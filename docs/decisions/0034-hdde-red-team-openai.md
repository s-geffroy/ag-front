# 0034 — HDDE : red team OpenAI (`gpt-4o`), frontière suggestion ≠ preuve

- **Statut :** accepté
- **Date :** 2026-06-26
- **Contexte connexe :** ADR 0032 (HDDE port TS), SPEC_V1 §8 (red team LLM), `docs/method.md`.

## Contexte

La méthode HDDE autorise un LLM **uniquement** pour générer des objections adversariales par persona
(8 personas : achats, supply chain, juridique, direction, assurance/finance, logistique,
régulateur/État, acteur perturbateur). Règle absolue de la SPEC :

```
LLM output = suggestion adversariale ≠ evidence ≠ validated diagnosis ≠ decision
```

L'utilisateur fournit une **clé OpenAI** et demande de **challenger les prompts** du pack (le
`persona_red_team_v1.md` d'origine est minimal).

## Décision

- **Fournisseur : OpenAI, modèle `gpt-4o`** par défaut (configurable via env). Clé via
  `OPENAI_API_KEY` (env, jamais commitée). Appels **server-side uniquement** (`hdde-api`).
- **Sortie JSON contrainte + validation `zod` stricte** du schéma
  (`persona, main_objection, attacked_assumptions[], possible_contradictions[], questions_to_ask[],
verdict_pressure, do_not_conclude[]`). Réponse non conforme ⇒ rejet, pas de persistance.
- **Prompts réécrits/durcis** (≠ pack original) : interdiction d'inventer des faits, séparation
  observation/objection/hypothèse/test, rappel « LLM ≠ preuve », interdiction de recommander une
  action irréversible, few-shots par persona, ancrage strict aux preuves fournies en entrée.
- **Cycle de vie** : les suggestions atterrissent dans `red_team_suggestions` au statut `pending` ; un
  analyste fait `accept`/`reject` (PATCH). **Aucune suggestion ne devient une preuve sans validation
  humaine** ; le type de preuve `llm_generated_suggestion` est `allowed_as_evidence: false` dans le
  domain pack.

## Justification

Contraindre le rôle du LLM à l'adversarialité + validation humaine empêche la contamination du
diagnostic. La validation JSON stricte évite qu'une sortie malformée ou hors-schéma ne pollue l'état.

## Conséquences

- Dépendance réseau OpenAI au runtime (la génération est explicite, jamais au build).
- Coût par run à surveiller ; `gpt-4o` est le compromis qualité/prix retenu.
- Le prompt durci est versionné sous `apps/hdde-api/prompts/red_team/` (l'original conservé en
  `.original.md` pour traçabilité).

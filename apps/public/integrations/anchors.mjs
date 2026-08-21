import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

/**
 * Astro integration : vérifier, AU BUILD, que chaque identifiant de chokepoint que nous ancrons
 * répond encore.
 *
 * POURQUOI ELLE EXISTE. Leur `0059` écrit qu'un identifiant retiré rend « 404, et pas un bloc vide
 * cette fois : c'est bien une erreur, elle se voit ». C'est vrai de l'appel HTTP — notre client lève
 * bien un `ChokepointsApiError`. Ce n'est PAS vrai de notre page : chaque chargeur d'Atlas rattrape
 * l'erreur pour rester gracieux (une fiche corridor ne doit pas mourir parce que l'API est en
 * panne), donc un ancrage mort se traduit par un `console.warn` dans un journal de build que
 * personne ne lit, et par un bloc absent sur une page publiée.
 *
 * C'est exactement le mode d'échec que nous leur décrivions au `0036` — « un identifiant faux ne
 * provoque aucune erreur chez nous, il rend des blocs vides, silencieusement » — et il vivait encore
 * chez nous pendant que nous le leur reprochions.
 *
 * CE QU'ELLE DISTINGUE, ET C'EST TOUT SON OBJET :
 *
 *  - **404** → l'ancrage n'existe plus. C'est NOTRE donnée qui est fausse, personne d'autre ne peut
 *    la corriger, et le build ÉCHOUE en nommant la fiche et l'identifiant.
 *  - **panne, 5xx, API non configurée** → nous ne savons rien. Le build continue : refuser de
 *    publier le site parce qu'un service tiers est indisponible transformerait leur incident en
 *    notre incident, et surtout ne prouverait rien sur nos ancrages.
 *  - **403** → mauvais jeton. Averti bruyamment, sans faire échouer : ce n'est pas un ancrage mort.
 *
 * L'inventaire lu ici est `docs/chokepoint-ids.pinned.txt`, le même fichier que celui déposé à
 * ag-back (leur `0054`) et tenu à jour par `pinned-ids.test.ts`. Les trois documents ne peuvent donc
 * pas diverger : la liste qu'ils gèlent, celle que nous vérifions et celle que le contenu porte sont
 * un seul fichier.
 */

const REPO_ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const INVENTORY = join(REPO_ROOT, 'docs/chokepoint-ids.pinned.txt');
const NAMES_TABLE = join(REPO_ROOT, 'apps/public/src/lib/corridor-names.ts');

function inventory() {
  return readFileSync(INVENTORY, 'utf-8')
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => {
      const [id, where] = l.split('\t');
      return { id, where: where ?? '(provenance absente)' };
    });
}

/**
 * Les clés de la table de noms français — le MÊME mode d'échec, et il a déjà frappé.
 *
 * Un libellé posé sur un identifiant inexistant ne casse rien : `corridorNameFr` retombe sur le nom
 * anglais, la page s'affiche, et le nom français qu'on croyait avoir branché n'apparaît simplement
 * jamais. C'est le « bloc vide en silence » de cette intégration, appliqué aux noms. Ce n'est pas
 * théorique : dix-neuf des trente-trois clés de la première version étaient fausses, fabriquées
 * d'après le nom anglais, et rien ne l'aurait signalé.
 *
 * La table est lue au texte plutôt qu'importée : cette intégration est du .mjs exécuté par Node au
 * build, la table est du TypeScript. Le même parti pris que `pinned-ids.test.ts`, qui lit les
 * frontmatter à l'expression régulière.
 *
 * Ces identifiants ne rejoignent PAS `docs/chokepoint-ids.pinned.txt` : cet inventaire-là est un
 * artefact de contrat, déposé à ag-back et gelé par eux (leur 0054). Nos libellés ne les regardent
 * pas, et grossir la liste déposée reviendrait à leur faire porter une contrainte qui est la nôtre.
 */
function nameTableIds() {
  const src = readFileSync(NAMES_TABLE, 'utf-8');
  const out = [];
  for (const m of src.matchAll(/^ {2}(p\d_[a-z0-9_]+):/gm)) {
    out.push({ id: m[1], where: 'libellé français (corridor-names.ts)' });
  }
  return out;
}

export function anchors() {
  return {
    name: 'ag:anchors',
    hooks: {
      'astro:build:done': async ({ logger }) => {
        const baseUrl = process.env.CHOKEPOINTS_API_URL;
        const token = process.env.CHOKEPOINTS_API_TOKEN;
        if (!baseUrl || !token) {
          logger.warn('API chokepoints non configurée — ancrages NON vérifiés.');
          return;
        }
        // Dédupliqué : un corridor peut être à la fois ancré par une fiche et nommé par la table.
        const byId = new Map();
        for (const entry of [...inventory(), ...nameTableIds()]) {
          const seen = byId.get(entry.id);
          if (seen) seen.where += ` + ${entry.where}`;
          else byId.set(entry.id, { ...entry });
        }
        const pinned = [...byId.values()];
        const dead = [];
        let unknown = 0;

        for (const { id, where } of pinned) {
          let status = 0;
          try {
            const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/chokepoints/${id}`, {
              headers: { authorization: `Bearer ${token}` },
              signal: AbortSignal.timeout(15_000),
            });
            status = res.status;
          } catch {
            unknown += 1;
            continue;
          }
          if (status === 404) dead.push({ id, where });
          else if (status === 403) logger.warn(`403 sur ${id} — jeton de mauvaise portée ?`);
          else if (status >= 500 || status === 0) unknown += 1;
        }

        if (dead.length) {
          for (const d of dead) {
            logger.error(`ANCRAGE MORT : ${d.id} rend 404 — porté par ${d.where}`);
          }
          throw new Error(
            `${dead.length} ancrage(s) de chokepoint ne répondent plus. ` +
              `Un identifiant retiré ne casse rien chez nous : il vide un bloc en silence — ou, ` +
              `pour un libellé, laisse le nom anglais s'afficher comme si de rien n'était. ` +
              `Corriger la chaîne dans le contenu ou la clé dans corridor-names.ts ; si l'ancrage ` +
              `vient d'une fiche, régénérer docs/chokepoint-ids.pinned.txt et redéposer la liste ` +
              `à ag-back.`,
          );
        }
        const checked = pinned.length - unknown;
        logger.info(
          `${checked}/${pinned.length} ancrage(s) vérifiés` +
            (unknown ? ` — ${unknown} indéterminé(s) (API injoignable)` : ''),
        );
      },
    },
  };
}

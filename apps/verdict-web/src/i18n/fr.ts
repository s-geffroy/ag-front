// FR UI strings for the VERDICT cockpit. The method vocabulary (stages, criteria, verdicts) comes
// from @ag/verdict so the UI and docs/methode-verdict.md never drift.
export const fr = {
  app: {
    title: 'Arbitrage décisionnel',
    private: 'Espace privé — réservé aux analystes Applied Geopolitics.',
  },
  auth: {
    login: 'Connexion',
    email: 'Identifiant',
    password: 'Mot de passe',
    signIn: 'Se connecter',
    signOut: 'Se déconnecter',
    invalid: 'Identifiants invalides.',
  },
  list: {
    title: 'Décisions',
    create: 'Nouvelle décision',
    none: 'Aucune décision pour le moment.',
    titleField: 'Objet de la décision',
    client: 'Client',
    sector: 'Secteur',
    situation: 'Situation (sans solution préférée)',
    save: 'Créer',
  },
  ws: {
    back: '← Toutes les décisions',
    ingest: 'Ingérer un cas HDDE',
    ingestRef: 'Référence du cas HDDE',
    ingestRun: 'Pré-remplir depuis HDDE',
    ingestDone: 'candidats pré-remplis',
    ingestFail: 'HDDE indisponible ou aucun packet pour ce cas.',
    runAudit: 'Lancer l’audit',
    add: 'Ajouter',
    validate: 'Valider',
    reject: 'Rejeter',
    remove: 'Supprimer',
    save: 'Enregistrer',
    candidate: 'candidat',
    rawScore: 'brut',
    adjScore: 'ajusté',
  },
} as const;

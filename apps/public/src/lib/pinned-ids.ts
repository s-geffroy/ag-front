/**
 * L'inventaire des identifiants de chokepoints que NOUS ancrons.
 *
 * POURQUOI IL EXISTE. Leur `0054` a balayé toute leur histoire et trouvé **cinq identifiants
 * disparus, dont quatre sans annonce** — trois le 8 juillet, Houston le 17 août. Aucun ne nous
 * touchait, par chance. Ils ont posé une garde de leur côté (`docs/chokepoint-ids.published.txt`,
 * promu délibérément à chaque publication) et ils nous demandent une chose en retour : **la liste des
 * identifiants que nous épinglons réellement**, pour la geler dans un test chez eux — un renommage
 * deviendrait alors rouge chez eux avant d'être vide chez nous.
 *
 * Une liste écrite à la main pour un message serait fausse au premier ancrage suivant. Celle-ci est
 * DÉRIVÉE du contenu, et `pinned-ids.test.ts` échoue dès qu'elle diverge du fichier déposé.
 *
 * CE QUI EST UN ANCRAGE, ET CE QUI N'EN EST PAS. Un ancrage est une chaîne dont la disparition vide
 * une surface vivante **sans lever d'erreur** — c'est notre propre formulation du `0036`, et c'est le
 * critère. En sont donc :
 *
 *  - le `chokepoint_id` d'une fiche Atlas : il commande les blocs consensus et actualité promue ;
 *  - une clef de `promoted-news.json` : elle range une promotion sous un corridor.
 *
 * N'en sont PAS, délibérément : les paquets de diagnostic HDDE déjà exportés
 * (`apps/hdde-api/data/exports/**`) et nos messages archivés sous `docs/handoff/`. Ce sont des
 * TRACES : elles conservent le nom sous lequel elles ont été écrites, et le réécrire ferait mentir
 * leur date. C'est exactement l'argument qu'ag-back applique à son propre `audit.change_log`, et il
 * vaut dans les deux sens.
 */

export const PINNED_IDS_FILE = 'docs/chokepoint-ids.pinned.txt';

/** Un ancrage, avec l'endroit qui le porte — pour qu'un identifiant retiré se corrige, pas se cherche. */
export interface PinnedId {
  id: string;
  /** Chemin relatif à la racine du dépôt. */
  where: string;
}

/** Les identifiants d'un lot de fiches, triés et dédoublonnés, avec leur provenance. */
export function collectPinnedIds(
  fiches: { slug: string; chokepointId?: string | null }[],
  promotedCorridorIds: string[],
): PinnedId[] {
  const found = new Map<string, string>();
  for (const f of fiches) {
    if (!f.chokepointId) continue;
    if (!found.has(f.chokepointId)) {
      found.set(f.chokepointId, `apps/public/src/content/atlas/${f.slug}.md`);
    }
  }
  for (const id of promotedCorridorIds) {
    if (!found.has(id)) found.set(id, 'apps/public/src/data/promoted-news.json');
  }
  return [...found.entries()]
    .map(([id, where]) => ({ id, where }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/** Le fichier déposé, tel qu'il doit être écrit : une ligne par identifiant, sa provenance en regard. */
export function renderPinnedIdsFile(ids: PinnedId[], generatedFrom: string): string {
  const header = [
    '# Identifiants de chokepoints épinglés par app-geo (ag-front)',
    '#',
    "# Déposé à la demande d'ag-back (leur 0054) pour être gelé dans un test chez eux : un",
    "# identifiant retiré ou renommé devient rouge chez EUX avant d'être vide chez NOUS.",
    '#',
    '# DÉRIVÉ, jamais écrit à la main — voir apps/public/src/lib/pinned-ids.ts. La garde',
    '# `pinned-ids.test.ts` échoue si ce fichier diverge du contenu.',
    '#',
    '# Ne figurent ici que les ancrages VIVANTS. Les paquets HDDE déjà exportés et nos messages',
    "# archivés portent des identifiants d'époque : ce sont des traces, elles gardent le nom sous",
    '# lequel elles ont été écrites.',
    '#',
    `# ${generatedFrom}`,
    '',
  ].join('\n');
  const body = ids.map((p) => `${p.id}\t${p.where}`).join('\n');
  return `${header}${body}\n`;
}

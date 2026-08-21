/**
 * Régénère `docs/chokepoint-ids.pinned.txt` depuis le contenu.
 *
 * POURQUOI CE SCRIPT EXISTE. `pinned-ids.test.ts` échoue dès que l'inventaire diverge et dit
 * « Régénérer » — sans qu'aucune commande ne le fasse. Le fichier se réécrivait donc à la main, ce
 * qui est exactement ce que son en-tête interdit (« DÉRIVÉ, jamais écrit à la main »).
 *
 * QUAND IL SERT, ET C'EST PLUS SOUVENT QU'AVANT : une promotion sur un corridor jamais promu ajoute
 * une clef à `promoted-news.json`, donc un ancrage. Depuis le flux au fil de l'eau, cela arrive au
 * rythme des promotions et non plus à celui des fiches. Le fichier régénéré doit ensuite être
 * REDÉPOSÉ à ag-back (leur 0054) : c'est un geste humain, pas une conséquence de ce script.
 *
 *   docker compose -f docker/docker-compose.yml run --rm tools \
 *     npm --workspace @ag/public run pinned-ids:regen
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PINNED_IDS_FILE, collectPinnedIds, renderPinnedIdsFile } from '../src/lib/pinned-ids';

const repo = (rel: string) => fileURLToPath(new URL(`../../../${rel}`, import.meta.url));

const dir = repo('apps/public/src/content/atlas');
const fiches = readdirSync(dir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const fm = readFileSync(`${dir}/${f}`, 'utf8').split('---')[1] ?? '';
    return {
      slug: f.replace(/\.md$/, ''),
      chokepointId: fm.match(/^chokepoint_id:\s*(\S+)\s*$/m)?.[1],
    };
  });

const promoted = Object.keys(
  JSON.parse(readFileSync(repo('apps/public/src/data/promoted-news.json'), 'utf8')) as Record<
    string,
    unknown
  >,
);

const ids = collectPinnedIds(fiches, promoted);
// La date vient de l'horloge : ce fichier n'est pas censé être reproductible à l'octet, il est censé
// être VRAI le jour où on le dépose.
const day = new Date().toISOString().slice(0, 10);
writeFileSync(
  repo(PINNED_IDS_FILE),
  renderPinnedIdsFile(ids, `Relevé le ${day} — ${ids.length} identifiants.`),
  'utf8',
);
console.log(`[pinned-ids] ${ids.length} identifiants écrits dans ${PINNED_IDS_FILE}.`);
console.log('[pinned-ids] À REDÉPOSER à ag-back (leur 0054) si la liste a changé.');

import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { collectPinnedIds, renderPinnedIdsFile, PINNED_IDS_FILE } from './pinned-ids';

const repo = (rel: string) => fileURLToPath(new URL(`../../../../${rel}`, import.meta.url));

/** Les fiches Atlas et leur `chokepoint_id`, lus au frontmatter — pas d'Astro dans un test unitaire. */
function fiches(): { slug: string; chokepointId?: string }[] {
  const dir = repo('apps/public/src/content/atlas');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const src = readFileSync(`${dir}/${f}`, 'utf8');
      const fm = src.split('---')[1] ?? '';
      const m = fm.match(/^chokepoint_id:\s*(\S+)\s*$/m);
      return { slug: f.replace(/\.md$/, ''), chokepointId: m?.[1] };
    });
}

function promotedCorridorIds(): string[] {
  return Object.keys(
    JSON.parse(readFileSync(repo('apps/public/src/data/promoted-news.json'), 'utf8')) as Record<
      string,
      unknown
    >,
  );
}

describe("l'inventaire des identifiants épinglés ne peut pas vieillir en silence", () => {
  /**
   * LA GARDE QUI COMPTE. Elle est le pendant exact de leur `docs/chokepoint-ids.published.txt` :
   * chez eux, un identifiant qui quitte le seed sans bump majeur devient rouge ; ici, un ancrage
   * ajouté ou retiré sans mettre l'inventaire à jour devient rouge. Sans elle, la liste que nous
   * leur déposons serait vraie le jour du dépôt et fausse à la fiche suivante — et ils l'auraient
   * gelée dans un test, ce qui rendrait leur garde fausse aussi.
   */
  it('le fichier déposé décrit exactement les ancrages du dépôt', () => {
    const ids = collectPinnedIds(fiches(), promotedCorridorIds());
    const onDisk = readFileSync(repo(PINNED_IDS_FILE), 'utf8');
    const declared = onDisk
      .split('\n')
      .filter((l) => l.trim() && !l.startsWith('#'))
      .map((l) => l.split('\t')[0]);
    const actual = ids.map((p) => p.id);

    const missing = actual.filter((id) => !declared.includes(id));
    const extra = declared.filter((id) => !actual.includes(id));
    expect(
      { missing, extra },
      `Régénérer ${PINNED_IDS_FILE} — et redéposer la liste à ag-back (leur 0054).`,
    ).toEqual({ missing: [], extra: [] });
  });

  it('chaque identifiant porte l’endroit qui l’ancre', () => {
    // Un identifiant retiré doit se corriger, pas se chercher : c'est le seul intérêt de la colonne.
    const ids = collectPinnedIds(fiches(), promotedCorridorIds());
    expect(ids.filter((p) => !p.where)).toEqual([]);
  });

  it('une fiche sans chokepoint_id n’entre pas dans l’inventaire', () => {
    // Les fiches minerais critiques et GNL n'ont volontairement aucune clef de jointure : leur
    // ancrage est une SFU ou une coupe par flow_type, et notre modèle n'a pas de champ pour cela.
    // Les inventorier fabriquerait un ancrage qui n'existe pas.
    const ids = collectPinnedIds(
      [{ slug: 'gnl' }, { slug: 'ormuz', chokepointId: 'p0_maritime_strait_strait_of_hormuz' }],
      [],
    );
    expect(ids.map((p) => p.id)).toEqual(['p0_maritime_strait_strait_of_hormuz']);
  });

  it('une promotion range son corridor même si aucune fiche ne le porte', () => {
    const ids = collectPinnedIds([], ['p0_maritime_canal_suez_canal']);
    expect(ids).toEqual([
      { id: 'p0_maritime_canal_suez_canal', where: 'apps/public/src/data/promoted-news.json' },
    ]);
  });

  it('le rendu du fichier est déterministe et trié', () => {
    const out = renderPinnedIdsFile(
      collectPinnedIds(
        [
          { slug: 'b', chokepointId: 'p1_zzz' },
          { slug: 'a', chokepointId: 'p0_aaa' },
        ],
        [],
      ),
      'relevé de test',
    );
    const lines = out.split('\n').filter((l) => l.trim() && !l.startsWith('#'));
    expect(lines).toEqual([
      'p0_aaa\tapps/public/src/content/atlas/a.md',
      'p1_zzz\tapps/public/src/content/atlas/b.md',
    ]);
  });
});

import { describe, expect, it } from 'vitest';
import {
  buildPromoteModal,
  clusterLabel,
  isAllowedChannel,
  NOTE_BLOCK_ID,
  outcomeFromCockpit,
  parseSubmission,
  validatedBy,
  CLUSTER_BLOCK_ID,
  CLUSTER_ACTION_ID,
  NOTE_ACTION_ID,
  type ClusterChoice,
} from './promote';

const cluster: ClusterChoice = {
  clusterId: 'c1',
  eventCategory: 'access_restriction',
  articleCount: 3,
  articles: [
    {
      title: 'Iran ties Hormuz reopening to US concessions',
      url: 'https://x.test/a',
      outlet: 'Reuters',
    },
    { title: 'Traffic dwindles', url: 'https://x.test/b', outlet: 'Reuters' },
  ],
};

describe('isAllowedChannel — l’autorisation EST le canal privé', () => {
  it('accepte le canal configuré, refuse tout autre', () => {
    expect(isAllowedChannel('C123', 'C123')).toBe(true);
    expect(isAllowedChannel('C999', 'C123')).toBe(false);
  });

  it('refuse TOUT quand la configuration manque, jamais l’inverse', () => {
    // Un défaut de configuration doit fermer la porte, pas l’ouvrir : un bouton transféré dans un
    // autre canal n’est pas une approbation.
    expect(isAllowedChannel('C123', undefined)).toBe(false);
    expect(isAllowedChannel('C123', '   ')).toBe(false);
    expect(isAllowedChannel(undefined, 'C123')).toBe(false);
  });
});

describe('validatedBy', () => {
  it('inscrit le passage par Slack dans le journal nominatif', () => {
    expect(validatedBy('Sylvain Geffroy')).toBe('Sylvain Geffroy (via Slack)');
    expect(validatedBy('  Sylvain Geffroy  ')).toBe('Sylvain Geffroy (via Slack)');
  });
});

describe('clusterLabel — jamais la prose du modèle', () => {
  it('décrit le regroupement par ses faits, pas par son titre généré', () => {
    const l = clusterLabel(cluster);
    expect(l).toContain('access restriction');
    expect(l).toContain('3 article(s)');
  });

  it('respecte la limite de 75 caractères de Slack', () => {
    const long = clusterLabel({
      ...cluster,
      eventCategory: 'x'.repeat(80),
      articles: [{ title: 'y'.repeat(80), url: 'https://x.test/a', outlet: 'z'.repeat(80) }],
    });
    expect(long.length).toBeLessThanOrEqual(75);
  });
});

describe('buildPromoteModal', () => {
  const modal = buildPromoteModal('hormuz', [cluster]);

  it('porte le corridor et les deux champs attendus', () => {
    expect(modal.private_metadata).toBe('hormuz');
    const ids = modal.blocks.map((b) => (b as { block_id?: string }).block_id);
    expect(ids).toContain(CLUSTER_BLOCK_ID);
    expect(ids).toContain(NOTE_BLOCK_ID);
  });

  it('met les titres des ÉDITEURS en liens cliquables — lire est à une tape', () => {
    const json = JSON.stringify(modal);
    expect(json).toContain('https://x.test/a');
    expect(json).toContain('Iran ties Hormuz reopening');
  });

  it('n’expose jamais headline ni summary_text', () => {
    // ClusterChoice ne les porte même pas : la garde est dans le type, ce test la constate.
    expect(JSON.stringify(modal)).not.toMatch(/headline|summary_text/);
  });
});

describe('parseSubmission', () => {
  const view = (note: string, clusterId = 'c1') => ({
    private_metadata: 'hormuz',
    state: {
      values: {
        [CLUSTER_BLOCK_ID]: { [CLUSTER_ACTION_ID]: { selected_option: { value: clusterId } } },
        [NOTE_BLOCK_ID]: { [NOTE_ACTION_ID]: { value: note } },
      },
    },
  });

  it('relit le choix et la phrase', () => {
    expect(parseSubmission(view('  Le passage devient négociable.  '))).toEqual({
      corridorId: 'hormuz',
      clusterId: 'c1',
      note: 'Le passage devient négociable.',
    });
  });

  it('refuse une soumission sans corridor ou sans regroupement', () => {
    expect(() => parseSubmission({ ...view('x'), private_metadata: '' })).toThrow();
    expect(() => parseSubmission(view('x', ''))).toThrow();
  });
});

describe('outcomeFromCockpit', () => {
  it('remonte le refus de paraphrase SOUS LE CHAMP, pas dans un log', () => {
    const o = outcomeFromCockpit(422, {
      error: 'editorial_note_paraphrase',
      message: 'Votre phrase reprend un texte déjà présent.',
    });
    expect(o).toEqual({
      ok: false,
      field: 'note',
      message: 'Votre phrase reprend un texte déjà présent.',
    });
  });

  it('réussit sur 2xx', () => {
    expect(outcomeFromCockpit(201, {})).toEqual({ ok: true });
  });

  it('traite les autres refus sans prétendre savoir lequel', () => {
    expect(outcomeFromCockpit(409, {})).toEqual({
      ok: false,
      field: null,
      message: 'Le cockpit a refusé (HTTP 409).',
    });
  });
});

import { describe, expect, it } from 'vitest';
import { provenanceSummary } from './content';

// Régression : QUATRIÈME occurrence du même aveuglement (ADR 0068). Le juge note des gates sur ce
// que `provenanceSummary` lui transmet ; tout champ de frontmatter RENDU SUR LA PAGE PUBLIQUE mais
// absent d'ici le fait conclure « absent » à raison sur ce qu'il voit, à tort sur le document.
// Constaté trois fois (confiance/sources/errata, puis `verdict`, puis `strategic_question`), puis
// une quatrième le 2026-08-21 : `fail` sur la rubrique `three_signals` de la note
// `un-corridor-nest-pas-une-route`, qui DÉCLARE bien trois signaux — en frontmatter seulement.
// Ce test existe pour qu'il n'y ait pas de cinquième.
describe('provenanceSummary — déclarations éditoriales rendues sur la page publique', () => {
  it('transmet les signaux, l’implication décisionnelle et l’angle mort d’une note', () => {
    const out = provenanceSummary({
      date: new Date('2026-06-09T00:00:00Z'),
      confidence: 'eleve',
      signals: ['Capacité résiduelle — seuil : marge avant saturation', 'Coût des bypass'],
      decision_implication: 'La bonne question n’est pas « où passe le flux ? ».',
      blind_spot: 'La géométrie d’un corridor est schématique.',
      sources: [{ label: 'U.S. EIA', type: 'institutionnel', url: 'https://www.eia.gov/' }],
      corrections: [],
    });

    expect(out).toContain('signaux_declares (rendus sous « Signaux à suivre »): 2');
    expect(out).toContain('Capacité résiduelle');
    expect(out).toContain('Coût des bypass');
    expect(out).toContain('implication_decisionnelle');
    expect(out).toContain('où passe le flux');
    expect(out).toContain('angle_mort_declare');
    expect(out).toContain('géométrie d’un corridor est schématique');
  });

  it('déclare zéro signal plutôt que de taire la rubrique quand la liste est vide', () => {
    // Même doctrine qu'ADR 0077 sur les errata : « aucun » n'est pas « rubrique absente ».
    const out = provenanceSummary({
      confidence: 'moyen',
      signals: [],
      sources: [],
      corrections: [],
    });
    expect(out).toContain('signaux_declares (rendus sous « Signaux à suivre »): 0');
  });

  it('n’invente aucune rubrique pour un document qui n’en porte pas (fiche Atlas)', () => {
    const out = provenanceSummary({
      confidence: 'moyen',
      verdict: 'Le corridor est un point de coupe systémique.',
      sources: [],
      corrections: [],
    });
    expect(out).toContain('verdict_declare');
    expect(out).not.toContain('implication_decisionnelle');
    expect(out).not.toContain('angle_mort_declare');
  });

  it('conserve ce que les trois correctifs précédents avaient ajouté', () => {
    const out = provenanceSummary({
      date: new Date('2026-08-12T00:00:00Z'),
      confidence: 'moyen',
      strategic_question: 'À quelles conditions le corridor retrouve-t-il sa crédibilité ?',
      verdict: 'Verdict déclaré.',
      sources: [{ label: 'SCA', type: 'institutionnel' }],
      corrections: [{ date: new Date('2026-08-12T00:00:00Z'), note: 'Fait périmé corrigé.' }],
    });
    expect(out).toContain('date: 2026-08-12');
    expect(out).toContain('confidence_declaree: moyen');
    expect(out).toContain('question_strategique');
    expect(out).toContain('verdict_declare');
    expect(out).toContain('sources_declarees: 1');
    expect(out).toContain('corrections_declarees: 1');
  });
});

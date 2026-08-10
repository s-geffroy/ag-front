/**
 * Legal pages (mentions légales, politique de confidentialité), held as data rather than as
 * `.astro` files, for one reason: **they must not ship until a human has filled in the facts only a
 * human knows** — SIREN, legal form, registered address, publication director, host identity.
 *
 * A static page under `src/pages/` cannot opt out of its own build, and the site rebuilds
 * unattended every hour (`redeploy-public.sh --refresh-signals`). So a half-written
 * `mentions-legales.astro` would reach production on its own, without anybody deciding to publish
 * it. Instead these live here and are rendered by the dynamic route `src/pages/[legal].astro`,
 * which emits **only** the pages that contain no `TO_COMPLETE` marker — the same "withhold from
 * dist rather than ship a placeholder" discipline as `plaquette.ts`.
 *
 * Failing this way keeps the build green: an unfinished page is absent, never broken. Making the
 * build *fail* on a marker would instead freeze the hourly signal refresh, i.e. one unfinished legal
 * page would quietly stale-date the whole Atlas.
 *
 * To publish: replace every `TO_COMPLETE` occurrence below with the real value, rebuild. The pages
 * and their footer links then appear together, because both read `publishableLegalPages()`.
 */

import { site } from './site';

/**
 * Marker for a fact we must not invent. Its presence anywhere in a page withholds that page.
 * Deliberately loud and accent-bearing so it cannot be mistaken for prose or missed in review.
 */
export const TO_COMPLETE = '⟦À COMPLÉTER⟧';

export interface LegalSection {
  heading: string;
  /** Paragraphs. A string starting with '- ' renders as a list item. */
  body: string[];
}

export interface LegalPage {
  slug: string;
  title: string;
  description: string;
  /** Shown under the H1: what this page is for, in one line. */
  intro: string;
  sections: LegalSection[];
  /** Footer label. Kept short — the footer column is narrow. */
  navLabel: string;
}

const HOST_BLOCK = [
  `Hébergeur : ${TO_COMPLETE} (raison sociale)`,
  `- Adresse : ${TO_COMPLETE}`,
  `- Téléphone : ${TO_COMPLETE}`,
];

export const legalPages: readonly LegalPage[] = [
  {
    slug: 'mentions-legales',
    navLabel: 'Mentions légales',
    title: 'Mentions légales',
    description:
      'Éditeur, directeur de publication et hébergeur du site www.applied-geopolitics.com.',
    intro:
      'Informations légales relatives à l’éditeur et à l’hébergeur de ce site, publiées en application de l’article 6-III de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique.',
    sections: [
      {
        heading: 'Éditeur du site',
        body: [
          `Le site ${site.url} est édité par ${TO_COMPLETE} (dénomination sociale de la structure porteuse, « LucidAxis » en nom commercial).`,
          `- Forme juridique : ${TO_COMPLETE}`,
          `- Capital social : ${TO_COMPLETE}`,
          `- Siège social : ${TO_COMPLETE}`,
          `- SIREN / SIRET : ${TO_COMPLETE}`,
          `- Numéro de TVA intracommunautaire : ${TO_COMPLETE}`,
          `- RCS : ${TO_COMPLETE}`,
          `- Adresse électronique : ${site.email}`,
        ],
      },
      {
        heading: 'Directeur de la publication',
        body: [
          `Le directeur de la publication est ${TO_COMPLETE}.`,
          'Les analyses publiées sous la marque Applied Geopolitics sont signées par leur auteur ; la responsabilité éditoriale de la publication demeure celle du directeur de la publication.',
        ],
      },
      {
        heading: 'Hébergement',
        body: HOST_BLOCK,
      },
      {
        heading: 'Propriété intellectuelle',
        body: [
          'L’ensemble des contenus éditoriaux publiés sur ce site — dossiers, fiches Atlas, notes, descriptions de méthode, représentations graphiques — est protégé par le droit d’auteur. Toute reproduction, représentation ou adaptation, totale ou partielle, sur quelque support que ce soit, est soumise à autorisation préalable écrite.',
          'La méthodologie CVI (Corridor Vulnerability Index) et les protocoles HDDE et VERDICT constituent des travaux propriétaires. Leur description publique sur ce site est fournie à titre d’information et n’emporte aucune cession de droits.',
          'Certaines données affichées dans l’Atlas proviennent de sources tierces et sont accompagnées, lorsque leur licence l’exige, de la mention d’attribution correspondante. Ces attributions doivent être conservées en cas de réutilisation.',
        ],
      },
      {
        heading: 'Nature des contenus et limites',
        body: [
          'Applied Geopolitics fournit des analyses structurées, des scénarios, des seuils et des niveaux de confiance. Elle ne fournit pas de garantie de prédiction, ni de conseil juridique, financier ou assurantiel engageant, et ne se substitue pas à la décision interne du lecteur ou du client.',
          'Les géométries cartographiques présentées sont schématiques. Elles n’ont aucune valeur navigationnelle ni juridique et ne sauraient être utilisées à des fins de navigation, de délimitation ou de contentieux.',
          'Les indices, scores et niveaux publiés sont des constructions méthodologiques documentées, dépendantes des données disponibles à la date de publication. Leurs limites sont explicitées dans les pages de méthode.',
        ],
      },
      {
        heading: 'Liens externes',
        body: [
          'Ce site cite des sources externes et peut renvoyer vers des sites tiers. Applied Geopolitics n’exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu, leur disponibilité ou leurs pratiques en matière de données personnelles.',
        ],
      },
      {
        heading: 'Signalement d’une erreur',
        body: [
          `Toute erreur factuelle peut être signalée à ${site.email}. Les corrections apportées à un contenu publié sont consignées dans un bloc de rectification visible sur la page concernée, conformément au devoir de rectification que nous nous imposons.`,
        ],
      },
    ],
  },
  {
    slug: 'politique-de-confidentialite',
    navLabel: 'Confidentialité',
    title: 'Politique de confidentialité',
    description:
      'Quelles données personnelles ce site collecte, pourquoi, combien de temps, et comment exercer vos droits.',
    intro:
      'Cette page décrit le traitement des données à caractère personnel effectué par ce site, en application des articles 12 à 14 du règlement (UE) 2016/679 (RGPD). Elle est volontairement précise : elle décrit ce que le code fait réellement, pas ce qu’il pourrait faire.',
    sections: [
      {
        heading: 'Responsable de traitement',
        body: [
          `Le responsable de traitement est ${TO_COMPLETE} (voir les mentions légales pour l’identification complète).`,
          `Contact pour toute question relative aux données personnelles : ${site.email}.`,
          `Délégué à la protection des données (DPO) : ${TO_COMPLETE} — mentionner « non désigné » si aucun DPO n’est requis.`,
        ],
      },
      {
        heading: 'Quelles données, et à quelle occasion',
        body: [
          'Une seule collecte a lieu sur ce site : le formulaire de contact. Aucune donnée personnelle n’est collectée lors de la simple consultation des pages.',
          'Les données transmises par le formulaire sont : votre nom, votre adresse électronique, le cas échéant votre organisation, le sujet choisi, et le message libre que vous rédigez.',
          'La date et l’heure de réception sont enregistrées, ainsi que la trace horodatée de votre consentement.',
          'Votre adresse IP est utilisée de manière transitoire pour limiter le nombre de soumissions par minute (protection anti-abus). Elle n’est pas conservée avec votre message : elle réside en mémoire vive le temps d’une fenêtre d’une minute, puis disparaît.',
        ],
      },
      {
        heading: 'Finalité et base légale',
        body: [
          'Finalité : répondre à votre demande et, le cas échéant, poursuivre l’échange commercial que vous avez initié.',
          'Base légale : votre consentement (article 6.1.a du RGPD), recueilli explicitement lors de l’envoi du formulaire. Ce consentement est révocable à tout moment, sans que cela n’affecte la licéité du traitement antérieur.',
          'Vos données ne sont utilisées pour aucune autre finalité. Elles ne servent pas à du profilage, ne font l’objet d’aucune décision automatisée, et ne sont pas exploitées pour de la prospection non sollicitée sur un sujet distinct de votre demande.',
        ],
      },
      {
        heading: 'Destinataires',
        body: [
          'Vos données sont accessibles aux seules personnes assurant le suivi commercial et éditorial d’Applied Geopolitics.',
          'Elles ne sont ni vendues, ni louées, ni transmises à des tiers à des fins commerciales.',
          `Une notification de votre demande est acheminée par courrier électronique via ${TO_COMPLETE} (prestataire d’envoi SMTP), qui agit en qualité de sous-traitant.`,
          'Aucun transfert de données en dehors de l’Union européenne n’est effectué dans le cadre de ce traitement.',
        ],
      },
      {
        heading: 'Durée de conservation',
        body: [
          `Les demandes n’ayant pas donné lieu à une relation commerciale sont conservées ${TO_COMPLETE} mois à compter du dernier contact, puis supprimées.`,
          'Les données relatives à un client sont conservées pendant la durée de la relation contractuelle, puis pendant la durée de prescription légale applicable.',
          'La trace de votre consentement est conservée aussi longtemps que les données auxquelles elle se rapporte, afin de pouvoir en démontrer l’existence.',
        ],
      },
      {
        heading: 'Vos droits',
        body: [
          'Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition, ainsi que d’un droit à la portabilité de vos données.',
          `Pour exercer ces droits, écrivez à ${site.email}. Une réponse vous sera apportée dans un délai d’un mois à compter de la réception de votre demande. Une pièce justificative d’identité pourra vous être demandée en cas de doute raisonnable sur l’identité du demandeur.`,
          'Vous pouvez également retirer votre consentement à tout moment par simple demande à cette même adresse.',
          'Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la Commission nationale de l’informatique et des libertés (CNIL), 3 place de Fontenoy — TSA 80715 — 75334 Paris Cedex 07, ou sur www.cnil.fr.',
        ],
      },
      {
        heading: 'Cookies et mesure d’audience',
        body: [
          'Ce site ne dépose aucun cookie publicitaire et ne pratique aucun suivi entre sites.',
          'Un unique élément est enregistré localement dans votre navigateur (`localStorage`) : votre préférence de thème clair ou sombre. Il ne quitte jamais votre appareil, ne permet pas de vous identifier, et relève des traceurs strictement nécessaires exemptés de consentement.',
          `Mesure d’audience : ${TO_COMPLETE} — indiquer « aucune » si aucun outil n’est déployé, ou le nom de l’outil, son hébergement et l’absence de cookie le cas échéant.`,
        ],
      },
      {
        heading: 'Sécurité',
        body: [
          'Les échanges avec ce site sont chiffrés en transit (HTTPS). Les données issues du formulaire sont stockées sur un serveur situé dans l’Union européenne, dont l’accès est restreint.',
          'Les espaces applicatifs HDDE et VERDICT sont protégés par authentification individuelle et ne sont pas indexés par les moteurs de recherche.',
        ],
      },
      {
        heading: 'Modifications',
        body: [
          'Cette politique peut être mise à jour pour refléter une évolution du site ou de la réglementation. La version en vigueur est celle publiée sur cette page.',
          `Dernière mise à jour : ${TO_COMPLETE} (date de publication).`,
        ],
      },
    ],
  },
];

/** A rendered block: either a paragraph or a bullet list. */
export type LegalBlock = { kind: 'p'; text: string } | { kind: 'ul'; items: string[] };

/**
 * Turn a section body into blocks, merging each run of consecutive `- ` lines into one list.
 *
 * This lives here rather than in the template so the content above can stay plain strings — editable
 * by whoever fills in the legal facts, without touching JSX — and so the grouping itself is testable.
 */
export function groupBody(body: string[]): LegalBlock[] {
  const blocks: LegalBlock[] = [];
  for (const line of body) {
    if (line.startsWith('- ')) {
      const last = blocks[blocks.length - 1];
      if (last && last.kind === 'ul') last.items.push(line.slice(2));
      else blocks.push({ kind: 'ul', items: [line.slice(2)] });
    } else {
      blocks.push({ kind: 'p', text: line });
    }
  }
  return blocks;
}

/** True when every fact has been filled in — i.e. the page carries no `TO_COMPLETE` marker. */
export function legalPageIsComplete(page: LegalPage): boolean {
  const haystack = [
    page.title,
    page.description,
    page.intro,
    ...page.sections.flatMap((s) => [s.heading, ...s.body]),
  ].join('\n');
  return !haystack.includes(TO_COMPLETE);
}

/**
 * The pages cleared to ship. Both the route and the footer read this, so a page and its link can
 * never disagree — the failure mode that would otherwise put a 404 in the footer of every page.
 */
export function publishableLegalPages(): LegalPage[] {
  return legalPages.filter(legalPageIsComplete);
}

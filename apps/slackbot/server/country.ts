/**
 * Pays d'un média, DÉDUIT de son domaine — et seulement quand le domaine le dit.
 *
 * POURQUOI CE FICHIER EST SI PRUDENT. Le flux ne transporte aucun pays : un article porte
 * `title`, `url`, `outlet`, `source_id`, `observed_on`, rien de plus. Le domaine est le seul
 * indice, et il est muet pour les gTLD. Sur le regroupement Ormuz du 11/08 : 113 `.com`, 23 `.org`
 * et 11 `.net` sans pays, contre 64 `.co.uk` — soit 67 % d'inconnu, et cet inconnu est
 * massivement américain (les dizaines de radios locales qui relaient la dépêche sont toutes
 * en `.com`).
 *
 * Un « pays dominant » calculé là-dessus dirait « Royaume-Uni » d'une histoire d'abord
 * américaine. Ce n'est pas une approximation, c'est une inversion. D'où la règle, qui est celle
 * de l'ADR 0077 : on ne compense pas une absence amont par une heuristique locale. On compte ce
 * que le domaine affirme, on affiche le reste comme indéterminé, et le total s'énonce en
 * PLANCHER (« ≥ 3 pays »), jamais en total.
 */

/**
 * ccTLD vendus comme génériques : `.io` n'indique pas le Territoire britannique de l'océan Indien
 * et `.co` rarement la Colombie. Les traiter comme des pays produirait des chiffres faux et
 * exotiques ; on les tient pour indéterminés.
 */
const VANITY = new Set([
  'io',
  'co',
  'me',
  'tv',
  'ly',
  'to',
  'cc',
  'ai',
  'fm',
  'gg',
  'im',
  'sh',
  'st',
  'ws',
  'nu',
  'tk',
  'gl',
  'cx',
  'mu',
  'as',
  'am',
  'is',
]);

const COUNTRIES: Record<string, string> = {
  uk: 'Royaume-Uni',
  gb: 'Royaume-Uni',
  ie: 'Irlande',
  fr: 'France',
  de: 'Allemagne',
  es: 'Espagne',
  it: 'Italie',
  pt: 'Portugal',
  nl: 'Pays-Bas',
  be: 'Belgique',
  ch: 'Suisse',
  at: 'Autriche',
  se: 'Suède',
  no: 'Norvège',
  dk: 'Danemark',
  fi: 'Finlande',
  pl: 'Pologne',
  cz: 'Tchéquie',
  hu: 'Hongrie',
  ro: 'Roumanie',
  gr: 'Grèce',
  ua: 'Ukraine',
  ru: 'Russie',
  tr: 'Turquie',
  az: 'Azerbaïdjan',
  il: 'Israël',
  ae: 'Émirats arabes unis',
  sa: 'Arabie saoudite',
  qa: 'Qatar',
  kw: 'Koweït',
  om: 'Oman',
  bh: 'Bahreïn',
  jo: 'Jordanie',
  lb: 'Liban',
  ir: 'Iran',
  iq: 'Irak',
  eg: 'Égypte',
  ma: 'Maroc',
  dz: 'Algérie',
  tn: 'Tunisie',
  za: 'Afrique du Sud',
  ng: 'Nigéria',
  ke: 'Kenya',
  in: 'Inde',
  pk: 'Pakistan',
  bd: 'Bangladesh',
  lk: 'Sri Lanka',
  np: 'Népal',
  cn: 'Chine',
  hk: 'Hong Kong',
  tw: 'Taïwan',
  jp: 'Japon',
  kr: 'Corée du Sud',
  sg: 'Singapour',
  my: 'Malaisie',
  id: 'Indonésie',
  th: 'Thaïlande',
  ph: 'Philippines',
  vn: 'Viêt Nam',
  au: 'Australie',
  nz: 'Nouvelle-Zélande',
  ca: 'Canada',
  mx: 'Mexique',
  br: 'Brésil',
  ar: 'Argentine',
  cl: 'Chili',
  pe: 'Pérou',
  us: 'États-Unis',
};

/** Le pays affirmé par le domaine, ou undefined. Undefined n'est PAS « aucun pays » : c'est « le domaine ne le dit pas ». */
export function outletCountry(outlet: string | undefined): string | undefined {
  if (!outlet) return undefined;
  const labels = outlet.toLowerCase().trim().replace(/\.$/, '').split('.');
  const last = labels[labels.length - 1];
  if (!last || last.length !== 2 || VANITY.has(last)) return undefined;
  return COUNTRIES[last];
}

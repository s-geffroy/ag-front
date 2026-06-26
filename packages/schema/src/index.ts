// Distinct data models under one roof:
//  - `content`  → the product (corridors, flux, Atlas fiches, notes, dossiers, signals, CVI)
//  - `cockpit`  → the launch pilot (E-light: config / deliverables / milestones / metrics /
//                 contacts / quality_gates)
//  - `hdde`     → Hidden Dependency Discovery Engine (cases, interview, evidence, packets, red team)
// Import the narrow entrypoint you need (`@ag/schema/content`, `@ag/schema/cockpit`,
// `@ag/schema/hdde`); this root re-export is a convenience.
export * as content from './content/index';
export * as cockpit from './cockpit/index';
export * as hdde from './hdde/index';

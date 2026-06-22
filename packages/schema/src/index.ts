// Two distinct data models under one roof:
//  - `content`  → the product (corridors, flux, Atlas fiches, notes, dossiers, signals, CVI)
//  - `cockpit`  → the launch pilot (E-light: config / deliverables / milestones / metrics /
//                 contacts / quality_gates)
// Import the narrow entrypoint you need (`@ag/schema/content` or `@ag/schema/cockpit`); this
// root re-export is a convenience.
export * as content from './content/index';
export * as cockpit from './cockpit/index';

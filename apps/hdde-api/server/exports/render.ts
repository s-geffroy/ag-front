// Export renderer — nunjucks (Jinja2-compatible) over the domain pack's .j2 templates → Markdown
// FR/EN, plus the canonical diagnostic_packet.json serialised directly from the packet payload.
// Outputs land under data/exports/<case_id>/v<version>/ (ADR 0032).
import nunjucks from 'nunjucks';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { config } from '../config';

const MARKDOWN_TEMPLATES = [
  'diagnostic_fiche.fr.md.j2',
  'diagnostic_fiche.en.md.j2',
  'dependency_control_matrix.fr.md.j2',
  'dependency_control_matrix.en.md.j2',
  'light_action_layer.fr.md.j2',
  'light_action_layer.en.md.j2',
] as const;

export interface RenderedExport {
  filename: string;
  content: string;
}

let env: nunjucks.Environment | null = null;
function getEnv(): nunjucks.Environment {
  if (!env) {
    env = nunjucks.configure(join(config.packDir, 'output_templates'), {
      autoescape: false, // Markdown/JSON output, not HTML
      throwOnUndefined: false, // tolerate template fields not populated in V1
    });
  }
  return env;
}

export interface PacketLike {
  packet_json: Record<string, unknown>;
  pack_hash: string;
  version_number: number;
}

/** Render all FR/EN exports for a packet. Returns the in-memory files (also written to disk). */
export function renderExports(
  caseRow: Record<string, unknown>,
  packet: PacketLike,
): RenderedExport[] {
  const ctx = {
    case: caseRow,
    packet: packet.packet_json,
    pack_hash: packet.pack_hash,
  };
  const outputs: RenderedExport[] = MARKDOWN_TEMPLATES.map((tpl) => ({
    filename: tpl.replace(/\.j2$/, ''),
    content: getEnv().render(tpl, ctx),
  }));

  // Canonical JSON packet — serialise the payload directly (carries pack_hash for traceability).
  outputs.push({
    filename: 'diagnostic_packet.json',
    content: JSON.stringify(packet.packet_json, null, 2),
  });

  // Persist to disk.
  const dir = join(config.exportsDir, String(caseRow.id), `v${packet.version_number}`);
  mkdirSync(dir, { recursive: true });
  for (const out of outputs) writeFileSync(join(dir, out.filename), out.content, 'utf-8');

  return outputs;
}

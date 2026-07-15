// Single source of truth for the Munich Charter catalogue now lives in the schema package, so the
// cockpit SERVER (LLM judge, ADR 0068) and this front share it. Re-exported here to keep existing
// front imports (`@/lib/munich`) working unchanged.
export {
  munichControls,
  munichModeLabel,
  judgeableMunichControls,
  type MunichMode,
  type MunichControl,
} from '@ag/schema/cockpit';

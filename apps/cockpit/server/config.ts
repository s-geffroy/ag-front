// Server-side config read from the environment. The OpenAI key is used only by the editorial
// contradiction module (ADR 0039) and NEVER reaches the browser. LLM is opt-in: with no key, or
// LLM_ENABLED unset, the contradiction tool returns a clearly-labelled offline facade.
export const config = {
  llmEnabled: process.env.LLM_ENABLED === 'true',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4o',
  // LLM judge / pré-validation (ADR 0068) may run a stronger model on a separate key than the red
  // team — a judge needs precision (a `pass` must be trustworthy), not just recall. Both fall back to
  // the red-team key/model so a single OPENAI_API_KEY/OPENAI_MODEL still works.
  openaiJudgeApiKey: process.env.OPENAI_JUDGE_API_KEY || process.env.OPENAI_API_KEY || '',
  openaiJudgeModel: process.env.OPENAI_JUDGE_MODEL || process.env.OPENAI_MODEL || 'gpt-4o',
};

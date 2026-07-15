// Server-side config read from the environment. The OpenAI key is used only by the editorial
// contradiction module (ADR 0039) and NEVER reaches the browser. LLM is opt-in: with no key, or
// LLM_ENABLED unset, the contradiction tool returns a clearly-labelled offline facade.
export const config = {
  llmEnabled: process.env.LLM_ENABLED === 'true',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4o',
  // LLM judge / pré-validation (ADR 0068). A judge needs precision (a `pass` must be trustworthy), so
  // it runs a REASONING model via the OpenAI Responses API — a different code path from the red team's
  // Chat Completions, tuned by reasoning EFFORT (not temperature). The key still falls back to the red
  // team's, but the model does NOT (a reasoning model ≠ gpt-4o) — default is a GPT-5.6 reasoning model.
  openaiJudgeApiKey: process.env.OPENAI_JUDGE_API_KEY || process.env.OPENAI_API_KEY || '',
  openaiJudgeModel: process.env.OPENAI_JUDGE_MODEL || 'gpt-5.6-terra',
  judgeReasoningEffort: (process.env.OPENAI_JUDGE_EFFORT || 'medium') as 'low' | 'medium' | 'high',
};

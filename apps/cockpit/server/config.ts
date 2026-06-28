// Server-side config read from the environment. The OpenAI key is used only by the editorial
// contradiction module (ADR 0039) and NEVER reaches the browser. LLM is opt-in: with no key, or
// LLM_ENABLED unset, the contradiction tool returns a clearly-labelled offline facade.
export const config = {
  llmEnabled: process.env.LLM_ENABLED === 'true',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4o',
};

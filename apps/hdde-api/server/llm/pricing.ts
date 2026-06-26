// LLM pricing → USD cost per call. Prices are USD per 1M tokens; cost is computed AT CALL TIME and
// stored, so historical costs stay stable even if prices change later. Defaults track OpenAI gpt-4o
// list pricing; override per deployment via env (OPENAI_PRICE_INPUT / OPENAI_PRICE_OUTPUT, USD/1M).

interface ModelPrice {
  inputPerM: number;
  outputPerM: number;
}

// Known list prices (USD per 1M tokens). Extend as needed.
const TABLE: Record<string, ModelPrice> = {
  'gpt-4o': { inputPerM: 2.5, outputPerM: 10.0 },
  'gpt-4o-mini': { inputPerM: 0.15, outputPerM: 0.6 },
  'gpt-4.1': { inputPerM: 2.0, outputPerM: 8.0 },
  'gpt-4.1-mini': { inputPerM: 0.4, outputPerM: 1.6 },
};

export function priceFor(model: string): ModelPrice {
  const envIn = Number(process.env.OPENAI_PRICE_INPUT);
  const envOut = Number(process.env.OPENAI_PRICE_OUTPUT);
  if (Number.isFinite(envIn) && Number.isFinite(envOut)) {
    return { inputPerM: envIn, outputPerM: envOut };
  }
  return TABLE[model] ?? TABLE['gpt-4o'];
}

/** USD cost of one call. */
export function computeCost(model: string, promptTokens: number, completionTokens: number): number {
  const p = priceFor(model);
  const cost =
    (promptTokens / 1_000_000) * p.inputPerM + (completionTokens / 1_000_000) * p.outputPerM;
  return Math.round(cost * 1_000_000) / 1_000_000; // round to 6 dp (micro-dollars)
}

import { EMBEDDING_MODEL } from "./config";
import { getOpenAI } from "./openai";

/** Embed a single string and return its vector. */
export async function embedText(text: string): Promise<number[]> {
  const [vector] = await embedTexts([text]);
  return vector;
}

/**
 * Embed many strings in one request. OpenAI returns embeddings in the same
 * order as the inputs.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const openai = getOpenAI();
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts.map((t) => t.replace(/\n/g, " ")),
  });
  // Re-order by the per-item `index` so embeddings always align to their input
  // positions, even if the API/proxy returns them out of order.
  return [...response.data]
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

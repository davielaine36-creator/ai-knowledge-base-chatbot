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
  return response.data.map((d) => d.embedding);
}

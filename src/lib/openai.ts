import OpenAI from "openai";

let client: OpenAI | null = null;

/**
 * Lazily create a shared OpenAI client. Throws a clear error if the API key
 * is missing so the failure is easy to diagnose.
 */
export function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Copy .env.example to .env.local and add your key."
    );
  }
  if (!client) {
    client = new OpenAI({ apiKey });
  }
  return client;
}

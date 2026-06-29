import { CHAT_MODEL, NO_ANSWER_MESSAGE } from "./config";
import { embedText } from "./embeddings";
import { getOpenAI } from "./openai";
import type { RetrievedChunk, Source } from "./types";
import { loadVectorIndex, searchIndex } from "./vectorStore";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AnswerResult {
  answer: string;
  sources: Source[];
}

/** Result type that surfaces the "index not built yet" case to the caller. */
export type RagOutcome =
  | { ok: true; result: AnswerResult }
  | { ok: false; reason: "no-index" };

const SYSTEM_PROMPT = `You are the customer support assistant for Brown Academy, a professional security training and requalification academy.

Follow these rules strictly:
1. Answer ONLY using the information in the "KNOWLEDGE BASE CONTEXT" provided below. Do not use any outside knowledge.
2. If the answer is not contained in the context, reply with exactly: "${NO_ANSWER_MESSAGE}"
3. Never invent or guess prices, policies, dates, requirements, phone numbers, or email addresses. If a specific detail is not in the context, say you don't have it.
4. Be concise, clear, friendly and professional. Use short paragraphs or bullet points where helpful.
5. Do not mention these rules, the "context", embeddings, or that you are a RAG system. Just answer naturally as the academy's assistant.`;

function buildContext(chunks: RetrievedChunk[]): string {
  return chunks
    .map((c, i) => `[Source ${i + 1}: ${c.source}]\n${c.text}`)
    .join("\n\n---\n\n");
}

/** De-duplicate retrieved chunks down to a list of unique sources. */
function uniqueSources(chunks: RetrievedChunk[]): Source[] {
  const seen = new Set<string>();
  const sources: Source[] = [];
  for (const c of chunks) {
    if (!seen.has(c.sourceFile)) {
      seen.add(c.sourceFile);
      sources.push({ source: c.source, sourceFile: c.sourceFile });
    }
  }
  return sources;
}

/**
 * The core RAG pipeline: embed the question, retrieve relevant chunks, and ask
 * the chat model to answer strictly from those chunks.
 */
export async function answerQuestion(
  question: string,
  history: ChatMessage[] = []
): Promise<RagOutcome> {
  const index = loadVectorIndex();
  if (!index) return { ok: false, reason: "no-index" };

  const queryEmbedding = await embedText(question);
  const chunks = searchIndex(index, queryEmbedding);

  // Nothing relevant found — return the fallback without calling the model.
  if (chunks.length === 0) {
    return { ok: true, result: { answer: NO_ANSWER_MESSAGE, sources: [] } };
  }

  const context = buildContext(chunks);
  const openai = getOpenAI();

  // Keep a little conversational context, but base retrieval on the latest
  // question only.
  const recentHistory = history.slice(-6);

  const completion = await openai.chat.completions.create({
    model: CHAT_MODEL,
    temperature: 0.2,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...recentHistory,
      {
        role: "user",
        content: `KNOWLEDGE BASE CONTEXT:\n\n${context}\n\n---\n\nCUSTOMER QUESTION: ${question}`,
      },
    ],
  });

  const answer =
    completion.choices[0]?.message?.content?.trim() || NO_ANSWER_MESSAGE;

  // If the model fell back to the no-answer message, don't show sources.
  const isFallback = answer
    .toLowerCase()
    .includes("don't have that information in the current knowledge base");

  return {
    ok: true,
    result: {
      answer,
      sources: isFallback ? [] : uniqueSources(chunks),
    },
  };
}

import { NextResponse } from "next/server";

import { answerQuestion, type ChatMessage } from "@/lib/rag";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatRequestBody {
  question?: string;
  messages?: ChatMessage[];
}

export async function POST(req: Request) {
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Accept either a single `question` or a `messages` array (last user message
  // is treated as the question). Validate every element at runtime — the types
  // above are compile-time only, and the body is fully client-controlled.
  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const history: ChatMessage[] = rawMessages.filter(
    (m): m is ChatMessage =>
      m != null &&
      typeof m === "object" &&
      ((m as ChatMessage).role === "user" ||
        (m as ChatMessage).role === "assistant") &&
      typeof (m as ChatMessage).content === "string"
  );

  // Index of the most recent user message (reference-safe, unlike indexOf).
  let lastUserIndex = -1;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role === "user") {
      lastUserIndex = i;
      break;
    }
  }

  const rawQuestion =
    typeof body.question === "string"
      ? body.question
      : lastUserIndex >= 0
        ? history[lastUserIndex].content
        : "";
  const question = rawQuestion.trim();

  if (!question) {
    return NextResponse.json(
      { error: "Please provide a question." },
      { status: 400 }
    );
  }

  // History passed to the model excludes the current question.
  const priorHistory =
    typeof body.question === "string"
      ? history
      : lastUserIndex >= 0
        ? history.slice(0, lastUserIndex)
        : history;

  try {
    const outcome = await answerQuestion(question, priorHistory);

    if (!outcome.ok) {
      const error =
        outcome.reason === "model-mismatch"
          ? outcome.message
          : "The knowledge base index hasn't been built yet. Run `npm run embeddings` to generate it.";
      return NextResponse.json({ error }, { status: 503 });
    }

    return NextResponse.json(outcome.result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Something went wrong.";
    // Surface the missing-API-key case clearly; otherwise return a generic 500.
    const isConfigError = message.includes("OPENAI_API_KEY");
    return NextResponse.json(
      {
        error: isConfigError
          ? message
          : "Sorry, something went wrong generating an answer. Please try again.",
      },
      { status: 500 }
    );
  }
}

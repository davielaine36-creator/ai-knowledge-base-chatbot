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
  // is treated as the question).
  const history = Array.isArray(body.messages) ? body.messages : [];
  const lastUserMessage = [...history]
    .reverse()
    .find((m) => m.role === "user");
  const question = (body.question || lastUserMessage?.content || "").trim();

  if (!question) {
    return NextResponse.json(
      { error: "Please provide a question." },
      { status: 400 }
    );
  }

  // History passed to the model excludes the current question.
  const priorHistory = body.question
    ? history
    : history.slice(0, history.lastIndexOf(lastUserMessage as ChatMessage));

  try {
    const outcome = await answerQuestion(question, priorHistory);

    if (!outcome.ok) {
      return NextResponse.json(
        {
          error:
            "The knowledge base index hasn't been built yet. Run `npm run embeddings` to generate it.",
        },
        { status: 503 }
      );
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
      { status: isConfigError ? 500 : 500 }
    );
  }
}

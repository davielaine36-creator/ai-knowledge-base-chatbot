"use client";

import { useEffect, useRef, useState } from "react";

interface Source {
  source: string;
  sourceFile: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  isError?: boolean;
}

const SUGGESTED_QUESTIONS = [
  "What courses does Brown Academy offer?",
  "How much is requalification?",
  "What do I need to bring?",
  "Can I get a refund?",
  "How do I schedule a course?",
  "Do you offer weekend classes?",
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Only auto-scroll if the user is already near the bottom, so we don't yank
    // the view while they're reading an earlier message.
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 160) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, loading]);

  async function sendMessage(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              data.error ||
              "Sorry, something went wrong. Please try again.",
            isError: true,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.answer,
            sources: data.sources,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't reach the server. Please try again.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-[34rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-3.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
          BA
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-900">
            Brown Academy Assistant
          </p>
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            Answers from the knowledge base only
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Conversation with the Brown Academy assistant"
        className="chat-scroll flex-1 space-y-4 overflow-y-auto px-5 py-5"
      >
        {isEmpty && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="max-w-sm text-sm text-slate-500">
              Ask anything about Brown Academy&apos;s courses, requalification,
              pricing, requirements, scheduling, refunds or contact details.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}

        {loading && (
          <div className="flex justify-start" role="status">
            <span className="sr-only">Assistant is typing…</span>
            <div
              className="rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3"
              aria-hidden="true"
            >
              <span className="typing-dot" />
              <span className="typing-dot ml-1" />
              <span className="typing-dot ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Quick chips (when conversation has started) */}
      {!isEmpty && (
        <div className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-3">
          {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              disabled={loading}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-slate-200 bg-white px-4 py-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          aria-label="Ask a question about Brown Academy"
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] animate-fade-in-up whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-brand-600 px-4 py-2.5 text-sm text-white">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] animate-fade-in-up space-y-2">
        <div
          className={`whitespace-pre-wrap break-words rounded-2xl rounded-bl-sm px-4 py-3 text-sm ${
            message.isError
              ? "border border-amber-200 bg-amber-50 text-amber-800"
              : "bg-slate-100 text-slate-800"
          }`}
        >
          {message.content}
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pl-1">
            <span className="text-xs font-medium text-slate-500">
              Sources used:
            </span>
            {message.sources.map((s) => (
              <span
                key={s.sourceFile}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600"
              >
                <svg
                  className="h-3 w-3 text-brand-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M4 4a2 2 0 012-2h5.586A2 2 0 0113 2.586L16.414 6A2 2 0 0117 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
                {s.source}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

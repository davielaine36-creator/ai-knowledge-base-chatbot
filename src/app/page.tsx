import Chat from "@/components/Chat";

export default function Home() {
  return (
    <main className="min-h-screen">
      <NavBar />
      <Hero />
      <ChatSection />
      <BusinessValueSection />
      <HowItWorksSection />
      <Footer />
    </main>
  );
}

function NavBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            K
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            KnowledgeBase&nbsp;Chatbot
          </span>
        </div>
        <a
          href="#demo"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Try the demo
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 pb-10 pt-16 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live demo · Trained on a sample business
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            AI Knowledge Base Chatbot
            <span className="block text-brand-600">for Service Businesses</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            A chatbot trained on <em>your</em> documents, FAQs, services,
            pricing and policies. It answers customer questions instantly — using
            only your approved information — and shows the sources behind every
            answer.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#demo"
              className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Try the live demo
            </a>
            <a
              href="#value"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              What it does for your business
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <Checkmark>Answers only from your knowledge base</Checkmark>
            <Checkmark>Cites its sources</Checkmark>
            <Checkmark>Never invents prices or policies</Checkmark>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChatSection() {
  return (
    <section id="demo" className="scroll-mt-20 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div className="lg:sticky lg:top-24">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              The demo
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Meet the Brown Academy assistant
            </h2>
            <p className="mt-4 text-slate-600">
              This chatbot has been trained on the knowledge base of a fictional
              business — <strong>Brown Academy</strong>, a security training and
              requalification academy. Ask it real customer questions and watch
              it answer from the academy&apos;s own documents.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              <FeatureLine title="Grounded answers">
                Every reply is built from retrieved knowledge base passages — not
                the model&apos;s imagination.
              </FeatureLine>
              <FeatureLine title="Honest limits">
                If the answer isn&apos;t in the knowledge base, it says so instead
                of guessing.
              </FeatureLine>
              <FeatureLine title="Source transparency">
                Each answer shows which documents it drew from.
              </FeatureLine>
            </ul>
            <p className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
              For your business, we&apos;d simply swap in your own documents — and
              the assistant would answer about <em>you</em> instead.
            </p>
          </div>

          <Chat />
        </div>
      </div>
    </section>
  );
}

function BusinessValueSection() {
  const benefits = [
    {
      title: "Answer customers 24/7",
      body: "Handle the same questions your team answers every day — opening hours, pricing, requirements — instantly, at any hour.",
      icon: "clock",
    },
    {
      title: "Reduce repetitive enquiries",
      body: "Deflect routine phone calls and emails so your staff can focus on the conversations that actually need a human.",
      icon: "inbox",
    },
    {
      title: "Stay accurate and on-brand",
      body: "The bot answers only from approved content and never invents prices or policies, so customers get consistent information.",
      icon: "shield",
    },
    {
      title: "Build trust with sources",
      body: "Showing the source of each answer reassures customers — and makes it easy for you to spot anything that needs updating.",
      icon: "doc",
    },
    {
      title: "Easy to keep current",
      body: "Update a markdown file, regenerate, and the assistant instantly reflects your latest pricing, courses or policies.",
      icon: "refresh",
    },
    {
      title: "Capture more leads",
      body: "Help prospects get the answers they need to book or buy — right at the moment they're ready to act.",
      icon: "spark",
    },
  ];

  return (
    <section id="value" className="scroll-mt-20 border-y border-slate-200 bg-white py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            What this could do for your business
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            A knowledgeable assistant that never goes off-script
          </h2>
          <p className="mt-4 text-slate-600">
            Turn the documents you already have into a customer-facing assistant
            that works around the clock.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-brand-200 hover:shadow-soft"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon name={b.icon} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {b.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {b.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      n: "1",
      title: "We collect your knowledge",
      body: "Your FAQs, services, pricing, policies and website content become the assistant's knowledge base.",
    },
    {
      n: "2",
      title: "We index it for search",
      body: "The content is split into passages and turned into embeddings so the assistant can find the most relevant parts of any question.",
    },
    {
      n: "3",
      title: "It answers — with sources",
      body: "For each question, the assistant retrieves the best passages and answers strictly from them, citing what it used.",
    },
  ];

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            How it works
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Simple to set up, easy to maintain
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {s.n}
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-500 sm:flex-row">
        <p>
          AI Knowledge Base Chatbot — a demo by an independent developer.
        </p>
        <p className="text-slate-400">
          Brown Academy is a fictional business used for demonstration only.
        </p>
      </div>
    </footer>
  );
}

/* ---------- small presentational helpers ---------- */

function Checkmark({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg
        className="h-4 w-4 text-emerald-500"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.8 6.79-6.8a1 1 0 011.42 0z"
          clipRule="evenodd"
        />
      </svg>
      {children}
    </span>
  );
}

function FeatureLine({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <svg
        className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-500"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.58 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      <span>
        <strong className="font-semibold text-slate-900">{title}.</strong>{" "}
        {children}
      </span>
    </li>
  );
}

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    clock: (
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.3.7l2.5 2.5a1 1 0 001.4-1.4L11 9.6V6z"
        clipRule="evenodd"
      />
    ),
    inbox: (
      <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v6h-3.6l-1 2h-3.8l-1-2H3V5zm0 8v2a2 2 0 002 2h10a2 2 0 002-2v-2h-3l-1 2H7l-1-2H3z" />
    ),
    shield: (
      <path
        fillRule="evenodd"
        d="M9.66 2.24a1 1 0 01.68 0l6 2.2A1 1 0 0117 5.4V10c0 3.8-2.5 6.6-6.6 8a1 1 0 01-.8 0C5.5 16.6 3 13.8 3 10V5.4a1 1 0 01.66-.96l6-2.2zm2.05 5.05a1 1 0 00-1.42-1.42L9 7.16l-.3-.3a1 1 0 10-1.4 1.42l1 1a1 1 0 001.4 0l2-2z"
        clipRule="evenodd"
      />
    ),
    doc: (
      <path d="M4 4a2 2 0 012-2h5.586A2 2 0 0113 2.586L16.414 6A2 2 0 0117 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
    ),
    refresh: (
      <path
        fillRule="evenodd"
        d="M4 2a1 1 0 011 1v2.1A7 7 0 0117 8a1 1 0 11-1.9.6A5 5 0 006.7 6H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm12 16a1 1 0 01-1-1v-2.1A7 7 0 013 12a1 1 0 111.9-.6A5 5 0 0013.3 14H11a1 1 0 110-2h5a1 1 0 011 1v4a1 1 0 01-1 1z"
        clipRule="evenodd"
      />
    ),
    spark: (
      <path d="M10 1l2.2 5.2L18 8l-4.4 3.4L15 17l-5-3-5 3 1.4-5.6L2 8l5.8-1.8L10 1z" />
    ),
  };

  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      {paths[name] ?? paths.doc}
    </svg>
  );
}

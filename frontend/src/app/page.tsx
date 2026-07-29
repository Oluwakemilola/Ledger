import LedgerHero from "@/components/LedgerHero";

const PROBLEMS = [
  {
    n: "01",
    title: "Receipts vanish",
    body: "Paper fades in a back pocket, WhatsApp photos get buried, and by tax season half the trail is gone.",
  },
  {
    n: "02",
    title: "Month-end surprises",
    body: "Owners only see total spend once the bookkeeper compiles everything — after the overspend already happened.",
  },
  {
    n: "03",
    title: "Reimbursement drags",
    body: "An expense submitted by DM sits unread for a week while the employee quietly covers the cost themselves.",
  },
  {
    n: "04",
    title: "No one signs off",
    body: "Without an approval step, company cards get used for anything, and nobody notices until the statement arrives.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Capture",
    body: "Photograph a receipt or forward an email. Vendor, amount, and date get pulled out automatically.",
  },
  {
    n: "02",
    title: "Approve",
    body: "It routes to the right manager based on amount and category. They approve or query it from their phone.",
  },
  {
    n: "03",
    title: "Reconcile",
    body: "Approved expenses sync to your books and roll into a live dashboard — no manual re-entry, ever.",
  },
];

const FEATURES = [
  { title: "Receipt capture + OCR", body: "Snap a photo, get a structured entry — vendor, amount, category, filed automatically." },
  { title: "Approval routing", body: "Set thresholds by amount or department so the right person signs off, every time." },
  { title: "Live budgets", body: "See spend against budget by category as it happens, not thirty days later." },
  { title: "Recurring expenses", body: "Track subscriptions and fixed bills so cash flow surprises stop happening." },
  { title: "Tax-ready exports", body: "Categorized, audit-ready reports in one click when filing season comes around." },
  { title: "Accounting sync", body: "Push approved expenses straight to QuickBooks or Xero — no double entry." },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--paper)]">
      {/* Nav */}
      <header className="border-b border-[var(--rule-light)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--ink)]">
            Ledger
          </span>
          <nav className="hidden items-center gap-8 font-[family-name:var(--font-body)] text-[14px] text-[var(--slate)] md:flex">
            <a href="#problem" className="hover:text-[var(--ink)]">The problem</a>
            <a href="#how" className="hover:text-[var(--ink)]">How it works</a>
            <a href="#features" className="hover:text-[var(--ink)]">Features</a>
          </nav>
          <a
            href="/register"
            className="rounded-sm bg-[var(--ink)] px-4 py-2 text-[14px] font-medium text-[var(--paper)] transition hover:bg-[var(--ledger-dim)]"
          >
            Get started
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-[var(--rule-light)] bg-[var(--paper)]">
        <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <p className="mb-5 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.2em] text-[var(--ledger)]">
              Built for small business, not enterprise
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-[2.75rem] leading-[1.08] tracking-tight text-[var(--ink)] md:text-[3.4rem]">
              Every expense,{" "}
              <span className="italic font-medium">accounted for</span>.
            </h1>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed text-[var(--slate)]">
              Ledger turns scattered receipts and WhatsApp reimbursement requests
              into one clean, approvable trail — so you know where the money
              went before the month is over.
            </p>
            <div className="mt-9 flex items-center gap-4">
              <a
                href="/register"
                className="rounded-sm bg-[var(--ledger)] px-6 py-3 text-[14px] font-medium text-white transition hover:bg-[var(--ledger-dim)]"
              >
                Start free — no card needed
              </a>
              <a
                href="#how"
                className="text-[14px] font-medium text-[var(--ink)] underline decoration-[var(--rule-light)] underline-offset-4 hover:decoration-[var(--ink)]"
              >
                See how it works
              </a>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <LedgerHero />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="border-b border-[var(--rule-light)] bg-[var(--ink)]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="mb-3 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.2em] text-[var(--stamp)]">
            Unresolved items
          </p>
          <h2 className="mb-12 max-w-xl font-[family-name:var(--font-display)] text-[2rem] leading-tight text-[var(--paper)]">
            The same four problems show up in almost every small business.
          </h2>
          <div className="grid gap-px overflow-hidden rounded-sm border border-[var(--rule-dark)] bg-[var(--rule-dark)] md:grid-cols-2">
            {PROBLEMS.map((p) => (
              <div key={p.n} className="bg-[var(--ink)] p-8">
                <span className="font-[family-name:var(--font-mono)] text-[13px] text-[var(--paper)]/40">
                  {p.n}
                </span>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-[19px] text-[var(--paper)]">
                  {p.title}
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--paper)]/65">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-b border-[var(--rule-light)] bg-[var(--paper)]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="mb-3 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.2em] text-[var(--ledger)]">
            The process
          </p>
          <h2 className="mb-14 max-w-xl font-[family-name:var(--font-display)] text-[2rem] leading-tight text-[var(--ink)]">
            From receipt to reconciled books, in three steps.
          </h2>
          <div className="grid gap-10 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative pl-0">
                <div className="flex items-baseline gap-3">
                  <span className="font-[family-name:var(--font-mono)] text-[13px] text-[var(--ledger)]">
                    {s.n}
                  </span>
                  <div className="h-px flex-1 bg-[var(--rule-light)]" />
                </div>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-[20px] text-[var(--ink)]">
                  {s.title}
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--slate)]">
                  {s.body}
                </p>
                {i < STEPS.length - 1 && (
                  <span className="pointer-events-none absolute -right-5 top-8 hidden font-[family-name:var(--font-display)] text-[var(--rule-light)] md:block">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-[var(--rule-light)] bg-[var(--paper)]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="mb-3 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.2em] text-[var(--ledger)]">
            What's included
          </p>
          <h2 className="mb-12 max-w-xl font-[family-name:var(--font-display)] text-[2rem] leading-tight text-[var(--ink)]">
            Everything the MVP needs, nothing an SME won't use.
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="border-t border-[var(--rule-light)] pt-5">
                <h3 className="font-[family-name:var(--font-display)] text-[17px] text-[var(--ink)]">
                  {f.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--slate)]">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--ink)]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-6 py-16 md:flex-row md:items-center">
          <h2 className="max-w-md font-[family-name:var(--font-display)] text-[1.8rem] leading-tight text-[var(--paper)]">
            Close the books with confidence this month.
          </h2>
          <a
            href="/register"
            className="whitespace-nowrap rounded-sm bg-[var(--stamp)] px-6 py-3 text-[14px] font-medium text-[var(--ink)] transition hover:opacity-90"
          >
            Start free — no card needed
          </a>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-6xl px-6 py-8">
        <p className="font-[family-name:var(--font-mono)] text-[12px] text-[var(--slate)]/60">
          © {new Date().getFullYear()} Ledger. Built for small businesses.
        </p>
      </footer>
    </div>
  );
}

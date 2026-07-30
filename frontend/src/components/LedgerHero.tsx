"use client";

import { useEffect, useState } from "react";

type Row = {
  vendor: string;
  category: string;
  amount: number;
};

const ROWS: Row[] = [
  { vendor: "Lagos Print & Co.", category: "Office supplies", amount: 42500 },
  { vendor: "Uber for Business", category: "Travel", amount: 18200 },
  { vendor: "Zoom Workplace", category: "Software", amount: 27600 },
  { vendor: "Ikeja Fuel Depot", category: "Transport", amount: 35000 },
];

export default function LedgerHero() {
  const [visibleRows, setVisibleRows] = useState(0);
  const [showStamp, setShowStamp] = useState(false);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    ROWS.forEach((_, i) => {
      timers.push(
        setTimeout(() => setVisibleRows((n) => Math.max(n, i + 1)), 400 + i * 380)
      );
    });
    timers.push(
      setTimeout(() => setShowStamp(true), 400 + ROWS.length * 380 + 300)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const total = ROWS.slice(0, visibleRows).reduce((s, r) => s + r.amount, 0);

  return (
    <div className="relative w-full max-w-md rounded-sm border border-[var(--rule-dark)]/15 bg-[var(--paper)] shadow-[0_1px_0_rgba(0,0,0,0.05),0_20px_50px_-20px_rgba(14,26,38,0.45)]">
      {/* Ledger header strip */}
      <div className="flex items-center justify-between border-b border-[var(--rule-light)] px-5 py-3">
        <span className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[var(--slate)]/60">
          Expense tracking — July
        </span>
        <span className="h-2 w-2 rounded-full bg-[var(--ledger)]" />
      </div>

      {/* Rows */}
      <div className="px-5 py-4">
        {ROWS.map((row, i) => (
          <div
            key={row.vendor}
            className={`flex items-center justify-between border-b border-dashed border-[var(--rule-light)] py-2.5 last:border-b-0 ${
              i < visibleRows ? "animate-row" : "opacity-0"
            }`}
          >
            <div>
              <p className="text-[13.5px] font-medium text-[var(--ink)]">{row.vendor}</p>
              <p className="font-[var(--font-mono)] text-[11px] text-[var(--slate)]/60">
                {row.category}
              </p>
            </div>
            <span className="font-[var(--font-mono)] text-[13.5px] text-[var(--ink)]">
              ₦{row.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between bg-[var(--ink)] px-5 py-3.5">
        <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--paper)]/60">
          Running total
        </span>
        <span className="font-[var(--font-mono)] text-[15px] font-medium text-[var(--paper)]">
          ₦{total.toLocaleString()}
        </span>
      </div>

      {/* Stamp */}
      {showStamp && (
        <div
          className="animate-stamp pointer-events-none absolute right-8 top-[38%] select-none rounded-sm border-[3px] border-[var(--stamp)] px-3 py-1 font-[var(--font-mono)] text-sm font-bold uppercase tracking-[0.15em] text-[var(--stamp)]"
          style={{ transform: "translate(-50%, -50%) rotate(-14deg)" }}
        >
          Approved
        </div>
      )}
    </div>
  );
}

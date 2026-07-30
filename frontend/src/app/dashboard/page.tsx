"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeDollarSign, CircleDollarSign, Plus, ReceiptText } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/AppShell";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Category, Entry } from "@/types/app";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrencyCompact(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) {
      return;
    }

    let isActive = true;

    const loadData = async () => {
      try {
        const [entryData, categoryData] = await Promise.all([
          apiGet<Entry[]>("/api/entries"),
          apiGet<Category[]>("/api/categories"),
        ]);

        if (isActive) {
          setEntries(entryData);
          setCategories(categoryData);
        }
      } catch (error) {
        if (error instanceof Error && error.message === "Not authenticated") {
          return;
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isActive = false;
    };
  }, [authLoading, isAuthenticated, user]);

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en", {
      month: "long",
      year: "numeric",
    }).format(new Date());
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEntries = entries.filter((entry) => new Date(entry.date) >= monthStart);

    const totalsByCategory = monthEntries.reduce<Record<string, number>>((accumulator, entry) => {
      const key = entry.category?._id || "uncategorized";
      accumulator[key] = (accumulator[key] || 0) + entry.amount;
      return accumulator;
    }, {});

    const topCategory = categories
      .map((category) => ({
        ...category,
        amount: totalsByCategory[category._id] || 0,
      }))
      .sort((left, right) => right.amount - left.amount)[0];

    return {
      totalSpend: monthEntries.reduce((total, entry) => total + entry.amount, 0),
      entryCount: monthEntries.length,
      topCategory,
    };
  }, [categories, entries]);

  const spendByCategory = useMemo(() => {
    const totals = entries.reduce<Record<string, number>>((accumulator, entry) => {
      const key = entry.category?._id || "uncategorized";
      accumulator[key] = (accumulator[key] || 0) + entry.amount;
      return accumulator;
    }, {});

    const total = Object.values(totals).reduce((sum, value) => sum + value, 0);

    return categories
      .map((category) => ({
        ...category,
        amount: totals[category._id] || 0,
      }))
      .filter((item) => item.amount > 0)
      .map((item) => ({
        ...item,
        share: total > 0 ? Math.round((item.amount / total) * 100) : 0,
      }))
      .sort((left, right) => right.amount - left.amount);
  }, [categories, entries]);

  const recentEntries = useMemo(() => entries.slice(0, 5), [entries]);

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 border-b border-[var(--rule-light)] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[var(--ledger)]">
                Overview
              </p>
              <h1 className="mt-2 font-[family-name:var(--font-display)] text-[2rem] text-[var(--ink)] sm:text-[2.4rem]">
                Dashboard
              </h1>
              <p className="mt-2 text-sm text-[var(--slate)]">{monthLabel}</p>
            </div>
            <Link
              href="/entries"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--ledger)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--ledger-dim)]"
            >
              <Plus size={16} />
              New expense
            </Link>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-[var(--rule-light)] bg-white/80 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--slate)]">Total spend this month</p>
                <BadgeDollarSign size={18} className="text-[var(--ledger)]" />
              </div>
              <div className="mt-4 font-[family-name:var(--font-mono)] text-[1.6rem] text-[var(--ink)]">
                {loading ? <div className="h-8 w-28 animate-pulse rounded bg-[var(--rule-light)]" /> : formatCurrencyCompact(stats.totalSpend)}
              </div>
            </div>
            <div className="rounded-lg border border-[var(--rule-light)] bg-white/80 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--slate)]">Entry count</p>
                <ReceiptText size={18} className="text-[var(--ledger)]" />
              </div>
              <div className="mt-4 font-[family-name:var(--font-mono)] text-[1.6rem] text-[var(--ink)]">
                {loading ? <div className="h-8 w-16 animate-pulse rounded bg-[var(--rule-light)]" /> : stats.entryCount}
              </div>
            </div>
            <div className="rounded-lg border border-[var(--rule-light)] bg-white/80 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--slate)]">Top category</p>
                <CircleDollarSign size={18} className="text-[var(--ledger)]" />
              </div>
              <div className="mt-4 text-[1rem] font-semibold text-[var(--ink)]">
                {loading ? <div className="h-8 w-32 animate-pulse rounded bg-[var(--rule-light)]" /> : stats.topCategory?.name || "No data"}
              </div>
              <p className="mt-2 font-[family-name:var(--font-mono)] text-sm text-[var(--slate)]">
                {loading ? null : stats.topCategory ? formatCurrencyCompact(stats.topCategory.amount) : "—"}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-lg border border-[var(--rule-light)] bg-white/80 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-display)] text-[1.25rem] text-[var(--ink)]">Spend by category</h2>
                <span className="font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.25em] text-[var(--slate)]">
                  Live split
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <div className="h-3 w-24 animate-pulse rounded-full bg-[var(--rule-light)]" />
                      <div className="h-3 w-full animate-pulse rounded-full bg-[var(--rule-light)]" />
                    </div>
                  ))
                ) : spendByCategory.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[var(--rule-light)] p-6 text-sm text-[var(--slate)]">
                    No category spend yet. Add your first expense to begin tracking.
                  </div>
                ) : (
                  spendByCategory.map((item) => (
                    <div key={item._id}>
                      <div className="mb-2 flex items-center justify-between text-sm text-[var(--ink)]">
                        <span>{item.name}</span>
                        <span className="font-[family-name:var(--font-mono)]">{formatCurrencyCompact(item.amount)}</span>
                      </div>
                      <div className="h-3 rounded-full bg-[var(--paper)]">
                        <div
                          className="h-3 rounded-full bg-[var(--ledger)]"
                          style={{ width: `${Math.max(item.share, 8)}%` }}
                        />
                      </div>
                      <div className="mt-1 text-right text-[12px] font-[family-name:var(--font-mono)] text-[var(--slate)]">
                        {item.share}% of spend
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-lg border border-[var(--rule-light)] bg-white/80 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-display)] text-[1.25rem] text-[var(--ink)]">Recent entries</h2>
                <Link href="/entries" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--ledger)] hover:text-[var(--ledger-dim)]">
                  View all <ArrowRight size={16} />
                </Link>
              </div>
              <div className="mt-6 space-y-3">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-14 animate-pulse rounded-lg bg-[var(--paper)]" />
                  ))
                ) : recentEntries.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[var(--rule-light)] p-6 text-sm text-[var(--slate)]">
                    No expenses yet — add your first one.
                  </div>
                ) : (
                  recentEntries.map((entry) => (
                    <div key={entry._id} className="flex items-center justify-between rounded-lg border border-[var(--rule-light)] bg-[var(--paper)] px-4 py-3 transition-colors hover:bg-white">
                      <div>
                        <p className="font-medium text-[var(--ink)]">{entry.vendor}</p>
                        <div className="mt-1 flex items-center gap-2 text-sm text-[var(--slate)]">
                          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--ledger)]">
                            {entry.category?.name || "Uncategorized"}
                          </span>
                          <span>{new Date(entry.date).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                        </div>
                      </div>
                      <div className="font-[family-name:var(--font-mono)] text-sm text-[var(--ink)]">
                        {formatCurrencyCompact(entry.amount)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

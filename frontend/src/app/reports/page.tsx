"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/AppShell";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Category, Entry } from "@/types/app";

function formatCurrency(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

function formatCurrencyCompact(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

function formatCsvAmount(value: number) {
  return Number(value.toFixed(2)).toString();
}

function formatMonthLabel(value: string) {
  return new Date(value).toLocaleDateString("en", {
    month: "short",
    year: "numeric",
  });
}

interface CategorySpend {
  _id: string;
  name: string;
  amount: number;
  entryCount: number;
  share: number;
}

interface MonthSpend {
  key: string;
  label: string;
  amount: number;
}

export default function ReportsPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) {
      return;
    }

    const loadData = async () => {
      try {
        const [entryData, categoryData] = await Promise.all([
          apiGet<Entry[]>("/api/entries"),
          apiGet<Category[]>("/api/categories"),
        ]);
        setEntries(entryData);
        setCategories(categoryData);
      } catch (error) {
        if (error instanceof Error && error.message === "Not authenticated") {
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [authLoading, isAuthenticated, user]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesCategory = categoryFilter === "all" || entry.category?._id === categoryFilter;
      const entryDate = new Date(entry.date);
      const matchesStart = !startDate || entryDate >= new Date(startDate);
      const matchesEnd = !endDate || entryDate <= new Date(endDate);

      return matchesCategory && matchesStart && matchesEnd;
    });
  }, [categoryFilter, endDate, entries, startDate]);

  const summary = useMemo(() => {
    const totalSpend = filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const averageExpense = filteredEntries.length > 0 ? totalSpend / filteredEntries.length : 0;

    return {
      totalSpend,
      entryCount: filteredEntries.length,
      averageExpense,
    };
  }, [filteredEntries]);

  const categorySpend = useMemo(() => {
    const totals = filteredEntries.reduce<Record<string, number>>((accumulator, entry) => {
      const key = entry.category?._id || "uncategorized";
      accumulator[key] = (accumulator[key] || 0) + entry.amount;
      return accumulator;
    }, {});

    const total = Object.values(totals).reduce((sum, value) => sum + value, 0);

    return categories
      .map((category) => ({
        ...category,
        amount: totals[category._id] || 0,
        entryCount: filteredEntries.filter((entry) => entry.category?._id === category._id).length,
      }))
      .filter((item) => item.amount > 0)
      .map((item) => ({
        ...item,
        share: total > 0 ? Math.round((item.amount / total) * 100) : 0,
      }))
      .sort((left, right) => right.amount - left.amount);
  }, [categories, filteredEntries]);

  const monthSpend = useMemo(() => {
    const grouped = filteredEntries.reduce<Record<string, number>>((accumulator, entry) => {
      const monthKey = new Date(entry.date).toISOString().slice(0, 7);
      accumulator[monthKey] = (accumulator[monthKey] || 0) + entry.amount;
      return accumulator;
    }, {});

    return Object.entries(grouped)
      .map(([key, amount]) => ({
        key,
        label: formatMonthLabel(`${key}-01`),
        amount,
      }))
      .sort((left, right) => left.key.localeCompare(right.key));
  }, [filteredEntries]);

  const hasEntries = entries.length > 0;
  const hasFilteredResults = filteredEntries.length > 0;

  const handleDownload = () => {
    if (!filteredEntries.length) {
      return;
    }

    const rows = filteredEntries.map((entry) => [
      entry.vendor,
      entry.category?.name || "Uncategorized",
      entry.date,
      formatCsvAmount(entry.amount),
      entry.notes || "",
    ]);

    const csvLines = [
      ["Vendor", "Category", "Date", "Amount (NGN)", "Notes"],
      ...rows,
    ].map((row) =>
      row
        .map((value) => {
          const stringValue = String(value).replace(/"/g, '""');
          return /[",\n]/.test(stringValue) ? `"${stringValue}"` : stringValue;
        })
        .join(",")
    );

    const csvContent = `${csvLines.join("\n")}\n`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kobo-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="mx-auto max-w-6xl page-enter">
          <div className="flex flex-col gap-4 border-b border-[var(--rule-light)] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[var(--ledger)]">
                Reports
              </p>
              <h1 className="mt-2 font-[family-name:var(--font-display)] text-[1.9rem] leading-tight text-[var(--ink)] sm:text-[2.4rem]">
                Expense reports
              </h1>
              <p className="mt-2 text-sm text-[var(--slate)]">
                Review spend trends for {user?.businessName || "your business"}.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!hasFilteredResults}
                title={!hasFilteredResults ? "Add entries to export the current report" : "Download the filtered report as CSV"}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--ledger)] px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-[var(--ledger-dim)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--ledger)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Download report
              </button>
              {!hasFilteredResults ? (
                <p className="text-xs text-[var(--slate)]">No expenses to export from the current view.</p>
              ) : null}
            </div>
          </div>

          <div className="mt-6 rounded-[20px] border border-[var(--rule-light)] bg-white/80 p-4 shadow-[0_1px_2px_rgba(14,26,38,0.04),0_8px_24px_-8px_rgba(14,26,38,0.12)] sm:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap lg:items-end">
              <label className="w-full text-sm font-medium text-[var(--ink)] md:w-[220px] lg:flex-1">
                <span className="mb-2 block">Category</span>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="w-full rounded-lg border border-[var(--rule-light)] bg-[var(--paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ledger)]"
                >
                  <option value="all">All categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-[var(--ink)]">
                <span className="mb-2 block">From</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="w-full rounded-lg border border-[var(--rule-light)] bg-[var(--paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ledger)]"
                />
              </label>
              <label className="text-sm font-medium text-[var(--ink)]">
                <span className="mb-2 block">To</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="w-full rounded-lg border border-[var(--rule-light)] bg-[var(--paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ledger)]"
                />
              </label>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-lg border border-[var(--rule-light)] bg-white/80 shadow-sm" />
              ))}
            </div>
          ) : !hasEntries ? (
            <div className="mt-8 rounded-[20px] border border-[var(--rule-light)] bg-white/80 p-8 text-center shadow-[0_1px_2px_rgba(14,26,38,0.04),0_8px_24px_-8px_rgba(14,26,38,0.12)] sm:p-10">
              <p className="font-[family-name:var(--font-display)] text-[1.2rem] text-[var(--ink)]">
                No expenses yet — once you add entries, your reports will show up here.
              </p>
              <p className="mt-3 text-sm text-[var(--slate)]">
                Start by adding your first expense in Kobo and come back to review the trends.
              </p>
              <Link href="/entries" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-[var(--ledger)] px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-[var(--ledger-dim)] active:scale-[0.98]">
                Add your first expense
              </Link>
            </div>
          ) : !hasFilteredResults ? (
            <div className="mt-8 rounded-[20px] border border-dashed border-[var(--rule-light)] bg-white/80 p-8 text-center shadow-[0_1px_2px_rgba(14,26,38,0.04),0_8px_24px_-8px_rgba(14,26,38,0.12)] sm:p-10">
              <p className="font-[family-name:var(--font-display)] text-[1.1rem] text-[var(--ink)]">
                No expenses match these filters.
              </p>
              <p className="mt-2 text-sm text-[var(--slate)]">
                Try broadening the date range or category selection to see the report again.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                <div className="rounded-lg border border-[var(--rule-light)] bg-white/80 p-6 shadow-sm">
                  <p className="text-sm text-[var(--slate)]">Total spend</p>
                  <div className="mt-4 font-[family-name:var(--font-mono)] text-[1.5rem] text-[var(--ink)]">
                    {formatCurrencyCompact(summary.totalSpend)}
                  </div>
                </div>
                <div className="rounded-lg border border-[var(--rule-light)] bg-white/80 p-6 shadow-sm">
                  <p className="text-sm text-[var(--slate)]">Entry count</p>
                  <div className="mt-4 font-[family-name:var(--font-mono)] text-[1.5rem] text-[var(--ink)]">
                    {summary.entryCount}
                  </div>
                </div>
                <div className="rounded-lg border border-[var(--rule-light)] bg-white/80 p-6 shadow-sm">
                  <p className="text-sm text-[var(--slate)]">Average expense</p>
                  <div className="mt-4 font-[family-name:var(--font-mono)] text-[1.5rem] text-[var(--ink)]">
                    {formatCurrencyCompact(summary.averageExpense)}
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <section className="rounded-lg border border-[var(--rule-light)] bg-white/80 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="font-[family-name:var(--font-display)] text-[1.25rem] text-[var(--ink)]">Spend by category</h2>
                    <span className="text-[11px] uppercase tracking-[0.25em] text-[var(--slate)]">Filtered</span>
                  </div>
                  <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-[var(--paper)] text-[var(--slate)]">
                        <tr>
                          <th className="px-3 py-3 font-medium">Category</th>
                          <th className="px-3 py-3 font-medium text-right">Total</th>
                          <th className="px-3 py-3 font-medium text-right">Entries</th>
                          <th className="px-3 py-3 font-medium text-right">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categorySpend.map((item) => (
                          <tr key={item._id} className="border-t border-[var(--rule-light)]">
                            <td className="px-3 py-3 text-[var(--ink)]">{item.name}</td>
                            <td className="px-3 py-3 text-right font-[family-name:var(--font-mono)] text-[var(--ink)]">
                              {formatCurrency(item.amount)}
                            </td>
                            <td className="px-3 py-3 text-right font-[family-name:var(--font-mono)] text-[var(--ink)]">
                              {item.entryCount}
                            </td>
                            <td className="px-3 py-3 text-right font-[family-name:var(--font-mono)] text-[var(--ink)]">
                              {item.share}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-6 space-y-4">
                    {categorySpend.map((item) => (
                      <div key={item._id}>
                        <div className="mb-2 flex items-center justify-between text-sm text-[var(--ink)]">
                          <span>{item.name}</span>
                          <span className="font-[family-name:var(--font-mono)]">{formatCurrencyCompact(item.amount)}</span>
                        </div>
                        <div className="h-3 rounded-full bg-[var(--paper)]">
                          <div className="h-3 rounded-full bg-[var(--ledger)]" style={{ width: `${Math.max(item.share, 8)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-lg border border-[var(--rule-light)] bg-white/80 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="font-[family-name:var(--font-display)] text-[1.25rem] text-[var(--ink)]">Spend by month</h2>
                    <span className="text-[11px] uppercase tracking-[0.25em] text-[var(--slate)]">Trend</span>
                  </div>
                  <div className="mt-6 space-y-4">
                    {monthSpend.map((item) => (
                      <div key={item.key}>
                        <div className="mb-2 flex items-center justify-between text-sm text-[var(--ink)]">
                          <span>{item.label}</span>
                          <span className="font-[family-name:var(--font-mono)]">{formatCurrencyCompact(item.amount)}</span>
                        </div>
                        <div className="h-3 rounded-full bg-[var(--paper)]">
                          <div
                            className="h-3 rounded-full bg-[var(--ledger-dim)]"
                            style={{ width: `${Math.min(100, Math.max(10, (item.amount / Math.max(...monthSpend.map((month) => month.amount), 1)) * 100))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit3, Filter, Plus, Search, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/AppShell";
import EntryModal from "@/components/EntryModal";
import { apiDelete, apiGet } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Category, Entry } from "@/types/app";

function formatCurrency(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

export default function EntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadEntries = async () => {
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
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) {
      return;
    }

    void loadEntries();
  }, [authLoading, isAuthenticated, user]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch = entry.vendor.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "all" || entry.category?._id === selectedCategory;
      const entryDate = new Date(entry.date);
      const matchesStart = !startDate || entryDate >= new Date(startDate);
      const matchesEnd = !endDate || entryDate <= new Date(endDate);

      return matchesSearch && matchesCategory && matchesStart && matchesEnd;
    });
  }, [entries, search, selectedCategory, startDate, endDate]);

  const handleDelete = async (entry: Entry) => {
    const confirmed = window.confirm(`Delete ${entry.vendor}?`);
    if (!confirmed) {
      return;
    }

    try {
      await apiDelete(`/api/entries/${entry._id}`);
      await loadEntries();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete entry.");
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 border-b border-[var(--rule-light)] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[var(--ledger)]">
                Kobo
              </p>
              <h1 className="mt-2 font-[family-name:var(--font-display)] text-[2rem] text-[var(--ink)] sm:text-[2.4rem]">
                Entries
              </h1>
              <p className="mt-2 text-sm text-[var(--slate)]">Track every expense and keep the trail current.</p>
            </div>
            <button
              onClick={() => {
                setSelectedEntry(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--ledger)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--ledger-dim)]"
            >
              <Plus size={16} />
              Add expense
            </button>
          </div>

          <div className="mt-6 rounded-lg border border-[var(--rule-light)] bg-white/80 p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <label className="flex-1 text-sm font-medium text-[var(--ink)]">
                <span className="mb-2 flex items-center gap-2">
                  <Search size={14} /> Search vendor
                </span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-lg border border-[var(--rule-light)] bg-[var(--paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ledger)]"
                  placeholder="Search by vendor"
                />
              </label>
              <label className="text-sm font-medium text-[var(--ink)]">
                <span className="mb-2 flex items-center gap-2">
                  <Filter size={14} /> Category
                </span>
                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
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

          <div className="mt-6 overflow-hidden rounded-lg border border-[var(--rule-light)] bg-white/80 shadow-sm">
            {loading ? (
              <div className="space-y-3 p-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-12 animate-pulse rounded-lg bg-[var(--paper)]" />
                ))}
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="p-10 text-center">
                <p className="font-[family-name:var(--font-display)] text-[1.15rem] text-[var(--ink)]">No expenses yet</p>
                <p className="mt-2 text-sm text-[var(--slate)]">Try widening the filters or add your first expense from the button above.</p>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-[var(--paper)] text-[var(--slate)]">
                      <tr>
                        <th className="px-4 py-3 font-medium">Vendor</th>
                        <th className="px-4 py-3 font-medium">Category</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium text-right">Amount</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEntries.map((entry) => (
                        <tr key={entry._id} className="border-t border-[var(--rule-light)] transition-colors hover:bg-[var(--paper)]">
                          <td className="px-4 py-3 font-medium text-[var(--ink)]">{entry.vendor}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-[var(--paper)] px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--ledger)]">
                              {entry.category?.name || "Uncategorized"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[var(--slate)]">{new Date(entry.date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</td>
                          <td className="px-4 py-3 text-right font-[family-name:var(--font-mono)] text-[var(--ink)]">{formatCurrency(entry.amount)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedEntry(entry);
                                  setModalOpen(true);
                                }}
                                className="rounded-lg border border-[var(--rule-light)] p-2 text-[var(--slate)] transition-colors hover:bg-white"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => void handleDelete(entry)}
                                className="rounded-lg border border-[var(--rule-light)] p-2 text-[var(--slate)] transition-colors hover:bg-white"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 p-4 md:hidden">
                  {filteredEntries.map((entry) => (
                    <div key={entry._id} className="rounded-lg border border-[var(--rule-light)] bg-[var(--paper)] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-[var(--ink)]">{entry.vendor}</p>
                          <p className="mt-1 text-sm text-[var(--slate)]">{new Date(entry.date).toLocaleDateString("en", { month: "short", day: "numeric" })}</p>
                        </div>
                        <div className="font-[family-name:var(--font-mono)] text-[var(--ink)]">{formatCurrency(entry.amount)}</div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--ledger)]">
                          {entry.category?.name || "Uncategorized"}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedEntry(entry);
                              setModalOpen(true);
                            }}
                            className="rounded-lg border border-[var(--rule-light)] p-2 text-[var(--slate)]"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => void handleDelete(entry)}
                            className="rounded-lg border border-[var(--rule-light)] p-2 text-[var(--slate)]"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <EntryModal
          open={modalOpen}
          entry={selectedEntry}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            setSelectedEntry(null);
            void loadEntries();
          }}
          onCategoryCreated={(category) => {
            setCategories((current) => [...current, category]);
          }}
        />
      </AppShell>
    </ProtectedRoute>
  );
}

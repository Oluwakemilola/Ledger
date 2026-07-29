"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/AppShell";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Category, Entry } from "@/types/app";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [categoryName, setCategoryName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [categoryData, entryData] = await Promise.all([
        apiGet<Category[]>("/api/categories"),
        apiGet<Entry[]>("/api/entries"),
      ]);
      setCategories(categoryData);
      setEntries(entryData);
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

    void loadData();
  }, [authLoading, isAuthenticated, user]);

  const counts = useMemo(() => {
    return categories.reduce<Record<string, number>>((accumulator, category) => {
      accumulator[category._id] = entries.filter((entry) => entry.category?._id === category._id).length;
      return accumulator;
    }, {});
  }, [categories, entries]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);

    if (!categoryName.trim()) {
      setFeedback("Category name is required.");
      return;
    }

    try {
      setSubmitting(true);
      const created = await apiPost<Category>("/api/categories", { name: categoryName.trim() });
      setCategories((current) => [...current, created]);
      setCategoryName("");
      setFeedback(null);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to create category.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category: Category) => {
    const count = counts[category._id] || 0;
    const confirmed = window.confirm(
      count > 0
        ? `This category is used by ${count} entr${count === 1 ? "y" : "ies"}. They will need a new category before you can delete this.`
        : `Delete ${category.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiDelete(`/api/categories/${category._id}`);
      await loadData();
      setFeedback(null);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to delete category.");
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-4 border-b border-[var(--rule-light)] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[var(--ledger)]">
                Structure
              </p>
              <h1 className="mt-2 font-[family-name:var(--font-display)] text-[2rem] text-[var(--ink)] sm:text-[2.4rem]">
                Categories
              </h1>
              <p className="mt-2 text-sm text-[var(--slate)]">Group expenses with a reusable ledger structure.</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="mt-6 rounded-lg border border-[var(--rule-light)] bg-white/80 p-4 shadow-sm sm:flex sm:items-end sm:gap-3">
            <label className="flex-1 text-sm font-medium text-[var(--ink)]">
              <span className="mb-2 block">Add a category</span>
              <input
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                className="w-full rounded-lg border border-[var(--rule-light)] bg-[var(--paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ledger)]"
                placeholder="Travel, software, rent"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--ledger)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--ledger-dim)] disabled:cursor-not-allowed disabled:opacity-70 sm:mt-0"
            >
              <Plus size={16} />
              Add category
            </button>
          </form>

          {feedback ? (
            <div className="mt-4 rounded-lg border border-[var(--rule-light)] bg-white/80 px-4 py-3 text-sm text-[var(--ink)]">
              {feedback}
            </div>
          ) : null}

          <div className="mt-6 space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-lg border border-[var(--rule-light)] bg-white/80" />
              ))
            ) : categories.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--rule-light)] bg-white/80 p-8 text-center text-sm text-[var(--slate)]">
                No categories yet. Start with your first one above.
              </div>
            ) : (
              categories.map((category) => (
                <div key={category._id} className="flex items-center justify-between rounded-lg border border-[var(--rule-light)] bg-white/80 p-4 shadow-sm transition-colors hover:bg-[var(--paper)]">
                  <div>
                    <p className="font-medium text-[var(--ink)]">{category.name}</p>
                    <p className="mt-1 text-sm text-[var(--slate)]">{counts[category._id] || 0} entr{(counts[category._id] || 0) === 1 ? "y" : "ies"}</p>
                  </div>
                  <button
                    onClick={() => void handleDelete(category)}
                    className="rounded-lg border border-[var(--rule-light)] p-2 text-[var(--slate)] transition-colors hover:bg-white"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

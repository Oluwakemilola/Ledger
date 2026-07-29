"use client";

import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, PlusCircle, X } from "lucide-react";
import type { Category, Entry } from "@/types/app";
import { apiPost, apiPut } from "@/lib/api";

interface EntryModalProps {
  open: boolean;
  entry?: Entry | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
  onCategoryCreated: (category: Category) => void;
}

const initialState = {
  vendor: "",
  amount: "",
  category: "",
  date: new Date().toISOString().slice(0, 10),
  notes: "",
};

export default function EntryModal({
  open,
  entry,
  categories,
  onClose,
  onSaved,
  onCategoryCreated,
}: EntryModalProps) {
  const [vendor, setVendor] = useState(initialState.vendor);
  const [amount, setAmount] = useState(initialState.amount);
  const [category, setCategory] = useState(initialState.category);
  const [date, setDate] = useState(initialState.date);
  const [notes, setNotes] = useState(initialState.notes);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (entry) {
      setVendor(entry.vendor);
      setAmount(String(entry.amount));
      setCategory(entry.category?._id || "");
      setDate(entry.date ? new Date(entry.date).toISOString().slice(0, 10) : initialState.date);
      setNotes(entry.notes || "");
    } else {
      setVendor(initialState.vendor);
      setAmount(initialState.amount);
      setCategory(initialState.category);
      setDate(initialState.date);
      setNotes(initialState.notes);
    }

    setNewCategoryName("");
    setShowNewCategoryInput(false);
    setError(null);
  }, [entry, open]);

  const categoryOptions = useMemo(() => {
    return [
      { _id: "", name: "Select category" },
      ...categories,
      { _id: "__new__", name: "+ New category" },
    ];
  }, [categories]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const trimmedVendor = vendor.trim();
    const parsedAmount = Number(amount);

    if (!trimmedVendor) {
      setError("Vendor is required.");
      return;
    }

    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    if (!category && !showNewCategoryInput) {
      setError("Please choose a category.");
      return;
    }

    try {
      setSubmitting(true);
      let selectedCategoryId = category;

      if (showNewCategoryInput) {
        const created = await apiPost<Category>("/api/categories", {
          name: newCategoryName.trim(),
        });
        onCategoryCreated(created);
        selectedCategoryId = created._id;
      }

      const payload = {
        vendor: trimmedVendor,
        amount: parsedAmount,
        category: selectedCategoryId,
        date,
        notes: notes.trim(),
      };

      if (entry) {
        await apiPut<Entry>(`/api/entries/${entry._id}`, payload);
      } else {
        await apiPost<Entry>("/api/entries", payload);
      }

      onSaved();
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:rgba(14,26,38,0.55)] px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-lg border border-[var(--rule-light)] bg-[var(--paper)] p-6 shadow-sm animate-[fadeIn_200ms_ease-out]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[var(--ledger)]">
              {entry ? "Edit expense" : "New expense"}
            </p>
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-[1.35rem] text-[var(--ink)]">
              {entry ? "Adjust the entry" : "Record a new expense"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--rule-light)] p-2 text-[var(--slate)] transition-colors hover:bg-white"
          >
            <X size={16} />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {error ? (
            <div className="rounded-lg border border-[var(--rule-light)] bg-white/80 px-4 py-3 text-sm text-[var(--ink)]">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-[var(--ink)]">
              <span className="mb-2 block">Vendor</span>
              <input
                value={vendor}
                onChange={(event) => setVendor(event.target.value)}
                className="w-full rounded-lg border border-[var(--rule-light)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--ledger)]"
                placeholder="e.g. Riverpoint Supplies"
              />
            </label>

            <label className="text-sm font-medium text-[var(--ink)]">
              <span className="mb-2 block">Amount</span>
              <div className="flex items-center rounded-lg border border-[var(--rule-light)] bg-white px-3 py-2.5 focus-within:border-[var(--ledger)]">
                <span className="mr-2 font-[family-name:var(--font-mono)] text-[var(--slate)]">₦</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="0.00"
                />
              </div>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-[var(--ink)]">
              <span className="mb-2 block">Category</span>
              <select
                value={category}
                onChange={(event) => {
                  const selectedValue = event.target.value;
                  if (selectedValue === "__new__") {
                    setShowNewCategoryInput(true);
                    setCategory("");
                  } else {
                    setShowNewCategoryInput(false);
                    setCategory(selectedValue);
                  }
                }}
                className="w-full rounded-lg border border-[var(--rule-light)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--ledger)]"
              >
                {categoryOptions.map((option) => (
                  <option key={option._id || option.name} value={option._id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-[var(--ink)]">
              <span className="mb-2 block">Date</span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-lg border border-[var(--rule-light)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--ledger)]"
              />
            </label>
          </div>

          {showNewCategoryInput ? (
            <div className="rounded-lg border border-dashed border-[var(--rule-light)] bg-white/70 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--ink)]">
                <PlusCircle size={16} className="text-[var(--ledger)]" />
                Create a new category
              </div>
              <input
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                className="mt-3 w-full rounded-lg border border-[var(--rule-light)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--ledger)]"
                placeholder="Office supplies"
              />
            </div>
          ) : null}

          <label className="block text-sm font-medium text-[var(--ink)]">
            <span className="mb-2 block">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="min-h-28 w-full rounded-lg border border-[var(--rule-light)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--ledger)]"
              placeholder="Optional context or receipts"
            />
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-[var(--rule-light)] pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--rule-light)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--paper)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-lg bg-[var(--ledger)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--ledger-dim)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? <LoaderCircle size={16} className="animate-spin" /> : null}
              {entry ? "Save changes" : "Create entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

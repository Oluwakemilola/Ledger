"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@kobo.test");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--paper)] px-4 py-10">
      <div className="w-full max-w-md rounded-[24px] border border-[var(--rule-light)] bg-white/80 p-6 shadow-[0_1px_2px_rgba(14,26,38,0.04),0_8px_24px_-8px_rgba(14,26,38,0.12)] sm:p-8">
        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[var(--ledger)]">
          Sign in
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[1.7rem] text-[var(--ink)]">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-[var(--slate)]">
          Enter your credentials to access your expense tracker.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error ? (
            <div className="rounded-lg border border-[var(--rule-light)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)]">
              {error}
            </div>
          ) : null}
          <label className="block text-sm font-medium text-[var(--ink)]">
            <span className="mb-2 block">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-[var(--rule-light)] bg-white px-3 py-2.5 text-sm outline-none transition-all duration-150 focus:border-[var(--ledger)] focus-visible:ring-2 focus-visible:ring-[var(--ledger)]/20"
            />
          </label>
          <label className="block text-sm font-medium text-[var(--ink)]">
            <span className="mb-2 block">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-[var(--rule-light)] bg-white px-3 py-2.5 text-sm outline-none transition-all duration-150 focus:border-[var(--ledger)] focus-visible:ring-2 focus-visible:ring-[var(--ledger)]/20"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--ledger)] px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-[var(--ledger-dim)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--ledger)] focus-visible:ring-offset-2"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiPost } from "@/lib/api";

interface RegisterFormErrors {
  businessName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RegisterFormErrors>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const validateFields = () => {
    const nextErrors: RegisterFormErrors = {};

    if (!businessName.trim()) {
      nextErrors.businessName = "Business name is required";
    }

    if (!email.trim()) {
      nextErrors.email = "Email is required";
    }

    if (!password) {
      nextErrors.password = "Password is required";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!validateFields()) {
      return;
    }

    setLoading(true);

    try {
      await apiPost<{ token: string; user: { id: string; businessName: string; email: string } }>(
        "/api/auth/register",
        {
          businessName: businessName.trim(),
          email: email.trim(),
          password,
        }
      );

      await login(email.trim(), password);
      router.replace("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--paper)] px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-[var(--rule-light)] bg-white/80 p-8 shadow-sm">
        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[var(--ledger)]">
          Create account
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[1.7rem] text-[var(--ink)]">
          Set up your ledger
        </h1>
        <p className="mt-2 text-sm text-[var(--slate)]">
          Register your business to start tracking expenses.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error ? (
            <div className="rounded-lg border border-[var(--rule-light)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)]">
              {error}
            </div>
          ) : null}

          <label className="block text-sm font-medium text-[var(--ink)]">
            <span className="mb-2 block">Business Name</span>
            <input
              type="text"
              value={businessName}
              onChange={(event) => {
                setBusinessName(event.target.value);
                if (fieldErrors.businessName) {
                  setFieldErrors((current) => ({ ...current, businessName: undefined }));
                }
              }}
              className="w-full rounded-lg border border-[var(--rule-light)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--ledger)]"
            />
            {fieldErrors.businessName ? (
              <p className="mt-1 text-sm text-[var(--slate)]">{fieldErrors.businessName}</p>
            ) : null}
          </label>

          <label className="block text-sm font-medium text-[var(--ink)]">
            <span className="mb-2 block">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((current) => ({ ...current, email: undefined }));
                }
              }}
              className="w-full rounded-lg border border-[var(--rule-light)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--ledger)]"
            />
            {fieldErrors.email ? (
              <p className="mt-1 text-sm text-[var(--slate)]">{fieldErrors.email}</p>
            ) : null}
          </label>

          <label className="block text-sm font-medium text-[var(--ink)]">
            <span className="mb-2 block">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((current) => ({ ...current, password: undefined }));
                }
              }}
              className="w-full rounded-lg border border-[var(--rule-light)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--ledger)]"
            />
            {fieldErrors.password ? (
              <p className="mt-1 text-sm text-[var(--slate)]">{fieldErrors.password}</p>
            ) : null}
          </label>

          <label className="block text-sm font-medium text-[var(--ink)]">
            <span className="mb-2 block">Confirm Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                if (fieldErrors.confirmPassword) {
                  setFieldErrors((current) => ({ ...current, confirmPassword: undefined }));
                }
              }}
              className="w-full rounded-lg border border-[var(--rule-light)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--ledger)]"
            />
            {fieldErrors.confirmPassword ? (
              <p className="mt-1 text-sm text-[var(--slate)]">{fieldErrors.confirmPassword}</p>
            ) : null}
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--ledger)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--ledger-dim)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--slate)]">
          <a href="/login" className="font-medium text-[var(--ledger)]">
            Already have an account? Log in
          </a>
        </p>
      </div>
    </div>
  );
}

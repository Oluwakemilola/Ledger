"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--paper)] px-6">
        <div className="w-full max-w-sm rounded-lg border border-[var(--rule-light)] bg-white/70 p-8 shadow-sm">
          <div className="h-3 w-24 animate-pulse rounded-full bg-[var(--rule-light)]" />
          <div className="mt-4 h-3 w-full animate-pulse rounded-full bg-[var(--rule-light)]" />
          <div className="mt-3 h-3 w-4/5 animate-pulse rounded-full bg-[var(--rule-light)]" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

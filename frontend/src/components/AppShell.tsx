"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, LayoutGrid, LogOut, Menu, NotebookPen, Tags, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/entries", label: "Entries", icon: NotebookPen },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <aside className="flex h-full flex-col bg-[var(--ink)] px-5 py-6 text-[var(--paper)]">
      <div className="px-2 pb-8">
        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[var(--stamp)]">
          Kobo
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-[1.4rem] leading-tight text-white">
          {user?.businessName || "Your business"}
        </h2>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[var(--stamp)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ink)] ${
                active
                  ? "bg-[color:rgba(255,255,255,0.12)] text-white"
                  : "text-[color:rgba(246,243,236,0.8)] hover:bg-[color:rgba(255,255,255,0.08)] hover:text-white"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${active ? "bg-[var(--stamp)]" : "bg-transparent"}`}
              />
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => {
          logout();
          setMobileOpen(false);
        }}
        className="mt-6 flex min-h-11 items-center gap-3 rounded-lg border border-white/10 px-3 py-3 text-sm font-medium text-[color:rgba(246,243,236,0.85)] transition-all duration-150 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[var(--stamp)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ink)]"
      >
        <LogOut size={16} />
        Logout
      </button>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <div className="hidden lg:block lg:w-72 lg:flex-none">
          {sidebar}
        </div>

        <div className="flex-1">
          <header className="border-b border-[var(--rule-light)] bg-[var(--paper)] px-4 py-4 lg:hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[var(--ledger)]">
                  Kobo
                </p>
                <h2 className="font-[family-name:var(--font-display)] text-[1.2rem] text-[var(--ink)]">
                  {user?.businessName || "Your business"}
                </h2>
              </div>
              <button
                onClick={() => setMobileOpen((value) => !value)}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--rule-light)] bg-white/80 p-2 text-[var(--slate)] shadow-[0_1px_2px_rgba(14,26,38,0.04),0_8px_24px_-8px_rgba(14,26,38,0.12)] transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[var(--ledger)] focus-visible:ring-offset-2"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
            {mobileOpen ? (
              <>
                <button
                  type="button"
                  aria-label="Close navigation"
                  className="fixed inset-0 z-30 bg-[var(--ink)]/40 backdrop-blur-sm"
                  onClick={() => setMobileOpen(false)}
                />
                <div className="fixed inset-y-0 left-0 z-40 mt-16 w-[85vw] max-w-[320px] translate-x-0 rounded-r-2xl border-r border-[var(--rule-light)] bg-[var(--ink)] shadow-[0_20px_60px_-20px_rgba(14,26,38,0.55)] transition-transform duration-200">
                  {sidebar}
                </div>
              </>
            ) : null}
          </header>

          <main className="min-h-screen bg-[var(--paper)] p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

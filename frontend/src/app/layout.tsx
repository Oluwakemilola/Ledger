import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Ledger — Expense tracking for small businesses",
  description:
    "Capture receipts, route approvals, and see where every naira goes — built for SMEs, not enterprises.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--paper)] text-[var(--slate)]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

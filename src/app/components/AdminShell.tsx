"use client";

// src/components/AdminShell.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAV = [
  { label: "Dashboard", href: "/admin" },
  { label: "Users", href: "/admin/users" },
  { label: "Teams", href: "/admin/teams" },
  { label: "Events", href: "/admin/events" },
  { label: "Challenges", href: "/admin/challenges" },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5">
                🛡️
              </div>
              <div className="leading-tight">
                <div className="text-sm font-extrabold tracking-wide text-white">
                  UITCTF
                </div>
                <div className="text-xs text-white/50">Admin Panel</div>
              </div>
            </Link>

            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
            >
              Back to site
            </Link>
          </div>

          {/* Nav tabs */}
          <div className="pb-3">
            <div className="flex flex-wrap gap-2">
              {NAV.map((n) => {
                const active =
                  pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href));
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${
                      active
                        ? "bg-[#077c8a]/20 text-white ring-[#077c8a]/40"
                        : "bg-white/5 text-white/60 ring-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {children}
    </main>
  );
}

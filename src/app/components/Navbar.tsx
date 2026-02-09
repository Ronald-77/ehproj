"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaFlag, FaBookOpen } from "react-icons/fa";

type Me = { user: { id: string; username: string; email: string } | null };

export default function Navbar() {
  const [me, setMe] = useState<Me["user"]>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data: Me = await res.json();
        setMe(data.user || null);
      } catch {
        setMe(null);
      }
    })();
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* ✅ UITCTF is link to home */}
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
            <FaFlag className="h-5 w-5 text-[#077c8a]" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-[#077c8a]">UIT</span>
            <span className="text-white">CTF</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/practice" className="inline-flex items-center gap-2 text-white/75 hover:text-white transition">
            <FaBookOpen className="text-white/40" />
            Practice
          </Link>

          <Link
            href="/event"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 transition"
          >
            Go to Event <span className="text-[#077c8a]">→</span>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {me ? (
            <>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 transition"
              >
                <span className="max-w-[140px] truncate">{me.username}</span>
              </Link>

              <button onClick={logout} className="text-sm font-semibold text-white/70 hover:text-white transition">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-white/70 hover:text-white">
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-[#077c8a] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

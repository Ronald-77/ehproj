"use client";

import { useEffect, useState } from "react";
import { FaFlag, FaUserCircle } from "react-icons/fa";

type MeUser = { id: string; username: string; email: string; avatar?: string };

export default function EventNavbar() {
  const [me, setMe] = useState<MeUser | null>(null);

  async function loadMe() {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    const data = await res.json();
    setMe(data.user || null);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  useEffect(() => {
    loadMe();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
            <FaFlag className="h-6 w-6 text-[#077c8a]" />
          </span>
          <div className="text-xl font-semibold tracking-tight">
            <span className="text-[#077c8a]">UIT</span>
            <span className="text-white/90">CTF</span>
          </div>
        </a>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-white/80">
          <a href="/users" className="hover:text-white transition">Users</a>
          <a href="/teams" className="hover:text-white transition">Teams</a>
          <a href="/challenges" className="hover:text-white transition">Challenges</a>
          <a href="/notification" className="hover:text-white transition">Notification</a>
        </nav>

        {/* Profile */}
        <div className="flex items-center gap-3">
          <a
            href="/profile"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
          >
            {me?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={me.avatar} alt="avatar" className="h-7 w-7 rounded-full object-cover ring-1 ring-white/10" />
            ) : (
              <FaUserCircle className="text-lg text-[#077c8a]" />
            )}
            {me?.username || "Profile"}
          </a>

          <button
            onClick={logout}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

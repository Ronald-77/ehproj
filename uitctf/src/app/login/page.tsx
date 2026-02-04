"use client";

import { useState } from "react";
import AuthBrand from "../components/AuthBrand";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    const e1 = email.trim().toLowerCase();

    // generic error (don’t reveal which one is wrong)
    if (!e1 || !password) {
      setErr("Email or password is incorrect");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e1, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.error || "Email or password is incorrect");
        return;
      }

      setMsg("Login successful ✅");

      // ✅ if middleware redirected here, it sets ?next=/event (or other page)
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.href = next || "/";

      setTimeout(() => {
        window.location.href = next || "/"; // login -> home by default
      }, 500);
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(7,124,138,0.18),transparent_55%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
          <AuthBrand />

          <h1 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Welcome Back
          </h1>
          <p className="mt-2 text-center text-white/70">
            Login to continue hacking
          </p>

          {(err || msg) && (
            <div
              className={`mt-6 rounded-2xl border p-4 text-sm ${
                err
                  ? "border-red-500/30 bg-red-500/10 text-red-200"
                  : "border-[#077c8a]/30 bg-[#077c8a]/10 text-white/90"
              }`}
            >
              {err ?? msg}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="example@uit.edu.mm"
                autoComplete="email"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#1493a0]/70"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#1493a0]/70"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[#077c8a] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/60">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-[#077c8a] hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

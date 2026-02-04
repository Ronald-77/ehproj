"use client";

import { useMemo, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import AuthBrand from "../components/AuthBrand";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const emailOk = useMemo(() => {
    const e = email.trim().toLowerCase();
    return e.length === 0 ? true : /^[^\s@]+@uit\.edu\.mm$/i.test(e);
  }, [email]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    const u = username.trim();
    const e1 = email.trim().toLowerCase();

    if (!u || !e1 || !password || !confirmPassword) {
      setErr("All fields are required.");
      return;
    }

    if (u.length < 3 || u.length > 24) {
      setErr("Username must be 3–24 characters.");
      return;
    }

    if (!/^[^\s@]+@uit\.edu\.mm$/i.test(e1)) {
      setErr("Only @uit.edu.mm emails are allowed.");
      return;
    }

    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: u,
          email: e1,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErr(data?.error || "Signup failed.");
        return;
      }

      setMsg("Account created! Redirecting to login...");
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        window.location.href = "/login";
      }, 800);
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
            Create Your Account
          </h1>
          <p className="mt-2 text-center text-white/70">
            Join the CTF community and start hacking
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

          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                placeholder="yourname"
                autoComplete="username"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#1493a0]/70"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Email (must be @uit.edu.mm)
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="example@uit.edu.mm"
                autoComplete="email"
                className={`w-full rounded-xl border bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none ${
                  emailOk
                    ? "border-white/10 focus:border-[#1493a0]/70"
                    : "border-red-500/40 focus:border-red-400/70"
                }`}
              />
              {!emailOk && (
                <p className="mt-2 text-xs text-red-200/80">
                  Only @uit.edu.mm emails are allowed.
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Password
              </label>

              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 pr-12 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#1493a0]/70"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white/60 hover:text-white transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {/* You requested: Eye = show, EyeSlash = hide */}
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 pr-12 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#1493a0]/70"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white/60 hover:text-white transition"
                  aria-label={
                    showConfirm ? "Hide confirm password" : "Show confirm password"
                  }
                >
                  {showConfirm ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[#077c8a] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/60">
            Already have an account?{" "}
            <a href="/login" className="text-[#077c8a] hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

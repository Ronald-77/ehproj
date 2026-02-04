"use client";

import { useEffect, useState } from "react";
import AuthBrand from "../components/AuthBrand";

type ProfileUser = {
  id: string;
  username: string;
  email: string;
  avatar?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function loadProfile() {
    const res = await fetch("/api/user/profile", { cache: "no-store" });
    if (!res.ok) {
      window.location.href = "/login";
      return;
    }
    const data = await res.json();
    setUser(data.user);
    setUsername(data.user.username);
    setAvatar(data.user.avatar || "");
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function onPickFile(file?: File | null) {
    if (!file) return;

    // limit ~200KB
    if (file.size > 200 * 1024) {
      setErr("Image too large. Please choose under 200KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), avatar }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error || "Update failed");
        return;
      }

      setMsg("Profile updated ✅");
      setUser(data.user);
    } catch {
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 text-white/70">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(7,124,138,0.18),transparent_55%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
          <AuthBrand />

          <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-[#077c8a]">
            User Profile
          </h1>
          <p className="mt-2 text-center text-white/70">
            Update your username and profile photo
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

          <div className="mt-8 flex flex-col items-center">
            <div className="h-28 w-28 overflow-hidden rounded-full ring-1 ring-white/10">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/5 text-white/60">
                  No Photo
                </div>
              )}
            </div>

            <label className="mt-4 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition">
              Change Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPickFile(e.target.files?.[0])}
              />
            </label>

            <div className="mt-3 text-xs text-white/50">
              Tip: use a small image (under 200KB).
            </div>
          </div>

          <form onSubmit={onSave} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#1493a0]/70"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Email
              </label>
              <input
                value={user.email}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/60"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[#077c8a] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

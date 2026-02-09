"use client";

import { useEffect, useMemo, useState } from "react";
import EventNavbar from "../components/EventNavbar";
import { useRequireTeam } from "../components/useRequireTeam";

type ChallengeRow = {
  _id: string;
  title: string;
  points: number;
  category: string;
  solved?: boolean;
};

export default function ChallengesPage() {
  const { loading } = useRequireTeam();
  const [list, setList] = useState<ChallengeRow[]>([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const [activeId, setActiveId] = useState<string | null>(null);
  const [flag, setFlag] = useState("");

  const active = useMemo(
    () => (activeId ? list.find((c) => c._id === activeId) : null),
    [activeId, list]
  );

  async function load() {
    setErr("");
    try {
      const res = await fetch("/api/challenges", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to load challenges");
      setList(Array.isArray(data?.challenges) ? data.challenges : []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load challenges");
    }
  }

  useEffect(() => {
    if (!loading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function submit() {
    setErr("");
    setMsg("");

    if (!activeId) {
      setErr("No challenge selected.");
      return;
    }

    const f = flag.trim();
    if (!f) {
      setErr("Enter a flag.");
      return;
    }

    try {
      const res = await fetch(`/api/challenges/${activeId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flag: f }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.error || "Submit failed");
        return;
      }

      if (data?.alreadySolved) {
        setMsg("Already solved ✅");
      } else {
        setMsg(`Correct ✅ +${data?.points ?? ""}`);
      }

      // mark solved locally
      setList((prev) =>
        prev.map((c) => (c._id === activeId ? { ...c, solved: true } : c))
      );

      setFlag("");
      setActiveId(null);
    } catch (e: any) {
      setErr(e?.message || "Submit failed");
    }
  }

  if (loading) return null;

  return (
    <main className="min-h-screen bg-black text-white">
      <EventNavbar />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-white">CTF </span>
            <span className="text-[#077c8a]">Challenges</span>
          </h1>
          <p className="mt-3 text-white/60">Click a challenge to solve it.</p>
        </div>

        {err && <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">{err}</div>}
        {msg && <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-200">{msg}</div>}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <button
              key={c._id}
              onClick={() => setActiveId(c._id)} // ✅ always set real id
              className={`rounded-2xl border p-5 text-left transition ${
                c.solved
                  ? "border-[#077c8a]/50 bg-[#077c8a]/10"
                  : "border-white/10 bg-white/[0.04] hover:border-[#077c8a]/40 hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold">{c.title}</div>
                  <div className="mt-1 text-xs text-white/50">{c.category}</div>
                </div>
                <div className="shrink-0 rounded-xl bg-white/5 px-3 py-1 text-sm font-bold text-[#077c8a] ring-1 ring-white/10">
                  {c.points}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {active && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-lg font-semibold">{active.title}</div>
                <div className="mt-1 text-sm text-white/60">{active.category}</div>
              </div>
              <button
                onClick={() => {
                  setActiveId(null);
                  setFlag("");
                  setErr("");
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="mt-5">
              <label className="text-sm text-white/70">Submit flag</label>
              <input
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                placeholder="UITCTF{...}"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#077c8a]/60"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={submit}
                className="rounded-xl bg-[#077c8a] px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";

type PracticeChallenge = {
  _id: string;
  title: string;
  category: string;
  points: number;
  endsAt: string;
  solved: boolean;
};

const CATS = [
  "All",
  "Forensics",
  "Cryptography",
  "Web Exploitation",
  "Reverse Engineering",
  "Pwn",
  "OSINT",
  "Misc",
  "Steganography",
];

function difficulty(points: number) {
  if (points <= 100) return { label: "EASY", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20" };
  if (points <= 200) return { label: "MEDIUM", cls: "bg-yellow-500/15 text-yellow-300 border-yellow-500/20" };
  return { label: "HARD", cls: "bg-rose-500/15 text-rose-300 border-rose-500/20" };
}

export default function PracticePage() {
  const [items, setItems] = useState<PracticeChallenge[]>([]);
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");

  const [open, setOpen] = useState<PracticeChallenge | null>(null);
  const [flag, setFlag] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const [hintBusy, setHintBusy] = useState(false);
  const [aiHints, setAiHints] = useState<string[]>([]);
  const [aiBusy, setAiBusy] = useState(false);

  async function load() {
    setErr(null);
    const res = await fetch("/api/practice/challenges", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data?.error || "Failed to load practice challenges");
      return;
    }
    setItems(data.challenges || []);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((c) => {
      const okCat = cat === "All" ? true : c.category === cat;
      const okQ = !q ? true : (c.title + " " + c.category).toLowerCase().includes(q.toLowerCase());
      return okCat && okQ;
    });
  }, [items, cat, q]);

  async function submitPractice() {
    if (!open) return;
    setBusy(true);
    setMsg(null);
    setErr(null);

    try {
      const res = await fetch(`/api/practice/challenges/${open._id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flag }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data?.error || "Submit failed");

      if (data.correct) {
        setMsg(data.alreadySolved ? "Already solved ✅" : "Correct flag ✅ (Practice)");
        setItems((prev) => prev.map((x) => (x._id === open._id ? { ...x, solved: true } : x)));
      } else {
        setErr("Incorrect flag");
      }
  } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Submit failed";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar/>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              <span className="text-white">Practice </span>
              <span className="text-[#077c8a]">Challenges</span>
            </h1>
            <p className="mt-2 text-white/60">
              Ended event challenges appear here for practice. Solves do <span className="text-white">not</span> give score.
            </p>
          </div>

          <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <span className="text-white/40">🔍</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search challenges..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex flex-wrap gap-3">
          {CATS.map((x) => (
            <button
              key={x}
              onClick={() => setCat(x)}
              className={[
                "rounded-2xl border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#077c8a]/40",
                x === cat
                  ? "border-[#077c8a]/50 bg-[#077c8a]/20 text-white shadow-md shadow-[#077c8a]/20"
                  : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06] hover:text-white hover:border-white/20",
              ].join(" ")}
            >
              {x}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const d = difficulty(c.points);
            return (
              <button
                key={c._id}
                onClick={() => {
                  setOpen(c);
                  setFlag("");
                  setMsg(null);
                  setErr(null);
                  setHints([]);
                }}
                className={[
                  "group relative rounded-3xl border bg-white/[0.03] p-7 text-left shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition",
                  "border-white/10 hover:-translate-y-1 hover:bg-white/[0.05]",
                  c.solved ? "ring-1 ring-emerald-500/25" : "",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`inline-flex rounded-xl border px-3 py-1 text-xs font-bold ${d.cls}`}>
                    {d.label}
                  </span>

                  <div className="text-sm font-semibold text-[#077c8a]">{c.points} pts</div>
                </div>

                <div className="mt-6 text-2xl font-bold text-white">{c.title}</div>
                <div className="mt-2 text-sm text-white/60">{c.category}</div>

                {c.solved && (
                  <div className="mt-8 text-right text-sm font-bold text-emerald-400">SOLVED</div>
                )}
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-white/60">
              No practice challenges found.
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-black/80 p-6 backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xl font-bold">{open.title}</div>
                <div className="mt-1 text-sm text-white/60">{open.category} • {open.points} pts (practice)</div>
              </div>
              <button
                onClick={() => setOpen(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="mt-6">
              <label className="text-sm font-semibold text-white/80">Submit flag</label>
              <input
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                placeholder="flag{...}"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#077c8a]/60"
              />
            </div>

            {msg && (
              <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                {msg}
              </div>
            )}
            {err && (
              <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                {err}
              </div>
            )}

            {hints.length > 0 && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <div className="text-sm font-semibold text-white/80">Hints</div>
                <ul className="mt-2 space-y-2">
                  {hints.map((h, i) => (
                    <li key={i} className="text-sm text-white/75">
                      {i + 1}. {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {aiHints.length > 0 && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <div className="text-sm font-semibold text-white/80">AI Hints</div>
                <ul className="mt-2 space-y-2">
                  {aiHints.map((h, i) => (
                    <li key={i} className="text-sm text-white/75">
                      {i + 1}. {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                disabled={hintBusy || hints.length >= 3}
                onClick={async () => {
                  if (!open) return;
                  setHintBusy(true);
                  setErr(null);
                  setMsg(null);
                  try {
                    const res = await fetch(`/api/practice/challenges/${open._id}/hint`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ tier: hints.length, provider: "rule" }),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) {
                      setErr(data?.error || "Failed to get hint");
                    } else if (data?.done) {
                      setMsg("No more hints");
                    } else if (data?.text) {
                      setHints((prev) => [...prev, String(data.text)]);
                    }
                  } finally {
                    setHintBusy(false);
                  }
                }}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 disabled:opacity-50"
              >
                {hintBusy ? "Loading…" : hints.length === 0 ? "Request Hint" : "Next Hint"}
              </button>

              <button
                disabled={aiBusy || aiHints.length >= 3}
                onClick={async () => {
                  if (!open) return;
                  setAiBusy(true);
                  setErr(null);
                  setMsg(null);
                  try {
                    const res = await fetch(`/api/practice/challenges/${open._id}/hint`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ tier: aiHints.length, provider: "ai" }),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) {
                      setErr(data?.error || "Failed to get AI hint");
                    } else if (data?.done) {
                      setMsg("No more AI hints");
                    } else if (data?.text) {
                      setAiHints((prev) => [...prev, String(data.text)]);
                    }
                  } finally {
                    setAiBusy(false);
                  }
                }}
                className="rounded-2xl bg-[#077c8a] px-4 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
              >
                {aiBusy ? "Asking AI…" : aiHints.length === 0 ? "Ask AI Hint" : "Next AI Hint"}
              </button>
            </div>

            <button
              disabled={busy}
              onClick={submitPractice}
              className="mt-6 w-full rounded-2xl bg-[#077c8a] py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Checking..." : "Submit"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

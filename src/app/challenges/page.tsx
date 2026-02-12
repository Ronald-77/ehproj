"use client";

import { useEffect, useMemo, useState } from "react";
import EventNavbar from "../components/EventNavbar";
import { useRequireTeam } from "../components/useRequireTeam";

type ChallengeListItem = {
  _id: string;
  title: string;
  category: string;
  points: number;
  startsAt?: string;
  endsAt?: string;
  solved?: boolean; // optional if your API provides it
};

type ChallengeFile = {
  fileId: string;
  filename: string;
  contentType?: string;
  size?: number;
};

type ChallengeDetail = {
  _id: string;
  title: string;
  category: string;
  points: number;
  description?: string;
  files?: ChallengeFile[];
  solved?: boolean;
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

function fmtKB(n?: number) {
  const v = Number(n || 0);
  return `${Math.round(v / 1024)} KB`;
}

export default function ChallengesPage() {
  // ✅ require login + team (your hook should redirect to /login or /team)
  const { loading } = useRequireTeam();
  const [list, setList] = useState<ChallengeListItem[]>([]);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());

  const [activeCat, setActiveCat] = useState<string>("All");
  const [q, setQ] = useState("");

  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ChallengeDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [flag, setFlag] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // --- Load challenges list
  useEffect(() => {
    if (loading) return;
    (async () => {
      try {
        const res = await fetch("/api/challenges", { cache: "no-store" });
        const data = await res.json();
        const challenges: ChallengeListItem[] = data.challenges || [];

        setList(challenges);

        // If API includes solvedIds, prefer that
        if (Array.isArray(data.solvedIds)) {
          setSolvedIds(new Set(data.solvedIds));
        } else {
          // otherwise infer from challenge.solved field if present
          const s = new Set<string>();
          for (const c of challenges) if (c.solved) s.add(c._id);
          setSolvedIds(s);
        }
      } catch {
        setList([]);
      }
    })();
  }, [loading]);

  // --- Open modal + fetch detail
  useEffect(() => {
    if (!openId) {
      setDetail(null);
      setMsg(null);
      setFlag("");
      return;
    }

    // ✅ prevent undefined bug
    if (!openId || openId === "undefined") return;

    (async () => {
      setDetailLoading(true);
      setDetail(null);
      setMsg(null);
      setFlag("");
      try {
        const res = await fetch(`/api/challenges/${openId}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) {
          setDetail(null);
          setMsg(data?.error || "Challenge not found.");
        } else {
          setDetail(data.challenge as ChallengeDetail);
        }
      } catch {
        setDetail(null);
        setMsg("Challenge not found.");
      } finally {
        setDetailLoading(false);
      }
    })();
  }, [openId]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return list.filter((c) => {
      const catOk = activeCat === "All" || c.category === activeCat;
      const qOk =
        !query ||
        c.title.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query);
      return catOk && qOk;
    });
  }, [list, activeCat, q]);

  async function submitFlag() {
    if (!detail?._id) return;
    setSubmitLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/challenges/${detail._id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ flag }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error || "Incorrect flag.");
      } else {
        setMsg("✅ Correct! Solved.");
        setSolvedIds((prev) => new Set(prev).add(detail._id));

        // also update list item (for immediate badge)
        setList((prev) =>
          prev.map((x) => (x._id === detail._id ? { ...x, solved: true } : x))
        );
      }
    } catch {
      setMsg("Submit failed. Try again.");
    } finally {
      setSubmitLoading(false);
    }
  }

  if (loading) return null;

  return (
    <main className="min-h-screen bg-black text-white">
      <EventNavbar />

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Title centered */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span className="text-white/80">CTF </span>
            <span className="text-[#077c8a]">Challenges</span>
          </h1>
          <p className="mt-2 text-white/50">Click a challenge to solve it.</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${
                  activeCat === c
                    ? "bg-white/10 text-white ring-white/15"
                    : "bg-white/5 text-white/60 ring-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="w-full md:w-[320px]">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="text-white/40">🔎</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search challenges..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const isSolved = solvedIds.has(c._id) || !!c.solved;
            const diff =
              c.points >= 300 ? "HARD" : c.points >= 200 ? "MEDIUM" : "EASY";

            return (
              <button
                key={c._id}
                onClick={() => setOpenId(c._id)}
                className={`group relative overflow-hidden rounded-3xl border bg-[#0a0a0a] p-6 text-left transition hover:bg-white/[0.03] ${
                  isSolved ? "border-emerald-500/30" : "border-white/10"
                }`}
              >
                <div className="mb-6 flex items-start justify-between">
                  <span
                    className={`rounded-lg px-3 py-1 text-xs font-bold tracking-wide ${
                      diff === "HARD"
                        ? "bg-red-500/15 text-red-400"
                        : diff === "MEDIUM"
                        ? "bg-yellow-500/15 text-yellow-300"
                        : "bg-emerald-500/15 text-emerald-300"
                    }`}
                  >
                    {diff}
                  </span>

                  <div className="text-right">
                    <div className="font-mono font-bold text-[#077c8a]">
                      {c.points} pts
                    </div>
                    {isSolved && (
                      <div className="mt-1 text-xs font-extrabold text-emerald-400">
                        SOLVED
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-2xl font-extrabold text-white">{c.title}</div>
                <div className="mt-2 text-white/60">{c.category}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {openId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b] shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div>
                <div className="text-2xl font-extrabold text-white">
                  {detail?.title || "Loading..."}
                </div>
                <div className="mt-1 text-white/60">
                  {detail?.category || ""}
                  {detail?.points ? (
                    <>
                      {" "}
                      • <span className="text-[#077c8a]">{detail.points} pts</span>
                    </>
                  ) : null}
                </div>
              </div>

              <button
                onClick={() => setOpenId(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="px-6 py-6">
              {detailLoading ? (
                <div className="text-white/60">Loading...</div>
              ) : detail ? (
                <>
                  {/* Description */}
                  {detail.description ? (
                    <div className="mb-6 whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
                      {detail.description}
                    </div>
                  ) : null}

                  {/* ✅ FILES (Download UI goes here) */}
                  {!!detail.files?.length && (
                    <div className="mb-6">
                      <h3 className="mb-3 text-sm font-bold text-white/80">Files</h3>
                      <div className="space-y-3">
                        {detail.files.map((f) => (
                          <div
                            key={f.fileId}
                            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">
                                {f.filename}
                              </p>
                              <p className="text-xs text-white/50">{fmtKB(f.size)}</p>
                            </div>
                            <a
                              href={`/api/files/${f.fileId}`}
                              className="rounded-lg bg-[#077c8a] px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
                            >
                              Download
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submit flag */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="mb-3 text-sm font-bold text-white/80">
                      Submit Flag
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                      <input
                        value={flag}
                        onChange={(e) => setFlag(e.target.value)}
                        placeholder="flag{...}"
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
                      />
                      <button
                        disabled={submitLoading}
                        onClick={submitFlag}
                        className="rounded-xl bg-[#077c8a] px-6 py-3 text-sm font-extrabold text-white hover:opacity-90 disabled:opacity-60"
                      >
                        {submitLoading ? "Submitting..." : "Submit"}
                      </button>
                    </div>

                    {msg && (
                      <div className="mt-3 text-sm text-white/80">
                        {msg}
                      </div>
                    )}

                    <div className="mt-4 text-xs text-white/45">
                      Team-wide solves: once any member solves, the whole team gets credit.
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-white/60">
                  {msg || "Challenge not found."}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

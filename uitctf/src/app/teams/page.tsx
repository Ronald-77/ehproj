"use client";

import { useEffect, useState } from "react";
import EventNavbar from "../components/EventNavbar";

type Team = { _id: string; name: string; ownerId: string; members: string[] };

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/teams", { cache: "no-store" });
    const data = await res.json();
    setTeams(data.teams || []);
  }

  async function requestJoin(teamId: string) {
    setErr(null);
    setMsg(null);

    const res = await fetch(`/api/teams/${teamId}/join`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setErr(data?.error || "Failed");
      return;
    }
    setMsg("Join request sent ✅ (waiting for owner approval)");
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <EventNavbar />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold text-[#077c8a]">Teams</h1>
        <p className="mt-2 text-white/70">Request to join a team. The team owner must accept.</p>

        {(err || msg) && (
          <div className={`mt-6 rounded-2xl border p-4 text-sm ${err ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-[#077c8a]/30 bg-[#077c8a]/10 text-white/90"}`}>
            {err ?? msg}
          </div>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <div key={t._id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 hover:border-[#1493a0]/70 transition">
              <div className="text-lg font-semibold">{t.name}</div>
              <div className="mt-2 text-sm text-white/60">Members: {t.members?.length ?? 0}</div>

              <button
                onClick={() => requestJoin(t._id)}
                className="mt-5 w-full rounded-xl bg-[#077c8a] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                Request Join
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

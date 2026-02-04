"use client";

import { useEffect, useState } from "react";
import EventNavbar from "../../components/EventNavbar";

type Req = { _id: string; teamId: string; userId: string; createdAt?: string };
type Team = { _id: string; name: string };

export default function TeamRequestsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [requests, setRequests] = useState<Req[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/teams/requests/incoming", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      setErr(data?.error || "Failed");
      return;
    }
    setTeams(data.teams || []);
    setRequests(data.requests || []);
  }

  async function act(requestId: string, action: "accept" | "reject") {
    setErr(null);
    setMsg(null);
    const res = await fetch(`/api/teams/requests/${requestId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data?.error || "Failed");
      return;
    }
    setMsg(action === "accept" ? "Accepted ✅" : "Rejected ✅");
    load();
  }

  useEffect(() => {
    load();
  }, []);

  const teamName = (teamId: string) => teams.find((t) => t._id === teamId)?.name || teamId;

  return (
    <main className="min-h-screen bg-black text-white">
      <EventNavbar />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold text-[#077c8a]">Team Join Requests</h1>
        <p className="mt-2 text-white/70">Only team owners can accept or reject requests.</p>

        {(err || msg) && (
          <div className={`mt-6 rounded-2xl border p-4 text-sm ${err ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-[#077c8a]/30 bg-[#077c8a]/10 text-white/90"}`}>
            {err ?? msg}
          </div>
        )}

        <div className="mt-8 space-y-4">
          {requests.map((r) => (
            <div key={r._id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 hover:border-[#1493a0]/70 transition">
              <div className="text-white/80 text-sm">Team: <span className="text-white font-semibold">{teamName(r.teamId)}</span></div>
              <div className="mt-1 text-white/70 text-sm">UserId: {r.userId}</div>

              <div className="mt-4 flex gap-3">
                <button onClick={() => act(r._id, "accept")} className="rounded-xl bg-[#077c8a] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition">
                  Accept
                </button>
                <button onClick={() => act(r._id, "reject")} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition">
                  Reject
                </button>
              </div>
            </div>
          ))}

          {requests.length === 0 && (
            <div className="text-white/60">No pending requests.</div>
          )}
        </div>
      </section>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import EventNavbar from "../components/EventNavbar";
import { useRequireTeam } from "../components/useRequireTeam";
import { FaTrophy, FaMedal, FaUser, FaUsers } from "react-icons/fa";

type IndividualRow = {
  rank: number;
  username: string;
  team: string;
  points: number;
  solves: number;
};

type TeamRow = {
  rank: number;
  name: string;
  members: number;
  points: number;
  solves: number;
};

type ScoreboardResp = {
  active: boolean;
  event: null | { id: string; name: string; startsAt: string; endsAt: string };
  individual: IndividualRow[];
  teams: TeamRow[];
};

export default function ScoreboardPage() {
  const { loading: guardLoading } = useRequireTeam();

  const [activeTab, setActiveTab] = useState<"individual" | "team">("individual");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState<ScoreboardResp>({
    active: false,
    event: null,
    individual: [],
    teams: [],
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch("/api/scoreboard", { cache: "no-store" });
        const j = (await res.json().catch(() => ({}))) as Partial<ScoreboardResp>;
        if (!res.ok) throw new Error((j as any)?.error || "Failed to load scoreboard");

        setData({
          active: Boolean(j.active),
          event: (j.event as any) ?? null,
          individual: Array.isArray(j.individual) ? j.individual : [],
          teams: Array.isArray(j.teams) ? j.teams : [],
        });
      } catch (e: any) {
        setErr(e?.message || "Failed to load scoreboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const rows = useMemo(() => {
    return activeTab === "individual" ? data.individual : data.teams;
  }, [activeTab, data]);

  if (guardLoading) return null;

  return (
    <main className="min-h-screen bg-black text-white">
      <EventNavbar />

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-[#077c8a] mb-2">
            Scoreboard
          </h1>
          <p className="text-white/60">
            {data.active && data.event ? `Event: ${data.event.name}` : "No active event right now"}
          </p>
        </div>

        {/* Toggle */}
        <div className="mb-8 flex">
          <div className="relative flex rounded-full bg-white/5 p-1 ring-1 ring-white/10">
            <button
              onClick={() => setActiveTab("individual")}
              className={`relative z-10 flex w-44 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${
                activeTab === "individual"
                  ? "bg-[#077c8a] text-white shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <FaUser className={activeTab === "individual" ? "text-white" : "text-white/40"} />
              Individual
            </button>

            <button
              onClick={() => setActiveTab("team")}
              className={`relative z-10 flex w-44 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${
                activeTab === "team"
                  ? "bg-[#077c8a] text-white shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <FaUsers className={activeTab === "team" ? "text-white" : "text-white/40"} />
              Team
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]">
          <div className="border-b border-white/5 bg-white/5 px-6 py-4">
            <h2 className="text-lg font-medium text-white">
              {activeTab === "individual" ? "Individual Rankings" : "Team Rankings"}
            </h2>
          </div>

          {loading ? (
            <div className="px-6 py-10 text-white/60">Loading…</div>
          ) : err ? (
            <div className="px-6 py-10 text-red-400">{err}</div>
          ) : !data.active ? (
            <div className="px-6 py-10 text-white/60">No active event scoreboard yet.</div>
          ) : rows.length === 0 ? (
            <div className="px-6 py-10 text-white/60">No solves yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-white/40">
                    <th className="px-6 py-4 font-medium">Rank</th>
                    <th className="px-6 py-4 font-medium">
                      {activeTab === "individual" ? "Username" : "Team Name"}
                    </th>
                    {activeTab === "individual" ? (
                      <th className="px-6 py-4 font-medium">Team</th>
                    ) : (
                      <th className="px-6 py-4 font-medium">Members</th>
                    )}
                    <th className="px-6 py-4 font-medium text-right">Points</th>
                    <th className="px-6 py-4 font-medium text-right">Solves</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5 text-sm">
                  {rows.map((item: any) => (
                    <tr
                      key={`${activeTab}-${item.rank}-${item.username ?? item.name}`}
                      className="group transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.rank === 1 && <FaTrophy className="text-yellow-500 text-lg" />}
                          {item.rank === 2 && <FaMedal className="text-gray-300 text-lg" />}
                          {item.rank === 3 && <FaMedal className="text-amber-600 text-lg" />}
                          <span
                            className={`font-mono font-bold ${
                              item.rank <= 3 ? "text-white" : "text-white/60"
                            }`}
                          >
                            {item.rank}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-white">
                        {activeTab === "individual" ? item.username : item.name}
                      </td>

                      {activeTab === "individual" ? (
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                            {item.team || "-"}
                          </span>
                        </td>
                      ) : (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-white/60">
                            <FaUser className="text-xs" />
                            {item.members ?? 0}
                          </div>
                        </td>
                      )}

                      <td className="px-6 py-4 text-right font-mono font-bold text-[#077c8a]">
                        {item.points ?? 0}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-white/60">
                        {item.solves ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { FaTrophy, FaMedal, FaUser, FaUsers } from "react-icons/fa";

type IndividualRow = {
  userId: string;
  username: string;
  team: string;
  points: number;
  solves: number;
};

type TeamRow = {
  teamId: string;
  name: string;
  members: number;
  points: number;
  solves: number;
};

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<"individual" | "team">("individual");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [individual, setIndividual] = useState<IndividualRow[]>([]);
  const [team, setTeam] = useState<TeamRow[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const res = await fetch("/api/leaderboard", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to load leaderboard");

        setIndividual(Array.isArray(data.individual) ? data.individual : []);
        setTeam(Array.isArray(data.team) ? data.team : []);
      } catch (e: any) {
        setErr(e?.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const rows = useMemo(() => {
    if (activeTab === "individual") {
      return individual.map((r, i) => ({
        rank: i + 1,
        username: r.username,
        team: r.team,
        points: r.points,
        solves: r.solves,
      }));
    }
    return team.map((t, i) => ({
      rank: i + 1,
      name: t.name,
      members: t.members,
      points: t.points,
      solves: t.solves,
    }));
  }, [activeTab, individual, team]);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-[#077c8a] mb-2">Leaderboard</h1>
          <p className="text-white/60">Competition rankings and statistics</p>
        </div>

        <div className="mb-8 flex">
          <div className="relative flex rounded-full bg-white/5 p-1 ring-1 ring-white/10">
            <button
              onClick={() => setActiveTab("individual")}
              className={`relative z-10 flex w-40 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${
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
              className={`relative z-10 flex w-40 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${
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
          ) : rows.length === 0 ? (
            <div className="px-6 py-10 text-white/60">No scores yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-white/40">
                    <th className="px-6 py-4 font-medium">Rank</th>
                    <th className="px-6 py-4 font-medium">
                      {activeTab === "individual" ? "Username" : "Team Name"}
                    </th>
                    {activeTab === "individual" && <th className="px-6 py-4 font-medium">Team</th>}
                    {activeTab === "team" && <th className="px-6 py-4 font-medium">Members</th>}
                    <th className="px-6 py-4 font-medium text-right">Points</th>
                    <th className="px-6 py-4 font-medium text-right">Solves</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5 text-sm">
                  {rows.map((item: any) => (
                    <tr key={item.rank} className="group transition-colors hover:bg-white/[0.02]">
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
                        {"username" in item ? item.username : item.name}
                      </td>

                      {"username" in item && (
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                            {item.team || "-"}
                          </span>
                        </td>
                      )}

                      {"members" in item && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-white/60">
                            <FaUser className="text-xs" />
                            {item.members}
                          </div>
                        </td>
                      )}

                      <td className="px-6 py-4 text-right font-mono font-bold text-[#077c8a]">
                        {item.points}
                      </td>

                      <td className="px-6 py-4 text-right font-mono text-white/60">
                        {item.solves}
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

"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

type Me = { user: { id: string; username: string; email: string } | null };

export default function ProfilePage() {
  const [me, setMe] = useState<Me["user"]>(null);
  const [teamName, setTeamName] = useState<string>("-");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data: Me = await res.json().catch(() => ({ user: null }));
        setMe(data.user || null);

        // team info (optional)
        const t = await fetch("/api/teams/me", { cache: "no-store" });
        const td = await t.json().catch(() => ({}));
        if (t.ok && td?.hasTeam && td?.team?.name) setTeamName(String(td.team.name));
        else setTeamName("-");
      } catch {
        setMe(null);
        setTeamName("-");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-bold text-[#077c8a]">User Profile</h1>
          <p className="mt-2 text-white/60">Account details</p>

          {loading ? (
            <div className="mt-8 text-white/60">Loading…</div>
          ) : !me ? (
            <div className="mt-8 text-red-400">Not logged in.</div>
          ) : (
            <div className="mt-8 space-y-6">
              <div>
                <div className="text-sm text-white/60">Username</div>
                <div className="mt-2 rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                  {me.username}
                </div>
              </div>

              <div>
                <div className="text-sm text-white/60">Email</div>
                <div className="mt-2 rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                  {me.email}
                </div>
              </div>

              <div>
                <div className="text-sm text-white/60">Team</div>
                <div className="mt-2 rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                  {teamName}
                </div>
              </div>

              <div className="pt-2 text-xs text-white/40">
                Note: profile photo upload is disabled for now.
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

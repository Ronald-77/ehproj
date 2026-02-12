"use client";

import { useEffect, useState } from "react";
import EventNavbar from "../components/EventNavbar";

type MeResp = {
  user: null | { id: string; username: string; email: string };
};

type TeamResp = {
  team: null | {
    id: string;
    name: string;
    inviteToken?: string;
    isLeader?: boolean;
    eventName?: string;
  };
};

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { error: text || "Non-JSON response" };
  }
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);

  const [me, setMe] = useState<MeResp["user"]>(null);
  const [team, setTeam] = useState<TeamResp["team"]>(null);

  const [tab, setTab] = useState<"create" | "join">("create");

  // create team form
  const [teamName, setTeamName] = useState("");
  const [teamPass, setTeamPass] = useState("");

  // join team form
  const [inviteToken, setInviteToken] = useState("");

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    setMsg("");

    try {
      // who am I
      const meRes = await fetch("/api/auth/me", { cache: "no-store" });
      const meData = (await safeJson(meRes)) as MeResp;

      if (!meRes.ok || !meData?.user) {
        window.location.href = "/login";
        return;
      }
      setMe(meData.user);

      // do I have a team?
      const tRes = await fetch("/api/teams/me", { cache: "no-store" });
      const tData = (await safeJson(tRes)) as TeamResp;

      if (tRes.ok) setTeam(tData?.team ?? null);
      else setTeam(null);
    } catch (e: any) {
      setErr(e?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createTeam() {
    setErr("");
    setMsg("");

    const name = teamName.trim();
    const password = teamPass;

    if (name.length < 3 || name.length > 32) {
      setErr("Team name must be 3–32 characters.");
      return;
    }
    if (password.length < 4 || password.length > 64) {
      setErr("Team password must be 4–64 characters.");
      return;
    }

    try {
      const res = await fetch("/api/teams/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error || "Create team failed.");

      setMsg("Team created ✅");
      await load();

      // go to event challenges
      window.location.href = "/challenges";
    } catch (e: any) {
      setErr(e?.message || "Create team failed.");
    }
  }

  async function joinTeam() {
    setErr("");
    setMsg("");

    const token = inviteToken.trim();
    if (!token || token.length < 6) {
      setErr("Invitation token is required.");
      return;
    }

    try {
      const res = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ inviteToken: token }),
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error || "Join team failed.");

      setMsg("Joined team ✅");
      await load();

      window.location.href = "/challenges";
    } catch (e: any) {
      setErr(e?.message || "Join team failed.");
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  if (loading) return null;

  return (
    <main className="min-h-screen bg-black text-white">
      <EventNavbar />

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="text-white">User </span>
              <span className="text-[#077c8a]">Profile</span>
            </h1>
            <p className="mt-2 text-white/60">
              Create or join a team to participate in event challenges.
            </p>
          </div>

          {/* User card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-white">{me?.username}</div>
                <div className="mt-1 text-sm text-white/60">{me?.email}</div>
              </div>
              <button
                onClick={logout}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition"
              >
                Logout
              </button>
            </div>

            {(err || msg) && (
              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                {err ? <div className="text-red-300">{err}</div> : null}
                {msg ? <div className="text-emerald-300">{msg}</div> : null}
              </div>
            )}
          </div>

          {/* Team section */}
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
            {team ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-white/70">Your Team</div>
                    <div className="mt-1 text-2xl font-extrabold text-white">{team.name}</div>
                    {team.eventName ? (
                      <div className="mt-2 text-sm text-white/50">Event: {team.eventName}</div>
                    ) : null}
                  </div>

                  <button
                    onClick={() => (window.location.href = "/challenges")}
                    className="rounded-xl bg-[#077c8a] px-5 py-3 text-sm font-bold text-white hover:opacity-90 transition"
                  >
                    Go to Challenges →
                  </button>
                </div>

                {team.inviteToken ? (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="text-sm font-semibold text-white/70">
                      Invitation Token
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <code className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white/90">
                        {team.inviteToken}
                      </code>
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(team.inviteToken || "");
                          setMsg("Copied ✅");
                          setErr("");
                        }}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-white/50">
                      Share this token to let others join your team.
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 text-sm text-white/50">
                    (Invite token not provided by API.)
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">
                    You don’t have a team yet
                  </div>
                  <div className="mt-2 text-white/60">
                    Create a team or join with an invitation token.
                  </div>
                </div>

                {/* Tabs */}
                <div className="mt-6 flex justify-center">
                  <div className="flex rounded-full bg-white/5 p-1 ring-1 ring-white/10">
                    <button
                      onClick={() => setTab("create")}
                      className={`w-40 rounded-full px-4 py-2 text-sm font-bold transition ${
                        tab === "create"
                          ? "bg-[#077c8a] text-white"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      Create Team
                    </button>
                    <button
                      onClick={() => setTab("join")}
                      className={`w-40 rounded-full px-4 py-2 text-sm font-bold transition ${
                        tab === "join"
                          ? "bg-[#077c8a] text-white"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      Join Team
                    </button>
                  </div>
                </div>

                {/* Forms */}
                {tab === "create" ? (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-white/70">
                        Team Name
                      </label>
                      <input
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="e.g. CyberNinjas"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/40"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-white/70">
                        Team Password
                      </label>
                      <input
                        value={teamPass}
                        onChange={(e) => setTeamPass(e.target.value)}
                        placeholder="Create a password"
                        type="password"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/40"
                      />
                    </div>

                    <button
                      onClick={createTeam}
                      className="w-full rounded-xl bg-[#077c8a] px-5 py-3 text-sm font-bold text-white hover:opacity-90 transition"
                    >
                      Create Team
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-white/70">
                        Invitation Token
                      </label>
                      <input
                        value={inviteToken}
                        onChange={(e) => setInviteToken(e.target.value)}
                        placeholder="Paste token here"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/40"
                      />
                    </div>

                    <button
                      onClick={joinTeam}
                      className="w-full rounded-xl bg-[#077c8a] px-5 py-3 text-sm font-bold text-white hover:opacity-90 transition"
                    >
                      Join Team
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

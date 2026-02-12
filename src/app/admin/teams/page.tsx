"use client";

import { useEffect, useMemo, useState } from "react";

type EventItem = {
  _id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  isActive?: boolean;
};

type TeamItem = {
  _id: string;
  name: string;
  membersCount: number;
  leaderUsername?: string;
  inviteToken: string;
  banned?: boolean;
  banReason?: string;
  createdAt?: string;
};

function fmt(dt?: string) {
  if (!dt) return "—";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function AdminTeamsPage() {
  const [token, setToken] = useState("");
  const [loaded, setLoaded] = useState(false);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventId, setEventId] = useState<string>("");

  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [q, setQ] = useState("");

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // ban modal-ish state
  const [banId, setBanId] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return teams;
    return teams.filter(
      (t) =>
        t.name.toLowerCase().includes(s) ||
        (t.leaderUsername || "").toLowerCase().includes(s) ||
        (t.inviteToken || "").toLowerCase().includes(s)
    );
  }, [teams, q]);

  async function loadEvents(adminToken: string) {
    const res = await fetch("/api/admin/events", {
      headers: { "x-admin-token": adminToken },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Failed to load events");
    setEvents(data.events || []);
    // auto pick active if exists
    const active = (data.events || []).find((e: EventItem) => e.isActive);
    if (active) setEventId(active._id);
  }

  async function loadTeams(adminToken: string, eId: string) {
    if (!eId) {
      setTeams([]);
      return;
    }
    const res = await fetch(`/api/admin/teams?eventId=${encodeURIComponent(eId)}`, {
      headers: { "x-admin-token": adminToken },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Failed to load teams");
    setTeams(data.teams || []);
  }

  async function doLoad() {
    try {
      setErr("");
      setMsg("");
      const t = token.trim();
      if (!t) {
        setErr("Admin token is required.");
        return;
      }
      await loadEvents(t);
      setLoaded(true);
      setMsg("Loaded ✅");
    } catch (e: any) {
      setErr(e?.message || "Load failed");
    }
  }

  // whenever eventId changes, fetch teams
  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        setErr("");
        setMsg("");
        await loadTeams(token.trim(), eventId);
      } catch (e: any) {
        setErr(e?.message || "Failed to load teams");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, loaded]);

  async function saveName(teamId: string) {
    try {
      setErr("");
      setMsg("");
      const newName = editName.trim();
      if (newName.length < 2 || newName.length > 40) {
        setErr("Team name must be 2–40 characters.");
        return;
      }

      const res = await fetch(`/api/admin/teams/${teamId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token.trim(),
        },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Update failed");

      setEditingId(null);
      setEditName("");
      setMsg("Team updated ✅");
      await loadTeams(token.trim(), eventId);
    } catch (e: any) {
      setErr(e?.message || "Update failed");
    }
  }

  async function rotateInvite(teamId: string) {
    try {
      setErr("");
      setMsg("");
      const res = await fetch(`/api/admin/teams/${teamId}/rotate-invite`, {
        method: "POST",
        headers: { "x-admin-token": token.trim() },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Rotate failed");
      setMsg("Invite token rotated ✅");
      await loadTeams(token.trim(), eventId);
    } catch (e: any) {
      setErr(e?.message || "Rotate failed");
    }
  }

  async function setBan(teamId: string, banned: boolean, reason?: string) {
    try {
      setErr("");
      setMsg("");
      const res = await fetch(`/api/admin/teams/${teamId}/ban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token.trim(),
        },
        body: JSON.stringify({ banned, reason: reason || "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Ban action failed");
      setMsg(banned ? "Team banned ✅" : "Team unbanned ✅");
      setBanId(null);
      setBanReason("");
      await loadTeams(token.trim(), eventId);
    } catch (e: any) {
      setErr(e?.message || "Ban action failed");
    }
  }

  async function deleteTeam(teamId: string) {
    try {
      setErr("");
      setMsg("");
      if (!confirm("Delete this team? This cannot be undone.")) return;

      const res = await fetch(`/api/admin/teams/${teamId}`, {
        method: "DELETE",
        headers: { "x-admin-token": token.trim() },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Delete failed");

      setMsg("Team deleted ✅");
      await loadTeams(token.trim(), eventId);
    } catch (e: any) {
      setErr(e?.message || "Delete failed");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Admin <span className="text-[#077c8a]">Teams</span>
          </h1>
          <p className="mt-2 text-white/60">
            Manage event teams: edit name, ban/unban, rotate invite token, delete.
          </p>
        </div>

        {/* Admin token */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-sm text-white/70">Admin Token</label>
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="uitctf_admin_..."
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#077c8a]/40"
              />
            </div>
            <button
              onClick={doLoad}
              className="rounded-xl bg-[#077c8a] px-6 py-3 font-semibold text-white hover:opacity-90"
            >
              Load
            </button>
          </div>

          {(msg || err) && (
            <div className="mt-4">
              {msg && <p className="text-sm text-emerald-400">{msg}</p>}
              {err && <p className="text-sm text-red-400">{err}</p>}
            </div>
          )}
        </div>

        {/* Event select + search */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-white/70">Select event</label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-[320px] rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#077c8a]/40"
              disabled={!loaded}
            >
              <option value="">— choose —</option>
              {events.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name} {e.isActive ? "(active)" : ""} • {fmt(e.startsAt)} → {fmt(e.endsAt)}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-[360px]">
            <label className="mb-2 block text-sm text-white/70">Search teams</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="team / leader / invite token..."
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#077c8a]/40"
              disabled={!loaded}
            />
          </div>
        </div>

        {/* Teams table */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Teams</h2>
              <div className="text-sm text-white/50">{filtered.length} team(s)</div>
            </div>
          </div>

          {!eventId ? (
            <div className="px-6 py-10 text-center text-white/60">Select an event to view teams.</div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-10 text-center text-white/60">No teams yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                    <th className="px-6 py-4">Team</th>
                    <th className="px-6 py-4">Members</th>
                    <th className="px-6 py-4">Leader</th>
                    <th className="px-6 py-4">Invite</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10 text-sm">
                  {filtered.map((t) => {
                    const isEditing = editingId === t._id;
                    return (
                      <tr key={t._id} className="hover:bg-white/[0.02]">
                        {/* Team */}
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-[240px] rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-[#077c8a]/40"
                              />
                              <button
                                onClick={() => saveName(t._id)}
                                className="rounded-xl bg-[#077c8a] px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingId(null);
                                  setEditName("");
                                }}
                                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="font-semibold text-white">{t.name}</div>
                          )}
                          <div className="mt-1 text-xs text-white/40">Created: {fmt(t.createdAt)}</div>
                        </td>

                        {/* Members */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                            {t.membersCount}
                          </span>
                        </td>

                        {/* Leader */}
                        <td className="px-6 py-4 text-white/80">{t.leaderUsername || "—"}</td>

                        {/* Invite */}
                        <td className="px-6 py-4">
                          <code className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs text-white/80">
                            {t.inviteToken}
                          </code>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {t.banned ? (
                            <div>
                              <span className="inline-flex rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-300">
                                BANNED
                              </span>
                              {t.banReason ? (
                                <div className="mt-1 text-xs text-red-200/70">{t.banReason}</div>
                              ) : null}
                            </div>
                          ) : (
                            <span className="inline-flex rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                              ACTIVE
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            {!isEditing ? (
                              <button
                                onClick={() => {
                                  setEditingId(t._id);
                                  setEditName(t.name);
                                }}
                                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
                              >
                                Edit
                              </button>
                            ) : null}

                            <button
                              onClick={() => rotateInvite(t._id)}
                              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
                            >
                              Rotate Invite
                            </button>

                            {t.banned ? (
                              <button
                                onClick={() => setBan(t._id, false)}
                                className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/15"
                              >
                                Unban
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setBanId(t._id);
                                  setBanReason("");
                                }}
                                className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/15"
                              >
                                Ban
                              </button>
                            )}

                            <button
                              onClick={() => deleteTeam(t._id)}
                              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
                            >
                              Delete
                            </button>
                          </div>

                          {/* Ban panel inline */}
                          {banId === t._id && !t.banned ? (
                            <div className="mt-3 rounded-xl border border-white/10 bg-black/40 p-3">
                              <label className="mb-2 block text-xs text-white/70">
                                Ban reason (optional)
                              </label>
                              <input
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-[#077c8a]/40"
                                placeholder="e.g., cheating, abusive name, spam..."
                              />
                              <div className="mt-2 flex gap-2">
                                <button
                                  onClick={() => setBan(t._id, true, banReason)}
                                  className="rounded-xl bg-red-500/90 px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
                                >
                                  Confirm Ban
                                </button>
                                <button
                                  onClick={() => {
                                    setBanId(null);
                                    setBanReason("");
                                  }}
                                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";

type EventRow = {
  _id: string;
  name: string;
  startsAt: string;
  endsAt: string;
};

function toLocalInputValue(d: any) {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(
    dt.getHours()
  )}:${pad(dt.getMinutes())}`;
}

async function apiJson(path: string, token: string, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      "x-admin-token": token,
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    },
    cache: "no-store",
  });

  const text = await res.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text || "Non-JSON response" };
  }
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

export default function AdminEventsPage() {
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  // create
  const [name, setName] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [eName, setEName] = useState("");
  const [eStartsAt, setEStartsAt] = useState("");
  const [eEndsAt, setEEndsAt] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("ADMIN_TOKEN") || "";
    setToken(t);
  }, []);

  async function load(t = token) {
    if (!t) {
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const data = await apiJson("/api/admin/events", t, { method: "GET" });
      setEvents(Array.isArray(data?.events) ? data.events : []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function saveToken() {
    const t = token.trim();
    localStorage.setItem("ADMIN_TOKEN", t);
    setMsg("Admin token saved ✅");
    setTimeout(() => setMsg(""), 1200);
    load(t);
  }

  async function createEvent() {
    setErr("");
    setMsg("");
    if (!token) return setErr("Admin token required.");
    if (!name.trim()) return setErr("Event name required.");
    if (!startsAt || !endsAt) return setErr("Start and end time required.");

    try {
      await apiJson("/api/admin/events", token, {
        method: "POST",
        body: JSON.stringify({ name, startsAt, endsAt }),
      });
      setMsg("Event created ✅");
      setName("");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Create event failed");
    }
  }

  function openEdit(ev: EventRow) {
    setEditId(ev._id);
    setEName(ev.name);
    setEStartsAt(toLocalInputValue(ev.startsAt));
    setEEndsAt(toLocalInputValue(ev.endsAt));
    setEditOpen(true);
  }

  async function saveEdit() {
    if (!editId) return;
    setErr("");
    setMsg("");

    try {
      await apiJson(`/api/admin/events/${editId}`, token, {
        method: "PUT",
        body: JSON.stringify({ name: eName, startsAt: eStartsAt, endsAt: eEndsAt }),
      });
      setMsg("Event updated ✅");
      setEditOpen(false);
      await load();
    } catch (e: any) {
      setErr(e?.message || "Update failed");
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm("Delete this event? (Only allowed if it has no challenges/teams)")) return;
    setErr("");
    setMsg("");
    try {
      await apiJson(`/api/admin/events/${id}`, token, { method: "DELETE" });
      setMsg("Event deleted ✅");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Delete failed");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span className="text-white">Admin </span>
            <span className="text-[#077c8a]">Events</span>
          </h1>
          <p className="mt-2 text-white/60">Create, edit, and delete event time windows.</p>
        </div>

        {/* Token */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="text-lg font-bold">Admin Token</div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder='ADMIN_TOKEN="..."'
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
            />
            <button
              onClick={saveToken}
              className="rounded-2xl bg-[#077c8a] px-5 py-3 text-sm font-bold text-white hover:opacity-90"
            >
              Save
            </button>
          </div>
        </div>

        {/* Create */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="text-lg font-bold">Create Event</div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Event name (e.g. UIT CTF Week 1)"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
              />
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end">
            <button
              onClick={createEvent}
              className="rounded-2xl bg-[#077c8a] px-6 py-3 text-sm font-bold text-white hover:opacity-90"
            >
              Create
            </button>
          </div>

          {msg ? <div className="mt-3 text-sm text-emerald-400">{msg}</div> : null}
          {err ? <div className="mt-3 text-sm text-red-400">{err}</div> : null}
        </div>

        {/* List */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="text-lg font-bold">Events</div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="text-white/60">Loading...</div>
            ) : events.length ? (
              events.map((ev) => (
                <div
                  key={ev._id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-base font-bold">{ev.name}</div>
                      <div className="mt-2 text-xs text-white/55">
                        Starts: {toLocalInputValue(ev.startsAt)} <br />
                        Ends: {toLocalInputValue(ev.endsAt)}
                      </div>
                      <div className="mt-2 text-[11px] text-white/35 break-all">{ev._id}</div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => openEdit(ev)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteEvent(ev._id)}
                        className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/15"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-white/60">No events yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0a0a0a] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="text-lg font-extrabold">Edit Event</div>
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <input
                value={eName}
                onChange={(e) => setEName(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
                placeholder="Event name"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-2 text-sm text-white/70">Starts at</div>
                  <input
                    type="datetime-local"
                    value={eStartsAt}
                    onChange={(e) => setEStartsAt(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <div className="mb-2 text-sm text-white/70">Ends at</div>
                  <input
                    type="datetime-local"
                    value={eEndsAt}
                    onChange={(e) => setEEndsAt(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setEditOpen(false)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="rounded-2xl bg-[#077c8a] px-6 py-2 text-sm font-extrabold text-white hover:opacity-90"
                >
                  Save
                </button>
              </div>

              {err ? <div className="text-sm font-semibold text-red-400">{err}</div> : null}
              {msg ? <div className="text-sm font-semibold text-emerald-400">{msg}</div> : null}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";

type EventRow = { _id: string; name: string; startsAt: string; endsAt: string };
type FileRow = { fileId: string; filename: string; contentType: string; size: number };
type ChallengeRow = {
  _id: string;
  eventId: string;
  title: string;
  category: string;
  description: string;
  points: number;
  startsAt: string;
  endsAt: string;
  files: FileRow[];
  createdAt?: string;
  updatedAt?: string;
};

const CATEGORIES = [
  "Web Exploitation",
  "Cryptography",
  "Forensics",
  "Pwn",
  "Reverse Engineering",
  "OSINT",
  "Misc",
  "Steganography",
] as const;

function fmtLocal(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function AdminChallengesPage() {
  const [token, setToken] = useState("");
  const [loadedToken, setLoadedToken] = useState("");

  const [events, setEvents] = useState<EventRow[]>([]);
  const [challenges, setChallenges] = useState<ChallengeRow[]>([]);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // create form
  const [eventId, setEventId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Web Exploitation");
  const [points, setPoints] = useState(100);
  const [description, setDescription] = useState("");
  const [flag, setFlag] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [createFiles, setCreateFiles] = useState<File[]>([]);
  const [showFlag, setShowFlag] = useState(false);

  // edit modal
  const [editing, setEditing] = useState<ChallengeRow | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<(typeof CATEGORIES)[number]>("Web Exploitation");
  const [editPoints, setEditPoints] = useState(100);
  const [editDescription, setEditDescription] = useState("");
  const [editStartsAt, setEditStartsAt] = useState("");
  const [editEndsAt, setEditEndsAt] = useState("");
  const [editFlag, setEditFlag] = useState(""); // optional
  const [editFilesPicked, setEditFilesPicked] = useState<File[]>([]);

  // ---------- helpers ----------
  async function api(path: string, init?: RequestInit) {
    const res = await fetch(path, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        ...(loadedToken ? { "x-admin-token": loadedToken } : {}),
      },
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

  async function loadAll() {
    setErr("");
    setMsg("");

    const [ev, ch] = await Promise.all([
      api("/api/admin/events", { cache: "no-store" }),
      api("/api/admin/challenges", { cache: "no-store" }),
    ]);

    setEvents(ev.events || []);
    setChallenges(ch.challenges || []);
  }

  async function uploadFiles(challengeId: string, files: File[]) {
    if (!files.length) return;

    const fd = new FormData();
    for (const f of files) fd.append("files", f);

    const res = await fetch(`/api/admin/challenges/${challengeId}/files`, {
      method: "POST",
      headers: { "x-admin-token": loadedToken },
      body: fd,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Upload failed");
  }

  // ---------- effects ----------
  useEffect(() => {
    const saved = localStorage.getItem("ADMIN_TOKEN") || "";
    if (saved) {
      setToken(saved);
      setLoadedToken(saved);
    }
  }, []);

  useEffect(() => {
    if (!loadedToken) return;
    loadAll().catch((e: any) => setErr(e?.message || "Load failed"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedToken]);

  const selectedEvent = useMemo(() => events.find((e) => e._id === eventId), [events, eventId]);

  // ---------- actions ----------
  async function onLoadToken() {
    setErr("");
    setMsg("");
    localStorage.setItem("ADMIN_TOKEN", token.trim());
    setLoadedToken(token.trim());
    setMsg("Loaded ✅");
  }

  async function onCreateChallenge() {
    setErr("");
    setMsg("");

    if (!loadedToken) return setErr("Admin token required.");
    if (!eventId) return setErr("Please select an event.");
    if (!title.trim()) return setErr("Title required.");
    if (!flag.trim()) return setErr("Flag required.");
    if (!startsAt || !endsAt) return setErr("Start/end time required.");

    // datetime-local -> ISO string (local time)
    const body = {
      eventId,
      title: title.trim(),
      category,
      points,
      description,
      flag: flag.trim(),
      startsAt,
      endsAt,
    };

    const created = await api("/api/admin/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const id = created?.challenge?._id;
    if (!id) throw new Error("Create returned no challenge id");

    // ✅ upload in same flow (looks like “upload once create”)
    if (createFiles.length) {
      await uploadFiles(id, createFiles);
    }

    setTitle("");
    setDescription("");
    setFlag("");
    setCreateFiles([]);
    setMsg("Challenge created ✅");
    await loadAll();
  }

  function openEdit(ch: ChallengeRow) {
    setEditing(ch);
    setEditTitle(ch.title);
    setEditCategory(ch.category as any);
    setEditPoints(ch.points);
    setEditDescription(ch.description || "");
    setEditStartsAt(ch.startsAt ? ch.startsAt.slice(0, 16) : "");
    setEditEndsAt(ch.endsAt ? ch.endsAt.slice(0, 16) : "");
    setEditFlag("");
    setEditFilesPicked([]);
  }

  async function saveEdit() {
    if (!editing) return;
    setErr("");
    setMsg("");

    const body: any = {
      title: editTitle.trim(),
      category: editCategory,
      points: editPoints,
      description: editDescription,
      startsAt: editStartsAt,
      endsAt: editEndsAt,
    };
    if (editFlag.trim()) body.flag = editFlag.trim();

    await api(`/api/admin/challenges/${editing._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (editFilesPicked.length) {
      await uploadFiles(editing._id, editFilesPicked);
    }

    setEditing(null);
    setMsg("Saved ✅");
    await loadAll();
  }

  async function deleteChallenge(id: string) {
    if (!confirm("Delete this challenge?")) return;
    setErr("");
    setMsg("");
    await api(`/api/admin/challenges/${id}`, { method: "DELETE" });
    setMsg("Deleted ✅");
    await loadAll();
  }

  async function deleteFile(challengeId: string, fileId: string) {
    if (!confirm("Delete this file?")) return;
    setErr("");
    setMsg("");
    await api(`/api/admin/challenges/${challengeId}/files/${fileId}`, { method: "DELETE" });
    setMsg("File deleted ✅");
    await loadAll();
  }

  // ---------- UI ----------
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-4xl font-bold tracking-tight">
          Admin <span className="text-[#077c8a]">Challenges</span>
        </h1>
        <p className="mt-2 text-white/60">Create events, create challenges, upload files, and manage them.</p>

        {/* token */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-3 text-sm font-semibold text-white/70">Admin Token</div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste ADMIN_TOKEN here"
              className="w-full flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
            />
            <button
              onClick={onLoadToken}
              className="rounded-2xl bg-[#077c8a] px-6 py-3 font-semibold text-white hover:opacity-90"
            >
              Load
            </button>
          </div>

          {(msg || err) && (
            <div className="mt-3 text-sm">
              {msg && <span className="text-emerald-400">{msg}</span>}
              {err && <span className="text-red-400">{err}</span>}
            </div>
          )}
        </div>

        {/* create */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Create Challenge</h2>
              <span className="text-xs text-white/50">Files upload during create</span>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm text-white/70">Event</label>
                <select
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                >
                  <option value="">Select event</option>
                  {events.map((ev) => (
                    <option key={ev._id} value={ev._id}>
                      {ev.name}
                    </option>
                  ))}
                </select>
                {selectedEvent && (
                  <div className="mt-1 text-xs text-white/50">
                    Event window: {fmtLocal(selectedEvent.startsAt)} → {fmtLocal(selectedEvent.endsAt)}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-white/70">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Challenge title"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-white/70">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-white/70">Points</label>
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-white/70">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Markdown / text description"
                  className="mt-2 h-28 w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-white/70">Starts at</label>
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70">Ends at</label>
                  <input
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-white/70">Flag</label>
                <div className="mt-2 flex gap-2">
                  <input
                    type={showFlag ? "text" : "password"}
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    placeholder="flag{...}"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                  />
                  <button
                    onClick={() => setShowFlag((s) => !s)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 hover:bg-white/10"
                    type="button"
                  >
                    {showFlag ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="mt-1 text-xs text-white/50">Flag is stored securely (hashed).</div>
              </div>

              {/* file upload - smaller + not too white */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-white/70">Challenge Files (optional)</label>
                  <span className="text-xs text-white/40">max 10MB each</span>
                </div>

                <input
                  id="challenge-files"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const picked = Array.from(e.target.files || []);
                    if (picked.length === 0) return;

                    setCreateFiles((prev) => {
                      const map = new Map(prev.map((f) => [f.name + ":" + f.size, f]));
                      for (const f of picked) map.set(f.name + ":" + f.size, f);
                      return Array.from(map.values());
                    });

                    e.currentTarget.value = "";
                  }}
                />

                <label
                  htmlFor="challenge-files"
                  className="mt-2 flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3 hover:bg-black/40"
                >
                  <div className="text-sm text-white/80">
                    {createFiles.length ? `${createFiles.length} file(s) selected` : "Click to choose files"}
                    <div className="text-xs text-white/45">Binary/zip/pdf/png etc.</div>
                  </div>
                  <span className="text-xs rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/70">
                    Browse
                  </span>
                </label>

                {createFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {createFiles.map((f) => (
                      <div
                        key={f.name + f.size}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-2"
                      >
                        <div className="text-sm text-white/80 truncate">
                          {f.name} <span className="text-white/40">({Math.round(f.size / 1024)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setCreateFiles((prev) => prev.filter((x) => !(x.name === f.name && x.size === f.size)))
                          }
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => onCreateChallenge().catch((e: any) => setErr(e?.message || "Create failed"))}
                className="mt-2 w-full rounded-2xl bg-[#077c8a] px-6 py-3 font-semibold text-white hover:opacity-90"
              >
                Create
              </button>
            </div>
          </section>

          {/* list */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-bold">Existing Challenges</h2>

            {challenges.length === 0 ? (
              <div className="mt-10 text-center text-white/50">No challenges yet.</div>
            ) : (
              <div className="mt-6 space-y-3">
                {challenges.map((ch) => (
                  <div key={ch._id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="truncate text-lg font-semibold text-white/90">{ch.title}</div>
                        <div className="mt-1 text-sm text-white/55">
                          {ch.category} • {ch.points} pts
                        </div>
                        <div className="mt-1 text-xs text-white/40">
                          Starts: {fmtLocal(ch.startsAt)} • Ends: {fmtLocal(ch.endsAt)}
                        </div>
                      </div>

                      {/* ✅ Edit button is here (you said you can’t see it before) */}
                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => openEdit(ch)}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteChallenge(ch._id).catch((e: any) => setErr(e?.message || "Delete failed"))}
                          className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300 hover:bg-red-500/15"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* files list + delete */}
                    {ch.files?.length ? (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs font-semibold text-white/50">Files</div>
                        {ch.files.map((f) => (
                          <div
                            key={f.fileId}
                            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2"
                          >
                            <div className="truncate text-sm text-white/75">
                              {f.filename}{" "}
                              <span className="text-xs text-white/40">
                                ({Math.round((f.size || 0) / 1024)} KB)
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                deleteFile(ch._id, f.fileId).catch((e: any) =>
                                  setErr(e?.message || "File delete failed")
                                )
                              }
                              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 hover:bg-white/10"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* edit modal (smaller) */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0a0a0a] p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold">Edit Challenge</div>
                <button
                  onClick={() => setEditing(null)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                  placeholder="Title"
                />

                <div className="grid gap-3 md:grid-cols-2">
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={editPoints}
                    onChange={(e) => setEditPoints(Number(e.target.value))}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                    placeholder="Points"
                  />
                </div>

                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="h-24 w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                  placeholder="Description"
                />

                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    type="datetime-local"
                    value={editStartsAt}
                    onChange={(e) => setEditStartsAt(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                  />
                  <input
                    type="datetime-local"
                    value={editEndsAt}
                    onChange={(e) => setEditEndsAt(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                  />
                </div>

                <div>
                  <div className="text-sm text-white/70">
                    New Flag (optional — leave empty to keep current)
                  </div>
                  <input
                    value={editFlag}
                    onChange={(e) => setEditFlag(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                    placeholder="flag{...}"
                  />
                  <div className="mt-1 text-xs text-white/40">
                    Tip: if users get “incorrect” for correct flag, re-enter flag here and Save to rehash.
                  </div>
                </div>

                {/* add files in edit */}
                <div>
                  <div className="text-sm text-white/70">Add files (optional)</div>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const picked = Array.from(e.target.files || []);
                      setEditFilesPicked(picked);
                    }}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                  />
                </div>

                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => saveEdit().catch((e: any) => setErr(e?.message || "Save failed"))}
                    className="flex-1 rounded-2xl bg-[#077c8a] px-6 py-3 font-semibold text-white hover:opacity-90"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white/80 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

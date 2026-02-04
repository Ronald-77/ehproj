"use client";

import { useEffect, useMemo, useState } from "react";

type UserRow = {
  _id: string;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
};

function fmt(d?: string) {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleString();
}

export default function AdminUsersPage() {
  const [token, setToken] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // Create form
  const [cUsername, setCUsername] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cPassword, setCPassword] = useState("");

  // Edit modal
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [eUsername, setEUsername] = useState("");
  const [eEmail, setEEmail] = useState("");

  const createEmailOk = useMemo(() => {
    const e = cEmail.trim();
    if (!e) return true;
    return /^[^\s@]+@uit\.edu\.mm$/i.test(e);
  }, [cEmail]);

  // ✅ replaced api() function
  async function api(path: string, init?: RequestInit) {
    const res = await fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token,
        ...(init?.headers || {}),
      },
    });

    // handle non-JSON responses (like Next 404 HTML)
    const text = await res.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text || "Non-JSON response" };
    }

    if (!res.ok) {
      throw new Error(data?.error || `Request failed (${res.status})`);
    }
    return data;
  }

  async function loadUsers() {
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      const data = await api("/api/admin/users");
      setUsers(data.users || []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  // auto-load when token is set
  useEffect(() => {
    if (token.trim().length > 0) loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    const username = cUsername.trim();
    const email = cEmail.trim().toLowerCase();

    if (!username || !email || !cPassword) {
      setErr("username, email, password are required.");
      return;
    }
    if (!/^[^\s@]+@uit\.edu\.mm$/i.test(email)) {
      setErr("Only @uit.edu.mm emails are allowed.");
      return;
    }
    if (cPassword.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await api("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({ username, email, password: cPassword }),
      });

      setMsg("User created ✅");
      setCUsername("");
      setCEmail("");
      setCPassword("");
      await loadUsers();
    } catch (e: any) {
      setErr(e?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(u: UserRow) {
    setEditing(u);
    setEUsername(u.username);
    setEEmail(u.email);
    setErr(null);
    setMsg(null);
  }

  async function onSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;

    setErr(null);
    setMsg(null);

    const username = eUsername.trim();
    const email = eEmail.trim().toLowerCase();

    if (!username || !email) {
      setErr("username and email are required.");
      return;
    }
    if (!/^[^\s@]+@uit\.edu\.mm$/i.test(email)) {
      setErr("Only @uit.edu.mm emails are allowed.");
      return;
    }

    setLoading(true);
    try {
      await api(`/api/admin/users/${editing._id}`, {
        method: "PUT",
        body: JSON.stringify({ username, email }),
      });

      setMsg("User updated ✅");
      setEditing(null);
      await loadUsers();
    } catch (e: any) {
      setErr(e?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    setErr(null);
    setMsg(null);

    if (!confirm("Delete this user?")) return;

    setLoading(true);
    try {
      await api(`/api/admin/users/${id}`, { method: "DELETE" });
      setMsg("User deleted ✅");
      await loadUsers();
    } catch (e: any) {
      setErr(e?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(7,124,138,0.18),transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-white">Admin </span>
          <span className="text-[#077c8a]">Users</span>
        </h1>
        <p className="mt-2 text-white/70">
          CRUD dashboard for users (protected by an admin token).
        </p>

        {/* Token box */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <label className="block text-sm font-medium text-white/80">
            Admin Token
          </label>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste ADMIN_TOKEN here"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#1493a0]/70"
          />

          <div className="mt-3 flex gap-3">
            <button
              onClick={loadUsers}
              className="rounded-xl bg-[#077c8a] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              Load Users
            </button>

            <button
              onClick={() => {
                setToken("");
                setUsers([]);
                setErr(null);
                setMsg(null);
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
            >
              Clear
            </button>

            <span className="ml-auto self-center text-sm text-white/60">
              {loading ? "Working..." : `${users.length} users`}
            </span>
          </div>

          {(err || msg) && (
            <div
              className={`mt-4 rounded-2xl border p-3 text-sm ${
                err
                  ? "border-red-500/30 bg-red-500/10 text-red-200"
                  : "border-[#077c8a]/30 bg-[#077c8a]/10 text-white/90"
              }`}
            >
              {err ?? msg}
            </div>
          )}
        </div>

        {/* Create user */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-lg font-semibold text-white">Create User</h2>

          <form onSubmit={onCreate} className="mt-4 grid gap-4 sm:grid-cols-3">
            <input
              value={cUsername}
              onChange={(e) => setCUsername(e.target.value)}
              placeholder="Username"
              className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#1493a0]/70"
            />

            <div className="sm:col-span-1">
              <input
                value={cEmail}
                onChange={(e) => setCEmail(e.target.value)}
                placeholder="email@uit.edu.mm"
                className={`w-full rounded-xl border bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none ${
                  createEmailOk
                    ? "border-white/10 focus:border-[#1493a0]/70"
                    : "border-red-500/40 focus:border-red-400/70"
                }`}
              />
              {!createEmailOk && (
                <p className="mt-2 text-xs text-red-200/80">
                  Only @uit.edu.mm emails allowed.
                </p>
              )}
            </div>

            <input
              value={cPassword}
              onChange={(e) => setCPassword(e.target.value)}
              placeholder="Password (min 8 chars)"
              type="password"
              className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#1493a0]/70"
            />

            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-[#077c8a] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </form>
        </div>

        {/* Users table */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Users</h2>
            <span className="text-sm text-white/60">
              {loading ? "Loading..." : `${users.length} users`}
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-white/70">
                <tr className="border-b border-white/10">
                  <th className="py-3 pr-4">Username</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Created</th>
                  <th className="py-3 pr-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-white/5">
                    <td className="py-3 pr-4 font-medium text-white">{u.username}</td>
                    <td className="py-3 pr-4 text-white/80">{u.email}</td>
                    <td className="py-3 pr-4 text-white/60">{fmt(u.createdAt)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(u)}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-white/80 hover:bg-white/10 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(u._id)}
                          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-red-200 hover:bg-red-500/15 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && !loading && (
                  <tr>
                    <td className="py-6 text-white/60" colSpan={4}>
                      No users yet. Create one above or sign up from the UI.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0b0b] p-6">
              <h3 className="text-lg font-semibold text-white">Edit User</h3>
              <p className="mt-1 text-sm text-white/60">
                Update username/email for this user.
              </p>

              <form onSubmit={onSaveEdit} className="mt-5 space-y-4">
                <input
                  value={eUsername}
                  onChange={(e) => setEUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#1493a0]/70"
                />
                <input
                  value={eEmail}
                  onChange={(e) => setEEmail(e.target.value)}
                  placeholder="email@uit.edu.mm"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#1493a0]/70"
                />

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-[#077c8a] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// src/app/admin/page.tsx
import Link from "next/link";

const cards = [
  {
    title: "Users",
    desc: "Manage user accounts, roles, and access.",
    href: "/admin/users",
    icon: "👤",
  },
  {
    title: "Teams",
    desc: "View teams per event, ban/unban, rename, delete.",
    href: "/admin/teams",
    icon: "👥",
  },
  {
    title: "Events",
    desc: "Create, edit, delete events and set active event.",
    href: "/admin/events",
    icon: "📅",
  },
  {
    title: "Challenges",
    desc: "Create, edit, upload files, schedule challenges.",
    href: "/admin/challenges",
    icon: "🧩",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="text-white/80">Admin </span>
          <span className="text-[#077c8a]">Dashboard</span>
        </h1>
        <p className="mt-2 text-white/55">
          Quick access to manage Users, Teams, Events, and Challenges.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:bg-white/[0.06]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-black/40 text-2xl">
                  {c.icon}
                </div>
                <div>
                  <div className="text-xl font-extrabold text-white">{c.title}</div>
                  <div className="mt-1 text-sm text-white/55">{c.desc}</div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm font-semibold text-white/70 group-hover:text-white">
                Open →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

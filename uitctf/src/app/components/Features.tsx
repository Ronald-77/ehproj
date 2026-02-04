export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-16">
      {/* Title */}
      <h2 className="text-center text-3xl font-bold tracking-tight sm:text-5xl">
        <span className="text-white">Platform </span>
        <span className="text-[#077c8a]">Features</span>
      </h2>

      {/* Grid */}
      <div className="mt-12 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Learn-by-Doing",
            desc: "Hands-on challenges that teach real-world cybersecurity skills.",
            icon: "🎯",
          },
          {
            title: "Rules",
            desc: "Clear rules that keep the competition fair and fun for everyone.",
            icon: "📜",
          },
          {
            title: "Live Competitions",
            desc: "Compete against others in exciting CTF events and climb the ranks.",
            icon: "🏆",
          },
          {
            title: "Secure & Fair",
            desc: "Fair gameplay with monitoring and protections against abuse.",
            icon: "🔒",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="
              group rounded-3xl border border-white/10 bg-white/[0.04] p-7
              shadow-[0_0_0_1px_rgba(255,255,255,0.04)]
              transition
              hover:border-[#1493a0]/70 hover:bg-white/[0.06]
            "
          >
            {/* Icon */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 text-2xl">
                {f.icon}
              </div>
            </div>

            {/* Title */}
            <h3 className="mt-6 text-lg font-semibold text-white">{f.title}</h3>

            {/* Description */}
            <p className="mt-3 text-sm leading-7 text-white/65">{f.desc}</p>

            {/* ✅ Removed the teal line */}
          </div>
        ))}
      </div>
    </section>
  );
}

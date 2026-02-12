export default function Features() {
  return (
    <section id="features" className="relative mx-auto max-w-6xl px-6 py-24">
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 opacity-20 blur-[100px] bg-[#077c8a]/20" />

      {/* Title Section */}
      <div className="mb-16 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Platform <span className="text-[#077c8a]">Features</span>
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-white/60">
          Everything you need to master cybersecurity in one place.
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Learn-by-Doing",
            desc: "Hands-on challenges that teach real-world cybersecurity skills.",
          },
          {
            title: "Rules",
            desc: "Clear rules that keep the competition fair and fun for everyone.",
          },
          {
            title: "Live Competitions",
            desc: "Compete against others in exciting CTF events and climb the ranks.",
          },
          {
            title: "Secure & Fair",
            desc: "Advanced monitoring and anti-cheat systems guarantee the integrity of every competition.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="
              group relative flex flex-col justify-between overflow-hidden rounded-2xl 
              bg-white/[0.02] p-8 backdrop-blur-sm
              transition-all duration-300
              hover:-translate-y-1 hover:bg-white/[0.04] hover:shadow-xl hover:shadow-[#077c8a]/10
            "
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-[#077c8a] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div>
              <h3 className="mb-3 text-xl font-bold text-white group-hover:text-[#077c8a] transition-colors">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/60 group-hover:text-white/80 transition-colors">
                {f.desc}
              </p>
            </div>
            
            {/* Subtle bottom detail */}
            <div className="mt-6 flex items-center gap-2 text-xs font-medium text-[#077c8a] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span>Learn more</span>
              <span>→</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

import Navbar from "./components/Navbar";
import Contact from "./components/Contact";
import Features from "./components/Features";


export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero */}
            {/* Hero */}
      <section className="relative">
        {/* subtle background glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(7,124,138,0.18),transparent_55%)]" />

        <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl items-center justify-center px-6">
          <div className="w-full max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              <span className="text-white">Learn.</span>{" "}
              <span className="text-[#077c8a]">Hack.</span>{" "}
              <span className="text-white">Complete.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-white/70">
              Practice challenges, compete with teams, climb the scoreboard, and learn
              security hands-on.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/event"
                className="inline-flex items-center justify-center rounded-xl bg-[#077c8a] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                Join Now{" "}
                <span className="ml-2" style={{ color: "#EDF5ED" }}>
                  →
                </span>
              </a>

              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                Platform Features
              </a>

              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </section>


      {/* Platform Features */}
      <Features />


      {/* Contact */}
      <Contact />

      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/50">
        © {new Date().getFullYear()} UIT CTF
      </footer>
    </main>
  );
}

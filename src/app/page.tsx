import Navbar from "./components/Navbar";
import Contact from "./components/Contact";
import Features from "./components/Features";
import Footer from "./components/Footer";
import ShieldLogo from "./components/ShieldLogo";
import About from "./components/About";


export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative">
        {/* subtle background glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(7,124,138,0.18),transparent_55%)]" />

        <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl items-center justify-center px-6 pb-20">
          <div className="w-full max-w-3xl text-center">
            
            {/* Logo Section */}
            <div className="mb-10 flex justify-center -translate-y-2">
              <ShieldLogo className="h-64 w-64" />
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl flex flex-wrap justify-center items-center gap-4">
              <span className="text-white">Learn</span>
              <span className="text-[#077c8a] text-3xl sm:text-5xl">•</span>
              <span className="relative inline-flex">
                <span className="absolute -inset-4 blur-xl bg-[#077c8a]/40 opacity-50 animate-pulse"></span>
                {['H', 'a', 'c', 'k'].map((char, i) => (
                    <span 
                      key={i} 
                      className="animate-text-wave inline-block text-[#4ff]" 
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                        {char}
                    </span>
                ))}
              </span>
              <span className="text-[#077c8a] text-3xl sm:text-5xl">•</span>
              <span className="text-white">Compete</span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-base sm:text-lg text-white/70">
              Challenges on. Skills up. Scoreboard waiting...
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/event"
                className="inline-flex items-center justify-center rounded-xl bg-[#077c8a] px-8 py-4 text-sm font-semibold text-white hover:opacity-90 transition shadow-lg shadow-[#077c8a]/20"
              >
                Join Now{" "}
                <span className="ml-2" style={{ color: "#EDF5ED" }}>
                  →
                </span>
              </a>

              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                Platform Features
              </a>

              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Us */}
      {/* Platform Features */}
      <Features />
      <About />


      {/* Contact */}
      <Contact />

      <Footer />
    </main>
  );
}

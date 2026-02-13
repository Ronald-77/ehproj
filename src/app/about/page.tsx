import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AboutSection from "../components/About";
import { FaCalendarAlt, FaPuzzlePiece, FaUsers, FaChartLine, FaLock, FaLayerGroup, FaArrowDown } from "react-icons/fa";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
              <span className="text-white">About </span>
              <span className="text-[#077c8a]">Us</span>
            </h1>
            <div className="mt-6 flex justify-center">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 text-[#077c8a] motion-safe:animate-bounce">
                <FaArrowDown />
              </span>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-3xl text-center text-white/80">
            <p>
              Built by UIT Cyber Security students to create a real CTF culture on campus.
            </p>
          </div>

          <div className="mx-auto mt-20 max-w-5xl">
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/10 transition hover:-translate-y-1 hover:border-[#077c8a]/70 hover:ring-[#077c8a]/30 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-[#077c8a]/30 hover:shadow-[0_0_20px_0_rgba(7,124,138,0.25)]">
                <div className="flex items-center gap-3 text-white">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                    <FaCalendarAlt className="text-[#077c8a] text-2xl" />
                  </span>
                  <div className="text-lg font-semibold">Monthly CTF Events</div>
                </div>
                <p className="mt-3 text-white/70">One battle. Every month.</p>
              </div>

              <div className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/10 transition hover:-translate-y-1 hover:border-[#077c8a]/70 hover:ring-[#077c8a]/30 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-[#077c8a]/30 hover:shadow-[0_0_20px_0_rgba(7,124,138,0.25)]">
                <div className="flex items-center gap-3 text-white">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                    <FaPuzzlePiece className="text-[#077c8a] text-2xl" />
                  </span>
                  <div className="text-lg font-semibold">Real CTF Challenges</div>
                </div>
                <p className="mt-3 text-white/70">Train with real-world inspired problems.</p>
              </div>

              <div className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/10 transition hover:-translate-y-1 hover:border-[#077c8a]/70 hover:ring-[#077c8a]/30 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-[#077c8a]/30 hover:shadow-[0_0_20px_0_rgba(7,124,138,0.25)]">
                <div className="flex items-center gap-3 text-white">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                    <FaUsers className="text-[#077c8a] text-2xl" />
                  </span>
                  <div className="text-lg font-semibold">Community</div>
                </div>
                <p className="mt-3 text-white/70">Connect with UIT’s cybersecurity community.</p>
              </div>

              <div className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/10 transition hover:-translate-y-1 hover:border-[#077c8a]/70 hover:ring-[#077c8a]/30 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-[#077c8a]/30 hover:shadow-[0_0_20px_0_rgba(7,124,138,0.25)]">
                <div className="flex items-center gap-3 text-white">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                    <FaChartLine className="text-[#077c8a] text-2xl" />
                  </span>
                  <div className="text-lg font-semibold">Leaderboard</div>
                </div>
                <p className="mt-3 text-white/70">Track progress. Climb the leaderboard.</p>
              </div>

              <div className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/10 transition hover:-translate-y-1 hover:border-[#077c8a]/70 hover:ring-[#077c8a]/30 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-[#077c8a]/30 hover:shadow-[0_0_20px_0_rgba(7,124,138,0.25)]">
                <div className="flex items-center gap-3 text-white">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                    <FaLock className="text-[#077c8a] text-2xl" />
                  </span>
                  <div className="text-lg font-semibold">UIT-Only Access</div>
                </div>
                <p className="mt-3 text-white/70">Secure login with official UIT email.</p>
              </div>

              <div className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/10 transition hover:-translate-y-1 hover:border-[#077c8a]/70 hover:ring-[#077c8a]/30 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-[#077c8a]/30 hover:shadow-[0_0_20px_0_rgba(7,124,138,0.25)]">
                <div className="flex items-center gap-3 text-white">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                    <FaLayerGroup className="text-[#077c8a] text-2xl" />
                  </span>
                  <div className="text-lg font-semibold">Categories</div>
                </div>
                <p className="mt-3 text-white/70">From Web to Binary — master them all.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AboutSection />

      <Footer />
    </main>
  );
}

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AboutSection from "../components/About";
import { FaCalendarAlt, FaPuzzlePiece, FaLaptopCode, FaUsers, FaChartLine, FaLock, FaLayerGroup, FaArrowDown } from "react-icons/fa";

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
          

          <div className="hidden">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-6 text-center transition hover:border-[#077c8a]/50">
              <div className="text-3xl font-extrabold bg-gradient-to-r from-[#4ff] to-[#077c8a] bg-clip-text text-transparent">0+</div>
              <div className="mt-1 text-sm text-white/70">Monthly Events Planned</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-6 text-center transition hover:border-[#077c8a]/50">
              <div className="text-3xl font-extrabold bg-gradient-to-r from-[#4ff] to-[#077c8a] bg-clip-text text-transparent">6+</div>
              <div className="mt-1 text-sm text-white/70">CTF Categories</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-6 text-center transition hover:border-[#077c8a]/50">
              <div className="text-3xl font-extrabold bg-gradient-to-r from-[#4ff] to-[#077c8a] bg-clip-text text-transparent">100%</div>
              <div className="mt-1 text-sm text-white/70">UIT Students Focused</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-6 text-center transition hover:border-[#077c8a]/50">
              <div className="text-3xl font-extrabold bg-gradient-to-r from-[#4ff] to-[#077c8a] bg-clip-text text-transparent">1</div>
              <div className="mt-1 text-sm text-white/70">University. One Community.</div>
            </div>
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

          <div className="hidden">
            <div className="text-2xl font-extrabold bg-gradient-to-r from-[#4ff] to-[#077c8a] bg-clip-text text-transparent">
              Built by UIT Students. Built for Future CTF Champions.
            </div>
            <p className="mt-4 text-white/70">
              We are a team of Cyber Security major students from the University of Information Technology (UIT), currently in our Fourth Year (First Semester).
            </p>
            <p className="mt-2 text-white/70">
              This platform was created as part of our academic project for CST-7413 — but we saw it as something bigger than a subject assignment. We built it to create a real CTF culture inside UIT.
            </p>
          </div>

          <div className="hidden">
            <div className="text-center text-2xl font-semibold">
              <span className="text-white">Our </span>
              <span className="text-[#077c8a]">Journey</span>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="text-white/85">2026 — Built for CST-7413</div>
                <div className="mt-2 text-white/60">The foundation of UIT CTF was created as a student project.</div>
              </div>
              <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="text-white/85">2026 — First UIT CTF Event</div>
                <div className="mt-2 text-white/60">Launching our first internal competition for UIT students.</div>
              </div>
              <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="text-white/85">Future — Inter-University Competition</div>
                <div className="mt-2 text-white/60">Expanding beyond UIT to friendly competitions with other universities.</div>
              </div>
              <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="text-white/85">Future — National CTF Representation</div>
                <div className="mt-2 text-white/60">Building a team ready to represent in national and international CTFs.</div>
              </div>
            </div>
          </div>

          <div className="hidden">
            <div className="grid gap-12 sm:grid-cols-2">
              <div>
                <div className="text-2xl font-semibold">
                  <span className="text-white">Why </span>
                  <span className="text-[#077c8a]">This Platform Exists</span>
                </div>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#077c8a]" />
                    <span>Only accessible with UIT student email</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#077c8a]" />
                    <span>Exclusively for UIT students</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#077c8a]" />
                    <span>Dedicated CTF competitions only for UIT participants</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#077c8a]" />
                    <span>Designed specifically for CyberSecurity learning</span>
                  </li>
                </ul>
              </div>

              <div>
                <div className="text-2xl font-semibold">
                  <span className="text-white">What Makes </span>
                  <span className="text-[#077c8a]">Us Different</span>
                </div>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#077c8a]" />
                    <span>Monthly CTF events</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#077c8a]" />
                    <span>Real CTF-style challenges inspired by international competitions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#077c8a]" />
                    <span>Hands-on learning: solve, analyze, secure</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#077c8a]" />
                    <span>Build your CTF network and community</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#077c8a]" />
                    <span>Scoreboard and ranking system</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="hidden" />

            <div className="hidden">
              <div className="text-2xl font-semibold">
                <span className="text-white">Multiple </span>
                <span className="text-[#077c8a]">Categories</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="rounded-full bg-white/5 px-4 py-2 text-sm text-white/80">Web Exploitation</span>
                <span className="rounded-full bg-white/5 px-4 py-2 text-sm text-white/80">Cryptography</span>
                <span className="rounded-full bg-white/5 px-4 py-2 text-sm text-white/80">Reverse Engineering</span>
                <span className="rounded-full bg-white/5 px-4 py-2 text-sm text-white/80">Forensics</span>
                <span className="rounded-full bg-white/5 px-4 py-2 text-sm text-white/80">OSINT</span>
                <span className="rounded-full bg-white/5 px-4 py-2 text-sm text-white/80">Binary Exploitation</span>
              </div>
            </div>

            <div className="hidden" />

            <div className="hidden">
              <div>
                <div className="text-2xl font-semibold">
                  <span className="text-white">Features We Are </span>
                  <span className="text-[#077c8a]">Adding</span>
                </div>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#077c8a]" />
                    <span>Achievement badges for top solvers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#077c8a]" />
                    <span>Live leaderboard during competitions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#077c8a]" />
                    <span>Team-based CTF mode</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#077c8a]" />
                    <span>Personal skill tracking dashboard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#077c8a]" />
                    <span>Post-CTF writeup sharing section</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#077c8a]" />
                    <span>Mini workshops before competitions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#077c8a]" />
                    <span>Small rewards or recognition for top players</span>
                  </li>
                </ul>
              </div>

              <div>
                <div className="text-2xl font-semibold">
                  <span className="text-white">What We Wish to </span>
                  <span className="text-[#077c8a]">Build Next</span>
                </div>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#077c8a]" />
                    <span>Represent UIT in national & international CTF competitions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#077c8a]" />
                    <span>Build a strong UIT CTF Team</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#077c8a]" />
                    <span>Collaborate with other universities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#077c8a]" />
                    <span>Host inter-university CTF competitions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#077c8a]" />
                    <span>Create a structured cybersecurity learning path</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#077c8a]" />
                    <span>Launch mentorship programs for junior students</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="hidden" />

            <div className="hidden">
              <p className="text-lg font-semibold text-white/90">“Let’s make UIT a strong name in the CTF world.”</p>
              <p className="mt-4">From students, for students — building for our own community.</p>
              <p className="mt-2">This started as a CST-7413 project, but it will grow into something bigger.</p>
              <div className="mt-8 flex justify-center">
                <a
                  href="/event"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 transition"
                >
                  Join the Movement
                </a>
              </div>
            </div>
          </div>

          <div className="hidden">
            <a
              href="/event"
              className="inline-flex items-center justify-center rounded-xl bg-[#077c8a] px-8 py-4 text-sm font-semibold text-white hover:opacity-90 transition shadow-lg shadow-[#077c8a]/30"
            >
              Join Event <span className="ml-2">→</span>
            </a>
          </div>
        </div>
      </section>

      <AboutSection />

      <Footer />
    </main>
  );
}

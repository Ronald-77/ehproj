import { FaTelegramPlane, FaDiscord, FaGoogle } from "react-icons/fa";

export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
          <span className="text-white">Contact </span>
          <span className="text-[#077c8a]">Us</span>
        </h2>
      </div>

      <p className="mx-auto mt-5 max-w-2xl text-center text-base sm:text-lg text-white/70">
        Reach out to the organizers on any of these channels.
      </p>

      {/* Cards */}
      <div className="mt-12 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <a
          className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition hover:border-[#1493a0]/70 hover:bg-white/[0.06]"
          href="https://t.me/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
              <FaTelegramPlane className="text-2xl text-[#077c8a]" />
            </span>
            <div>
              <div className="text-base font-semibold text-white">Telegram</div>
              <div className="mt-1 text-sm text-white/60">
                t.me/your_channel
              </div>
            </div>
          </div>
        </a>

        <a
          className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition hover:border-[#1493a0]/70 hover:bg-white/[0.06]"
          href="https://discord.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
              <FaDiscord className="text-2xl text-[#077c8a]" />
            </span>
            <div>
              <div className="text-base font-semibold text-white">Discord</div>
              <div className="mt-1 text-sm text-white/60">
                discord.gg/your_invite
              </div>
            </div>
          </div>
        </a>

        <a
          className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition hover:border-[#1493a0]/70 hover:bg-white/[0.06]"
          href="mailto:uitctf@gmail.com"
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
              <FaGoogle className="text-2xl text-[#077c8a]" />
            </span>
            <div>
              <div className="text-base font-semibold text-white">Gmail</div>
              <div className="mt-1 text-sm text-white/60">
                uitctf@gmail.com
              </div>
            </div>
          </div>
        </a>
      </div>
    </section>
  );
}

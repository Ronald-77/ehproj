
import Link from 'next/link';
import { FaFlag } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                <FaFlag className="h-5 w-5 text-[#077c8a]" />
              </span>
              <span className="text-lg font-bold tracking-tight">
                <span className="text-[#077c8a]">UIT</span>
                <span className="text-white">CTF</span>
              </span>
            </div>
            <p className="text-sm text-white/60">
Your UIT gateway to hands-on cybersecurity
            </p>
          </div>

          {/* Links Column 1 */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-white">Platform</h4>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <Link href="/about" className="hover:text-[#077c8a] transition-colors">
                About Us
              </Link>
              <Link href="/event" className="hover:text-[#077c8a] transition-colors">
                Live Events
              </Link>
              <Link href="/practice" className="hover:text-[#077c8a] transition-colors">
                Practice
              </Link>

            </div>
          </div>

          {/* Links Column 2 */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-white">Resources</h4>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <Link href="#" className="hover:text-[#077c8a] transition-colors">
                Rules
              </Link>
              <Link href="#" className="hover:text-[#077c8a] transition-colors">
                FAQ
              </Link>
              <Link href="#contact" className="hover:text-[#077c8a] transition-colors">
                Contact Support
              </Link>
            </div>
          </div>

          {/* Legal/Social Column */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-white">Legal</h4>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <Link href="#" className="hover:text-[#077c8a] transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-[#077c8a] transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 flex flex-col items-center justify-center text-sm text-white/40">
          <p>© {currentYear} UIT CTF Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

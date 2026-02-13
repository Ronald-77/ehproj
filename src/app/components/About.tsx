import { FaLinkedin, FaGithub, FaUserCircle } from "react-icons/fa";

export default function About() {
  // Member data structure - designed for easy expansion/integration with real data
  const members = [
    {
      name: "Saw Ronald",
      role: "Role",
      linkedin: "#",
      github: "https://github.com/Ronald-77",
    },
    {
      name: "Mi Khin Han Thar Soe",
      role: "Role",
      linkedin: "https://www.linkedin.com/in/mi-khin-hanthar-soe-3849aa25b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
      github: "https://github.com/MiKhin1115",
    }, 
    {
      name: "San Yamin",
      role: "Role",
      linkedin: "https://www.linkedin.com/in/san-yamin-18b781307?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
      github: "https://github.com/San-Yamin",
    },
    {
      name: "Naw Shin Nadi Than",
      role: "Role",
      linkedin: "linkedin.com/in/naw-shin-nadi-than",
      github: "https://github.com/x-xingnadi",
    },
  ];

  return (
    <section id="about" className="relative mx-auto max-w-6xl px-6 py-24">
      {/* Title Section */}
      <div className="mb-16 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-5xl">
          <span className="text-white">Our </span>
          <span className="text-[#077c8a]">Team</span>
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-white/70">
          Created to support UIT students in cybersecurity learning.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {members.map((member, idx) => (
          <div
            key={idx}
            className="group relative flex flex-col items-center justify-between rounded-2xl bg-white/[0.02] p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-[#077c8a]/30 border border-white/10 hover:border-[#077c8a]/40"
          >
             <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-lg bg-[radial-gradient(ellipse_at_center,rgba(7,124,138,0.25),transparent_60%)]"></div>
             <div className="mb-6 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10 group-hover:ring-[#077c8a] transition-all">
                <FaUserCircle className="h-16 w-16 text-white/25 group-hover:text-[#077c8a]/60 transition-colors" />
             </div>
             
             <div className="text-center">
               <h3 className="mb-2 text-xl font-bold text-white transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#4ff] group-hover:to-[#077c8a]">
                  {member.name}
               </h3>
             </div>

             <div className="mt-6 flex gap-4">
                <a 
                  href={member.linkedin} 
                  className="rounded-full bg-white/5 p-3 text-white/60 hover:bg-[#0077b5] hover:text-white transition-all"
                  aria-label="LinkedIn"
                >
                    <FaLinkedin size={20} />
                </a>
                <a 
                  href={member.github} 
                  className="rounded-full bg-white/5 p-3 text-white/60 hover:bg-[#333] hover:text-white transition-all"
                  aria-label="GitHub"
                >
                    <FaGithub size={20} />
                </a>
             </div>
          </div>
        ))}
      </div>
    </section>
  );
}

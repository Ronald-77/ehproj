import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import EventNavbar from "../components/EventNavbar";

export default async function EventPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ctf_token")?.value;

  if (!token) {
    redirect("/login?next=/event");
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <EventNavbar />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-3xl font-bold">
          <span className="text-white">Event </span>
          <span className="text-[#077c8a]">Dashboard</span>
        </h1>
        <p className="mt-3 text-white/70">
          Welcome to the event area.
        </p>
      </section>
    </main>
  );
}

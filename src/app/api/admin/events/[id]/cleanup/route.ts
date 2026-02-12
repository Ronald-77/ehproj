export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/adminAuth";
import { Event } from "@/models/Event";
import { Team } from "@/models/Team";

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  await connectMongo();

  const eventId = ctx.params.id;
  const ev = await Event.findById(eventId).select("_id endsAt name");
  if (!ev) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  // ✅ Only allow cleanup after the event ended
  const now = new Date();
  const endsAt = ev.endsAt ? new Date(ev.endsAt) : null;

  if (endsAt && now < endsAt) {
    return NextResponse.json(
      { error: "Event has not ended yet. Cleanup allowed only after it ends." },
      { status: 400 }
    );
  }

  // ✅ delete all teams for this event
  const result = await Team.deleteMany({ eventId: ev._id });

  return NextResponse.json({
    ok: true,
    deletedTeams: result.deletedCount ?? 0,
  });
}

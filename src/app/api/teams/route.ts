export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Event } from "@/models/Event";
import { Team } from "@/models/Team";

export async function GET() {
  await connectMongo();

  // ✅ Only show teams for the currently active event (time window)
  const now = new Date();
  const activeEvent = await Event.findOne({
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  }).select("_id name startsAt endsAt");

  // ✅ No active event => no event teams should show
  if (!activeEvent) {
    return NextResponse.json({
      event: null,
      teams: [],
    });
  }

  const teams = await Team.find({ eventId: activeEvent._id })
    .sort({ createdAt: -1 })
    .select("_id name members leaderId");

  return NextResponse.json({
    event: {
      _id: activeEvent._id.toString(),
      name: activeEvent.name,
      startsAt: activeEvent.startsAt,
      endsAt: activeEvent.endsAt,
    },
    teams: teams.map((t) => ({
      _id: t._id.toString(),
      name: t.name,
      membersCount: Array.isArray(t.members) ? t.members.length : 0,
      leaderId: t.leaderId?.toString?.() || null,
    })),
  });
}

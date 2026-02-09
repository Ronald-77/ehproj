export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Event } from "@/models/Event";
import { Challenge } from "@/models/Challenge";

export async function GET() {
  await connectMongo();

  const now = new Date();

  // ended events
  const endedEvents = await Event.find({ endsAt: { $lt: now } }).select("_id").lean();
  const endedIds = endedEvents.map((e: any) => e._id);

  if (endedIds.length === 0) return NextResponse.json({ challenges: [] });

  const challenges = await Challenge.find({
    eventId: { $in: endedIds },
    endsAt: { $lt: now },
  })
    .sort({ endsAt: -1, points: 1 })
    .select("_id title points category eventId endsAt");

  return NextResponse.json({
    challenges: challenges.map((c: any) => ({
      _id: String(c._id),
      title: c.title,
      category: c.category,
      points: c.points,
      eventId: String(c.eventId),
      endsAt: c.endsAt,
    })),
  });
}

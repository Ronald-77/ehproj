export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Event } from "@/models/Event";

export async function GET() {
  await connectMongo();
  const now = new Date();

  const event = await Event.findOne({
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  })
    .sort({ startsAt: -1 })
    .select("_id name startsAt endsAt");

  if (!event) {
    return NextResponse.json({ event: null });
  }

  return NextResponse.json({
    event: {
      _id: event._id.toString(),
      name: event.name,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
    },
  });
}

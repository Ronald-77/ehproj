export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { connectMongo } from "@/lib/mongodb";
import { Event } from "@/models/Event";

export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  await connectMongo();

  const events = await Event.find({})
    .sort({ createdAt: -1 })
    .select("_id name startsAt endsAt createdAt updatedAt");

  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));

  const name = String(body.name ?? "").trim();
  const startsAt = new Date(String(body.startsAt));
  const endsAt = new Date(String(body.endsAt));

  if (!name || name.length < 2 || name.length > 80) {
    return NextResponse.json({ error: "Event name must be 2–80 characters." }, { status: 400 });
  }
  if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime())) {
    return NextResponse.json({ error: "Invalid start/end time." }, { status: 400 });
  }
  if (endsAt <= startsAt) {
    return NextResponse.json({ error: "End time must be after start time." }, { status: 400 });
  }

  await connectMongo();

  const created = await Event.create({ name, startsAt, endsAt });

  return NextResponse.json({
    ok: true,
    event: {
      _id: created._id.toString(),
      name: created.name,
      startsAt: created.startsAt,
      endsAt: created.endsAt,
    },
  });
}

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { connectMongo } from "@/lib/mongodb";
import { Event } from "@/models/Event";

function toDateFromDatetimeLocal(v: unknown) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  // admin UI sends "2026-02-09T21:47" (datetime-local)
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  await connectMongo();

  const now = new Date();
  const events = await Event.find({})
    .sort({ createdAt: -1 })
    .select("_id name startsAt endsAt createdAt updatedAt");

  return NextResponse.json({
    events: events.map((e: any) => ({
      _id: e._id.toString(),
      name: e.name,
      startsAt: e.startsAt ? new Date(e.startsAt).toISOString() : null,
      endsAt: e.endsAt ? new Date(e.endsAt).toISOString() : null,
      isActive: e.startsAt && e.endsAt ? now >= e.startsAt && now <= e.endsAt : false,
      createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : null,
      updatedAt: e.updatedAt ? new Date(e.updatedAt).toISOString() : null,
    })),
  });
}

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));

  const name = String(body.name ?? body.eventName ?? "").trim();
  const startsAt = toDateFromDatetimeLocal(body.startsAt);
  const endsAt = toDateFromDatetimeLocal(body.endsAt);

  if (!name || name.length < 2 || name.length > 80) {
    return NextResponse.json({ error: "Event name must be 2–80 characters." }, { status: 400 });
  }
  if (!startsAt || !endsAt) {
    return NextResponse.json({ error: "startsAt and endsAt are required." }, { status: 400 });
  }
  if (endsAt <= startsAt) {
    return NextResponse.json({ error: "End time must be after start time." }, { status: 400 });
  }

  await connectMongo();

  const created = await Event.create({
    name,
    startsAt,
    endsAt,
  });

  return NextResponse.json({
    ok: true,
    event: {
      _id: created._id.toString(),
      name: created.name,
      startsAt: created.startsAt.toISOString(),
      endsAt: created.endsAt.toISOString(),
    },
  });
}

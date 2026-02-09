export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/adminAuth";
import { connectMongo } from "@/lib/mongodb";
import { Challenge } from "@/models/Challenge";
import { Event } from "@/models/Event";
import { Types } from "mongoose";

const CATEGORIES = new Set([
  "Web Exploitation",
  "Cryptography",
  "Forensics",
  "Pwn",
  "Reverse Engineering",
  "OSINT",
  "Misc",
  "Steganography",
]);

/**
 * Admin: list all challenges (for admin page)
 */
export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  await connectMongo();

  const list = await Challenge.find({})
    .sort({ createdAt: -1 })
    .select("_id eventId title category points startsAt endsAt createdAt updatedAt files");

  return NextResponse.json({ challenges: list });
}

/**
 * Admin: create challenge
 * - If body.eventId is provided, use it
 * - else auto-use latest created Event
 * - validate schedule + store flagHash
 */
export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));

  const title = String(body.title ?? "").trim();
  const category = String(body.category ?? "").trim();
  const description = String(body.description ?? "");
  const points = Number(body.points ?? 0);
  const flag = String(body.flag ?? "").trim();

  // datetime-local strings -> Date
  const startsAt = new Date(String(body.startsAt));
  const endsAt = new Date(String(body.endsAt));

  // optional eventId
  const rawEventId = body.eventId ? String(body.eventId) : "";

  if (!title || title.length < 2 || title.length > 80) {
    return NextResponse.json({ error: "Title must be 2–80 characters." }, { status: 400 });
  }
  if (!CATEGORIES.has(category)) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }
  if (!Number.isFinite(points) || points <= 0 || points > 10000) {
    return NextResponse.json({ error: "Points must be 1–10000." }, { status: 400 });
  }
  if (!flag || flag.length < 4 || flag.length > 200) {
    return NextResponse.json({ error: "Flag must be 4–200 characters." }, { status: 400 });
  }

  if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime())) {
    return NextResponse.json({ error: "Invalid start/end time." }, { status: 400 });
  }
  if (endsAt <= startsAt) {
    return NextResponse.json({ error: "End time must be after start time." }, { status: 400 });
  }

  await connectMongo();

  // ✅ pick event
  let eventDoc: any = null;

  if (rawEventId) {
    if (!Types.ObjectId.isValid(rawEventId)) {
      return NextResponse.json({ error: "Invalid eventId." }, { status: 400 });
    }
    eventDoc = await Event.findById(rawEventId).select("_id name startsAt endsAt");
    if (!eventDoc) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }
  } else {
    // ✅ auto: latest created event
    eventDoc = await Event.findOne({}).sort({ createdAt: -1 }).select("_id name startsAt endsAt");
    if (!eventDoc) {
      return NextResponse.json(
        { error: "No event found. Create an event first." },
        { status: 400 }
      );
    }
  }

  // ✅ optional: keep challenge inside event window (recommended so it appears correctly)
  // If you don't want this strict rule, delete this block.
  if (startsAt < eventDoc.startsAt || endsAt > eventDoc.endsAt) {
    return NextResponse.json(
      {
        error:
          "Challenge time must be inside the event time window. (Fix startsAt/endsAt to fit the event.)",
      },
      { status: 400 }
    );
  }

  const flagHash = await bcrypt.hash(flag, 10);

  const created = await Challenge.create({
    eventId: eventDoc._id, // ✅ IMPORTANT
    title,
    category,
    description,
    points,
    flagHash,
    startsAt,
    endsAt,
    files: [],
  });

  return NextResponse.json({
    ok: true,
    challenge: {
      _id: created._id.toString(),
      eventId: String(created.eventId),
      title: created.title,
      category: created.category,
      points: created.points,
      startsAt: created.startsAt,
      endsAt: created.endsAt,
    },
  });
}

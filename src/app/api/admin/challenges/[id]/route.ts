export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/adminAuth";
import { connectMongo } from "@/lib/mongodb";
import { Challenge } from "@/models/Challenge";
import { Event } from "@/models/Event";

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

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { id } = await ctx.params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  await connectMongo();

  const ch = await Challenge.findById(id).select(
    "_id eventId title category description points startsAt endsAt files createdAt updatedAt"
  );

  if (!ch) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    challenge: {
      _id: ch._id.toString(),
      eventId: String(ch.eventId),
      title: ch.title,
      category: ch.category,
      description: ch.description ?? "",
      points: ch.points,
      startsAt: ch.startsAt,
      endsAt: ch.endsAt,
      files: ch.files ?? [],
      createdAt: ch.createdAt,
      updatedAt: ch.updatedAt,
    },
  });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { id } = await ctx.params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));

  const title = String(body.title ?? "").trim();
  const category = String(body.category ?? "").trim();
  const description = String(body.description ?? "");
  const points = Number(body.points ?? 0);

  // flag optional (empty => do not change)
  const newFlag = String(body.flag ?? "").trim();

  // schedule (datetime-local strings)
  const startsAt = new Date(String(body.startsAt));
  const endsAt = new Date(String(body.endsAt));

  if (!title || title.length < 2 || title.length > 80) {
    return NextResponse.json({ error: "Title must be 2–80 characters." }, { status: 400 });
  }
  if (!CATEGORIES.has(category)) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }
  if (!Number.isFinite(points) || points <= 0 || points > 10000) {
    return NextResponse.json({ error: "Points must be 1–10000." }, { status: 400 });
  }

  if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime())) {
    return NextResponse.json({ error: "Invalid start/end time." }, { status: 400 });
  }
  if (endsAt <= startsAt) {
    return NextResponse.json({ error: "End time must be after start time." }, { status: 400 });
  }

  if (newFlag && (newFlag.length < 4 || newFlag.length > 200)) {
    return NextResponse.json({ error: "Flag must be 4–200 characters." }, { status: 400 });
  }

  await connectMongo();

  const current = await Challenge.findById(id).select("_id eventId");
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // ✅ Keep challenge window inside its event window (recommended)
  const ev = await Event.findById(current.eventId).select("startsAt endsAt");
  if (ev) {
    if (startsAt < ev.startsAt || endsAt > ev.endsAt) {
      return NextResponse.json(
        { error: "Challenge time must be inside the event time window." },
        { status: 400 }
      );
    }
  }

  const patch: any = {
    title,
    category,
    description,
    points,
    startsAt,
    endsAt,
  };

  if (newFlag) {
    patch.flagHash = await bcrypt.hash(newFlag, 10);
  }

  const updated = await Challenge.findByIdAndUpdate(id, patch, { new: true }).select(
    "_id eventId title category description points startsAt endsAt files updatedAt"
  );

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ok: true,
    challenge: {
      _id: updated._id.toString(),
      eventId: String(updated.eventId),
      title: updated.title,
      category: updated.category,
      description: updated.description ?? "",
      points: updated.points,
      startsAt: updated.startsAt,
      endsAt: updated.endsAt,
      files: updated.files ?? [],
      updatedAt: updated.updatedAt,
    },
  });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { id } = await ctx.params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  await connectMongo();

  const deleted = await Challenge.findByIdAndDelete(id).select("_id");
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}

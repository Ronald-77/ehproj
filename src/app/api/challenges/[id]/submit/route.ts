export const runtime = "nodejs";

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { connectMongo } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { Event } from "@/models/Event";
import { Team } from "@/models/Team";
import { Challenge } from "@/models/Challenge";
import { Solve } from "@/models/Solve";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await connectMongo();

  const session = await getSession(req);
  if (!session?.id) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const { id } = await ctx.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid challenge id." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const flag = String(body.flag ?? "").trim();

  if (!flag) {
    return NextResponse.json({ error: "Flag is required." }, { status: 400 });
  }

  const now = new Date();

  const activeEvent = await Event.findOne({
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  }).select("_id");

  if (!activeEvent) {
    return NextResponse.json({ error: "No active event right now." }, { status: 403 });
  }

  const userId = new mongoose.Types.ObjectId(String(session.id));

  // ✅ must have a team for THIS active event
  const team = await Team.findOne({
    eventId: activeEvent._id,
    members: userId,
  }).select("_id");

  if (!team) {
    return NextResponse.json({ error: "Create or join a team first." }, { status: 403 });
  }

  // ✅ challenge must exist and belong to active event
  const ch = await Challenge.findOne({ _id: id, eventId: activeEvent._id }).select(
    "_id points flagHash startsAt endsAt eventId"
  );

  if (!ch) {
    return NextResponse.json({ error: "Challenge not found." }, { status: 404 });
  }

  // ✅ scheduled window check
  if (now < ch.startsAt || now > ch.endsAt) {
    return NextResponse.json({ error: "Challenge is not active." }, { status: 403 });
  }

  // ✅ already solved? (don’t award twice)
  const existing = await Solve.findOne({
    userId,
    teamId: team._id,
    challengeId: ch._id,
    eventId: ch.eventId,
  }).select("_id");

  if (existing) {
    return NextResponse.json({ ok: true, alreadySolved: true });
  }

  // ✅ correct compare (trim already done)
  const ok = await bcrypt.compare(flag, ch.flagHash);
  if (!ok) {
    return NextResponse.json({ error: "Incorrect flag." }, { status: 400 });
  }

  await Solve.create({
    userId,
    teamId: team._id,
    challengeId: ch._id,
    eventId: ch.eventId,
    points: ch.points,
  });

  return NextResponse.json({ ok: true, points: ch.points });
}

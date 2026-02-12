export const runtime = "nodejs";

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { connectMongo } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { Event } from "@/models/Event";
import { Team } from "@/models/Team";
import { Challenge } from "@/models/Challenge";
import { Solve } from "@/models/Solve";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await connectMongo();

  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid challenge id." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const flag = String(body.flag ?? "").trim();
  if (!flag) return NextResponse.json({ error: "Flag required." }, { status: 400 });

  // ✅ active event
  const now = new Date();
  const activeEvent = await Event.findOne({
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  }).select("_id");

  if (!activeEvent) {
    return NextResponse.json({ error: "No active event right now." }, { status: 409 });
  }

  // ✅ team in this event
  const team = await Team.findOne({
    eventId: activeEvent._id,
    members: new mongoose.Types.ObjectId(session.id),
  }).select("_id");

  if (!team) {
    return NextResponse.json({ error: "Create or join a team first." }, { status: 403 });
  }

  // ✅ challenge belongs to this event
  const ch = await Challenge.findOne({
    _id: new mongoose.Types.ObjectId(id),
    eventId: activeEvent._id,
  }).select("_id points flagHash startsAt endsAt eventId");

  if (!ch) {
    return NextResponse.json({ error: "Challenge not found." }, { status: 404 });
  }

  // ✅ schedule window check
  if (now < new Date(ch.startsAt) || now > new Date(ch.endsAt)) {
    return NextResponse.json({ error: "Challenge not active." }, { status: 403 });
  }

  // ✅ TEAM already solved?
  const already = await Solve.findOne({
    teamId: team._id,
    challengeId: ch._id,
    eventId: ch.eventId,
  }).select("_id");

  if (already) {
    return NextResponse.json({ ok: true, alreadySolved: true });
  }

  // ✅ compare submitted flag with stored hash
  const ok = await bcrypt.compare(flag, String(ch.flagHash));
  if (!ok) {
    return NextResponse.json({ error: "Incorrect flag." }, { status: 400 });
  }

  // ✅ create solve (unique index prevents duplicates)
  try {
    await Solve.create({
      userId: new mongoose.Types.ObjectId(session.id),
      teamId: team._id,
      challengeId: ch._id,
      eventId: ch.eventId,
      points: ch.points,
    });
  } catch (e: any) {
    // race: two members submit at same time
    if (String(e?.code) === "11000") {
      return NextResponse.json({ ok: true, alreadySolved: true });
    }
    return NextResponse.json({ error: "Failed to save solve." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, solved: true, points: ch.points });
}

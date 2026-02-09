export const runtime = "nodejs";

import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectMongo } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { getActiveOrNextEvent } from "@/lib/eventContext";
import { Team } from "@/models/Team";
import { Challenge } from "@/models/Challenge";
import { Solve } from "@/models/Solve";

export async function GET(req: Request) {
  await connectMongo();

  const session = await getSession(req);
  if (!session?.id) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const { event, mode } = await getActiveOrNextEvent();
  if (!event) {
    return NextResponse.json({ challenges: [], mode: "none", event: null });
  }

  const userId = new mongoose.Types.ObjectId(String(session.id));

  const team = await Team.findOne({
    eventId: event._id,
    members: userId,
  }).select("_id name");

  if (!team) {
    return NextResponse.json({ error: "Create or join a team first." }, { status: 403 });
  }

  // upcoming event => show none yet
  if (mode !== "active") {
    return NextResponse.json({
      challenges: [],
      mode,
      event: { id: String(event._id) },
      team: { id: String(team._id), name: team.name },
    });
  }

  const now = new Date();

  const challenges = await Challenge.find({
    eventId: event._id,
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  })
    .sort({ points: 1, createdAt: 1 })
    .select("_id title points category");

  const solved = await Solve.find({
    eventId: event._id,
    teamId: team._id,
    userId,
  }).select("challengeId");

  const solvedSet = new Set(solved.map((s: any) => String(s.challengeId)));

  return NextResponse.json({
    mode,
    event: { id: String(event._id) },
    team: { id: String(team._id), name: team.name },
    challenges: challenges.map((c: any) => ({
      _id: String(c._id),
      title: c.title,
      category: c.category,
      points: c.points,
      solved: solvedSet.has(String(c._id)),
    })),
  });
}

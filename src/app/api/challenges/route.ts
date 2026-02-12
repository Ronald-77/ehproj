export const runtime = "nodejs";

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongo } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { Event } from "@/models/Event";
import { Team } from "@/models/Team";
import { Challenge } from "@/models/Challenge";
import { Solve } from "@/models/Solve";

export async function GET() {
  await connectMongo();

  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ active event by time window
  const now = new Date();
  const activeEvent = await Event.findOne({
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  }).select("_id name startsAt endsAt");

  if (!activeEvent) {
    return NextResponse.json({
      event: null,
      challenges: [],
      solvedIds: [],
    });
  }

  // ✅ find user's team for THIS event (members: ObjectId[])
  const team = await Team.findOne({
    eventId: activeEvent._id,
    members: new mongoose.Types.ObjectId(session.id),
  }).select("_id name");

  if (!team) {
    // user logged in but no team for active event
    return NextResponse.json({
      event: {
        _id: activeEvent._id.toString(),
        name: activeEvent.name,
        startsAt: activeEvent.startsAt,
        endsAt: activeEvent.endsAt,
      },
      needsTeam: true,
      challenges: [],
      solvedIds: [],
    });
  }

  // ✅ only challenges active right now (scheduled)
  const challenges = await Challenge.find({
    eventId: activeEvent._id,
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  })
    .sort({ points: 1, createdAt: 1 })
    .select("_id title points category startsAt endsAt");

  // ✅ solvedIds for TEAM (one solve means solved for all members)
  const solves = await Solve.find({
    eventId: activeEvent._id,
    teamId: team._id,
  }).select("challengeId");

  const solvedIds = solves.map((s) => s.challengeId.toString());

  return NextResponse.json({
    event: {
      _id: activeEvent._id.toString(),
      name: activeEvent.name,
      startsAt: activeEvent.startsAt,
      endsAt: activeEvent.endsAt,
    },
    team: { _id: team._id.toString(), name: team.name },
    challenges: challenges.map((c) => ({
      _id: c._id.toString(),
      title: c.title,
      points: c.points,
      category: c.category,
      startsAt: c.startsAt,
      endsAt: c.endsAt,
    })),
    solvedIds,
  });
}

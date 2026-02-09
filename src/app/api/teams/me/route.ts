export const runtime = "nodejs";

import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectMongo } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { getActiveOrNextEvent } from "@/lib/eventContext";
import { Team } from "@/models/Team";

export async function GET(req: Request) {
  await connectMongo();

  const session = await getSession(req);
  if (!session?.id) {
    return NextResponse.json({ hasTeam: false }, { status: 401 });
  }

  const { event, mode } = await getActiveOrNextEvent();
  if (!event) {
    return NextResponse.json({ hasTeam: false, mode: "none", event: null });
  }

  const userId = new mongoose.Types.ObjectId(String(session.id));

  const team = await Team.findOne({
    eventId: event._id,
    members: userId,
  }).select("_id name inviteToken leaderId");

  if (!team) {
    return NextResponse.json({
      hasTeam: false,
      mode,
      event: { id: String(event._id) },
    });
  }

  return NextResponse.json({
    hasTeam: true,
    mode,
    event: { id: String(event._id) },
    team: {
      id: String(team._id),
      name: team.name,
      inviteToken: team.inviteToken,
      leaderId: team.leaderId?.toString?.() || "",
    },
  });
}

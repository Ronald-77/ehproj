export const runtime = "nodejs";

import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectMongo } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { getActiveOrNextEvent } from "@/lib/eventContext";
import { Team } from "@/models/Team";

export async function POST(req: Request) {
  await connectMongo();

  const session = await getSession(req);
  if (!session?.id) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const inviteToken = String(body.inviteToken ?? "").trim().toUpperCase();

  if (!inviteToken) {
    return NextResponse.json({ error: "Invite token is required." }, { status: 400 });
  }

  const { event, mode } = await getActiveOrNextEvent();
  if (!event) {
    return NextResponse.json(
      { error: "No event exists. Admin must create an event first." },
      { status: 409 }
    );
  }

  const userId = new mongoose.Types.ObjectId(String(session.id));

  const already = await Team.findOne({
    eventId: event._id,
    members: userId,
  }).select("_id");

  if (already) {
    return NextResponse.json({ error: "You already have a team for this event." }, { status: 409 });
  }

  const team = await Team.findOne({
    eventId: event._id,
    inviteToken,
  }).select("_id name inviteToken");

  if (!team) {
    return NextResponse.json({ error: "Invalid invite token." }, { status: 404 });
  }

  await Team.updateOne({ _id: team._id }, { $addToSet: { members: userId } });

  return NextResponse.json({
    ok: true,
    mode,
    event: { id: String(event._id) },
    team: { id: String(team._id), name: team.name, inviteToken: team.inviteToken },
  });
}

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { connectMongo } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { getActiveOrNextEvent } from "@/lib/eventContext";
import { Team } from "@/models/Team";

function makeInviteToken() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
}

export async function POST(req: Request) {
  await connectMongo();

  const session = await getSession(req);
  if (!session?.id) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const password = String(body.password ?? "").trim();

  if (!name || name.length < 2 || name.length > 40) {
    return NextResponse.json({ error: "Team name must be 2–40 characters." }, { status: 400 });
  }
  if (!password || password.length < 4 || password.length > 72) {
    return NextResponse.json({ error: "Password must be 4–72 characters." }, { status: 400 });
  }

  const { event, mode } = await getActiveOrNextEvent();
  if (!event) {
    return NextResponse.json(
      { error: "No event exists. Admin must create an event first." },
      { status: 409 }
    );
  }

  const userId = new mongoose.Types.ObjectId(String(session.id));

  // ✅ prevent joining/creating multiple teams for same event
  const existing = await Team.findOne({
    eventId: event._id,
    members: userId,
  }).select("_id");

  if (existing) {
    return NextResponse.json({ error: "You already have a team for this event." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const inviteToken = makeInviteToken();

  const created = await Team.create({
    eventId: event._id,
    name,
    passwordHash,
    inviteToken,
    leaderId: userId,
    members: [userId], // ✅ ObjectId[]
  });

  return NextResponse.json({
    ok: true,
    mode, // active | upcoming
    event: { id: String(event._id) },
    team: {
      id: String(created._id),
      name: created.name,
      inviteToken: created.inviteToken,
    },
  });
}

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { connectMongo } from "@/lib/mongodb";
import { Team } from "@/models/Team";
import mongoose from "mongoose";
import crypto from "crypto";

function makeToken() {
  return crypto.randomBytes(16).toString("hex");
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { id } = await ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid team id." }, { status: 400 });
  }

  await connectMongo();

  // rotate until unique (very unlikely to collide, but safe)
  let inviteToken = makeToken();
  for (let i = 0; i < 5; i++) {
    const exists = await Team.findOne({ inviteToken }).select("_id");
    if (!exists) break;
    inviteToken = makeToken();
  }

  const team = await Team.findByIdAndUpdate(id, { $set: { inviteToken } }, { new: true }).select(
    "_id inviteToken"
  );

  if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

  return NextResponse.json({ ok: true, inviteToken: team.inviteToken });
}

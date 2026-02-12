export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { connectMongo } from "@/lib/mongodb";
import { Team } from "@/models/Team";
import mongoose from "mongoose";

export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const url = new URL(req.url);
  const eventId = url.searchParams.get("eventId") || "";

  if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
    return NextResponse.json({ error: "eventId is required." }, { status: 400 });
  }

  await connectMongo();

  const teams = await Team.find({ eventId, deletedAt: { $exists: false } })
    .sort({ createdAt: -1 })
    .select("_id name members leaderId inviteToken banned banReason createdAt");

  // If you have User model and want leader usernames, you can populate:
  // const teams = await Team.find({ eventId }).populate("leaderId","username").lean()

  const out = teams.map((t: any) => ({
    _id: t._id.toString(),
    name: t.name,
    membersCount: Array.isArray(t.members) ? t.members.length : 0,
    leaderUsername: t.leaderId?.username, // will exist only if populated
    inviteToken: t.inviteToken,
    banned: !!t.banned,
    banReason: t.banReason || "",
    createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : undefined,
  }));

  return NextResponse.json({ teams: out });
}

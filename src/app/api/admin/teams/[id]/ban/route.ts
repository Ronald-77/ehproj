export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { connectMongo } from "@/lib/mongodb";
import { Team } from "@/models/Team";
import mongoose from "mongoose";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { id } = await ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid team id." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const banned = !!body.banned;
  const reason = String(body.reason ?? "").trim().slice(0, 200);

  await connectMongo();

  const upd: any = banned
    ? { banned: true, banReason: reason, bannedAt: new Date() }
    : { banned: false, banReason: "", bannedAt: null };

  const team = await Team.findByIdAndUpdate(id, { $set: upd }, { new: true }).select(
    "_id banned banReason"
  );

  if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

  return NextResponse.json({
    ok: true,
    team: { _id: team._id.toString(), banned: !!team.banned, banReason: team.banReason || "" },
  });
}

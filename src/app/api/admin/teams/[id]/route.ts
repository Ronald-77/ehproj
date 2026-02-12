export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { connectMongo } from "@/lib/mongodb";
import { Team } from "@/models/Team";
import mongoose from "mongoose";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { id } = await ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid team id." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();

  if (!name || name.length < 2 || name.length > 40) {
    return NextResponse.json({ error: "Team name must be 2–40 characters." }, { status: 400 });
  }

  await connectMongo();

  const updated = await Team.findByIdAndUpdate(
    id,
    { $set: { name } },
    { new: true }
  ).select("_id name");

  if (!updated) return NextResponse.json({ error: "Team not found." }, { status: 404 });

  return NextResponse.json({ ok: true, team: { _id: updated._id.toString(), name: updated.name } });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { id } = await ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid team id." }, { status: 400 });
  }

  await connectMongo();

  // Hard delete. If you prefer soft delete: set deletedAt instead.
  const deleted = await Team.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ error: "Team not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
}

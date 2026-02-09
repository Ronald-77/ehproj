export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { connectMongo } from "@/lib/mongodb";
import { Event } from "@/models/Event";
import { Challenge } from "@/models/Challenge";
import { Team } from "@/models/Team";
import { Solve } from "@/models/Solve";
import { PracticeSolve } from "@/models/PracticeSolve"; // if you created it
import mongoose from "mongoose";

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { id } = await ctx.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
  }

  await connectMongo();

  const event = await Event.findById(id).select("_id startsAt endsAt");
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  // (optional) block deleting running event
  const now = new Date();
  if (now >= event.startsAt && now <= event.endsAt) {
    return NextResponse.json({ error: "Cannot delete an active event." }, { status: 409 });
  }

  // find challenges first (for cleaning practiceSolves optionally)
  const challenges = await Challenge.find({ eventId: event._id }).select("_id");
  const challengeIds = challenges.map((c) => c._id);

  // ✅ cascade deletes
  await Solve.deleteMany({ eventId: event._id });
  await Team.deleteMany({ eventId: event._id });
  await Challenge.deleteMany({ eventId: event._id });

  // optional: remove practice solves for those challenges
  if (challengeIds.length > 0) {
    await PracticeSolve.deleteMany({ challengeId: { $in: challengeIds } });
  }

  await Event.findByIdAndDelete(event._id);

  return NextResponse.json({ ok: true });
}

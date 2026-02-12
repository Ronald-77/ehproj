export const runtime = "nodejs";

import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Challenge } from "@/models/Challenge";
import { getActiveEvent } from "@/lib/getActiveEvent"; // if you have it; otherwise remove & skip event filter

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // ✅ Next can give params as Promise — MUST await
    const params = await Promise.resolve(ctx.params);
    const id = params?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid challenge id" }, { status: 400 });
    }

    await connectMongo();

    // OPTIONAL: only allow viewing for active event challenge
    // If you DON'T want event filtering here, delete activeEvent + eventId from query.
    const activeEvent = await getActiveEvent().catch(() => null);

    const query: any = { _id: id };
    if (activeEvent?._id) query.eventId = activeEvent._id;

    const ch = await Challenge.findOne(query).select(
      "_id title category description points files startsAt endsAt eventId"
    );

    if (!ch) {
      return NextResponse.json({ error: "Challenge not found." }, { status: 404 });
    }

    // ✅ schedule guard (only if you want to block outside window)
    // If you want practice to view ended challenges, DO NOT block here (only block submit route).
    // Comment out this block if you want always view.
    /*
    const now = new Date();
    if (now < ch.startsAt || now > ch.endsAt) {
      return NextResponse.json({ error: "Challenge not active yet." }, { status: 403 });
    }
    */

    return NextResponse.json({
      challenge: {
        _id: ch._id.toString(),
        title: ch.title,
        category: ch.category,
        description: ch.description,
        points: ch.points,
        startsAt: ch.startsAt,
        endsAt: ch.endsAt,
        eventId: ch.eventId?.toString?.() ?? null,
        files: (ch.files ?? []).map((f: any) => ({
          fileId: String(f.fileId),
          filename: String(f.filename),
          contentType: String(f.contentType ?? "application/octet-stream"),
          size: Number(f.size ?? 0),
        })),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/adminAuth";
import { connectMongo } from "@/lib/mongodb";
import { Challenge } from "@/models/Challenge";
import { getGridFSBucket } from "@/lib/gridfs";

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string; fileId: string }> }
) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { id, fileId } = await ctx.params;

  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid challenge id." }, { status: 400 });
  }
  if (!ObjectId.isValid(fileId)) {
    return NextResponse.json({ error: "Invalid fileId." }, { status: 400 });
  }

  await connectMongo();

  const ch = await Challenge.findById(id);
  if (!ch) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  // ✅ remove from challenge.files first
  const before = ch.files?.length || 0;
  ch.files = (ch.files || []).filter((f: any) => String(f.fileId) !== String(fileId));
  const after = ch.files.length;

  if (before === after) {
    return NextResponse.json({ error: "File not found in this challenge." }, { status: 404 });
  }

  const bucket = getGridFSBucket();

  // ✅ delete from GridFS (Promise-based, no callback)
  try {
    await bucket.delete(new ObjectId(fileId));
  } catch {
    // If GridFS file already missing, we still keep DB consistent
    // (optional: return 404 instead)
  }

  await ch.save();

  return NextResponse.json({ ok: true });
}

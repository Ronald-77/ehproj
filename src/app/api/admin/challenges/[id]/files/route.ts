export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/adminAuth";
import { connectMongo } from "@/lib/mongodb";
import { Challenge } from "@/models/Challenge";
import { getGridFSBucket } from "@/lib/gridfs";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB each

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { id } = await ctx.params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid challenge id." }, { status: 400 });
  }

  await connectMongo();

  const ch = await Challenge.findById(id);
  if (!ch) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  const form = await req.formData();
  const files = form.getAll("files").filter(Boolean) as File[];

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No files uploaded. Field name must be 'files'." }, { status: 400 });
  }

  const bucket = getGridFSBucket();

  const uploaded: any[] = [];

  for (const file of files) {
    if (!file || typeof file.name !== "string") continue;

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `File too large (max 10MB): ${file.name}` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // IMPORTANT: avoid TS error by not using "contentType" option (driver typings differ)
    // We'll store contentType in metadata + also in Challenge.files[]
    const uploadStream = bucket.openUploadStream(file.name, {
      metadata: {
        challengeId: id,
        contentType: file.type || "application/octet-stream",
      },
    });

    await new Promise<void>((resolve, reject) => {
      uploadStream.on("error", reject);
      uploadStream.on("finish", () => resolve());
      uploadStream.end(buffer);
    });

    const fileId = String(uploadStream.id as ObjectId);

    const entry = {
      fileId,
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
    };

    ch.files.push(entry);
    uploaded.push(entry);
  }

  await ch.save();

  return NextResponse.json({ ok: true, uploaded });
}

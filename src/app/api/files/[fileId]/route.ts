export const runtime = "nodejs";

import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";

type GridFSFileDoc = {
  _id: mongoose.Types.ObjectId;
  filename?: string;
  length?: number;
  contentType?: string;
  metadata?: { contentType?: string };
};

export async function GET(
  req: Request,
  ctx: { params: Promise<{ fileId: string }> | { fileId: string } }
) {
  try {
    const params = await Promise.resolve(ctx.params);
    const fileId = params?.fileId;

    if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
      return NextResponse.json({ error: "Invalid file id" }, { status: 400 });
    }

    await connectMongo();

    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: "MongoDB not connected" }, { status: 500 });
    }

    const _id = new mongoose.Types.ObjectId(fileId);

    // ✅ bucketName = "challengeFiles" => collections: challengeFiles.files + challengeFiles.chunks
    const filesCol = db.collection("challengeFiles.files");

    // IMPORTANT: cast the result manually (do NOT use GridFSFile typing)
    const fileDoc = (await filesCol.findOne({ _id })) as GridFSFileDoc | null;

    if (!fileDoc) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const filename = fileDoc.filename || "file";
    const contentType =
      fileDoc.contentType ||
      fileDoc.metadata?.contentType ||
      "application/octet-stream";

    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "challengeFiles" });
    const stream = bucket.openDownloadStream(_id);

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);

    if (typeof fileDoc.length === "number") {
      headers.set("Content-Length", String(fileDoc.length));
    }

    return new Response(stream as any, { headers });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Download failed" }, { status: 500 });
  }
}

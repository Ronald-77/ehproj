import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

let bucket: GridFSBucket | null = null;

export function getGridFSBucket() {
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB not connected yet.");

  // cache bucket
  if (!bucket) {
    bucket = new GridFSBucket(db, { bucketName: "challengeFiles" });
  }
  return bucket;
}

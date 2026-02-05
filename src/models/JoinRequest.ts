import mongoose, { Schema, type Model } from "mongoose";

export interface IJoinRequest {
  teamId: string;
  userId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt?: Date;
  updatedAt?: Date;
}

const JoinRequestSchema = new Schema<IJoinRequest>(
  {
    teamId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

// prevent duplicate pending requests
JoinRequestSchema.index({ teamId: 1, userId: 1 }, { unique: true });

export const JoinRequest: Model<IJoinRequest> =
  mongoose.models.JoinRequest || mongoose.model<IJoinRequest>("JoinRequest", JoinRequestSchema);

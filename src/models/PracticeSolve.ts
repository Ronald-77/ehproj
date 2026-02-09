import mongoose, { Schema, models, model } from "mongoose";

export type IPracticeSolve = {
  userId: mongoose.Types.ObjectId;
  challengeId: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

const PracticeSolveSchema = new Schema<IPracticeSolve>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    challengeId: { type: Schema.Types.ObjectId, ref: "Challenge", required: true, index: true },
  },
  { timestamps: true }
);

// ✅ user can’t “practice solve” same challenge multiple times
PracticeSolveSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

export const PracticeSolve =
  models.PracticeSolve || model<IPracticeSolve>("PracticeSolve", PracticeSolveSchema);

import mongoose, { Schema, models, model } from "mongoose";

export type ISolve = {
  userId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  challengeId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  points: number;
  createdAt?: Date;
  updatedAt?: Date;
};

const SolveSchema = new Schema<ISolve>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    challengeId: { type: Schema.Types.ObjectId, ref: "Challenge", required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },

    points: { type: Number, required: true },
  },
  { timestamps: true }
);

// ✅ prevent double scoring for same challenge in same event
SolveSchema.index({ userId: 1, teamId: 1, challengeId: 1, eventId: 1 }, { unique: true });

export const Solve = models.Solve || model<ISolve>("Solve", SolveSchema);

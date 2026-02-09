import mongoose, { Schema, models, model } from "mongoose";

export type ITeam = {
  eventId: mongoose.Types.ObjectId;
  name: string;

  leaderId: mongoose.Types.ObjectId; // team creator
  inviteToken: string;

  passwordHash: string;

  members: mongoose.Types.ObjectId[]; // ✅ store only user ObjectIds
  createdAt?: Date;
  updatedAt?: Date;
};

const TeamSchema = new Schema<ITeam>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },

    name: { type: String, required: true, trim: true },

    leaderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    inviteToken: { type: String, required: true, unique: true, index: true },

    passwordHash: { type: String, required: true },

    members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  },
  { timestamps: true }
);

// ✅ one team name per event
TeamSchema.index({ eventId: 1, name: 1 }, { unique: true });

export const Team = models.Team || model<ITeam>("Team", TeamSchema);

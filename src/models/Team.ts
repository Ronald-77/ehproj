import mongoose, { Schema, models, model } from "mongoose";

export type ITeam = {
  eventId: mongoose.Types.ObjectId;
  name: string;

  leaderId: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];

  inviteToken: string;
  passwordHash?: string;

  banned?: boolean;
  banReason?: string;
  bannedAt?: Date;

  deletedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
};

const TeamSchema = new Schema<ITeam>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    name: { type: String, required: true, trim: true },

    leaderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],

    inviteToken: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String },

    banned: { type: Boolean, default: false, index: true },
    banReason: { type: String, default: "" },
    bannedAt: { type: Date },

    deletedAt: { type: Date, index: true },
  },
  { timestamps: true }
);

// ✅ TS-safe hook: no "next" callback (prevents Record<string, any> typing bug)
TeamSchema.pre("validate", function () {
  const doc = this as any;

  if (!doc.leaderId) return;

  const leader = String(doc.leaderId);
  const members = Array.isArray(doc.members) ? doc.members.map((m: any) => String(m)) : [];

  if (!members.includes(leader)) {
    doc.members = [...(doc.members || []), doc.leaderId];
  }
});

export const Team = models.Team || model<ITeam>("Team", TeamSchema);

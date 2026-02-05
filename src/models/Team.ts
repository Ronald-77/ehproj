import mongoose, { Schema, type Model } from "mongoose";

export interface ITeam {
  name: string;
  ownerId: string;        // User._id
  members: string[];      // user ids
  createdAt?: Date;
  updatedAt?: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    ownerId: { type: String, required: true, index: true },
    members: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Team: Model<ITeam> =
  mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Solve } from "@/models/Solve";

export async function GET() {
  await connectMongo();

  // ---------- Individual global leaderboard ----------
  const individual = await Solve.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$userId",
        points: { $sum: "$points" },
        solves: { $sum: 1 },
        teamId: { $first: "$teamId" }, // latest team
      },
    },
    { $sort: { points: -1, solves: -1 } },
    { $limit: 300 },

    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

    { $lookup: { from: "teams", localField: "teamId", foreignField: "_id", as: "team" } },
    { $unwind: { path: "$team", preserveNullAndEmptyArrays: true } },

    {
      $project: {
        _id: 0,
        userId: { $toString: "$_id" },
        username: { $ifNull: ["$user.username", "Unknown"] },
        team: { $ifNull: ["$team.name", "-"] },
        points: 1,
        solves: 1,
      },
    },
  ]);

  // ---------- Team global leaderboard ----------
  const team = await Solve.aggregate([
    {
      $group: {
        _id: "$teamId",
        points: { $sum: "$points" },
        solves: { $sum: 1 },
      },
    },
    { $sort: { points: -1, solves: -1 } },
    { $limit: 300 },

    { $lookup: { from: "teams", localField: "_id", foreignField: "_id", as: "team" } },
    { $unwind: { path: "$team", preserveNullAndEmptyArrays: true } },

    {
      $project: {
        _id: 0,
        teamId: { $toString: "$_id" },
        name: { $ifNull: ["$team.name", "Unknown"] },
        members: {
          $cond: [{ $isArray: "$team.members" }, { $size: "$team.members" }, 0],
        },
        points: 1,
        solves: 1,
      },
    },
  ]);

  return NextResponse.json({ individual, team });
}

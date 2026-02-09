export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Solve } from "@/models/Solve";
import { Event } from "@/models/Event";

export async function GET() {
  await connectMongo();

  const now = new Date();

  // ✅ active event (running now)
  const activeEvent = await Event.findOne({
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  })
    .sort({ startsAt: -1 })
    .select("_id name startsAt endsAt");

  if (!activeEvent) {
    return NextResponse.json({
      active: false,
      event: null,
      individual: [],
      teams: [],
    });
  }

  const eventId = activeEvent._id;

  // ---------------- INDIVIDUAL (event only) ----------------
  const individualRaw = await Solve.aggregate([
    { $match: { eventId } },
    {
      $group: {
        _id: "$userId",
        points: { $sum: "$points" },
        solves: { $sum: 1 },
        teamId: { $last: "$teamId" },
      },
    },
    { $sort: { points: -1, solves: -1 } },
    { $limit: 200 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "teams",
        localField: "teamId",
        foreignField: "_id",
        as: "team",
      },
    },
    { $unwind: { path: "$team", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        username: { $ifNull: ["$user.username", "Unknown"] },
        team: { $ifNull: ["$team.name", "-"] },
        points: 1,
        solves: 1,
      },
    },
  ]);

  const individual = individualRaw.map((row: any, idx: number) => ({
    rank: idx + 1, // ✅ FIX undefined
    username: row.username,
    team: row.team,
    points: row.points ?? 0,
    solves: row.solves ?? 0,
  }));

  // ---------------- TEAM (event only) ----------------
  const teamRaw = await Solve.aggregate([
    { $match: { eventId } },
    {
      $group: {
        _id: "$teamId",
        points: { $sum: "$points" },
        solves: { $sum: 1 },
      },
    },
    { $sort: { points: -1, solves: -1 } },
    { $limit: 200 },
    {
      $lookup: {
        from: "teams",
        localField: "_id",
        foreignField: "_id",
        as: "team",
      },
    },
    { $unwind: { path: "$team", preserveNullAndEmptyArrays: false } },
    {
      $project: {
        name: "$team.name",
        members: { $size: { $ifNull: ["$team.members", []] } },
        points: 1,
        solves: 1,
      },
    },
  ]);

  const teams = teamRaw.map((row: any, idx: number) => ({
    rank: idx + 1,
    name: row.name ?? "Unknown",
    members: row.members ?? 0,
    points: row.points ?? 0,
    solves: row.solves ?? 0,
  }));

  return NextResponse.json({
    active: true,
    event: {
      id: activeEvent._id.toString(),
      name: activeEvent.name,
      startsAt: activeEvent.startsAt,
      endsAt: activeEvent.endsAt,
    },
    individual,
    teams,
  });
}

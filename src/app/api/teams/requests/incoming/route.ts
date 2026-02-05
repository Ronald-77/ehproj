import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Team } from "@/models/Team";
import { JoinRequest } from "@/models/JoinRequest";
import { requireUser } from "@/lib/requireUser";

export async function GET() {
  const { session, denied } = await requireUser();
  if (denied) return denied;

  await connectMongo();

  const myTeams = await Team.find({ ownerId: session!.id }).select("_id name");
  const teamIds = myTeams.map((t) => t._id.toString());

  const requests = await JoinRequest.find({ teamId: { $in: teamIds }, status: "pending" })
    .select("_id teamId userId status createdAt")
    .sort({ createdAt: -1 });

  return NextResponse.json({ teams: myTeams, requests });
}

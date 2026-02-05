import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Team } from "@/models/Team";
import { JoinRequest } from "@/models/JoinRequest";
import { requireUser } from "@/lib/requireUser";

export async function POST(req: Request, ctx: { params: Promise<{ teamId: string }> }) {
  const { session, denied } = await requireUser();
  if (denied) return denied;

  const { teamId } = await ctx.params;

  await connectMongo();

  const team = await Team.findById(teamId).select("_id ownerId members");
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  // already member
  if (team.members.includes(session!.id)) {
    return NextResponse.json({ error: "You are already in this team." }, { status: 400 });
  }

  // create join request (unique index prevents duplicates)
  try {
    const jr = await JoinRequest.create({
      teamId,
      userId: session!.id,
      status: "pending",
    });
    return NextResponse.json({ request: jr }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "You already requested to join." }, { status: 409 });
  }
}

import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Team } from "@/models/Team";
import { JoinRequest } from "@/models/JoinRequest";
import { requireUser } from "@/lib/requireUser";

export async function PUT(req: Request, ctx: { params: Promise<{ requestId: string }> }) {
  const { session, denied } = await requireUser();
  if (denied) return denied;

  const { requestId } = await ctx.params;
  const body = await req.json();
  const action = String(body.action ?? ""); // "accept" | "reject"

  if (action !== "accept" && action !== "reject") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  await connectMongo();

  const jr = await JoinRequest.findById(requestId);
  if (!jr) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  const team = await Team.findById(jr.teamId);
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  // only owner can decide
  if (team.ownerId !== session!.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (jr.status !== "pending") {
    return NextResponse.json({ error: "Request already processed" }, { status: 400 });
  }

  if (action === "reject") {
    jr.status = "rejected";
    await jr.save();
    return NextResponse.json({ ok: true });
  }

  // accept
  jr.status = "accepted";
  await jr.save();

  if (!team.members.includes(jr.userId)) {
    team.members.push(jr.userId);
    await team.save();
  }

  return NextResponse.json({ ok: true });
}

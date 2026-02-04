import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Team } from "@/models/Team";
import { requireUser } from "@/lib/requireUser";

export async function GET() {
  await connectMongo();
  const teams = await Team.find().select("_id name ownerId members createdAt").sort({ createdAt: -1 }).limit(200);
  return NextResponse.json({ teams });
}

export async function POST(req: Request) {
  const { session, denied } = await requireUser();
  if (denied) return denied;

  const body = await req.json();
  const name = String(body.name ?? "").trim();

  if (!name || name.length < 3 || name.length > 24) {
    return NextResponse.json({ error: "Team name must be 3–24 characters." }, { status: 400 });
  }

  await connectMongo();

  const existing = await Team.findOne({ name }).select("_id");
  if (existing) return NextResponse.json({ error: "Team name already exists." }, { status: 409 });

  const team = await Team.create({
    name,
    ownerId: session!.id,
    members: [session!.id],
  });

  return NextResponse.json({ team }, { status: 201 });
}

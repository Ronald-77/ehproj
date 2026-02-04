import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET() {
  await connectMongo();
  const users = await User.find().select("username email createdAt").sort({ createdAt: -1 });
  return NextResponse.json({ count: users.length, users });
}

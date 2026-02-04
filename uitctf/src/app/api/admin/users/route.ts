import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectMongo } from "@/lib/mongodb";
import { User } from "@/models/User";
import { requireAdmin } from "@/lib/adminAuth";

function isValidUitEmail(email: string) {
  return /^[^\s@]+@uit\.edu\.mm$/i.test(email);
}

export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  await connectMongo();
  const users = await User.find()
    .select("_id username email createdAt updatedAt")
    .sort({ createdAt: -1 })
    .limit(200);

  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const body = await req.json();

  const username = String(body.username ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!username || !email || !password) {
    return NextResponse.json(
      { error: "username, email, password are required." },
      { status: 400 }
    );
  }

  if (username.length < 3 || username.length > 24) {
    return NextResponse.json({ error: "Username must be 3–24 chars." }, { status: 400 });
  }

  if (!isValidUitEmail(email)) {
    return NextResponse.json({ error: "Only @uit.edu.mm emails are allowed." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 chars." }, { status: 400 });
  }

  await connectMongo();

  const existing = await User.findOne({ $or: [{ email }, { username }] }).select("_id");
  if (existing) {
    return NextResponse.json({ error: "Username or email already exists." }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ username, email, password: hashed });

  return NextResponse.json(
    { user: { id: user._id.toString(), username: user.username, email: user.email } },
    { status: 201 }
  );
}

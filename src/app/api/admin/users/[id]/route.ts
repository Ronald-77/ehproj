import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { User } from "@/models/User";
import { requireAdmin } from "@/lib/adminAuth";

function isValidUitEmail(email: string) {
  return /^[^\s@]+@uit\.edu\.mm$/i.test(email);
}

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { id } = await ctx.params; // ✅ unwrap async params

  try {
    await connectMongo();
    const user = await User.findById(id).select("_id username email createdAt updatedAt avatar");
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { id } = await ctx.params; // ✅ unwrap async params

  try {
    const body = await req.json();
    const username = String(body.username ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!username || !email) {
      return NextResponse.json({ error: "username and email are required." }, { status: 400 });
    }
    if (username.length < 3 || username.length > 24) {
      return NextResponse.json({ error: "Username must be 3–24 chars." }, { status: 400 });
    }
    if (!isValidUitEmail(email)) {
      return NextResponse.json({ error: "Only @uit.edu.mm emails are allowed." }, { status: 400 });
    }

    await connectMongo();

    const existing = await User.findOne({
      _id: { $ne: id },
      $or: [{ email }, { username }],
    }).select("_id");

    if (existing) {
      return NextResponse.json({ error: "Username or email already exists." }, { status: 409 });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { username, email },
      { new: true }
    ).select("_id username email createdAt updatedAt avatar");

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: "Invalid request or user id" }, { status: 400 });
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { id } = await ctx.params; // ✅ unwrap async params

  try {
    await connectMongo();
    const deleted = await User.findByIdAndDelete(id).select("_id");
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }
}

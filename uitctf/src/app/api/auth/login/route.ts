import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectMongo } from "@/lib/mongodb";
import { User } from "@/models/User";
import { signSession } from "@/lib/jwt";

function looksLikeUitEmail(email: string) {
  return /^[^\s@]+@uit\.edu\.mm$/i.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    const invalidMsg = { error: "Email or password is incorrect" };

    if (!email || !password) return NextResponse.json(invalidMsg, { status: 401 });
    if (!looksLikeUitEmail(email)) return NextResponse.json(invalidMsg, { status: 401 });

    await connectMongo();

    const user = await User.findOne({ email }).select("_id username email password");
    if (!user) return NextResponse.json(invalidMsg, { status: 401 });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return NextResponse.json(invalidMsg, { status: 401 });

    const token = signSession({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    });

    const res = NextResponse.json(
      { ok: true, user: { id: user._id.toString(), username: user.username, email: user.email } },
      { status: 200 }
    );

    // httpOnly cookie
    res.cookies.set("ctf_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

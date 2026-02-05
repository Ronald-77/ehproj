import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/jwt";
import { connectMongo } from "@/lib/mongodb";
import { User } from "@/models/User";

function isValidUitEmail(email: string) {
  return /^[^\s@]+@uit\.edu\.mm$/i.test(email);
}

export async function GET() {
  const cookieStore = await cookies(); // ✅ await
  const token = cookieStore.get("ctf_token")?.value;

  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectMongo();
  const user = await User.findById(session.id).select("_id username email avatar");
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      avatar: user.avatar || "",
    },
  });
}

export async function PUT(req: Request) {
  const cookieStore = await cookies(); // ✅ await
  const token = cookieStore.get("ctf_token")?.value;

  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifySession(token);
  if (!session || !isValidUitEmail(session.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const username = String(body.username ?? "").trim();
  const avatar = String(body.avatar ?? ""); // Data URL

  if (!username || username.length < 3 || username.length > 24) {
    return NextResponse.json(
      { error: "Username must be 3–24 characters." },
      { status: 400 }
    );
  }

  // Optional: limit avatar size
  if (avatar && avatar.length > 300_000) {
    return NextResponse.json({ error: "Image too large." }, { status: 400 });
  }

  await connectMongo();

  // prevent username collisions (exclude self)
  const exists = await User.findOne({
    _id: { $ne: session.id },
    username,
  }).select("_id");

  if (exists) {
    return NextResponse.json({ error: "Username already exists." }, { status: 409 });
  }

  const updated = await User.findByIdAndUpdate(
    session.id,
    { username, avatar },
    { new: true }
  ).select("_id username email avatar");

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    user: {
      id: updated._id.toString(),
      username: updated.username,
      email: updated.email,
      avatar: updated.avatar || "",
    },
  });
}

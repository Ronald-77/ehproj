import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectMongo } from "@/lib/mongodb";
import { User } from "@/models/User";

/**
 * Simple in-memory rate limiter (per server instance).
 * Good for development. For production, use Redis/Upstash/etc.
 */
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests / minute / IP
const ipHits = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: Request) {
  // On Vercel/proxies this header is usually set
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}

function rateLimit(ip: string) {
  const now = Date.now();
  const entry = ipHits.get(ip);

  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  ipHits.set(ip, entry);
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

function isValidUitEmail(email: string) {
  // strict: something@uit.edu.mm (no spaces, no extra @)
  const uitEmailRegex = /^[^\s@]+@uit\.edu\.mm$/i;
  return uitEmailRegex.test(email);
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(ip);

  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    const username = String(body.username ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const confirmPassword = String(body.confirmPassword ?? "");

    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    // Username rules (adjust if you want)
    if (username.length < 3 || username.length > 24) {
      return NextResponse.json(
        { error: "Username must be 3–24 characters." },
        { status: 400 }
      );
    }

    // Email domain restriction
    if (!isValidUitEmail(email)) {
      return NextResponse.json(
        { error: "Only @uit.edu.mm emails are allowed." },
        { status: 400 }
      );
    }

    // Password rules
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    await connectMongo();

    // Check duplicates
    const existing = await User.findOne({
      $or: [{ email }, { username }],
    }).select("_id");

    if (existing) {
      return NextResponse.json(
        { error: "Username or email already exists." },
        { status: 409 }
      );
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      email,
      password: hashed,
    });

    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch {
    // Don’t leak details
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectMongo } from "@/lib/mongodb";
import { verifySession } from "@/lib/jwt";
import { Challenge } from "@/models/Challenge";
import { generateAiHint, generateRuleHint } from "@/lib/hints";

function pickHint(category: string, tier: number, points: number, description: string) {
  const web = [
    "Check input handling and server-side validation.",
    "Try adjusting payload encoding or headers.",
    "Inspect how the app builds queries or templates."
  ];
  const crypto = [
    "Identify the cipher or scheme used.",
    "Look for padding, mode, or encoding issues.",
    "Consider known-plaintext or key-space constraints."
  ];
  const forensics = [
    "Extract and inspect embedded metadata.",
    "Try common file carving or timeline analysis.",
    "Focus on hidden content or alternate data streams."
  ];
  const rev = [
    "Trace the control flow and critical functions.",
    "Inspect string references and I/O routines.",
    "Patch or hook to observe checks dynamically."
  ];
  const pwn = [
    "Locate user-controlled buffers and boundaries.",
    "Check protections (NX, PIE, ASLR) and format strings.",
    "Craft an exploit using the discovered primitive."
  ];
  const osint = [
    "Expand queries with alternative spellings.",
    "Pivot across platforms and reverse image search.",
    "Correlate timestamps, locations, and identities."
  ];
  const misc = [
    "Break the task into smaller steps.",
    "Try different encodings or data formats.",
    "Look for non-obvious transformations."
  ];
  const steg = [
    "Inspect color channels and LSB patterns.",
    "Try common steg tools for images or audio.",
    "Compare original vs modified artifacts."
  ];

  const map: Record<string, string[]> = {
    "Web Exploitation": web,
    "Cryptography": crypto,
    "Forensics": forensics,
    "Reverse Engineering": rev,
    "Pwn": pwn,
    "OSINT": osint,
    "Misc": misc,
    "Steganography": steg
  };

  const arr = map[category] || misc;
  const idx = Math.max(0, Math.min(tier - 1, arr.length - 1));
  return arr[idx];
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const ck = await cookies();
  const token = ck.get("ctf_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifySession(token);
  if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const current = Number(body?.tier ?? 0);
  const provider = String(body?.provider || "rule");
  const next = current + 1;
  if (next > 3) return NextResponse.json({ done: true, tier: current });

  await connectMongo();

  const ch = await Challenge.findById(id).select("_id category points description endsAt");
  if (!ch) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  const now = new Date();
  if (now <= ch.endsAt) {
    return NextResponse.json({ error: "Hints available after event ends" }, { status: 403 });
  }

  const base = {
    category: String(ch.category),
    points: Number(ch.points),
    description: String(ch.description || ""),
    tier: next as 1 | 2 | 3,
  };
  const text =
    provider === "ai" ? await generateAiHint(base) : await generateRuleHint(base);
  return NextResponse.json({ tier: next, text, provider });
}

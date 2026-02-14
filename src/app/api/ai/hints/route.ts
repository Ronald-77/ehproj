export const runtime = "nodejs";

import { NextResponse } from "next/server";
import OpenAI from "openai";

function sanitize(output: string): string {
  return output.replace(/flag\{[^}]*\}/gi, "[redacted]").trim();
}

export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set on server." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const category = String(body?.category || "");
  const description = String(body?.description || "");
  const tier = Number(body?.tier || 1);
  const points = Number(body?.points || 0);
  const model = String(process.env.AI_HINTS_MODEL || "gpt-4o-mini");

  if (!category || !description || !tier) {
    return NextResponse.json(
      { error: "Missing fields: category, description, tier." },
      { status: 400 }
    );
  }

  const client = new OpenAI({ apiKey: key });

  const system = [
    "You are a strict CTF assistant that provides high-level hints.",
    "Never reveal flags or exact payloads. Do not give copy-paste solutions.",
    "Output 1-2 concise sentences focused on strategy appropriate to the tier.",
  ].join(" ");

  const user = [
    `Category: ${category}`,
    `Points: ${points}`,
    `Tier: ${tier}`,
    `Description: ${description}`,
    "Give a progressive hint. Focus on technique, not answers.",
  ].join("\n");

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.4,
      max_tokens: 120,
    });

    const hint =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Focus on understanding the data flow and constraints; validate assumptions.";

    return NextResponse.json({ hint: sanitize(hint) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "AI hint generation failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

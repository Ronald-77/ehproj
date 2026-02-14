import type { ChallengeCategory } from "@/models/Challenge";

export type HintTier = 1 | 2 | 3;

export type HintInput = {
  category: ChallengeCategory | string;
  points: number;
  description: string;
  tier: HintTier;
};

function sanitize(output: string): string {
  // remove any accidental flag-like patterns
  return output.replace(/flag\{[^}]*\}/gi, "[redacted]");
}

export async function generateRuleHint(input: HintInput): Promise<string> {
  const { category, tier } = input;
  const bank: Record<string, string[]> = {
    "Web Exploitation": [
      "Check input handling and server-side validation.",
      "Try adjusting payload encoding or headers.",
      "Inspect how the app builds queries or templates.",
    ],
    Cryptography: [
      "Identify the cipher or scheme used.",
      "Look for padding, mode, or encoding issues.",
      "Consider known-plaintext or key-space constraints.",
    ],
    Forensics: [
      "Extract and inspect embedded metadata.",
      "Try common file carving or timeline analysis.",
      "Focus on hidden content or alternate data streams.",
    ],
    "Reverse Engineering": [
      "Trace the control flow and critical functions.",
      "Inspect string references and I/O routines.",
      "Patch or hook to observe checks dynamically.",
    ],
    Pwn: [
      "Locate user-controlled buffers and boundaries.",
      "Check protections (NX, PIE, ASLR) and format strings.",
      "Craft an exploit using the discovered primitive.",
    ],
    OSINT: [
      "Expand queries with alternative spellings.",
      "Pivot across platforms and reverse image search.",
      "Correlate timestamps, locations, and identities.",
    ],
    Misc: [
      "Break the task into smaller steps.",
      "Try different encodings or data formats.",
      "Look for non-obvious transformations.",
    ],
    Steganography: [
      "Inspect color channels and LSB patterns.",
      "Try common steg tools for images or audio.",
      "Compare original vs modified artifacts.",
    ],
  };
  const arr = bank[category] || bank["Misc"];
  const idx = Math.max(0, Math.min(Number(tier) - 1, arr.length - 1));
  return sanitize(arr[idx]);
}

export async function generateAiHint(input: HintInput): Promise<string> {
  // If an external AI hint endpoint is configured, call it; otherwise fall back to rule-based.
  const url = process.env.AI_HINTS_URL;
  if (!url) {
    return generateRuleHint(input);
  }

  // Minimal generic call; expected server should apply guardrails.
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category: input.category,
      points: input.points,
      tier: input.tier,
      description: input.description,
    }),
  }).catch(() => null);

  if (!res || !res.ok) {
    return generateRuleHint(input);
  }
  const data = (await res.json().catch(() => ({}))) as { hint?: string };
  const text = String(data?.hint || "");
  if (!text) {
    return generateRuleHint(input);
  }
  return sanitize(text);
}

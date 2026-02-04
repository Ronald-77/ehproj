import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/jwt";

export async function requireUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ctf_token")?.value;

  if (!token) return { session: null, denied: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const session = verifySession(token);
  if (!session) return { session: null, denied: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  return { session, denied: null };
}

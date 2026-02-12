import { cookies } from "next/headers";
import { verifySession } from "@/lib/jwt";

export type SessionUser = {
  id: string;
  email?: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  // ✅ Next (newer) cookies() can be async
  const store = await cookies();
  const token = store.get("ctf_token")?.value;
  if (!token) return null;

  const session = verifySession(token);
  if (!session?.id) return null;

  return {
    id: String(session.id),
    email: session.email ? String(session.email) : undefined,
  };
}

import jwt from "jsonwebtoken";

export type Session = {
  id: string;
  username?: string;
  email?: string;
};

function parseCookies(cookieHeader: string | null) {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  cookieHeader.split(";").forEach((part) => {
    const [k, ...rest] = part.trim().split("=");
    if (!k) return;
    out[k] = decodeURIComponent(rest.join("=") || "");
  });
  return out;
}

export async function getSession(req: Request): Promise<Session | null> {
  const cookies = parseCookies(req.headers.get("cookie"));

  const token =
    cookies["ctf_token"] || cookies["token"] || cookies["auth_token"] || cookies["jwt"];

  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET as string;
    const payload = jwt.verify(token, secret) as any;

    const id = String(payload?.id || "");
    if (!id) return null;

    return { id, username: payload?.username, email: payload?.email };
  } catch {
    return null;
  }
}

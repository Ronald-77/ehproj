import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) throw new Error("JWT_SECRET missing in .env.local");

export type SessionUser = {
  id: string;
  username: string;
  email: string;
};

export function signSession(user: SessionUser) {
  return jwt.sign(user, JWT_SECRET!, { expiresIn: "7d" });
}

export function verifySession(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET!) as SessionUser;
  } catch {
    return null;
  }
}

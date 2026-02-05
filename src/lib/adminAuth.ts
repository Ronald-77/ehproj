import { NextResponse } from "next/server";

export function requireAdmin(req: Request) {
  const token = req.headers.get("x-admin-token");
  const expected = process.env.ADMIN_TOKEN;

  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_TOKEN is not set on server." },
      { status: 500 }
    );
  }

  if (!token || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null; // ok
}

import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectMongo();
    return NextResponse.json({ ok: true, message: "MongoDB connected ✅" });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: "MongoDB connection failed ❌" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();
  const expected = process.env.ADMIN_PASSWORD || "admin123";
  if (password !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}

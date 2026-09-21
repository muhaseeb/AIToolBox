import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);
    await prisma.newsletterSubscriber.upsert({
      where: { email: email.toLowerCase() },
      update: {},
      create: { email: email.toLowerCase() },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Invalid email" }, { status: 400 });
  }
}

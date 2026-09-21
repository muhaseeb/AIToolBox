import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  officialUrl: z.string().url(),
  category: z.string().optional(),
  description: z.string().optional(),
  submitterEmail: z.string().email().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    await prisma.toolSubmission.create({
      data: {
        name: data.name,
        officialUrl: data.officialUrl,
        category: data.category || null,
        description: data.description || null,
        submitterEmail: data.submitterEmail || null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Invalid" }, { status: 400 });
  }
}

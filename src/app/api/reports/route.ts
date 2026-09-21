import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  toolId: z.string().min(1),
  message: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    await prisma.pricingReport.create({
      data: {
        toolId: data.toolId,
        message: data.message,
        email: data.email || null,
      },
    });
    await prisma.tool
      .update({
        where: { id: data.toolId },
        data: {
          verificationStatus: "needs_review",
          needsReview: true,
          reviewReason: data.message.slice(0, 280) || "User reported outdated pricing",
        },
      })
      .catch(() => null);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Invalid" }, { status: 400 });
  }
}

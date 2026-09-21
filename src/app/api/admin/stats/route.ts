import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [total, free, paid, openSource, needsReview, brokenLinks, recent, lastCron] =
    await Promise.all([
      prisma.tool.count({ where: { status: "active" } }),
      prisma.tool.count({
        where: { status: "active", OR: [{ pricingType: "FREE" }, { freePlan: true }] },
      }),
      prisma.tool.count({
        where: { status: "active", pricingType: { in: ["PAID", "ENTERPRISE", "CUSTOM"] } },
      }),
      prisma.tool.count({ where: { status: "active", openSource: true } }),
      prisma.tool.count({
        where: {
          OR: [
            { needsReview: true },
            { verificationStatus: { in: ["needs_review", "needs_verification", "outdated"] } },
          ],
        },
      }),
      prisma.tool.count({ where: { urlStatus: "broken" } }),
      prisma.tool.findMany({
        where: {
          OR: [
            { needsReview: true },
            {
              verificationStatus: {
                in: ["needs_review", "needs_verification", "outdated"],
              },
            },
          ],
        },
        orderBy: { lastVerified: "asc" },
        take: 30,
        select: {
          id: true,
          name: true,
          slug: true,
          lastVerified: true,
          verificationStatus: true,
          needsReview: true,
          reviewReason: true,
          urlStatus: true,
          httpStatus: true,
          pricingSourceUrl: true,
        },
      }),
      prisma.cronRun.findFirst({
        where: { job: "update-tools" },
        orderBy: { startedAt: "desc" },
      }),
    ]);

  return NextResponse.json({
    total,
    free,
    paid,
    openSource,
    needsReview,
    brokenLinks,
    recent,
    lastCron,
  });
}

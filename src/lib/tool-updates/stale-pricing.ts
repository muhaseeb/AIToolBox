import { prisma } from "@/lib/db";

/**
 * Flag tools whose lastVerified is older than `staleDays` into the
 * Pricing Verification Queue. Does not invent or change pricing values.
 */
export async function flagStalePricing(staleDays = 30): Promise<{
  flagged: { id: string; slug: string; lastVerified: Date }[];
}> {
  const cutoff = new Date(Date.now() - staleDays * 24 * 60 * 60 * 1000);

  const candidates = await prisma.tool.findMany({
    where: {
      status: "active",
      OR: [
        { lastVerified: { lt: cutoff } },
        {
          AND: [{ startingPrice: null }, { pricingType: { not: "FREE" } }],
        },
      ],
    },
    select: {
      id: true,
      slug: true,
      lastVerified: true,
      startingPrice: true,
      pricingType: true,
      needsReview: true,
      verificationStatus: true,
    },
  });

  const flagged: { id: string; slug: string; lastVerified: Date }[] = [];

  for (const tool of candidates) {
    const isUnpriced = tool.startingPrice == null && tool.pricingType !== "FREE";
    const isStale = tool.lastVerified < cutoff;
    if (!isUnpriced && !isStale) continue;

    // Already correctly queued — still count once if status needs refresh
    const reason = isUnpriced
      ? "Pricing unavailable — check official site"
      : `Pricing last verified more than ${staleDays} days ago`;
    const status = isUnpriced ? "needs_verification" : "outdated";

    await prisma.tool.update({
      where: { id: tool.id },
      data: {
        needsReview: true,
        reviewReason: reason,
        verificationStatus: status,
      },
    });
    flagged.push({ id: tool.id, slug: tool.slug, lastVerified: tool.lastVerified });
  }

  return { flagged };
}

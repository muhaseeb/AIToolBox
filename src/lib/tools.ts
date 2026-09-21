import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type ToolFilters = {
  q?: string;
  category?: string;
  pricing?: string[];
  budget?: string;
  openSource?: string;
  platforms?: string[];
  features?: string[];
  featured?: boolean;
  trending?: boolean;
  freePlan?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
};

export async function searchTools(filters: ToolFilters = {}) {
  const {
    q,
    category,
    pricing,
    budget,
    openSource,
    platforms,
    features,
    featured,
    trending,
    freePlan,
    sort = "name",
    page = 1,
    limit = 24,
  } = filters;

  const where: Prisma.ToolWhereInput = { status: "active" };
  const and: Prisma.ToolWhereInput[] = [];

  if (q?.trim()) {
    const term = q.trim();
    and.push({
      OR: [
        { name: { contains: term } },
        { company: { contains: term } },
        { description: { contains: term } },
        { shortDescription: { contains: term } },
        { category: { contains: term } },
        { tags: { contains: term } },
        { features: { contains: term } },
        { bestFor: { contains: term } },
      ],
    });
  }

  if (category) {
    and.push({
      OR: [
        { category },
        { subcategories: { contains: `"${category}"` } },
        { tags: { contains: category } },
      ],
    });
  }

  if (pricing?.length) {
    and.push({ pricingType: { in: pricing.map((p) => p.toUpperCase()) } });
  }

  if (freePlan) and.push({ freePlan: true });
  if (featured) and.push({ featured: true });
  if (trending) and.push({ trending: true });

  if (openSource === "yes") and.push({ openSource: true });
  if (openSource === "no") and.push({ openSource: false });
  if (openSource === "weights") and.push({ openWeights: true });
  if (openSource === "self-hosted") and.push({ selfHostable: true });

  if (platforms?.length) {
    const platformConditions: Prisma.ToolWhereInput[] = [];
    for (const p of platforms) {
      const key = p.toLowerCase();
      if (key === "web") platformConditions.push({ web: true });
      if (key === "windows") platformConditions.push({ windows: true });
      if (key === "macos" || key === "mac") platformConditions.push({ macos: true });
      if (key === "linux") platformConditions.push({ linux: true });
      if (key === "chrome") platformConditions.push({ chromeExtension: true });
      if (key === "ios") platformConditions.push({ ios: true });
      if (key === "android") platformConditions.push({ android: true });
    }
    if (platformConditions.length) and.push({ OR: platformConditions });
  }

  if (features?.length) {
    const featureConditions: Prisma.ToolWhereInput[] = [];
    for (const f of features) {
      const key = f.toLowerCase();
      if (key === "api") featureConditions.push({ apiAvailable: true });
      if (key === "commercial") featureConditions.push({ commercialUse: true });
      if (key === "local") featureConditions.push({ selfHostable: true });
      featureConditions.push({ features: { contains: f } });
      featureConditions.push({ tags: { contains: f } });
    }
    and.push({ OR: featureConditions });
  }

  if (budget) {
    if (budget === "0") {
      and.push({ OR: [{ pricingType: "FREE" }, { freePlan: true }] });
    } else if (budget === "100+") {
      and.push({ startingPrice: { gte: 100 } });
    } else {
      const max = parseInt(budget.replace("<", "").replace("$", ""), 10);
      if (!isNaN(max)) {
        and.push({
          OR: [{ pricingType: "FREE" }, { startingPrice: { lte: max } }, { freePlan: true }],
        });
      }
    }
  }

  if (and.length) where.AND = and;

  let orderBy: Prisma.ToolOrderByWithRelationInput = { name: "asc" };
  if (sort === "trending") orderBy = { viewCount: "desc" };
  if (sort === "newest") orderBy = { createdAt: "desc" };
  if (sort === "updated") orderBy = { updatedAt: "desc" };
  if (sort === "saved") orderBy = { saveCount: "desc" };
  if (sort === "price-asc") orderBy = { startingPrice: "asc" };
  if (sort === "price-desc") orderBy = { startingPrice: "desc" };
  if (sort === "featured") orderBy = { featured: "desc" };

  const skip = (page - 1) * limit;
  const [tools, total] = await Promise.all([
    prisma.tool.findMany({ where, orderBy, skip, take: limit }),
    prisma.tool.count({ where }),
  ]);

  return { tools, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getToolBySlug(slug: string) {
  return prisma.tool.findUnique({ where: { slug } });
}

export async function getRelatedTools(tool: { id: string; category: string }, limit = 6) {
  return prisma.tool.findMany({
    where: { status: "active", category: tool.category, NOT: { id: tool.id } },
    take: limit,
    orderBy: { featured: "desc" },
  });
}



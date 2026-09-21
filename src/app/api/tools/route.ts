import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { searchTools } from "@/lib/tools";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slugs = searchParams.get("slugs");
  if (slugs) {
    const list = slugs.split(",").filter(Boolean);
    const tools = await prisma.tool.findMany({ where: { slug: { in: list }, status: "active" } });
    return NextResponse.json({ tools });
  }
  const result = await searchTools({
    q: searchParams.get("q") || undefined,
    category: searchParams.get("category") || undefined,
    pricing: searchParams.get("pricing")?.split(","),
    budget: searchParams.get("budget") || undefined,
    openSource: searchParams.get("openSource") || undefined,
    platforms: searchParams.get("platforms")?.split(","),
    features: searchParams.get("features")?.split(","),
    sort: searchParams.get("sort") || undefined,
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "24", 10),
  });
  return NextResponse.json(result);
}

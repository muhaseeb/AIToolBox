import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const tools = await prisma.tool.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ tools });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const tool = await prisma.tool.create({
      data: {
        name: body.name,
        slug: body.slug,
        company: body.company || "Unknown",
        description: body.description || body.shortDescription || "",
        shortDescription: body.shortDescription || "",
        category: body.category || "chat",
        officialUrl: body.officialUrl,
        pricingUrl: body.pricingUrl || null,
        pricingType: body.pricingType || "FREEMIUM",
        startingPrice: body.startingPrice ?? null,
        freePlan: !!body.freePlan,
        openSource: !!body.openSource,
        openWeights: !!body.openWeights,
        sourceAvailable: !!body.sourceAvailable,
        selfHostable: !!body.selfHostable,
        license: body.license || null,
        commercialUse: !!body.commercialUse,
        apiAvailable: !!body.apiAvailable,
        featured: !!body.featured,
        trending: !!body.trending,
        editorialPick: !!body.editorialPick,
        lastVerified: body.lastVerified ? new Date(body.lastVerified) : new Date(),
        verifiedAt: body.verifiedAt ? new Date(body.verifiedAt) : null,
        verifiedBy: body.verifiedBy || null,
        pricingSourceUrl: body.pricingSourceUrl || body.pricingUrl || null,
        verificationStatus: body.verificationStatus || "verified",
        needsReview: !!body.needsReview,
        reviewReason: body.reviewReason || null,
        urlStatus: body.urlStatus || "unchecked",
        web: body.web !== false,
      },
    });
    return NextResponse.json({ tool });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const { id, ...data } = body;
    if (data.lastVerified) data.lastVerified = new Date(data.lastVerified);
    if (data.verifiedAt) data.verifiedAt = new Date(data.verifiedAt);
    if (data.urlLastChecked) data.urlLastChecked = new Date(data.urlLastChecked);
    const tool = await prisma.tool.update({ where: { id }, data });
    return NextResponse.json({ tool });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.tool.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

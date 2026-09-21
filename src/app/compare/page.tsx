import { Suspense } from "react";
import { CompareClient } from "@/components/CompareClient";
import { prisma } from "@/lib/db";

export const metadata = { title: "Compare AI Tools" };
export const dynamic = "force-dynamic";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { tools?: string };
}) {
  const slugs = (searchParams.tools || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const selected =
    slugs.length > 0
      ? await prisma.tool.findMany({ where: { slug: { in: slugs }, status: "active" } })
      : [];

  // preserve order
  const ordered = slugs
    .map((s) => selected.find((t) => t.slug === s))
    .filter(Boolean) as typeof selected;

  const allTools = await prisma.tool.findMany({
    where: { status: "active" },
    select: { slug: true, name: true, company: true, category: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Compare AI Tools</h1>
        <p className="mt-2 text-zinc-400">
          Select up to 4 tools. We show factual differences — no overall winner.
        </p>
      </div>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-zinc-900" />}>
        <CompareClient initialSlugs={ordered.map((t) => t.slug)} initialTools={ordered} catalog={allTools} />
      </Suspense>
    </div>
  );
}

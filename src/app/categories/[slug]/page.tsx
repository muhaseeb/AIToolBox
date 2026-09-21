import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CATEGORIES, categoryName } from "@/lib/utils";
import { searchTools } from "@/lib/tools";
import { ToolCardGrid } from "@/components/ToolCard";
import { SearchFilters } from "@/components/SearchFilters";
import { EmptyState } from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { slug: string } }) {
  const name = categoryName(params.slug);
  return {
    title: `Best ${name} — Compare Free & Paid`,
    description: `Compare leading ${name} by pricing, features, platforms and open-source status.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | undefined>;
}) {
  if (!CATEGORIES.some((c) => c.slug === params.slug)) notFound();
  const result = await searchTools({
    category: params.slug,
    q: searchParams.q,
    pricing: searchParams.pricing ? searchParams.pricing.split(",") : undefined,
    budget: searchParams.budget,
    openSource: searchParams.openSource,
    platforms: searchParams.platforms ? searchParams.platforms.split(",") : undefined,
    features: searchParams.features ? searchParams.features.split(",") : undefined,
    sort: searchParams.sort || "featured",
    limit: 48,
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-500">Category</p>
        <h1 className="section-title">{categoryName(params.slug)}</h1>
        <p className="mt-2 text-zinc-400">{result.total} tools · filters available below</p>
      </div>
      <Suspense><SearchFilters basePath={`/categories/${params.slug}`} /></Suspense>
      {result.tools.length ? <ToolCardGrid tools={result.tools} /> : <EmptyState />}
    </div>
  );
}

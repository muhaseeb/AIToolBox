import { Suspense } from "react";
import { searchTools } from "@/lib/tools";
import { ToolCardGrid } from "@/components/ToolCard";
import { SearchFilters } from "@/components/SearchFilters";
import { EmptyState } from "@/components/EmptyState";
import Link from "next/link";

export const metadata = { title: "Discover AI Tools" };
export const dynamic = "force-dynamic";

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const result = await searchTools({
    q: searchParams.q,
    category: searchParams.category,
    pricing: searchParams.pricing ? searchParams.pricing.split(",") : undefined,
    budget: searchParams.budget,
    openSource: searchParams.openSource,
    platforms: searchParams.platforms ? searchParams.platforms.split(",") : undefined,
    features: searchParams.features ? searchParams.features.split(",") : undefined,
    sort: searchParams.sort || "name",
    page,
    limit: 24,
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="section-title">Discover AI Tools</h1>
        <p className="mt-2 text-zinc-400">Search and filter {result.total} tools in the catalog.</p>
      </div>
      <Suspense fallback={<div className="h-24 animate-pulse rounded-xl bg-zinc-900" />}>
        <SearchFilters basePath="/discover" />
      </Suspense>
      {result.tools.length === 0 ? (
        <EmptyState title="No tools matched" description="Try clearing filters or a broader query." actionHref="/discover" actionLabel="Reset" />
      ) : (
        <ToolCardGrid tools={result.tools} />
      )}
      {result.pages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link href={`/discover?${new URLSearchParams({ ...searchParams, page: String(page - 1) } as Record<string, string>).toString()}`} className="btn-secondary">Previous</Link>
          )}
          <span className="flex items-center px-3 text-sm text-zinc-500">Page {page} / {result.pages}</span>
          {page < result.pages && (
            <Link href={`/discover?${new URLSearchParams({ ...searchParams, page: String(page + 1) } as Record<string, string>).toString()}`} className="btn-secondary">Next</Link>
          )}
        </div>
      )}
    </div>
  );
}

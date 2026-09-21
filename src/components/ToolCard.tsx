"use client";

import Link from "next/link";
import { GitCompare, Heart, Share2 } from "lucide-react";
import type { Tool } from "@prisma/client";
import { Badge, PricingBadge } from "./Badges";
import { ToolLogo } from "./ToolLogo";
import { OfficialLink } from "./OfficialLink";
import { categoryName, formatPrice, parseJsonArray } from "@/lib/utils";
import { useCompareList, useSavedTools } from "@/hooks/useLocalStore";

export function ToolCard({ tool }: { tool: Tool }) {
  const saved = useSavedTools();
  const compare = useCompareList();
  const features = parseJsonArray(tool.features).slice(0, 3);

  const share = async () => {
    const url = `${window.location.origin}/tools/${tool.slug}`;
    try {
      if (navigator.share) await navigator.share({ title: tool.name, url });
      else {
        await navigator.clipboard.writeText(url);
        alert("Link copied");
      }
    } catch {
      /* cancelled */
    }
  };

  return (
    <article className="card group flex flex-col p-5 animate-slide-up">
      <div className="mb-3 flex items-start justify-between gap-3">
        <Link href={`/tools/${tool.slug}`} className="flex min-w-0 items-center gap-3">
          <ToolLogo name={tool.name} />
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-white group-hover:text-accent-soft">{tool.name}</h3>
            <p className="truncate text-xs text-zinc-500">{tool.company}</p>
          </div>
        </Link>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label={saved.has(tool.slug) ? "Unsave" : "Save"}
            onClick={() => saved.toggle(tool.slug)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-pink-400"
          >
            <Heart className={`h-4 w-4 ${saved.has(tool.slug) ? "fill-pink-400 text-pink-400" : ""}`} />
          </button>
          <button type="button" aria-label="Share" onClick={share} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Link href={`/tools/${tool.slug}`} className="mb-3 flex-1">
        <p className="line-clamp-2 text-sm text-zinc-400">{tool.shortDescription}</p>
      </Link>

      <div className="mb-3 flex flex-wrap gap-1.5">
        <Badge tone="accent">{categoryName(tool.category)}</Badge>
        <PricingBadge pricingType={tool.pricingType} startingPrice={tool.startingPrice} />
        {tool.openSource && <Badge tone="os">Open Source</Badge>}
        {!tool.openSource && tool.openWeights && <Badge tone="os">Open Weights</Badge>}
        {tool.sourceAvailable && !tool.openSource && <Badge tone="os">Source Available</Badge>}
        {tool.apiAvailable && <Badge>API</Badge>}
        {tool.web && <Badge>Web</Badge>}
        {tool.windows && <Badge>Windows</Badge>}
        {tool.macos && <Badge>Mac</Badge>}
        {tool.chromeExtension && <Badge>Chrome</Badge>}
      </div>

      {features.length > 0 && <p className="mb-3 text-xs text-zinc-500">{features.join(" · ")}</p>}

      <p className="mb-3 text-xs font-medium text-zinc-300">
        {formatPrice(tool.startingPrice, tool.pricingType, tool.currency)}
      </p>

      <div className="mt-auto flex flex-wrap gap-2">
        <OfficialLink href={tool.officialUrl} variant="secondary" className="flex-1 py-2 text-xs">
          Official website
        </OfficialLink>
        {tool.pricingUrl && (
          <OfficialLink href={tool.pricingUrl} variant="ghost" className="px-2 py-2 text-xs">
            Pricing
          </OfficialLink>
        )}
        <button
          type="button"
          onClick={() => compare.toggle(tool.slug)}
          className={`btn-ghost px-2 py-2 text-xs ${compare.has(tool.slug) ? "text-accent-soft" : ""}`}
          title={compare.has(tool.slug) ? "Remove from compare" : "Add to compare (max 4)"}
        >
          <GitCompare className="h-3.5 w-3.5" />
          Compare
        </button>
      </div>
    </article>
  );
}

export function ToolCardGrid({ tools }: { tools: Tool[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}

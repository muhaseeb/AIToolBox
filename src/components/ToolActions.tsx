"use client";

import { GitCompare, Heart, Share2 } from "lucide-react";
import { useCompareList, useSavedTools } from "@/hooks/useLocalStore";

export function ToolActions({ slug, name }: { slug: string; name: string }) {
  const saved = useSavedTools();
  const compare = useCompareList();

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: name, url });
      else {
        await navigator.clipboard.writeText(url);
        alert("Link copied");
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => saved.toggle(slug)} className="btn-ghost text-xs">
        <Heart className={`h-3.5 w-3.5 ${saved.has(slug) ? "fill-pink-400 text-pink-400" : ""}`} />
        {saved.has(slug) ? "Saved" : "Save"}
      </button>
      <button type="button" onClick={() => compare.toggle(slug)} className="btn-ghost text-xs">
        <GitCompare className="h-3.5 w-3.5" />
        {compare.has(slug) ? "In compare" : "Compare"}
      </button>
      <button type="button" onClick={share} className="btn-ghost text-xs">
        <Share2 className="h-3.5 w-3.5" /> Share
      </button>
    </div>
  );
}

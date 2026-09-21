"use client";

import Link from "next/link";
import { GitCompare, X } from "lucide-react";
import { useCompareList } from "@/hooks/useLocalStore";

export function CompareBar() {
  const compare = useCompareList();
  if (!compare.ready || compare.value.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-40 flex w-[min(96%,36rem)] -translate-x-1/2 items-center gap-3 rounded-2xl border border-violet-500/40 bg-zinc-950/95 px-4 py-3 shadow-glow backdrop-blur-xl">
      <GitCompare className="h-4 w-4 shrink-0 text-accent-soft" />
      <p className="flex-1 text-sm text-zinc-300">
        Comparing <strong className="text-white">{compare.value.length}</strong>/4 tools
      </p>
      <button type="button" onClick={compare.clear} className="btn-ghost py-1.5 text-xs" aria-label="Clear">
        <X className="h-3.5 w-3.5" /> Clear
      </button>
      <Link href={`/compare?tools=${compare.value.join(",")}`} className="btn-primary py-1.5 text-xs">
        Compare
      </Link>
    </div>
  );
}

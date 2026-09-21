"use client";

import { useEffect, useState } from "react";
import { useSavedTools } from "@/hooks/useLocalStore";
import { ToolCardGrid } from "@/components/ToolCard";
import { EmptyState } from "@/components/EmptyState";
import type { Tool } from "@prisma/client";

export default function SavedPage() {
  const saved = useSavedTools();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!saved.ready) return;
    if (saved.value.length === 0) {
      setTools([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/tools?slugs=${saved.value.join(",")}`)
      .then((r) => r.json())
      .then((d) => setTools(d.tools || []))
      .finally(() => setLoading(false));
  }, [saved.ready, saved.value]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="section-title">Saved tools</h1>
        <p className="mt-2 text-zinc-400">Stored locally in your browser for this device.</p>
      </div>
      {loading ? (
        <div className="h-40 animate-pulse rounded-xl bg-zinc-900" />
      ) : tools.length ? (
        <ToolCardGrid tools={tools} />
      ) : (
        <EmptyState title="No saved tools" description="Tap the heart on any tool card to save it." actionHref="/discover" actionLabel="Discover tools" />
      )}
    </div>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { CATEGORIES } from "@/lib/utils";

export function SearchFilters({ basePath = "/discover" }: { basePath?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [pending, startTransition] = useTransition();

  const update = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (!value) next.delete(key);
      else next.set(key, value);
      next.delete("page");
      startTransition(() => router.push(`${basePath}?${next.toString()}`));
    },
    [params, router, basePath]
  );

  useEffect(() => {
    const t = setTimeout(() => {
      if (q !== (params.get("q") || "")) update("q", q || null);
    }, 300);
    return () => clearTimeout(t);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMulti = (key: string, value: string) => {
    const current = (params.get(key) || "").split(",").filter(Boolean);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    update(key, next.length ? next.join(",") : null);
  };

  const has = (key: string, value: string) => (params.get(key) || "").split(",").includes(value);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          className="input pl-10"
          placeholder="Search tools, companies, features…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search"
        />
        {pending && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">Searching…</span>}
      </div>

      <div className="flex flex-wrap gap-2">
        <select className="input w-auto py-2 text-xs" value={params.get("category") || ""} onChange={(e) => update("category", e.target.value || null)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select className="input w-auto py-2 text-xs" value={params.get("budget") || ""} onChange={(e) => update("budget", e.target.value || null)}>
          <option value="">Any budget</option>
          <option value="0">$0</option>
          <option value="<10">&lt;$10</option>
          <option value="<20">&lt;$20</option>
          <option value="<50">&lt;$50</option>
          <option value="<100">&lt;$100</option>
          <option value="100+">$100+</option>
        </select>
        <select className="input w-auto py-2 text-xs" value={params.get("openSource") || ""} onChange={(e) => update("openSource", e.target.value || null)}>
          <option value="">Open source: any</option>
          <option value="yes">Open source</option>
          <option value="weights">Open weights</option>
          <option value="self-hosted">Self-hostable</option>
          <option value="no">Not open source</option>
        </select>
        <select className="input w-auto py-2 text-xs" value={params.get("sort") || "name"} onChange={(e) => update("sort", e.target.value)}>
          <option value="name">Sort: Name</option>
          <option value="trending">Trending signals</option>
          <option value="newest">Newest</option>
          <option value="updated">Recently updated</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {["FREE", "FREEMIUM", "PAID", "ENTERPRISE"].map((p) => (
          <button key={p} type="button" onClick={() => toggleMulti("pricing", p)} className={`badge cursor-pointer ${has("pricing", p) ? "border-violet-500/50 bg-violet-500/20 text-violet-200" : ""}`}>
            {p}
          </button>
        ))}
        {["web", "windows", "macos", "linux", "chrome", "ios", "android"].map((p) => (
          <button key={p} type="button" onClick={() => toggleMulti("platforms", p)} className={`badge cursor-pointer ${has("platforms", p) ? "border-violet-500/50 bg-violet-500/20 text-violet-200" : ""}`}>
            {p}
          </button>
        ))}
        {["api", "commercial", "local"].map((f) => (
          <button key={f} type="button" onClick={() => toggleMulti("features", f)} className={`badge cursor-pointer ${has("features", f) ? "border-violet-500/50 bg-violet-500/20 text-violet-200" : ""}`}>
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}

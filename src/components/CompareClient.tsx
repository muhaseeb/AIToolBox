"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Tool } from "@prisma/client";
import { formatPrice, formatVerifiedDate, categoryName, parseJsonArray } from "@/lib/utils";
import { OfficialLink } from "@/components/OfficialLink";
import { ToolLogo } from "@/components/ToolLogo";
import { X } from "lucide-react";

type CatalogItem = { slug: string; name: string; company: string; category: string };

export function CompareClient({
  initialSlugs,
  initialTools,
  catalog,
}: {
  initialSlugs: string[];
  initialTools: Tool[];
  catalog: CatalogItem[];
}) {
  const router = useRouter();
  const [slugs, setSlugs] = useState<string[]>(initialSlugs);
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [pick, setPick] = useState("");

  const rows = useMemo(() => {
    if (tools.length === 0) return [];
    return [
      { label: "Company", values: tools.map((t) => t.company) },
      { label: "Category", values: tools.map((t) => categoryName(t.category)) },
      {
        label: "Price",
        values: tools.map((t) => formatPrice(t.startingPrice, t.pricingType, t.currency)),
      },
      { label: "Free plan", values: tools.map((t) => (t.freePlan ? "Yes" : "No")) },
      { label: "API", values: tools.map((t) => (t.apiAvailable ? "Yes" : "No")) },
      { label: "Open source", values: tools.map((t) => (t.openSource ? "Yes" : "No")) },
      { label: "Open weights", values: tools.map((t) => (t.openWeights ? "Yes" : "No")) },
      { label: "Source available", values: tools.map((t) => (t.sourceAvailable ? "Yes" : "No")) },
      { label: "Self-hostable", values: tools.map((t) => (t.selfHostable ? "Yes" : "No")) },
      { label: "License", values: tools.map((t) => t.license || "—") },
      {
        label: "Commercial use",
        values: tools.map((t) => (t.commercialUse ? "Allowed (verify)" : "Check official terms")),
      },
      {
        label: "Platforms",
        values: tools.map((t) =>
          [
            t.web && "Web",
            t.windows && "Windows",
            t.macos && "macOS",
            t.linux && "Linux",
            t.chromeExtension && "Chrome",
            t.ios && "iOS",
            t.android && "Android",
          ]
            .filter(Boolean)
            .join(", ") || "—"
        ),
      },
      {
        label: "Best for",
        values: tools.map((t) => parseJsonArray(t.bestFor).slice(0, 3).join(", ") || "—"),
      },
      {
        label: "Last verified",
        values: tools.map((t) => formatVerifiedDate(t.lastVerified)),
      },
    ];
  }, [tools]);

  function sync(next: string[]) {
    setSlugs(next);
    router.push(next.length ? `/compare?tools=${next.join(",")}` : "/compare");
  }

  function remove(slug: string) {
    const next = slugs.filter((s) => s !== slug);
    setTools((prev) => prev.filter((t) => t.slug !== slug));
    sync(next);
  }

  function add() {
    if (!pick || slugs.includes(pick) || slugs.length >= 4) return;
    const next = [...slugs, pick];
    setPick("");
    sync(next);
    // page reload via router will refetch tools
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[16rem] flex-1">
          <label className="mb-1 block text-xs text-zinc-500">Add a tool (max 4)</label>
          <select className="input" value={pick} onChange={(e) => setPick(e.target.value)}>
            <option value="">Select…</option>
            {catalog
              .filter((c) => !slugs.includes(c.slug))
              .map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name} ({c.company})
                </option>
              ))}
          </select>
        </div>
        <button type="button" className="btn-primary" onClick={add} disabled={!pick || slugs.length >= 4}>
          Add
        </button>
      </div>

      {tools.length === 0 ? (
        <div className="card p-10 text-center text-zinc-400">
          Pick up to 4 tools to compare pricing, platforms and licensing side by side.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="p-4 text-zinc-500">Attribute</th>
                {tools.map((t) => (
                  <th key={t.id} className="p-4 align-top">
                    <div className="flex items-start gap-2">
                      <ToolLogo name={t.name} size="sm" />
                      <div>
                        <div className="font-medium text-white">{t.name}</div>
                        <OfficialLink href={t.officialUrl} variant="text" className="text-xs">
                          Official site
                        </OfficialLink>
                      </div>
                      <button type="button" className="ml-auto text-zinc-500 hover:text-white" onClick={() => remove(t.slug)} aria-label="Remove">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-zinc-800/80">
                  <td className="p-4 font-medium text-zinc-400">{row.label}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className="p-4 text-zinc-200">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-zinc-800 p-3 text-xs text-zinc-500">
            No overall winner — compare attributes that matter for your use case. Prices may change; verify on official sites.
          </p>
        </div>
      )}
    </div>
  );
}

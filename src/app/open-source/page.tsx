import Link from "next/link";
import { prisma } from "@/lib/db";
import { OS_HUB_TABS } from "@/lib/utils";
import { ToolCardGrid } from "@/components/ToolCard";
import { Badge } from "@/components/Badges";

export const metadata = { title: "Open Source AI Hub" };
export const dynamic = "force-dynamic";

export default async function OpenSourcePage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const tab = searchParams.tab || "All";
  const where =
    tab === "All"
      ? {
          status: "active" as const,
          OR: [{ openSource: true }, { openWeights: true }, { sourceAvailable: true }, { selfHostable: true }],
        }
      : {
          status: "active" as const,
          osHubTab: tab,
          OR: [{ openSource: true }, { openWeights: true }, { sourceAvailable: true }, { selfHostable: true }],
        };

  const tools = await prisma.tool.findMany({ where, orderBy: [{ featured: "desc" }, { name: "asc" }] });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="section-title">Open Source AI</h1>
        <p className="mt-2 max-w-2xl text-zinc-400">
          We distinguish <Badge tone="os">Open Source</Badge>{" "}
          <Badge tone="os">Open Weights</Badge>{" "}
          <Badge tone="os">Source Available</Badge> and self-hostable projects — downloadable weights alone do not equal open source.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {["All", ...OS_HUB_TABS].map((t) => (
          <Link
            key={t}
            href={t === "All" ? "/open-source" : `/open-source?tab=${encodeURIComponent(t)}`}
            className={`badge ${tab === t ? "border-violet-500/50 bg-violet-500/20 text-violet-200" : ""}`}
          >
            {t}
          </Link>
        ))}
      </div>
      <ToolCardGrid tools={tools} />
    </div>
  );
}

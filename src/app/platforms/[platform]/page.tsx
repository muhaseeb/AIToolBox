import { notFound } from "next/navigation";
import { PLATFORMS } from "@/lib/utils";
import { prisma } from "@/lib/db";
import { ToolCardGrid } from "@/components/ToolCard";
import { EmptyState } from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { platform: string } }) {
  if (params.platform === "local") return { title: "Local & Self-hosted AI Tools" };
  const p = PLATFORMS.find((x) => x.key === params.platform);
  return { title: p ? `AI Tools for ${p.label}` : "Platform" };
}

export default async function PlatformPage({ params }: { params: { platform: string } }) {
  if (params.platform === "local") {
    const tools = await prisma.tool.findMany({
      where: { status: "active", selfHostable: true },
      orderBy: { featured: "desc" },
    });
    return (
      <div className="space-y-8 animate-fade-in">
        <h1 className="section-title">Local / Self-hosted AI</h1>
        <p className="text-zinc-400">Tools that can run on your own infrastructure.</p>
        {tools.length ? <ToolCardGrid tools={tools} /> : <EmptyState />}
      </div>
    );
  }

  const platform = PLATFORMS.find((p) => p.key === params.platform);
  if (!platform) notFound();

  const tools = await prisma.tool.findMany({
    where: { status: "active", [platform.field]: true },
    orderBy: { featured: "desc" },
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="section-title">AI Tools for {platform.label}</h1>
      <p className="text-zinc-400">{tools.length} tools available on {platform.label}.</p>
      {tools.length ? <ToolCardGrid tools={tools} /> : <EmptyState />}
    </div>
  );
}

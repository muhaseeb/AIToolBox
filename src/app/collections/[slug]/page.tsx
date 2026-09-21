import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ToolCardGrid } from "@/components/ToolCard";
import { EmptyState } from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const c = await prisma.collection.findUnique({ where: { slug: params.slug } });
  return { title: c?.name || "Collection" };
}

export default async function CollectionPage({ params }: { params: { slug: string } }) {
  const collection = await prisma.collection.findUnique({
    where: { slug: params.slug },
    include: {
      tools: { include: { tool: true }, orderBy: { order: "asc" } },
    },
  });
  if (!collection) notFound();
  const tools = collection.tools.map((ct) => ct.tool).filter((t) => t.status === "active");

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-500">Collection</p>
        <h1 className="section-title">{collection.name}</h1>
        <p className="mt-2 text-zinc-400">{collection.description}</p>
      </div>
      {tools.length ? <ToolCardGrid tools={tools} /> : <EmptyState />}
    </div>
  );
}

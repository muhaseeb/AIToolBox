import { prisma } from "@/lib/db";
import { ToolCardGrid } from "@/components/ToolCard";

export const metadata = { title: "Trending AI Tools" };
export const dynamic = "force-dynamic";

export default async function TrendingPage() {
  const [trending, recent, updated] = await Promise.all([
    prisma.tool.findMany({ where: { status: "active", trending: true }, orderBy: { viewCount: "desc" }, take: 12 }),
    prisma.tool.findMany({ where: { status: "active" }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.tool.findMany({ where: { status: "active" }, orderBy: { updatedAt: "desc" }, take: 8 }),
  ]);

  return (
    <div className="space-y-12 animate-fade-in">
      <div>
        <h1 className="section-title">🔥 Trending AI Tools</h1>
        <p className="mt-2 text-zinc-400">
          Transparent signals only — editorial trending, recently added, and recently updated. Not a claim of “most used.”
        </p>
      </div>
      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">Trending (editorial)</h2>
        <ToolCardGrid tools={trending} />
      </section>
      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">Recently added</h2>
        <ToolCardGrid tools={recent} />
      </section>
      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">Recently updated</h2>
        <ToolCardGrid tools={updated} />
      </section>
    </div>
  );
}

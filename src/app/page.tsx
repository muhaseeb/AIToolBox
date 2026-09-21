import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { prisma } from "@/lib/db";
import { CATEGORIES } from "@/lib/utils";
import { ToolCardGrid } from "@/components/ToolCard";
import { HomeSearch } from "@/components/HomeSearch";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [trending, featured, freeTools, openSource] = await Promise.all([
    prisma.tool.findMany({ where: { status: "active", trending: true }, take: 8, orderBy: { viewCount: "desc" } }),
    prisma.tool.findMany({ where: { status: "active", featured: true }, take: 8, orderBy: { name: "asc" } }),
    prisma.tool.findMany({
      where: { status: "active", OR: [{ pricingType: "FREE" }, { freePlan: true }] },
      take: 8,
      orderBy: { featured: "desc" },
    }),
    prisma.tool.findMany({
      where: { status: "active", OR: [{ openSource: true }, { openWeights: true }, { selfHostable: true }] },
      take: 8,
      orderBy: { featured: "desc" },
    }),
  ]);

  const chips = [
    { label: "Generate a video", href: "/discover?q=video" },
    { label: "Create an image", href: "/discover?q=image" },
    { label: "Write content", href: "/discover?q=writing" },
    { label: "Code an app", href: "/discover?category=coding" },
    { label: "Clone a voice", href: "/discover?category=voice" },
    { label: "Research a topic", href: "/discover?category=search" },
    { label: "Run AI locally", href: "/discover?openSource=self-hosted" },
  ];

  const popular = CATEGORIES.filter((c) =>
    ["chat", "video", "image", "coding", "voice", "open-source"].includes(c.slug)
  );

  return (
    <div className="space-y-16 animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-violet-500/10 to-transparent px-6 py-16 text-center sm:px-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
            <Sparkles className="h-3.5 w-3.5" /> Product Hunt for AI tools
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Find the right AI tool in seconds.
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Discover, compare and launch the world&apos;s leading AI tools — free, paid and open source.
          </p>
          <div className="mt-8">
            <HomeSearch />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {chips.map((c) => (
              <Link key={c.href} href={c.href} className="badge hover:border-violet-500/40 hover:text-violet-200">
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title mb-4">Popular Categories</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {popular.map((c) => (
            <Link key={c.slug} href={`/categories/${c.slug}`} className="card flex items-center justify-between p-4 text-sm font-medium hover:border-violet-500/40">
              {c.name.replace(/^AI /, "")}
              <ArrowRight className="h-4 w-4 text-zinc-600" />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="section-title">🔥 Trending Tools</h2>
          <Link href="/trending" className="text-sm text-accent-soft hover:underline">View all</Link>
        </div>
        <p className="mb-4 text-xs text-zinc-500">Editorial trending signals — not a claim of objective “most used”.</p>
        <ToolCardGrid tools={trending} />
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="section-title">⭐ Featured Tools</h2>
          <Link href="/discover?sort=featured" className="text-sm text-accent-soft hover:underline">View all</Link>
        </div>
        <ToolCardGrid tools={featured} />
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="section-title">🆓 Best Free Tools</h2>
          <Link href="/collections/best-free-ai-tools" className="text-sm text-accent-soft hover:underline">Collection</Link>
        </div>
        <ToolCardGrid tools={freeTools} />
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="section-title">💻 Open Source & Local AI</h2>
          <Link href="/open-source" className="text-sm text-accent-soft hover:underline">Open Source hub</Link>
        </div>
        <ToolCardGrid tools={openSource} />
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
        <h2 className="text-2xl font-semibold text-white">💰 Compare AI Prices</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-400">
          Side-by-side pricing and feature comparisons. No overall “winner” — just facts from our verified catalog.
        </p>
        <Link href="/compare" className="btn-primary mt-6 inline-flex">Start comparing</Link>
      </section>
    </div>
  );
}

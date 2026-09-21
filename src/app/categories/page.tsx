import Link from "next/link";
import { CATEGORIES } from "@/lib/utils";
import { prisma } from "@/lib/db";
import { ArrowRight } from "lucide-react";

export const metadata = { title: "AI Tool Categories" };
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const counts = await prisma.tool.groupBy({ by: ["category"], where: { status: "active" }, _count: true });
  const map = Object.fromEntries(counts.map((c) => [c.category, c._count]));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="section-title">Categories</h1>
        <p className="mt-2 text-zinc-400">Browse AI tools by category.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => (
          <Link key={c.slug} href={`/categories/${c.slug}`} className="card flex items-center justify-between p-5">
            <div>
              <h2 className="font-medium text-white">{c.name}</h2>
              <p className="text-xs text-zinc-500">{map[c.slug] || 0} tools</p>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-600" />
          </Link>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/db";
import { ArrowRight } from "lucide-react";

export const metadata = { title: "Collections" };
export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const collections = await prisma.collection.findMany({
    include: { _count: { select: { tools: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="section-title">Collections</h1>
        <p className="mt-2 text-zinc-400">Curated lists for common jobs-to-be-done.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => (
          <Link key={c.id} href={`/collections/${c.slug}`} className="card flex items-center justify-between p-5">
            <div>
              <h2 className="font-medium text-white">{c.name}</h2>
              <p className="mt-1 text-xs text-zinc-500">{c._count.tools} tools · {c.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-zinc-600" />
          </Link>
        ))}
      </div>
    </div>
  );
}

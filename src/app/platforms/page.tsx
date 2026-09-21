import Link from "next/link";
import { PLATFORMS } from "@/lib/utils";
import { prisma } from "@/lib/db";
import { ArrowRight } from "lucide-react";

export const metadata = { title: "AI Tools by Platform" };
export const dynamic = "force-dynamic";

export default async function PlatformsPage() {
  const counts = await Promise.all(
    PLATFORMS.map(async (p) => ({
      ...p,
      count: await prisma.tool.count({ where: { status: "active", [p.field]: true } }),
    }))
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="section-title">AI Tools by Platform</h1>
        <p className="mt-2 text-zinc-400">Find tools for Web, desktop, mobile and Chrome.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {counts.map((p) => (
          <Link key={p.key} href={`/platforms/${p.key}`} className="card flex items-center justify-between p-5">
            <div>
              <h2 className="font-medium text-white">{p.label}</h2>
              <p className="text-xs text-zinc-500">{p.count} tools</p>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-600" />
          </Link>
        ))}
      </div>
      <Link href="/platforms/local" className="card flex items-center justify-between p-5">
        <div>
          <h2 className="font-medium text-white">Local / Self-hosted</h2>
          <p className="text-xs text-zinc-500">Tools you can run on your own machine</p>
        </div>
        <ArrowRight className="h-4 w-4 text-zinc-600" />
      </Link>
    </div>
  );
}

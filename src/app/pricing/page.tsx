import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice, formatVerifiedDate, categoryName } from "@/lib/utils";
import { OfficialLink } from "@/components/OfficialLink";

export const metadata = { title: "AI Tools Pricing Directory" };
export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const tools = await prisma.tool.findMany({
    where: { status: "active" },
    orderBy: [{ startingPrice: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="section-title">Pricing Directory</h1>
        <p className="mt-2 text-zinc-400">
          Catalog prices from our database only. Always verify on the official site — prices may change.
        </p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-zinc-800">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400">
            <tr>
              <th className="p-3">Tool</th>
              <th className="p-3">Category</th>
              <th className="p-3">Pricing</th>
              <th className="p-3">Verified</th>
              <th className="p-3">Official</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((t) => (
              <tr key={t.id} className="border-b border-zinc-800/70">
                <td className="p-3">
                  <Link href={`/tools/${t.slug}`} className="font-medium text-white hover:text-violet-300">
                    {t.name}
                  </Link>
                  <div className="text-xs text-zinc-500">{t.company}</div>
                </td>
                <td className="p-3 text-zinc-400">{categoryName(t.category)}</td>
                <td className="p-3 text-zinc-200">{formatPrice(t.startingPrice, t.pricingType, t.currency)}</td>
                <td className="p-3 text-xs text-zinc-500">{formatVerifiedDate(t.lastVerified)}</td>
                <td className="p-3">
                  <OfficialLink href={t.officialUrl} variant="text">Site</OfficialLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

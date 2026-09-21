import { notFound } from "next/navigation";
import Link from "next/link";
import { getToolBySlug, getRelatedTools } from "@/lib/tools";
import { prisma } from "@/lib/db";
import {
  categoryName,
  formatPrice,
  formatVerifiedDate,
  parseJsonArray,
  parseJsonObject,
  type PricingPlan,
} from "@/lib/utils";
import { Badge, PricingBadge } from "@/components/Badges";
import { ToolLogo } from "@/components/ToolLogo";
import { OfficialLink } from "@/components/OfficialLink";
import { ToolCardGrid } from "@/components/ToolCard";
import { ToolActions } from "@/components/ToolActions";
import { ReportPricingButton } from "@/components/ReportPricingButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const tool = await getToolBySlug(params.slug);
  if (!tool) return { title: "Tool not found" };
  return {
    title: `${tool.name} — Pricing, Features & Alternatives`,
    description: tool.shortDescription,
  };
}

export default async function ToolDetailPage({ params }: { params: { slug: string } }) {
  const tool = await getToolBySlug(params.slug);
  if (!tool || tool.status !== "active") notFound();

  await prisma.tool
    .update({ where: { id: tool.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => null);

  const related = await getRelatedTools(tool);
  const features = parseJsonArray(tool.features);
  const bestFor = parseJsonArray(tool.bestFor);
  const pros = parseJsonArray(tool.pros);
  const limitations = parseJsonArray(tool.limitations);
  const plans = parseJsonObject<PricingPlan[]>(tool.pricingPlans, []);
  const faq = parseJsonObject<{ q: string; a: string }[]>(tool.faq, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    applicationCategory: categoryName(tool.category),
    operatingSystem: [
      tool.web && "Web",
      tool.windows && "Windows",
      tool.macos && "macOS",
      tool.linux && "Linux",
      tool.ios && "iOS",
      tool.android && "Android",
    ]
      .filter(Boolean)
      .join(", "),
    offers:
      tool.startingPrice != null
        ? { "@type": "Offer", price: tool.startingPrice, priceCurrency: tool.currency || "USD" }
        : undefined,
    url: tool.officialUrl,
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="card flex flex-col gap-6 p-6 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <ToolLogo name={tool.name} size="lg" />
          <div>
            <p className="text-xs text-zinc-500">{tool.company}</p>
            <h1 className="text-3xl font-semibold text-white">{tool.name}</h1>
            <p className="mt-2 max-w-2xl text-zinc-400">{tool.shortDescription}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge tone="accent">{categoryName(tool.category)}</Badge>
              <PricingBadge pricingType={tool.pricingType} startingPrice={tool.startingPrice} />
              {tool.openSource && <Badge tone="os">Open Source</Badge>}
              {tool.openWeights && <Badge tone="os">Open Weights</Badge>}
              {tool.sourceAvailable && <Badge tone="os">Source Available</Badge>}
              {tool.selfHostable && <Badge>Self-hostable</Badge>}
              {tool.apiAvailable && <Badge>API</Badge>}
              {tool.featured && <Badge tone="warning">Featured</Badge>}
              {tool.trending && <Badge tone="warning">Trending</Badge>}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <OfficialLink href={tool.officialUrl} variant="primary">
            Visit Official Website
          </OfficialLink>
          {tool.pricingUrl && (
            <OfficialLink href={tool.pricingUrl} variant="secondary">
              View Pricing
            </OfficialLink>
          )}
          <ToolActions slug={tool.slug} name={tool.name} />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="section-title text-xl">Overview</h2>
            <p className="mt-3 whitespace-pre-wrap text-zinc-300">{tool.description}</p>
          </section>

          <section>
            <h2 className="section-title text-xl">Pricing</h2>
            <p className="mt-2 text-lg font-medium text-white">
              {formatPrice(tool.startingPrice, tool.pricingType, tool.currency)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Last verified: {formatVerifiedDate(tool.lastVerified)} · Prices may change
            </p>
            {(tool.needsReview ||
              ["needs_review", "needs_verification", "outdated"].includes(tool.verificationStatus)) && (
              <p className="mt-2 text-sm text-amber-300">
                {tool.reviewReason || "Pricing unavailable — check official site"}
              </p>
            )}
            {plans.length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {plans.map((plan) => (
                  <div key={plan.name} className="card p-4">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-medium text-white">{plan.name}</h3>
                      <span className="text-sm text-zinc-300">
                        {plan.price == null
                          ? "Custom"
                          : plan.price === 0
                            ? "Free"
                            : `$${plan.price}/{plan.period}`}
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1 text-xs text-zinc-400">
                      {plan.features.map((f) => (
                        <li key={f}>• {f}</li>
                      ))}
                    </ul>
                    {plan.note && <p className="mt-2 text-xs text-amber-300/80">{plan.note}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-zinc-400">Pricing unavailable — check official site</p>
            )}
            <div className="mt-4">
              <ReportPricingButton toolId={tool.id} toolName={tool.name} />
            </div>
          </section>

          {features.length > 0 && (
            <section>
              <h2 className="section-title text-xl">Features</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {features.map((f) => (
                  <li key={f} className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-300">
                    {f}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(pros.length > 0 || limitations.length > 0) && (
            <section className="grid gap-4 sm:grid-cols-2">
              <div>
                <h2 className="section-title text-xl">Pros</h2>
                <ul className="mt-3 space-y-1 text-sm text-zinc-300">
                  {pros.map((p) => (
                    <li key={p}>+ {p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="section-title text-xl">Limitations</h2>
                <ul className="mt-3 space-y-1 text-sm text-zinc-300">
                  {limitations.map((p) => (
                    <li key={p}>– {p}</li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {faq.length > 0 && (
            <section>
              <h2 className="section-title text-xl">FAQ</h2>
              <div className="mt-3 space-y-3">
                {faq.map((item) => (
                  <details key={item.q} className="card p-4">
                    <summary className="cursor-pointer font-medium text-white">{item.q}</summary>
                    <p className="mt-2 text-sm text-zinc-400">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card space-y-3 p-5">
            <h3 className="font-medium text-white">Platforms</h3>
            <div className="flex flex-wrap gap-1.5">
              {tool.web && <Badge>Web</Badge>}
              {tool.windows && <Badge>Windows</Badge>}
              {tool.macos && <Badge>macOS</Badge>}
              {tool.linux && <Badge>Linux</Badge>}
              {tool.chromeExtension && <Badge>Chrome</Badge>}
              {tool.ios && <Badge>iOS</Badge>}
              {tool.android && <Badge>Android</Badge>}
            </div>
          </div>
          <div className="card space-y-3 p-5">
            <h3 className="font-medium text-white">Licensing</h3>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>Open source: {tool.openSource ? "Yes" : "No"}</li>
              <li>Open weights: {tool.openWeights ? "Yes" : "No"}</li>
              <li>Source available: {tool.sourceAvailable ? "Yes" : "No"}</li>
              <li>Self-hostable: {tool.selfHostable ? "Yes" : "No"}</li>
              <li>License: {tool.license || "See official site"}</li>
              <li>Commercial use: {tool.commercialUse ? "Allowed (verify)" : "Check official terms"}</li>
            </ul>
          </div>
          {bestFor.length > 0 && (
            <div className="card space-y-2 p-5">
              <h3 className="font-medium text-white">Best for</h3>
              <ul className="space-y-1 text-sm text-zinc-400">
                {bestFor.map((b) => (
                  <li key={b}>• {b}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="card space-y-2 p-5 text-sm">
            <h3 className="font-medium text-white">Official links</h3>
            <OfficialLink href={tool.officialUrl} variant="text">
              Official website
            </OfficialLink>
            {tool.pricingUrl && (
              <div>
                <OfficialLink href={tool.pricingUrl} variant="text">
                  Pricing page
                </OfficialLink>
              </div>
            )}
            {tool.documentationUrl && (
              <div>
                <OfficialLink href={tool.documentationUrl} variant="text">
                  Documentation
                </OfficialLink>
              </div>
            )}
            {tool.githubUrl && (
              <div>
                <OfficialLink href={tool.githubUrl} variant="text">
                  GitHub
                </OfficialLink>
              </div>
            )}
            {tool.huggingFaceUrl && (
              <div>
                <OfficialLink href={tool.huggingFaceUrl} variant="text">
                  Hugging Face
                </OfficialLink>
              </div>
            )}
          </div>
          <Link href={`/compare?tools=${tool.slug}`} className="btn-secondary w-full justify-center">
            Compare alternatives
          </Link>
        </aside>
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="section-title mb-4">Similar tools</h2>
          <ToolCardGrid tools={related} />
        </section>
      )}
    </div>
  );
}

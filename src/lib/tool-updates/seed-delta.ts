import fs from "fs";
import path from "path";
import { prisma } from "@/lib/db";
import type { ToolSeedDelta } from "./types";

const UPDATES_DIR = path.join(process.cwd(), "prisma", "updates");

function isPresent<T>(v: T | null | undefined): v is T {
  return v !== null && v !== undefined;
}

function hasNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/** Load all *.json files from prisma/updates (array or { tools: [] }). */
export function loadSeedDeltas(): ToolSeedDelta[] {
  if (!fs.existsSync(UPDATES_DIR)) return [];

  const files = fs
    .readdirSync(UPDATES_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();

  const out: ToolSeedDelta[] = [];
  for (const file of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(UPDATES_DIR, file), "utf8"));
      const list = Array.isArray(raw) ? raw : Array.isArray(raw?.tools) ? raw.tools : [];
      for (const item of list) {
        if (item && typeof item.slug === "string" && item.slug.trim()) {
          out.push(item as ToolSeedDelta);
        }
      }
    } catch (e) {
      console.warn(`[seed-delta] skip ${file}:`, e instanceof Error ? e.message : e);
    }
  }
  return out;
}

/**
 * Merge curated JSON seed deltas by slug.
 * Never overwrite verified pricing with empty/guessed values.
 * Does not invent pricing from scrapes — only applies structured fields present in the delta.
 */
export async function ingestSeedDeltas(): Promise<{
  merged: string[];
  created: string[];
  skipped: string[];
}> {
  const deltas = loadSeedDeltas();
  const merged: string[] = [];
  const created: string[] = [];
  const skipped: string[] = [];

  for (const delta of deltas) {
    const existing = await prisma.tool.findUnique({ where: { slug: delta.slug } });

    if (!existing) {
      // Create only when required identity fields are present
      if (
        !hasNonEmptyString(delta.name) ||
        !hasNonEmptyString(delta.officialUrl) ||
        !hasNonEmptyString(delta.company) ||
        !hasNonEmptyString(delta.category) ||
        !hasNonEmptyString(delta.shortDescription) ||
        !hasNonEmptyString(delta.pricingType)
      ) {
        skipped.push(delta.slug);
        continue;
      }

      const needsVerification =
        delta.needsVerification === true ||
        (delta.pricingType !== "FREE" && !isPresent(delta.startingPrice));

      await prisma.tool.create({
        data: {
          name: delta.name!,
          slug: delta.slug,
          company: delta.company!,
          description: delta.description || delta.shortDescription || "",
          shortDescription: delta.shortDescription!,
          category: delta.category!,
          officialUrl: delta.officialUrl!,
          pricingUrl: delta.pricingUrl || null,
          documentationUrl: delta.documentationUrl || null,
          githubUrl: delta.githubUrl || null,
          huggingFaceUrl: delta.huggingFaceUrl || null,
          pricingType: delta.pricingType!,
          startingPrice: isPresent(delta.startingPrice) ? delta.startingPrice : null,
          freePlan: !!delta.freePlan,
          freeTrial: !!delta.freeTrial,
          pricingPlans: JSON.stringify(delta.pricingPlans || []),
          creditSystem: !!delta.creditSystem,
          apiAvailable: !!delta.apiAvailable,
          apiPricingUrl: delta.apiPricingUrl ?? null,
          openSource: !!delta.openSource,
          openWeights: !!delta.openWeights,
          sourceAvailable: !!delta.sourceAvailable,
          selfHostable: !!delta.selfHostable,
          license: delta.license ?? null,
          commercialUse: !!delta.commercialUse,
          platforms: JSON.stringify(delta.platforms || []),
          windows: !!delta.windows,
          macos: !!delta.macos,
          linux: !!delta.linux,
          web: delta.web !== false,
          chromeExtension: !!delta.chromeExtension,
          ios: !!delta.ios,
          android: !!delta.android,
          bestFor: JSON.stringify(delta.bestFor || []),
          features: JSON.stringify(delta.features || []),
          tags: JSON.stringify(delta.tags || []),
          pros: JSON.stringify(delta.pros || []),
          limitations: JSON.stringify(delta.limitations || []),
          faq: JSON.stringify(delta.faq || []),
          featured: !!delta.featured,
          trending: !!delta.trending,
          editorialPick: !!delta.editorialPick,
          modelSize: delta.modelSize ?? null,
          gpuRequirements: delta.gpuRequirements ?? null,
          latestRelease: delta.latestRelease ?? null,
          osHubTab: delta.osHubTab ?? null,
          status: delta.status || "active",
          lastVerified: delta.lastVerified ? new Date(delta.lastVerified) : new Date(0),
          verifiedAt: null,
          verifiedBy: null,
          pricingSourceUrl: delta.pricingSourceUrl || delta.pricingUrl || null,
          verificationStatus: needsVerification
            ? "needs_verification"
            : delta.verificationStatus || "needs_review",
          needsReview: true,
          reviewReason: needsVerification
            ? "Pricing unavailable — check official site"
            : "New tool from seed delta — pending admin verification",
          urlStatus: "unchecked",
        },
      });
      created.push(delta.slug);
      continue;
    }

    // Update existing — never overwrite verified pricing with empty/null
    const data: Record<string, unknown> = {};

    const stringFields = [
      "name",
      "company",
      "description",
      "shortDescription",
      "category",
      "officialUrl",
      "pricingUrl",
      "documentationUrl",
      "githubUrl",
      "huggingFaceUrl",
      "license",
      "modelSize",
      "gpuRequirements",
      "latestRelease",
      "osHubTab",
      "status",
      "pricingSourceUrl",
    ] as const;

    for (const key of stringFields) {
      const v = delta[key];
      if (hasNonEmptyString(v)) data[key] = v;
    }

    const boolFields = [
      "freePlan",
      "freeTrial",
      "creditSystem",
      "apiAvailable",
      "openSource",
      "openWeights",
      "sourceAvailable",
      "selfHostable",
      "commercialUse",
      "windows",
      "macos",
      "linux",
      "web",
      "chromeExtension",
      "ios",
      "android",
      "featured",
      "trending",
      "editorialPick",
    ] as const;

    for (const key of boolFields) {
      if (typeof delta[key] === "boolean") data[key] = delta[key];
    }

    const jsonArrayFields = [
      "platforms",
      "bestFor",
      "features",
      "tags",
      "pros",
      "limitations",
      "pricingPlans",
      "faq",
    ] as const;
    for (const key of jsonArrayFields) {
      if (Array.isArray(delta[key])) data[key] = JSON.stringify(delta[key]);
    }

    if (hasNonEmptyString(delta.apiPricingUrl)) data.apiPricingUrl = delta.apiPricingUrl;
    else if (delta.apiPricingUrl === null) {
      /* leave existing */
    }

    // Pricing: only apply when delta has real structured values
    const existingVerified =
      existing.verificationStatus === "verified" && !existing.needsReview;

    if (hasNonEmptyString(delta.pricingType)) {
      data.pricingType = delta.pricingType;
    }

    if (isPresent(delta.startingPrice) && typeof delta.startingPrice === "number") {
      data.startingPrice = delta.startingPrice;
    } else if (delta.startingPrice === null && !existingVerified) {
      // Explicit null only clears when not currently verified
      data.startingPrice = null;
      data.needsReview = true;
      data.reviewReason = "Pricing unavailable — check official site";
      data.verificationStatus = "needs_verification";
    }
    // else: leave existing pricing untouched (never overwrite verified with empty)

    if (delta.needsVerification === true) {
      data.needsReview = true;
      data.reviewReason = "Pricing unavailable — check official site";
      data.verificationStatus = "needs_verification";
    }

    if (Object.keys(data).length === 0) {
      skipped.push(delta.slug);
      continue;
    }

    await prisma.tool.update({ where: { id: existing.id }, data });
    merged.push(delta.slug);
  }

  return { merged, created, skipped };
}

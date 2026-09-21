import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const VERIFIED = new Date("2026-09-15T00:00:00.000Z");

type SeedTool = Record<string, unknown>;

async function main() {
  const dataDir = path.join(__dirname, "data");
  const tools = JSON.parse(fs.readFileSync(path.join(dataDir, "tools.json"), "utf8")) as SeedTool[];
  const collections = JSON.parse(
    fs.readFileSync(path.join(dataDir, "collections.json"), "utf8")
  ) as { name: string; slug: string; description: string; icon: string; toolSlugs: string[] }[];

  console.log("Seeding AIToolBox...");
  await prisma.cronRun.deleteMany();
  await prisma.pricingReport.deleteMany();
  await prisma.collectionTool.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.tool.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.toolSubmission.deleteMany();

  for (const t of tools) {
    const web = t.web !== false;
    const windows = !!t.windows;
    const macos = !!t.macos;
    const linux = !!t.linux;
    const chromeExtension = !!t.chromeExtension;
    const ios = !!t.ios;
    const android = !!t.android;

    await prisma.tool.create({
      data: {
        name: String(t.name),
        slug: String(t.slug),
        company: String(t.company),
        description: String(t.description),
        shortDescription: String(t.shortDescription),
        category: String(t.category),
        subcategories: JSON.stringify(t.subcategories || []),
        officialUrl: String(t.officialUrl),
        pricingUrl: (t.pricingUrl as string) || null,
        documentationUrl: (t.documentationUrl as string) || null,
        githubUrl: (t.githubUrl as string) || null,
        huggingFaceUrl: (t.huggingFaceUrl as string) || null,
        status: "active",
        pricingType: String(t.pricingType),
        startingPrice: (t.startingPrice as number | null) ?? null,
        currency: "USD",
        freePlan: !!t.freePlan,
        freeTrial: !!t.freeTrial,
        pricingPlans: JSON.stringify(t.pricingPlans || []),
        creditSystem: !!t.creditSystem,
        apiAvailable: !!t.apiAvailable,
        apiPricingUrl: (t.apiPricingUrl as string) || null,
        openSource: !!t.openSource,
        openWeights: !!t.openWeights,
        sourceAvailable: !!t.sourceAvailable,
        selfHostable: !!t.selfHostable,
        license: (t.license as string) || null,
        commercialUse: !!t.commercialUse,
        platforms: JSON.stringify([
          ...(web ? ["web"] : []),
          ...(windows ? ["windows"] : []),
          ...(macos ? ["macos"] : []),
          ...(linux ? ["linux"] : []),
          ...(chromeExtension ? ["chrome"] : []),
          ...(ios ? ["ios"] : []),
          ...(android ? ["android"] : []),
        ]),
        windows,
        macos,
        linux,
        web,
        chromeExtension,
        ios,
        android,
        bestFor: JSON.stringify(t.bestFor || []),
        features: JSON.stringify(t.features || []),
        tags: JSON.stringify(t.tags || []),
        pros: JSON.stringify(t.pros || []),
        limitations: JSON.stringify(t.limitations || []),
        faq: JSON.stringify(t.faq || []),
        lastVerified: VERIFIED,
        verifiedAt: VERIFIED,
        verifiedBy: "seed",
        pricingSourceUrl: (t.pricingUrl as string) || (t.officialUrl as string) || null,
        verificationStatus: String(t.verificationStatus || "verified"),
        needsReview: false,
        reviewReason: null,
        urlStatus: "unchecked",
        featured: !!t.featured,
        trending: !!t.trending,
        editorialPick: !!t.editorialPick,
        modelSize: (t.modelSize as string) || null,
        gpuRequirements: (t.gpuRequirements as string) || null,
        latestRelease: (t.latestRelease as string) || null,
        osHubTab: (t.osHubTab as string) || null,
        viewCount: Math.floor(Math.random() * 5000),
        saveCount: Math.floor(Math.random() * 800),
        clickCount: Math.floor(Math.random() * 2000),
      },
    });
  }

  for (const c of collections) {
    const col = await prisma.collection.create({
      data: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        icon: c.icon,
        featured: true,
      },
    });
    let order = 0;
    for (const slug of c.toolSlugs) {
      const tool = await prisma.tool.findUnique({ where: { slug } });
      if (tool) {
        await prisma.collectionTool.create({
          data: { collectionId: col.id, toolId: tool.id, order: order++ },
        });
      }
    }
  }

  console.log(`Seeded ${tools.length} tools and ${collections.length} collections.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

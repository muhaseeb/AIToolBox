/** Curated seed-delta entry — only structured known fields; never invented pricing. */
export type ToolSeedDelta = {
  slug: string;
  name?: string;
  company?: string;
  description?: string;
  shortDescription?: string;
  category?: string;
  officialUrl?: string;
  pricingUrl?: string;
  documentationUrl?: string;
  githubUrl?: string;
  huggingFaceUrl?: string;
  /** Only applied when present and non-empty; never clears verified pricing with null/empty */
  pricingType?: string;
  startingPrice?: number | null;
  freePlan?: boolean;
  freeTrial?: boolean;
  pricingPlans?: unknown[];
  creditSystem?: boolean;
  apiAvailable?: boolean;
  apiPricingUrl?: string | null;
  openSource?: boolean;
  openWeights?: boolean;
  sourceAvailable?: boolean;
  selfHostable?: boolean;
  license?: string | null;
  commercialUse?: boolean;
  platforms?: string[];
  windows?: boolean;
  macos?: boolean;
  linux?: boolean;
  web?: boolean;
  chromeExtension?: boolean;
  ios?: boolean;
  android?: boolean;
  bestFor?: string[];
  features?: string[];
  tags?: string[];
  pros?: string[];
  limitations?: string[];
  faq?: unknown[];
  featured?: boolean;
  trending?: boolean;
  editorialPick?: boolean;
  modelSize?: string | null;
  gpuRequirements?: string | null;
  latestRelease?: string | null;
  osHubTab?: string | null;
  status?: string;
  /** If true, explicitly marks pricing as needing human verification */
  needsVerification?: boolean;
  pricingSourceUrl?: string;
  lastVerified?: string;
  verificationStatus?: string;
};

export type UpdateJobOptions = {
  /** Skip link health checks */
  skipLinkHealth?: boolean;
  /** Skip stale pricing flagging */
  skipStalePricing?: boolean;
  /** Skip prisma/updates/*.json ingest */
  skipSeedDelta?: boolean;
  /** Max tools to check for link health this run */
  linkBatchSize?: number;
  /** Delay ms between link checks (rate limit) */
  linkDelayMs?: number;
  /** Days before lastVerified is considered stale */
  staleDays?: number;
};

export type UpdateJobResult = {
  startedAt: string;
  finishedAt: string;
  linksChecked: number;
  linksBroken: number;
  staleFlagged: number;
  seedMerged: number;
  seedSkipped: number;
  seedCreated: number;
  details: {
    brokenSlugs: string[];
    staleSlugs: string[];
    mergedSlugs: string[];
    createdSlugs: string[];
    skippedSlugs: string[];
  };
  cronRunId?: string;
};

import { prisma } from "@/lib/db";
import { runLinkHealthChecks } from "./link-health";
import { flagStalePricing } from "./stale-pricing";
import { ingestSeedDeltas } from "./seed-delta";
import type { UpdateJobOptions, UpdateJobResult } from "./types";

/**
 * Data-source abstraction entrypoint:
 * 1) Manual admin updates (existing UI/API — unchanged)
 * 2) Scheduled verification → marks tools needing review
 * 3) Optional curated JSON seed deltas + official URL link health (status only)
 *
 * Never invents pricing from HTML scrapes.
 */
export async function runUpdateToolsJob(
  options: UpdateJobOptions = {}
): Promise<UpdateJobResult> {
  const startedAt = new Date();
  const cronRun = await prisma.cronRun.create({
    data: { job: "update-tools", status: "running", startedAt },
  });

  const details: UpdateJobResult["details"] = {
    brokenSlugs: [],
    staleSlugs: [],
    mergedSlugs: [],
    createdSlugs: [],
    skippedSlugs: [],
  };

  let linksChecked = 0;
  let linksBroken = 0;
  let staleFlagged = 0;
  let seedMerged = 0;
  let seedSkipped = 0;
  let seedCreated = 0;
  let errorMsg: string | null = null;

  try {
    if (!options.skipLinkHealth) {
      const linkResult = await runLinkHealthChecks({
        batchSize: options.linkBatchSize ?? 25,
        delayMs: options.linkDelayMs ?? 250,
        recheckDays: 7,
      });
      linksChecked = linkResult.checked.length;
      linksBroken = linkResult.broken.length;
      details.brokenSlugs = linkResult.broken.map((b) => b.slug);
    }

    if (!options.skipStalePricing) {
      const stale = await flagStalePricing(options.staleDays ?? 30);
      staleFlagged = stale.flagged.length;
      details.staleSlugs = stale.flagged.map((s) => s.slug);
    }

    if (!options.skipSeedDelta) {
      const seed = await ingestSeedDeltas();
      seedMerged = seed.merged.length;
      seedCreated = seed.created.length;
      seedSkipped = seed.skipped.length;
      details.mergedSlugs = seed.merged;
      details.createdSlugs = seed.created;
      details.skippedSlugs = seed.skipped;
    }
  } catch (e) {
    errorMsg = e instanceof Error ? e.message : String(e);
  }

  const finishedAt = new Date();
  const status = errorMsg ? "error" : "ok";

  await prisma.cronRun.update({
    where: { id: cronRun.id },
    data: {
      finishedAt,
      status,
      linksChecked,
      linksBroken,
      staleFlagged,
      seedMerged: seedMerged + seedCreated,
      seedSkipped,
      summary: JSON.stringify(details),
      error: errorMsg,
    },
  });

  return {
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    linksChecked,
    linksBroken,
    staleFlagged,
    seedMerged,
    seedSkipped,
    seedCreated,
    details,
    cronRunId: cronRun.id,
  };
}

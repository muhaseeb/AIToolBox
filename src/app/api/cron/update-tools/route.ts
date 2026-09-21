import { NextResponse } from "next/server";
import { runUpdateToolsJob } from "@/lib/tool-updates";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorize(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // In development, allow when CRON_SECRET is unset only with explicit local bypass
    if (process.env.NODE_ENV !== "production" && process.env.ALLOW_INSECURE_CRON === "true") {
      return true;
    }
    return false;
  }

  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ") && auth.slice(7) === secret) return true;

  const header = req.headers.get("x-cron-secret");
  if (header === secret) return true;

  return false;
}

async function handle(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const skipLinkHealth = url.searchParams.get("skipLinkHealth") === "1";
  const skipStalePricing = url.searchParams.get("skipStalePricing") === "1";
  const skipSeedDelta = url.searchParams.get("skipSeedDelta") === "1";
  const linkBatchSize = parseInt(url.searchParams.get("linkBatchSize") || "25", 10);
  const staleDays = parseInt(url.searchParams.get("staleDays") || "30", 10);

  const result = await runUpdateToolsJob({
    skipLinkHealth,
    skipStalePricing,
    skipSeedDelta,
    linkBatchSize: Number.isFinite(linkBatchSize) ? linkBatchSize : 25,
    staleDays: Number.isFinite(staleDays) ? staleDays : 30,
    linkDelayMs: 250,
  });

  return NextResponse.json({
    ok: true,
    job: "update-tools",
    ...result,
  });
}

/** Vercel Cron uses GET; local/scripts may use POST */
export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}

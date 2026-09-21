import { prisma } from "@/lib/db";

export type LinkCheckResult = {
  toolId: string;
  slug: string;
  url: string;
  httpStatus: number | null;
  urlStatus: "ok" | "broken" | "redirect" | "unchecked";
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * HEAD (fallback GET) official_url — status only.
 * Never parses HTML or invents pricing from page content.
 */
export async function checkUrlHealth(url: string): Promise<{
  httpStatus: number | null;
  urlStatus: "ok" | "broken" | "redirect" | "unchecked";
}> {
  if (!url || !/^https?:\/\//i.test(url)) {
    return { httpStatus: null, urlStatus: "broken" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      signal: controller.signal,
      headers: { "User-Agent": "AIToolBox-LinkHealth/1.0 (+catalog verification)" },
    });

    // Some hosts reject HEAD — retry GET without reading body
    if (res.status === 405 || res.status === 501 || res.status === 403) {
      res = await fetch(url, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": "AIToolBox-LinkHealth/1.0 (+catalog verification)",
          Range: "bytes=0-0",
        },
      });
    }

    const status = res.status;
    if (status >= 200 && status < 300) {
      return { httpStatus: status, urlStatus: "ok" };
    }
    if (status >= 300 && status < 400) {
      return { httpStatus: status, urlStatus: "redirect" };
    }
    return { httpStatus: status, urlStatus: "broken" };
  } catch {
    return { httpStatus: null, urlStatus: "broken" };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Batch-check official URLs that are due (unchecked or older than recheckDays).
 * Rate-limited with delay between requests.
 */
export async function runLinkHealthChecks(opts: {
  batchSize?: number;
  delayMs?: number;
  recheckDays?: number;
}): Promise<{ checked: LinkCheckResult[]; broken: LinkCheckResult[] }> {
  const batchSize = opts.batchSize ?? 25;
  const delayMs = opts.delayMs ?? 250;
  const recheckDays = opts.recheckDays ?? 7;
  const cutoff = new Date(Date.now() - recheckDays * 24 * 60 * 60 * 1000);

  const tools = await prisma.tool.findMany({
    where: {
      status: "active",
      OR: [
        { urlLastChecked: null },
        { urlStatus: "unchecked" },
        { urlLastChecked: { lt: cutoff } },
      ],
    },
    select: { id: true, slug: true, officialUrl: true },
    orderBy: [{ urlLastChecked: "asc" }, { updatedAt: "asc" }],
    take: batchSize,
  });

  const checked: LinkCheckResult[] = [];
  const broken: LinkCheckResult[] = [];

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    const result = await checkUrlHealth(tool.officialUrl);
    const row: LinkCheckResult = {
      toolId: tool.id,
      slug: tool.slug,
      url: tool.officialUrl,
      httpStatus: result.httpStatus,
      urlStatus: result.urlStatus,
    };
    checked.push(row);
    if (result.urlStatus === "broken") broken.push(row);

    const now = new Date();
    const reviewReason =
      result.urlStatus === "broken"
        ? `Official URL returned HTTP ${result.httpStatus ?? "error"} — check link`
        : undefined;

    await prisma.tool.update({
      where: { id: tool.id },
      data: {
        urlStatus: result.urlStatus,
        httpStatus: result.httpStatus,
        urlLastChecked: now,
        ...(result.urlStatus === "broken"
          ? {
              needsReview: true,
              reviewReason,
              verificationStatus: "needs_review",
            }
          : {}),
      },
    });

    if (i < tools.length - 1 && delayMs > 0) await sleep(delayMs);
  }

  return { checked, broken };
}

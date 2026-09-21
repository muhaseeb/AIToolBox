"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type QueueItem = {
  id: string;
  name: string;
  slug: string;
  lastVerified: string;
  verificationStatus: string;
  needsReview: boolean;
  reviewReason: string | null;
  urlStatus: string;
  httpStatus: number | null;
  pricingSourceUrl: string | null;
};

type CronRun = {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  status: string;
  linksChecked: number;
  linksBroken: number;
  staleFlagged: number;
  seedMerged: number;
  seedSkipped: number;
  error: string | null;
};

type Stats = {
  total: number;
  free: number;
  paid: number;
  openSource: number;
  needsReview: number;
  brokenLinks: number;
  recent: QueueItem[];
  lastCron: CronRun | null;
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [cronMsg, setCronMsg] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("aitoolbox:admin") === "1") {
      setAuthed(true);
      load();
    }
  }, []);

  async function load() {
    const res = await fetch("/api/admin/stats");
    if (res.ok) setStats(await res.json());
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("Invalid password");
      return;
    }
    sessionStorage.setItem("aitoolbox:admin", "1");
    setAuthed(true);
    load();
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm space-y-4 animate-fade-in">
        <h1 className="section-title">Admin</h1>
        <form onSubmit={login} className="card space-y-3 p-6">
          <input
            className="input"
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn-primary w-full" type="submit">
            Enter
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <p className="text-xs text-zinc-500">
            Default password is in ADMIN_PASSWORD (.env). Local-only gate for v1.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Admin dashboard</h1>
        <Link href="/admin/tools" className="btn-primary text-xs">
          Manage tools
        </Link>
      </div>
      {stats && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {[
              ["Total tools", stats.total],
              ["Free / freemium", stats.free],
              ["Paid+", stats.paid],
              ["Open source", stats.openSource],
              ["Needs pricing review", stats.needsReview],
              ["Broken links", stats.brokenLinks],
            ].map(([label, value]) => (
              <div key={label as string} className="card p-4">
                <p className="text-xs text-zinc-500">{label}</p>
                <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>

          <section className="card space-y-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-medium text-white">Catalog update job</h2>
              <p className="text-xs text-zinc-500">
                Cron uses <code className="text-zinc-400">CRON_SECRET</code> — run via curl /
                Vercel, not from the browser.
              </p>
            </div>
            {stats.lastCron ? (
              <div className="grid gap-2 text-sm text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
                <p>
                  Last run:{" "}
                  <span className="text-zinc-200">
                    {new Date(stats.lastCron.startedAt).toLocaleString()}
                  </span>{" "}
                  ({stats.lastCron.status})
                </p>
                <p>
                  Links: {stats.lastCron.linksChecked} checked / {stats.lastCron.linksBroken}{" "}
                  broken
                </p>
                <p>Stale flagged: {stats.lastCron.staleFlagged}</p>
                <p>
                  Seed merge: {stats.lastCron.seedMerged} (skipped {stats.lastCron.seedSkipped})
                </p>
                {stats.lastCron.error && (
                  <p className="sm:col-span-2 text-red-400">{stats.lastCron.error}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No cron runs yet.</p>
            )}
            {cronMsg && <p className="text-xs text-zinc-500">{cronMsg}</p>}
            <button
              type="button"
              className="btn-ghost text-xs"
              onClick={() => {
                setCronMsg(
                  'Run: curl -X POST http://localhost:3000/api/cron/update-tools -H "Authorization: Bearer $CRON_SECRET"'
                );
                load();
              }}
            >
              Refresh stats / show curl
            </button>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-medium text-white">Pricing verification queue</h2>
            <div className="overflow-x-auto rounded-2xl border border-zinc-800">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400">
                  <tr>
                    <th className="p-3">Tool</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">URL</th>
                    <th className="p-3">Last verified</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-zinc-500">
                        Queue empty — all pricing looks fresh.
                      </td>
                    </tr>
                  )}
                  {stats.recent.map((t) => (
                    <tr key={t.id} className="border-b border-zinc-800/70">
                      <td className="p-3 text-white">{t.name}</td>
                      <td className="p-3 text-zinc-400">{t.verificationStatus}</td>
                      <td className="p-3 text-xs text-amber-200/80 max-w-[220px]">
                        {t.reviewReason || "—"}
                      </td>
                      <td className="p-3 text-xs text-zinc-500">
                        {t.urlStatus}
                        {t.httpStatus != null ? ` (${t.httpStatus})` : ""}
                      </td>
                      <td className="p-3 text-zinc-500">
                        {new Date(t.lastVerified).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <Link
                          href={`/admin/tools?edit=${t.slug}`}
                          className="text-violet-300 hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

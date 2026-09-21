/**
 * Vercel build-time Turso schema + seed.
 * Prisma sqlite provider rejects libsql:// for `db push` (P1012).
 * Instead: generate SQL via `migrate diff`, apply with @libsql/client, then seed.
 */
import { spawnSync } from "child_process";
import { createClient } from "@libsql/client";

const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();
const onVercel = Boolean(process.env.VERCEL);

function runCapture(cmd, args, env = process.env) {
  const result = spawnSync(cmd, args, {
    encoding: "utf8",
    env,
    shell: process.platform === "win32",
  });
  if (result.error) {
    console.error(`[prod-db-setup] Failed to start ${cmd}:`, result.error);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(result.stdout || "");
    console.error(result.stderr || "");
    console.error(`[prod-db-setup] ${cmd} exited with code ${result.status}`);
    process.exit(result.status ?? 1);
  }
  return result.stdout || "";
}

function runInherit(cmd, args, env = process.env) {
  console.log(`[prod-db-setup] Running: ${cmd} ${args.join(" ")}`);
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
  });
  if (result.error) {
    console.error(`[prod-db-setup] Failed to start ${cmd}:`, result.error);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`[prod-db-setup] ${cmd} exited with code ${result.status}`);
    process.exit(result.status ?? 1);
  }
}

if (!tursoUrl || !tursoToken) {
  if (onVercel) {
    console.error(
      "[prod-db-setup] TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required on Vercel."
    );
    process.exit(1);
  }
  console.log(
    "[prod-db-setup] TURSO_* not set — skipping Turso setup (local build)."
  );
  process.exit(0);
}

// Prisma CLI sqlite datasource requires file: URLs — keep a dummy for diff only
const cliEnv = {
  ...process.env,
  DATABASE_URL: "file:./prisma/vercel-diff.db",
};

console.log("[prod-db-setup] Generating schema SQL…");
const sql = runCapture(
  "npx",
  [
    "prisma",
    "migrate",
    "diff",
    "--from-empty",
    "--to-schema-datamodel",
    "prisma/schema.prisma",
    "--script",
  ],
  cliEnv
);

if (!sql.trim()) {
  console.error("[prod-db-setup] Empty SQL from migrate diff");
  process.exit(1);
}

console.log("[prod-db-setup] Applying schema to Turso…");
const client = createClient({ url: tursoUrl, authToken: tursoToken });

// Split on statement boundaries; skip empty / comment-only chunks
const statements = sql
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.split("\n").every((l) => l.trim().startsWith("--") || !l.trim()));

for (const statement of statements) {
  try {
    await client.execute(statement);
  } catch (err) {
    const msg = String(err?.message || err);
    // Idempotent re-deploys: ignore already-exists
    if (/already exists|duplicate/i.test(msg)) {
      console.warn(`[prod-db-setup] skip (exists): ${msg.slice(0, 120)}`);
      continue;
    }
    console.error("[prod-db-setup] SQL failed:", statement.slice(0, 200));
    console.error(msg);
    process.exit(1);
  }
}

console.log(`[prod-db-setup] Applied ${statements.length} statements.`);
console.log("[prod-db-setup] Seeding…");
// seed.ts reads TURSO_* directly for the adapter
runInherit("npx", ["tsx", "prisma/seed.ts"], {
  ...process.env,
  // keep file: so any accidental Prisma CLI in seed path is happy
  DATABASE_URL: "file:./prisma/vercel-diff.db",
  TURSO_DATABASE_URL: tursoUrl,
  TURSO_AUTH_TOKEN: tursoToken,
});

console.log("[prod-db-setup] Done.");

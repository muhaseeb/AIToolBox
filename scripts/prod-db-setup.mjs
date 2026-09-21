/**
 * Vercel build-time Turso schema push + seed.
 * Uses TURSO_* env already configured on Vercel (browser agents cannot read secrets).
 *
 * - With TURSO_DATABASE_URL + TURSO_AUTH_TOKEN: sets DATABASE_URL with authToken, then
 *   runs `prisma db push` and `tsx prisma/seed.ts`.
 * - Without Turso env: on Vercel, exit 1; locally (VERCEL unset), skip and exit 0.
 */
import { spawnSync } from "child_process";

const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();
const onVercel = Boolean(process.env.VERCEL);

function run(cmd, args) {
  console.log(`[prod-db-setup] Running: ${cmd} ${args.join(" ")}`);
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    env: process.env,
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
    "[prod-db-setup] TURSO_DATABASE_URL / TURSO_AUTH_TOKEN not set — skipping db push + seed (local build)."
  );
  process.exit(0);
}

const sep = tursoUrl.includes("?") ? "&" : "?";
process.env.DATABASE_URL = `${tursoUrl}${sep}authToken=${tursoToken}`;

console.log("[prod-db-setup] Pushing schema and seeding Turso…");
run("npx", ["prisma", "db", "push"]);
run("npx", ["tsx", "prisma/seed.ts"]);
console.log("[prod-db-setup] Done.");

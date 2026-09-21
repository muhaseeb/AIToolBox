# AIToolBox

Production-style AI tools discovery & comparison directory.

**Discovery / comparison / navigation only** — we do not host third-party AI services. Every external CTA opens the official website in a new tab and is labeled as such.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- SQLite via Prisma (zero external services for v1)
- LocalStorage for save/compare; demo auth stubs
- Password-gated admin CRUD + pricing verification queue
- Scheduled catalog update job (link health + stale pricing flags + curated JSON deltas)

## Quick start

```bash
cd /workspace/AIToolBox
npm install
npm run db:setup    # generate client, push schema, seed ≥50 tools
npm run dev         # http://localhost:3000
```

### Admin

- URL: `/admin`
- Password: value of `ADMIN_PASSWORD` in `.env` (default `admin123`)

### Auth (demo)

- `/login` works without real OAuth keys (`DEMO_AUTH=true`)
- To enable Google OAuth later: set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env` and wire a NextAuth (or similar) provider — stubs are documented in the login UI

## Seed data

`prisma/data/tools.json` ships **70** curated tools across chat, video, image, voice, music, coding, search, productivity, agents, open-source and local AI.

Pricing rules:

- Values come from the database only
- UI shows last verified date (Sep 2026) and “Prices may change”
- If unverified / missing → **Pricing unavailable — check official site**
- Open-source fields are separate: `openSource`, `openWeights`, `sourceAvailable`, `selfHostable`, `license`, `commercialUse`

## Auto-update architecture (catalog freshness)

The live site keeps tools/pricing **verification** fresh without inventing data.

### Data sources

| Source | What it does |
|--------|----------------|
| **Manual admin** | Existing `/admin` CRUD + “Mark verified” — source of truth for pricing edits |
| **Scheduled job** | Flags stale `lastVerified` (>30 days) into the Pricing Verification Queue; checks official URL link health (HTTP status only) |
| **Curated JSON deltas** | Optional files in `prisma/updates/*.json` — merge by `slug`; never overwrite verified pricing with empty/guessed values |

**Never** scrape HTML to invent pricing, features, licensing, or open-source status. Link checks are HEAD/GET status only. If pricing cannot be verified from structured known fields → `needs_verification` / “Pricing unavailable — check official site”.

### `CRON_SECRET`

Protects `GET|POST /api/cron/update-tools`.

Send either:

```bash
Authorization: Bearer <CRON_SECRET>
# or
x-cron-secret: <CRON_SECRET>
```

Local example:

```bash
curl -X POST http://localhost:3000/api/cron/update-tools \
  -H "Authorization: Bearer $CRON_SECRET"
```

Optional query flags: `skipLinkHealth=1`, `skipStalePricing=1`, `skipSeedDelta=1`, `linkBatchSize=10`, `staleDays=30`.

Set `CRON_SECRET` in `.env` (see `.env.example`). In production, omit `ALLOW_INSECURE_CRON`. For local testing without a secret, you may set `ALLOW_INSECURE_CRON=true` (dev only).

Job summaries are stored in the `CronRun` table (links checked, broken, stale flagged, seed merges).

### Adding update JSON files

1. Create `prisma/updates/<name>.json` (see `prisma/updates/README.md`).
2. Include only fields you have verified. New tools need `slug`, `name`, `company`, `category`, `shortDescription`, `officialUrl`, `pricingType`.
3. Deploy / restart so the next cron run (or a manual curl) merges by slug.
4. Review items in `/admin` → Pricing verification queue (`needsReview` / `verificationStatus`).

### Vercel cron

`vercel.json` schedules a daily job:

```json
{
  "crons": [
    {
      "path": "/api/cron/update-tools",
      "schedule": "0 6 * * *"
    }
  ]
}
```

On Vercel (Pro+ for crons): set `CRON_SECRET` in project env. Vercel sends `Authorization: Bearer <CRON_SECRET>` on cron invocations. Schedule is **06:00 UTC** daily (`0 6 * * *`).

Schema fields used by the job: `verificationStatus`, `verifiedAt`, `verifiedBy`, `pricingSourceUrl`, `needsReview`, `reviewReason`, `urlStatus`, `urlLastChecked`, `httpStatus`, plus `CronRun` logs.

## Main routes

| Route | Purpose |
|-------|---------|
| `/` | Home — hero, search, trending/featured/free/open-source |
| `/discover` | Search + filters |
| `/categories`, `/categories/[slug]` | Category browse |
| `/tools/[slug]` | Tool detail |
| `/compare` | Compare ≤4 tools (no overall winner) |
| `/open-source` | Open-source hub with license distinctions |
| `/trending` | Editorial trending + recently added/updated |
| `/platforms`, `/platforms/[platform]` | By platform + local |
| `/collections`, `/collections/[slug]` | Curated lists |
| `/pricing` | Pricing directory |
| `/saved` | Saved tools (localStorage) |
| `/submit` | Submit a tool |
| `/login` | Demo auth |
| `/admin`, `/admin/tools` | Admin dashboard + CRUD |

## API (extension-ready)

- `GET /api/tools` — search / fetch by slugs
- `POST /api/newsletter` — email capture
- `POST /api/submit` — tool submissions
- `POST /api/reports` — outdated pricing reports
- `POST /api/admin/login`, `GET /api/admin/stats`, `CRUD /api/admin/tools`
- `GET|POST /api/cron/update-tools` — protected catalog update job (`CRON_SECRET`)

## Environment

Copy `.env.example` → `.env`:

```
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="admin123"
NEXTAUTH_URL="http://localhost:3000"
DEMO_AUTH="true"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
CRON_SECRET=
ALLOW_INSECURE_CRON="false"
```

## Product rules (enforced in UI)

- External CTAs → official site, new tab, “Official website”
- No invented pricing / licensing / platforms
- No overall compare “winner”
- No fake “most used” claims on trending

## License

MIT (application code). Third-party product names/logos belong to their owners.

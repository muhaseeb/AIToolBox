# Catalog update seed deltas

Drop curated JSON files here (e.g. `2026-09-21-new-tools.json`). The daily cron job merges them by `slug`.

## Rules

- Only include **structured, known** fields you have verified yourself.
- **Never** invent pricing, licensing, or open-source status.
- Empty / omitted pricing fields do **not** overwrite existing verified pricing.
- New tools require at least: `slug`, `name`, `company`, `category`, `shortDescription`, `officialUrl`, `pricingType`.
- Set `"needsVerification": true` when pricing is unknown → status becomes `needs_verification` / queue item.

## Shape

```json
{
  "tools": [
    {
      "slug": "example-ai",
      "name": "Example AI",
      "company": "Example Inc",
      "category": "chat",
      "shortDescription": "Short blurb",
      "description": "Longer description",
      "officialUrl": "https://example.com",
      "pricingUrl": "https://example.com/pricing",
      "pricingType": "FREEMIUM",
      "startingPrice": 20,
      "freePlan": true,
      "needsVerification": false
    }
  ]
}
```

Or a bare array of tool objects.

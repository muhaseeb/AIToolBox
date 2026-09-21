import { PrismaClient } from "@prisma/client";
import { createClient } from "@libsql/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { seedDatabase } from "../src/lib/seed-database";

function createSeedPrismaClient(): PrismaClient {
  const tursoUrl =
    process.env.TURSO_DATABASE_URL ||
    (process.env.DATABASE_URL?.startsWith("libsql:") ? process.env.DATABASE_URL : undefined);
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl && tursoToken) {
    // Strip authToken query if present — createClient takes authToken separately
    const url = tursoUrl.replace(/[?&]authToken=[^&]*/g, "").replace(/\?$/, "");
    const libsql = createClient({ url, authToken: tursoToken });
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({ adapter });
  }

  // Local default: SQLite via DATABASE_URL="file:./dev.db"
  return new PrismaClient();
}

async function main() {
  const prisma = createSeedPrismaClient();
  try {
    await seedDatabase(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

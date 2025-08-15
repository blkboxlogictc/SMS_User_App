import type { Config } from "drizzle-kit";

export default {
  schema: "./shared/schema-postgres.ts",
  out: "./drizzle/postgres",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
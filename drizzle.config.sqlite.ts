import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations-sqlite",
  schema: "./shared/schema-sqlite.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: "./dev.db",
  },
});
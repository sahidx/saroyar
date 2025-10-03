import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Please set it in your environment variables.");
}

// Only support PostgreSQL for production
if (!process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.startsWith('postgres://')) {
  throw new Error("Only PostgreSQL databases are supported. DATABASE_URL must start with 'postgresql://' or 'postgres://'");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});

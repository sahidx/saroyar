import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load environment variables from .env file
config();

// If still not found, try to provide helpful error message
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is required but not found!");
  console.error("");
  console.error("Solutions:");
  console.error("1. Run: npm run vps:env-setup");
  console.error("2. Create .env file with: DATABASE_URL=postgresql://user:pass@host:5432/db");
  console.error("3. Export in shell: export DATABASE_URL='postgresql://user:pass@host:5432/db'");
  console.error("");
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

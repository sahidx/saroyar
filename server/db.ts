import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// PostgreSQL-only Database Configuration for VPS Production
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/saroyar_dev";

// Validate DATABASE_URL format
if (!DATABASE_URL.startsWith("postgresql://") && !DATABASE_URL.startsWith("postgres://")) {
  throw new Error("DATABASE_URL must be a PostgreSQL connection string (postgresql://...)");
}

console.log("🐘 Connecting to PostgreSQL database...");

// Initialize PostgreSQL connection
const client = postgres(DATABASE_URL, {
  // Connection pool options for production
  max: 20,                    // Maximum number of connections
  idle_timeout: 20,           // Close idle connections after 20 seconds
  connect_timeout: 10,        // Connection timeout in seconds
  prepare: false,             // Disable prepared statements for compatibility
});

// Initialize Drizzle ORM with PostgreSQL
const db = drizzle(client, { schema });

// Test connection function
export async function testConnection() {
  try {
    await client`SELECT 1`;
    console.log("✅ PostgreSQL database connection successful");
    return true;
  } catch (error) {
    console.error("❌ PostgreSQL database connection failed:", error);
    throw error;
  }
}

// Graceful shutdown function
export async function closeConnection() {
  try {
    await client.end();
    console.log("✅ PostgreSQL connection closed gracefully");
  } catch (error) {
    console.error("❌ Error closing PostgreSQL connection:", error);
  }
}

export { db };
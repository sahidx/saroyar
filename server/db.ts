import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

const DATABASE_URL = process.env.DATABASE_URL!;

console.log("🐘 Connecting to PostgreSQL...");

const client = postgres(DATABASE_URL, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
});

const db = drizzle(client, { schema });

export async function initializeDatabase() {
  try {
    console.log("🔄 Initializing database tables...");
    
    await client.unsafe(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "firstName" varchar(255) NOT NULL,
        "lastName" varchar(255) NOT NULL,
        phone varchar(20) UNIQUE,
        email varchar(255) UNIQUE,
        password varchar(255),
        role varchar(50) DEFAULT 'student',
        "batchId" uuid,
        class varchar(20),
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS batches (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(255) NOT NULL,
        subject varchar(100) NOT NULL,
        "batchCode" varchar(20) UNIQUE NOT NULL,
        password varchar(20) NOT NULL,
        "maxStudents" integer DEFAULT 50,
        "currentStudents" integer DEFAULT 0,
        "startDate" timestamp,
        "endDate" timestamp,
        status varchar(20) DEFAULT 'active',
        "createdBy" uuid NOT NULL,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now()
      );
    `);
    
    console.log("✅ Database tables created successfully");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}

export { db };

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
    console.log("🔄 Initializing database tables and enums...");
    
    // Create all necessary enums and extensions
    await client.unsafe(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
      -- Create all enum types if they don't exist
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM('teacher', 'student', 'super_user');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      
      DO $$ BEGIN
        CREATE TYPE subject AS ENUM('math', 'higher_math', 'science');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      
      DO $$ BEGIN
        CREATE TYPE batch_status AS ENUM('active', 'inactive', 'completed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      
      DO $$ BEGIN
        CREATE TYPE attendance_status AS ENUM('present', 'excused', 'absent');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      
      DO $$ BEGIN
        CREATE TYPE payment_status AS ENUM('pending', 'completed', 'failed', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      
      DO $$ BEGIN
        CREATE TYPE sms_type AS ENUM('attendance', 'exam_result', 'exam_notification', 'notice', 'reminder');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      
      DO $$ BEGIN
        CREATE TYPE note_type AS ENUM('pdf', 'google_drive', 'link', 'text');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      
      DO $$ BEGIN
        CREATE TYPE api_key_status AS ENUM('active', 'quota_exceeded', 'error', 'disabled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      
      DO $$ BEGIN
        CREATE TYPE trigger_type AS ENUM('monthly_exam', 'attendance_reminder', 'exam_notification', 'custom_schedule');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      
      DO $$ BEGIN
        CREATE TYPE target_audience AS ENUM('students', 'parents', 'both');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      
      DO $$ BEGIN
        CREATE TYPE execution_status AS ENUM('pending', 'in_progress', 'completed', 'failed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log("✅ Database enums created successfully");
    
    // Note: Actual table creation will be handled by drizzle migrations
    // This ensures we have all the necessary enums available
    
    console.log("✅ Database initialization completed successfully");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}

export { db };

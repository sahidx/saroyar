/**
 * Database Setup and Migration Script for VPS Deployment
 * This script ensures the database is properly initialized and migrated
 * when deploying to any VPS environment.
 */

import { execSync } from 'child_process';
import { db } from './db';
import { sql } from 'drizzle-orm';
import { 
  users, 
  batches, 
  exams, 
  questions, 
  examSubmissions, 
  messages, 
  notices, 
  attendance, 
  smsLogs, 
  smsTransactions, 
  activityLogs, 
  notes, 
  courses, 
  teacherProfiles,
  onlineExamQuestions,
  questionBank,
  academicCalendar,
  monthlyCalendarSummary,
  gradingSchemes,
  studentFees,
  batchFeeSettings,
  monthlyResults,
  praggoAIKeys,
  smsTemplates
} from '@shared/schema';

export class DatabaseSetup {
  private static isInitialized = false;

  /**
   * Main setup function that should be called on server startup
   */
  public static async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('📊 Database already initialized, skipping...');
      return;
    }

    console.log('🚀 Starting database initialization for VPS deployment...');

    try {
      // Step 1: Validate connection
      await this.validateConnection();

      // Step 2: Check if schema exists
      await this.checkAndCreateSchema();

      // Step 3: Run migrations
      await this.runMigrations();

      // Step 4: Verify tables
      await this.verifyTablesExist();

      // Step 5: Seed data if needed
      await this.seedIfEmpty();

      this.isInitialized = true;
      console.log('✅ Database initialization completed successfully!');

    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw new Error(`Database setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate database connection
   */
  private static async validateConnection(): Promise<void> {
    console.log('🔍 Validating database connection...');
    
    try {
      // Simple health check by running a basic query
      await db.execute(sql`SELECT 1 as health_check`);
      console.log('✅ Database connection validated');
    } catch (error) {
      throw new Error(`Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check and create schema if needed
   */
  private static async checkAndCreateSchema(): Promise<void> {
    console.log('🔍 Checking database schema...');
    
    try {
      // Ensure all required enums exist
      await db.execute(sql`
        DO $$ BEGIN
          CREATE TYPE IF NOT EXISTS user_role AS ENUM('teacher', 'student', 'super_user');
          CREATE TYPE IF NOT EXISTS subject AS ENUM('math', 'higher_math', 'science');
          CREATE TYPE IF NOT EXISTS batch_status AS ENUM('active', 'inactive', 'completed');
          CREATE TYPE IF NOT EXISTS attendance_status AS ENUM('present', 'excused', 'absent');
          CREATE TYPE IF NOT EXISTS payment_status AS ENUM('pending', 'completed', 'failed', 'cancelled');
          CREATE TYPE IF NOT EXISTS sms_type AS ENUM('attendance', 'exam_result', 'exam_notification', 'notice', 'reminder');
          CREATE TYPE IF NOT EXISTS note_type AS ENUM('pdf', 'google_drive', 'link', 'text');
          CREATE TYPE IF NOT EXISTS api_key_status AS ENUM('active', 'quota_exceeded', 'error', 'disabled');
          CREATE TYPE IF NOT EXISTS trigger_type AS ENUM('monthly_exam', 'attendance_reminder', 'exam_notification', 'custom_schedule');
          CREATE TYPE IF NOT EXISTS target_audience AS ENUM('students', 'parents', 'both');
          CREATE TYPE IF NOT EXISTS execution_status AS ENUM('pending', 'in_progress', 'completed', 'failed');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);
      
      console.log('✅ Database enums verified/created');
    } catch (error) {
      console.error('❌ Schema creation failed:', error);
      throw error;
    }
  }

  /**
   * Run database migrations using Drizzle
   */
  private static async runMigrations(): Promise<void> {
    console.log('🔄 Running database migrations...');
    
    // Ensure DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required for migrations');
    }
    
    try {
      // Use drizzle-kit to apply migrations
      const command = 'npx drizzle-kit migrate';
      
      console.log(`Executing: ${command}`);
      console.log(`Using DATABASE_URL: ${process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@')}`);
      
      const result = execSync(command, { 
        stdio: 'pipe',
        cwd: process.cwd(),
        timeout: 120000, // 2 minute timeout
        env: {
          ...process.env,
          DATABASE_URL: process.env.DATABASE_URL
        }
      });
      
      console.log('Migration output:', result.toString());
      console.log('✅ Migrations completed successfully');
      
    } catch (error: any) {
      console.error('❌ Migration failed:', error);
      
      // Try drizzle-kit push as fallback
      try {
        console.log('🔄 Attempting schema push as fallback...');
        const pushCommand = 'npx drizzle-kit push';
        
        const pushResult = execSync(pushCommand, { 
          stdio: 'pipe',
          cwd: process.cwd(),
          timeout: 120000,
          env: {
            ...process.env,
            DATABASE_URL: process.env.DATABASE_URL
          }
        });
        
        console.log('Push output:', pushResult.toString());
        console.log('✅ Schema push succeeded');
      } catch (pushError: any) {
        throw new Error(`Migration failed: ${error.message}. Push also failed: ${pushError.message}`);
      }
    }
  }  /**
   * Verify all required tables exist
   */
  private static async verifyTablesExist(): Promise<void> {
    console.log('🔍 Verifying database tables...');
    
    const tableChecks = [
      { name: 'users', table: users },
      { name: 'batches', table: batches },
      { name: 'exams', table: exams },
      { name: 'questions', table: questions },
      { name: 'exam_submissions', table: examSubmissions },
      { name: 'messages', table: messages },
      { name: 'notices', table: notices },
      { name: 'attendance', table: attendance },
      { name: 'sms_logs', table: smsLogs },
      { name: 'sms_transactions', table: smsTransactions },
      { name: 'activity_logs', table: activityLogs },
      { name: 'notes', table: notes },
      { name: 'courses', table: courses },
      { name: 'teacher_profiles', table: teacherProfiles },
      { name: 'online_exam_questions', table: onlineExamQuestions },
      { name: 'question_bank', table: questionBank },
      { name: 'academic_calendar', table: academicCalendar },
      { name: 'monthly_calendar_summary', table: monthlyCalendarSummary },
      { name: 'grading_schemes', table: gradingSchemes },
      { name: 'student_fees', table: studentFees },
      { name: 'batch_fee_settings', table: batchFeeSettings },
      { name: 'monthly_results', table: monthlyResults },
      { name: 'praggo_ai_keys', table: praggoAIKeys },
      { name: 'sms_templates', table: smsTemplates }
    ];

    let successCount = 0;
    for (const { name, table } of tableChecks) {
      try {
        await db.select().from(table).limit(1);
        console.log(`✅ Table ${name} exists and accessible`);
        successCount++;
      } catch (error) {
        console.log(`⚠️  Table ${name} may not exist yet - will be created on first use`);
      }
    }

    console.log(`✅ Verified ${successCount}/${tableChecks.length} tables`);
  }

  /**
   * Seed initial data if database is empty
   */
  private static async seedIfEmpty(): Promise<void> {
    console.log('🌱 Checking if seeding is needed...');
    
    try {
      // Run compatibility fixes first
      const { fixDatabaseCompatibility, validateSchemaConsistency } = await import('./schema-fixes');
      await fixDatabaseCompatibility();
      
      // Validate schema consistency
      try {
        await validateSchemaConsistency();
      } catch (validationError) {
        console.warn('⚠️  Schema validation warnings (non-fatal):', validationError);
      }
      
      // Check if admin user exists
      const existingUsers = await db.select().from(users).limit(1);
      
      if (existingUsers.length === 0) {
        console.log('📝 Creating initial admin user...');
        await this.createInitialAdminUser();
      }

      // Check if default grading scheme exists
      const existingGradingSchemes = await db.select().from(gradingSchemes).limit(1);
      
      if (existingGradingSchemes.length === 0) {
        console.log('📝 Creating default grading scheme...');
        await this.createDefaultGradingScheme();
      }

      console.log('✅ Database seeding completed');
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      // Don't throw error, seeding is optional
    }
  }

  /**
   * Create initial admin user
   */
  private static async createInitialAdminUser(): Promise<void> {
    try {
      const adminUser = {
        firstName: 'Admin',
        lastName: 'Teacher',
        email: 'admin@saroyar.com',
        phoneNumber: '01700000000',
        role: 'teacher' as const,
        username: 'admin',
        password: 'admin123', // Should be changed after first login
        smsCredits: 100,
        isActive: true,
      };

      const [newUser] = await db.insert(users).values(adminUser).returning();
      console.log(`✅ Created admin user: ${newUser.firstName} ${newUser.lastName}`);
      
      // Log this activity
      await db.insert(activityLogs).values({
        type: 'system_setup',
        message: 'Initial admin user created during database setup',
        icon: '👨‍💼',
        userId: newUser.id,
      });
    } catch (error) {
      console.error('❌ Failed to create admin user:', error);
    }
  }

  /**
   * Create default grading scheme
   */
  private static async createDefaultGradingScheme(): Promise<void> {
    try {
      const defaultGradingScheme = {
        name: 'Bangladesh Standard Grading',
        description: 'Standard grading system used in Bangladesh educational institutions',
        gradeRanges: [
          { letter: 'A+', minPercent: 80, maxPercent: 100, gpa: 5.0, color: '#10B981' },
          { letter: 'A', minPercent: 70, maxPercent: 79, gpa: 4.0, color: '#059669' },
          { letter: 'A-', minPercent: 60, maxPercent: 69, gpa: 3.5, color: '#047857' },
          { letter: 'B', minPercent: 50, maxPercent: 59, gpa: 3.0, color: '#F59E0B' },
          { letter: 'C', minPercent: 40, maxPercent: 49, gpa: 2.0, color: '#D97706' },
          { letter: 'D', minPercent: 33, maxPercent: 39, gpa: 1.0, color: '#EF4444' },
          { letter: 'F', minPercent: 0, maxPercent: 32, gpa: 0.0, color: '#DC2626' }
        ],
        isActive: true,
        isDefault: true,
        createdBy: 'system',
      };

      await db.insert(gradingSchemes).values(defaultGradingScheme);
      console.log('✅ Created default grading scheme');
    } catch (error) {
      console.error('❌ Failed to create default grading scheme:', error);
    }
  }



  /**
   * Get database information for monitoring
   */
  public static async getDatabaseInfo(): Promise<any> {
    try {
      const [version, tables, size] = await Promise.all([
        db.execute(sql`SELECT version()`),
        db.execute(sql`
          SELECT table_name, table_rows 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `),
        db.execute(sql`
          SELECT pg_size_pretty(pg_database_size(current_database())) as size
        `)
      ]);

      return {
        version: version.rows?.[0] || version[0],
        tables: tables.rows || tables,
        size: size.rows?.[0] || size[0],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Backup database (for VPS environments with pg_dump)
   */
  public static async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `backup-${timestamp}.sql`;
    
    try {
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        throw new Error('DATABASE_URL not available for backup');
      }
      
      execSync(`pg_dump "${dbUrl}" > ${backupFile}`, {
        stdio: 'pipe',
        timeout: 300000 // 5 minute timeout
      });
      
      console.log(`✅ Database backup created: ${backupFile}`);
      return backupFile;
      
    } catch (error) {
      throw new Error(`Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export utilities for external use
export const {
  initialize: initializeDatabase,
  getDatabaseInfo,
  createBackup: backupDatabase
} = DatabaseSetup;
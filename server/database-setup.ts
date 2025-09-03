/**
 * Database Setup and Migration Script for VPS Deployment
 * This script ensures the database is properly initialized and migrated
 * when deploying to any VPS environment.
 */

import { execSync } from 'child_process';
import { db, dbHealthCheck } from './db';
import { sql } from 'drizzle-orm';

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
    
    const health = await dbHealthCheck();
    if (health.status !== 'healthy') {
      throw new Error(`Database health check failed: ${JSON.stringify(health.details)}`);
    }
    
    console.log('✅ Database connection validated');
  }

  /**
   * Check if schema exists and create if necessary
   */
  private static async checkAndCreateSchema(): Promise<void> {
    console.log('🔧 Checking database schema...');
    
    try {
      // Check if essential tables exist
      const result = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        )
      `);
      
      const tablesExist = result.rows?.[0]?.exists || result[0]?.exists;
      
      if (!tablesExist) {
        console.log('📋 No existing schema found, will create new schema');
      } else {
        console.log('✅ Existing schema detected');
      }
      
    } catch (error) {
      console.log('⚠️  Schema check failed, proceeding with migration:', error);
    }
  }

  /**
   * Run database migrations using Drizzle
   */
  private static async runMigrations(): Promise<void> {
    console.log('🔄 Running database migrations...');
    
    try {
      // Use drizzle-kit to push schema changes
      const command = process.env.NODE_ENV === 'production' 
        ? 'npm run db:push --force'
        : 'npm run db:push';
      
      console.log(`Executing: ${command}`);
      execSync(command, { 
        stdio: 'pipe',
        cwd: process.cwd(),
        timeout: 60000 // 60 second timeout
      });
      
      console.log('✅ Migrations completed successfully');
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      
      // Try force push as fallback
      try {
        console.log('🔄 Attempting force migration...');
        execSync('npm run db:push --force', { 
          stdio: 'pipe',
          cwd: process.cwd(),
          timeout: 60000
        });
        console.log('✅ Force migration succeeded');
      } catch (forceError) {
        throw new Error(`Both normal and force migrations failed: ${forceError}`);
      }
    }
  }

  /**
   * Verify essential tables exist
   */
  private static async verifyTablesExist(): Promise<void> {
    console.log('🔍 Verifying essential tables exist...');
    
    const essentialTables = [
      'users', 'batches', 'exams', 'questions', 'attendance', 
      'messages', 'notices', 'sms_transactions', 'activity_logs'
    ];
    
    for (const tableName of essentialTables) {
      try {
        const result = await db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ${tableName}
          )
        `);
        
        const exists = result.rows?.[0]?.exists || result[0]?.exists;
        
        if (!exists) {
          throw new Error(`Essential table '${tableName}' does not exist`);
        }
        
        console.log(`  ✅ Table '${tableName}' verified`);
        
      } catch (error) {
        throw new Error(`Table verification failed for '${tableName}': ${error}`);
      }
    }
    
    console.log('✅ All essential tables verified');
  }

  /**
   * Seed database with initial data if empty
   */
  private static async seedIfEmpty(): Promise<void> {
    console.log('🌱 Checking if database needs seeding...');
    
    try {
      // Check if users table has any data
      const userCount = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
      const count = parseInt(userCount.rows?.[0]?.count || userCount[0]?.count || '0');
      
      if (count === 0) {
        console.log('📦 Database is empty, running seeding...');
        
        // Dynamic import to avoid circular dependencies
        const { seedDatabase } = await import('./seedData');
        await seedDatabase();
        
        console.log('✅ Database seeding completed');
      } else {
        console.log(`✅ Database already has ${count} users, skipping seeding`);
      }
      
    } catch (error) {
      console.warn('⚠️  Seeding check failed, but continuing:', error);
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
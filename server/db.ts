import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Environment validation
class DatabaseConfig {
  private static instance: DatabaseConfig;
  private _pool: Pool | null = null;
  private _db: any = null;
  
  private constructor() {
    this.validateEnvironment();
    this.initializeConnection();
  }
  
  public static getInstance(): DatabaseConfig {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new DatabaseConfig();
    }
    return DatabaseConfig.instance;
  }
  
  private validateEnvironment(): void {
    const requiredVars = ['DATABASE_URL'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}\n` +
        'Please ensure your database is properly configured and environment variables are set.'
      );
    }
    
    // Validate DATABASE_URL format
    const dbUrl = process.env.DATABASE_URL!;
    if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
      throw new Error(
        'DATABASE_URL must be a valid PostgreSQL connection string starting with postgresql:// or postgres://'
      );
    }
    
    console.log('✅ Database environment validation passed');
  }
  
  private initializeConnection(): void {
    try {
      // Configure Neon for serverless environments
      neonConfig.webSocketConstructor = ws;
      
      // Parse connection string to get connection details
      const dbUrl = new URL(process.env.DATABASE_URL!);
      
      // Create connection pool with optimized settings for VPS deployment
      this._pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        // Connection pool settings for VPS environments
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
        maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
      });
      
      // Initialize Drizzle ORM with schema
      this._db = drizzle({ client: this._pool, schema });
      
      console.log(`✅ Database connection initialized for host: ${dbUrl.hostname}`);
      
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw new Error(
        `Failed to initialize database connection: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  
  public get pool(): Pool {
    if (!this._pool) {
      throw new Error('Database pool not initialized');
    }
    return this._pool;
  }
  
  public get db(): any {
    if (!this._db) {
      throw new Error('Database client not initialized');
    }
    return this._db;
  }
  
  // Health check method for VPS monitoring
  public async healthCheck(): Promise<{ status: string; timestamp: string; details?: any }> {
    try {
      const result = await this._db.execute('SELECT 1 as health_check');
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        details: {
          connected: true,
          result: result.rows?.[0] || result[0]
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
  
  // Graceful shutdown for VPS deployment
  public async close(): Promise<void> {
    try {
      if (this._pool) {
        await this._pool.end();
        console.log('✅ Database connection pool closed gracefully');
      }
    } catch (error) {
      console.error('❌ Error closing database connection:', error);
    }
  }
}

// Export singleton instance
const dbConfig = DatabaseConfig.getInstance();
export const pool = dbConfig.pool;
export const db = dbConfig.db;
export const dbHealthCheck = dbConfig.healthCheck.bind(dbConfig);
export const closeDatabase = dbConfig.close.bind(dbConfig);

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Received SIGINT, closing database connections...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Received SIGTERM, closing database connections...');
  await closeDatabase();
  process.exit(0);
});
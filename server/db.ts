import pg from 'pg';
const { Pool } = pg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as pgSchema from "@shared/schema";

// PostgreSQL-only Database Configuration for VPS Production
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
        'Please ensure your PostgreSQL database is properly configured and DATABASE_URL is set.'
      );
    }
    
    // Validate PostgreSQL URL
    const dbUrl = process.env.DATABASE_URL!;
    if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
      throw new Error(
        'DATABASE_URL must be a valid PostgreSQL connection string (postgresql://... or postgres://...)'
      );
    }
    
    console.log('✅ PostgreSQL environment validation passed');
  }
  
  private initializeConnection(): void {
    try {
      const dbUrl = process.env.DATABASE_URL!;
      
      // PostgreSQL connection with production-ready configuration
      this._pool = new Pool({
        connectionString: dbUrl,
        max: 20,                      // Maximum number of connections in pool
        idleTimeoutMillis: 30000,     // Close idle connections after 30s
        connectionTimeoutMillis: 2000, // Timeout for new connections
        maxUses: 7500,                // Maximum uses per connection
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      
      this._db = drizzle(this._pool, { schema: pgSchema });
      
      const parsedUrl = new URL(dbUrl);
      console.log(`✅ PostgreSQL connection initialized for host: ${parsedUrl.hostname}`);
      
    } catch (error) {
      console.error('❌ PostgreSQL initialization failed:', error);
      throw new Error(
        `Failed to initialize PostgreSQL connection: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  
  public get pool(): Pool {
    if (!this._pool) {
      throw new Error('PostgreSQL pool not initialized');
    }
    return this._pool;
  }
  
  public get db(): any {
    if (!this._db) {
      throw new Error('PostgreSQL database client not initialized');
    }
    return this._db;
  }
  
  // Health check method for VPS monitoring
  public async healthCheck(): Promise<{ status: string; timestamp: string; details?: any }> {
    try {
      const result = await this._db.execute('SELECT 1 as health_check, gen_random_uuid() as uuid_test');
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        details: {
          connected: true,
          uuid_function_available: true,
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
        console.log('✅ PostgreSQL connection pool closed gracefully');
      }
    } catch (error) {
      console.error('❌ Error closing PostgreSQL pool:', error);
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
  console.log('🔄 Received SIGINT, closing PostgreSQL connections...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Received SIGTERM, closing PostgreSQL connections...');
  await closeDatabase();
  process.exit(0);
});
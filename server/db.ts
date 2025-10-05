import pg from 'pg'; 
const { Pool } = pg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Production PostgreSQL-only Database Configuration
class DatabaseConfig {
  private static instance: DatabaseConfig;
  private _pool: typeof Pool.prototype | null = null;
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
        'Please set DATABASE_URL to your PostgreSQL connection string.'
      );
    }
    
    // Check database type - PostgreSQL only
    const dbUrl = process.env.DATABASE_URL!;
    if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
      throw new Error(
        'Only PostgreSQL is supported. DATABASE_URL must be a valid PostgreSQL connection string (postgresql://...)'
      );
    }
    
    console.log('✅ Production PostgreSQL environment validated');
  }
  
  private initializeConnection(): void {
    try {
      const dbUrl = process.env.DATABASE_URL!;
      const parsedUrl = new URL(dbUrl);
      
      // Production PostgreSQL connection with optimized settings
      this._pool = new Pool({
        connectionString: dbUrl,
        max: parseInt(process.env.DB_POOL_MAX || '20'),
        min: parseInt(process.env.DB_POOL_MIN || '5'),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        maxUses: 7500,
        allowExitOnIdle: false
      });
      
      this._db = drizzle(this._pool, { schema });
      console.log(`✅ Production PostgreSQL initialized for: ${parsedUrl.hostname}:${parsedUrl.port || 5432}`);
      
      // Test connection
      this.testConnection();
      
    } catch (error) {
      console.error('❌ Failed to initialize PostgreSQL connection:', error);
      throw new Error('Database connection failed. Check your DATABASE_URL and network connectivity.');
    }
  }
  
  private async testConnection(): Promise<void> {
    try {
      if (this._pool) {
        const client = await this._pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        console.log('✅ PostgreSQL connection test successful');
      }
    } catch (error) {
      console.error('❌ PostgreSQL connection test failed:', error);
    }
  }
  
  public get pool(): any {
    if (!this._pool) {
      throw new Error('PostgreSQL pool not initialized. Check database configuration.');
    }
    return this._pool;
  }
  
  public get db(): any {
    if (!this._db) {
      throw new Error('Database connection not initialized. Check database configuration.');
    }
    return this._db;
  }
  
  public async healthCheck(): Promise<{ status: string; timestamp: string; details?: any }> {
    try {
      const client = await this._pool!.connect();
      const result = await client.query('SELECT NOW() as timestamp, version() as version');
      client.release();
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        details: {
          database: 'PostgreSQL',
          server_time: result.rows[0].timestamp,
          version: result.rows[0].version,
          pool_total: this._pool!.totalCount,
          pool_idle: this._pool!.idleCount,
          pool_waiting: this._pool!.waitingCount
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
  
  public async gracefulShutdown(): Promise<void> {
    try {
      console.log('🔄 Initiating graceful database shutdown...');
      
      if (this._pool) {
        await this._pool.end();
        console.log('✅ PostgreSQL pool closed successfully');
      }
      
      console.log('✅ Database shutdown completed');
    } catch (error) {
      console.error('❌ Error during database shutdown:', error);
    }
  }
}

// Initialize and export database instance
const dbConfig = DatabaseConfig.getInstance();
export const pool = dbConfig.pool;
export const db = dbConfig.db;

// Export utility functions
export const healthCheck = () => dbConfig.healthCheck();
export const gracefulShutdown = () => dbConfig.gracefulShutdown();

// Global error handlers for database connections
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, initiating graceful shutdown...');
  await gracefulShutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, initiating graceful shutdown...');
  await gracefulShutdown();
  process.exit(0);
});

// Default export
export default db;
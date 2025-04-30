import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create pool for Postgres connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create drizzle instance with our schema
export const db = drizzle(pool, { schema });

// Function to initialize the database by creating tables based on schema
export async function initializeDatabase() {
  try {
    const client = await pool.connect();
    
    try {
      // Check if tables exist before creating them
      const query = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = 'users'
        );
      `;
      
      const { rows } = await client.query(query);
      const tablesExist = rows[0].exists;
      
      if (!tablesExist) {
        console.log('Tables do not exist, creating schema...');
        
        // Create users table
        await client.query(`
          CREATE TABLE IF NOT EXISTS "users" (
            "id" SERIAL PRIMARY KEY,
            "name" TEXT,
            "email" TEXT NOT NULL,
            "password" TEXT,
            "image" TEXT,
            "email_verified" TIMESTAMP,
            "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
          );
          CREATE UNIQUE INDEX IF NOT EXISTS "email_idx" ON "users" ("email");
        `);
        
        // Create accounts table
        await client.query(`
          CREATE TABLE IF NOT EXISTS "accounts" (
            "id" SERIAL PRIMARY KEY,
            "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
            "type" TEXT NOT NULL,
            "provider" TEXT NOT NULL,
            "provider_account_id" TEXT NOT NULL,
            "refresh_token" TEXT,
            "access_token" TEXT,
            "expires_at" INTEGER,
            "token_type" TEXT,
            "scope" TEXT,
            "id_token" TEXT,
            "session_state" TEXT,
            "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
          );
          CREATE UNIQUE INDEX IF NOT EXISTS "provider_provider_account_id_idx" ON "accounts" ("provider", "provider_account_id");
        `);
        
        // Create configurations table
        await client.query(`
          CREATE TABLE IF NOT EXISTS "configurations" (
            "id" SERIAL PRIMARY KEY,
            "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
            "name" TEXT NOT NULL,
            "description" TEXT,
            "total_slots" INTEGER NOT NULL,
            "price_per_spin" INTEGER NOT NULL,
            "default_prize" INTEGER NOT NULL,
            "prize_configs" JSONB NOT NULL,
            "is_public" BOOLEAN DEFAULT FALSE,
            "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
          );
        `);
        
        // Create sessions table
        await client.query(`
          CREATE TABLE IF NOT EXISTS "sessions" (
            "id" SERIAL PRIMARY KEY,
            "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
            "session_token" TEXT NOT NULL,
            "expires" TIMESTAMP NOT NULL
          );
        `);
        
        // Create verification tokens table
        await client.query(`
          CREATE TABLE IF NOT EXISTS "verification_tokens" (
            "id" SERIAL PRIMARY KEY,
            "identifier" TEXT NOT NULL,
            "token" TEXT NOT NULL,
            "expires" TIMESTAMP NOT NULL
          );
          CREATE UNIQUE INDEX IF NOT EXISTS "identifier_token_idx" ON "verification_tokens" ("identifier", "token");
        `);
        
        console.log('Database schema created successfully');
      } else {
        console.log('Tables already exist, skipping schema creation');
      }
    } finally {
      client.release();
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';
import { Pool } from 'pg';
import ws from 'ws';

// Add WebSockets for edge compatibility
neonConfig.webSocketConstructor = ws as any;

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create pool and drizzle instance
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(neon(process.env.DATABASE_URL), { schema });

// Function to initialize the database by running migrations (if needed)
export async function initializeDatabase() {
  try {
    // Here we could add automated migrations when needed
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
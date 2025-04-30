import { initializeDatabase } from './index';

// Run the database initialization
export async function setupDatabase() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Failed to setup database:', error);
    process.exit(1);
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}
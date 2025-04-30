import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db/index';

// This is a simple endpoint to initialize the database
// It will be called once during development to ensure the database is set up
let initialized = false;

export async function GET() {
  try {
    if (!initialized) {
      console.log('Initializing database from API route...');
      await initializeDatabase();
      initialized = true;
      return NextResponse.json({ success: true, message: 'Database initialized successfully' });
    } else {
      return NextResponse.json({ success: true, message: 'Database already initialized' });
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
}
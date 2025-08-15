import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from '../shared/schema-postgres.js';

async function createSchema() {
  console.log('🔄 Creating Supabase schema...');
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("your_supabase")) {
    console.error("❌ Please set your actual Supabase DATABASE_URL in the .env file");
    console.log("You can find it in your Supabase project settings -> Database -> Connection string");
    process.exit(1);
  }
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  const db = drizzle(client, { schema });
  
  try {
    await client.connect();
    console.log('✅ Connected to Supabase database');
    
    // Create tables using raw SQL
    console.log('📦 Creating tables...');
    
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        first_name TEXT,
        last_name TEXT,
        profile_image_url TEXT,
        role TEXT NOT NULL DEFAULT 'general',
        business_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✓ Created users table');
    
    // Sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid TEXT PRIMARY KEY,
        sess TEXT NOT NULL,
        expire TIMESTAMP NOT NULL
      )
    `);
    console.log('   ✓ Created sessions table');
    
    // Businesses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS businesses (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        website TEXT,
        phone TEXT,
        address TEXT,
        latitude REAL,
        longitude REAL,
        hours TEXT,
        image_url TEXT,
        is_open BOOLEAN DEFAULT true,
        wait_time INTEGER,
        owner_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✓ Created businesses table');
    
    // Events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        date TIMESTAMP NOT NULL,
        location TEXT NOT NULL,
        image_url TEXT,
        organizer_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✓ Created events table');
    
    // Surveys table
    await client.query(`
      CREATE TABLE IF NOT EXISTS surveys (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        questions TEXT NOT NULL,
        reward_points INTEGER DEFAULT 0,
        business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✓ Created surveys table');
    
    // Promotions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS promotions (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        business_id INTEGER NOT NULL,
        code TEXT,
        discount TEXT,
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✓ Created promotions table');
    
    // Checkins table
    await client.query(`
      CREATE TABLE IF NOT EXISTS checkins (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        business_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✓ Created checkins table');
    
    // Event RSVPs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_rsvps (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        event_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✓ Created event_rsvps table');
    
    // Rewards table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rewards (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        points INTEGER NOT NULL DEFAULT 0,
        source TEXT NOT NULL,
        description TEXT,
        business_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✓ Created rewards table');
    
    // Survey responses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS survey_responses (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        survey_id INTEGER NOT NULL,
        responses TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✓ Created survey_responses table');
    
    console.log('🚀 Schema created successfully!');
    console.log('📊 Now you can run: npm run supabase:migrate');
    
  } catch (error) {
    console.error('❌ Schema creation failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

createSchema().catch(console.error);
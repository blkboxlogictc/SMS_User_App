import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import Database from 'better-sqlite3';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import * as schemaPostgres from "@shared/schema-postgres";
import * as schemaSqlite from "@shared/schema-sqlite";

let db: any;
let supabase: any = null;

if (!process.env.DATABASE_URL || process.env.DATABASE_URL === '') {
  console.log('No DATABASE_URL found, using SQLite for development...');
  console.log('To use PostgreSQL, set DATABASE_URL in your .env file');
  
  // Use SQLite for local development
  const sqlite = new Database('./dev.db');
  db = drizzleSqlite(sqlite, { schema: schemaSqlite });
} else {
  console.log('Using Supabase PostgreSQL database...');
  
  // Create Supabase client for server-side operations
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }
  
  // Use postgres-js for Drizzle ORM with Supabase
  const client = postgres(process.env.DATABASE_URL, {
    ssl: 'require',
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  
  db = drizzle(client, { schema: schemaPostgres });
}

export { db, supabase };
import Database from 'better-sqlite3';

// Create the new tables manually
function createTables() {
  try {
    const sqlite = new Database('./dev.db');
    
    console.log("Creating rewards table...");
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS rewards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        points INTEGER NOT NULL DEFAULT 0,
        source TEXT NOT NULL,
        description TEXT,
        business_id INTEGER,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    console.log("Creating surveys table...");
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS surveys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        questions TEXT,
        reward_points INTEGER NOT NULL DEFAULT 10,
        is_active INTEGER DEFAULT 1,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    console.log("Creating survey_responses table...");
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS survey_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        survey_id INTEGER NOT NULL,
        responses TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    sqlite.close();
    console.log("Tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
}

createTables();
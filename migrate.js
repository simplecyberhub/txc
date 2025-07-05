const { Pool } = require("pg");
const { drizzle } = require("drizzle-orm/node-postgres");
const { migrate } = require("drizzle-orm/node-postgres/migrator");
require("dotenv").config();

async function main() {
  console.log("Running migrations...");
  const pool = new Pool({
    host: process.env.DATABASE_HOST || "127.0.0.1",
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    database: process.env.DATABASE_NAME || "tradex_db",
    user: process.env.DATABASE_USER || "tradex_user",
    password: process.env.DATABASE_PASSWORD || "Tradexcapital@123",
    ssl: false,
  });

  const db = drizzle(pool);

  // This will create the schema from scratch
  try {
    const schema = require("./shared/schema");
    console.log("Loaded schema successfully");

    // Execute SQL queries for each table
    const createUserTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      first_name TEXT,
      last_name TEXT,
      is_verified BOOLEAN NOT NULL DEFAULT FALSE,
      is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
      is_admin BOOLEAN NOT NULL DEFAULT FALSE,
      verification_token TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`;

    await pool.query(createUserTable);
    console.log("Created users table");

    const createKycTable = `
    CREATE TABLE IF NOT EXISTS kyc (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      document_type TEXT NOT NULL,
      document_id TEXT NOT NULL,
      document_path TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      rejection_reason TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`;

    await pool.query(createKycTable);
    console.log("Created kyc table");

    // Add other tables here...

    console.log("All tables created successfully!");
  } catch (error) {
    console.error("Error during migration:", error);
  }

  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

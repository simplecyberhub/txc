import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './shared/schema';
import 'dotenv/config';

async function main() {
  console.log('Setting up database connection...');
  const pool = new Pool({
    host: process.env.DATABASE_HOST || '69.62.123.61',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME || 'tradex_db',
    user: process.env.DATABASE_USER || 'tradex_user',
    password: process.env.DATABASE_PASSWORD || 'Tradexcapital@123',
    ssl: false
  });

  try {
    // Test connection
    const client = await pool.connect();
    const result = await client.query('SELECT 1 as test');
    console.log('Database connection successful:', result.rows[0]);
    client.release();

    // Create tables using raw SQL
    console.log('Creating tables...');
    
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
    console.log('Users table created or already exists');
    
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
    console.log('KYC table created or already exists');
    
    const createWalletsTable = `
    CREATE TABLE IF NOT EXISTS wallets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      balance REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'USD',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`;
    
    await pool.query(createWalletsTable);
    console.log('Wallets table created or already exists');
    
    const createTransactionsTable = `
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'pending',
      asset_symbol TEXT,
      asset_type TEXT,
      leverage REAL,
      duration INTEGER NOT NULL DEFAULT 1,
      take_profit REAL,
      stop_loss REAL,
      margin REAL,
      order_type TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`;
    
    await pool.query(createTransactionsTable);
    console.log('Transactions table created or already exists');
    
    const createPortfolioTable = `
    CREATE TABLE IF NOT EXISTS portfolio (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      asset_symbol TEXT NOT NULL,
      asset_type TEXT NOT NULL,
      quantity REAL NOT NULL,
      average_price REAL NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`;
    
    await pool.query(createPortfolioTable);
    console.log('Portfolio table created or already exists');
    
    const createWatchlistTable = `
    CREATE TABLE IF NOT EXISTS watchlist (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      asset_symbol TEXT NOT NULL,
      asset_name TEXT NOT NULL,
      asset_type TEXT NOT NULL,
      exchange TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`;
    
    await pool.query(createWatchlistTable);
    console.log('Watchlist table created or already exists');
    
    const createContentsTable = `
    CREATE TABLE IF NOT EXISTS contents (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      type TEXT NOT NULL,
      is_published BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`;
    
    await pool.query(createContentsTable);
    console.log('Contents table created or already exists');
    
    const createSettingsTable = `
    CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      type TEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`;
    
    await pool.query(createSettingsTable);
    console.log('Settings table created or already exists');
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    await pool.end();
  }
}

main().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});

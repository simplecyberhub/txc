const { Pool } = require('pg');

// Print environment variables (only first few characters of DATABASE_URL for security)
const dbUrl = process.env.DATABASE_URL;
console.log('DATABASE_URL exists:', !!dbUrl);
if (dbUrl) {
  console.log('DATABASE_URL preview:', dbUrl.substring(0, 25) + '...');
}

const pool = new Pool({
  // Use environment variables directly
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Enable SSL
});

// Test the connection
pool.query('SELECT NOW() as current_time')
  .then(res => {
    console.log('Connection successful! Current time:', res.rows[0].current_time);
    pool.end();
  })
  .catch(err => {
    console.error('Connection error:', err.message);
    pool.end();
  });

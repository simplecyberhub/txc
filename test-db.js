const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  connectionTimeoutMillis: 5000
});

console.log('Attempting to connect to:', process.env.DATABASE_HOST);

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

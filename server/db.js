const { Pool } = require("pg");
require("dotenv").config();

// Hosted databases (Neon, Supabase, Render...) give a single connection
// string and require SSL. Locally we fall back to the separate DB_* variables.
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

module.exports = pool;

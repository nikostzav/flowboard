const fs = require("fs");
const path = require("path");
const pool = require("../db");

// One-off setup: loads schema.sql and seed.sql into an empty database.
// Safe to run on every start: it does nothing if the tables already exist.
(async () => {
  try {
    const check = await pool.query("SELECT to_regclass('public.users') AS t");
    if (check.rows[0].t) {
      console.log("Database already initialised, skipping.");
      return;
    }
    for (const file of ["schema.sql", "seed.sql"]) {
      await pool.query(fs.readFileSync(path.join(__dirname, file), "utf8"));
    }
    console.log("Database initialised from schema.sql and seed.sql");
  } catch (err) {
    console.error("DB init failed:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();

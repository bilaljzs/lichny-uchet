const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set — point it at your Supabase/Postgres connection string");
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
});

async function migrate() {
  await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      login TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      note TEXT DEFAULT '',
      position INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS subjects_user_id_idx ON subjects(user_id);

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      bank TEXT NOT NULL,
      balance DOUBLE PRECISION NOT NULL DEFAULT 0,
      card_id TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      status TEXT DEFAULT 'РАБОЧИЙ',
      position INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON accounts(user_id);
    CREATE INDEX IF NOT EXISTS accounts_subject_id_idx ON accounts(subject_id);

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      delta DOUBLE PRECISION NOT NULL,
      time TEXT NOT NULL,
      position INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);

    CREATE TABLE IF NOT EXISTS archive (
      id TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount DOUBLE PRECISION NOT NULL,
      buy DOUBLE PRECISION NOT NULL,
      sell DOUBLE PRECISION NOT NULL,
      result DOUBLE PRECISION NOT NULL,
      time TEXT NOT NULL,
      position INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS archive_user_id_idx ON archive(user_id);

    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      bank TEXT NOT NULL,
      holder_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      days INTEGER[] NOT NULL DEFAULT '{}',
      position INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS cards_user_id_idx ON cards(user_id);
  `);
}

const migrationReady = migrate().catch((err) => {
  console.error("Database migration failed:", err);
  process.exit(1);
});

async function withClient(fn) {
  await migrationReady;
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

// Runs `fn` inside a transaction. Every query issued through the app must
// still explicitly filter/insert by user_id — see index.js — this only
// wraps multi-statement writes atomically.
async function withTransaction(fn) {
  return withClient(async (client) => {
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      throw err;
    }
  });
}

module.exports = { pool, withClient, withTransaction };

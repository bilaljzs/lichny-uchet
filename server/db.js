const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const DATA_DIR = path.join(__dirname, "data");
const USERS_DIR = path.join(DATA_DIR, "users");
fs.mkdirSync(USERS_DIR, { recursive: true });

// Shared, minimal auth database — holds only credentials, never financial data.
const mainDb = new Database(path.join(DATA_DIR, "main.db"));
mainDb.pragma("journal_mode = WAL");
mainDb.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    login TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);

// One physical SQLite file per user: real, filesystem-level isolation between logins.
const userDbCache = new Map();

function getUserDb(userId) {
  if (userDbCache.has(userId)) return userDbCache.get(userId);
  const dbPath = path.join(USERS_DIR, `${userId}.db`);
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      note TEXT DEFAULT '',
      position INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      bank TEXT NOT NULL,
      balance REAL NOT NULL DEFAULT 0,
      card_id TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      status TEXT DEFAULT 'РАБОЧИЙ',
      position INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      delta REAL NOT NULL,
      time TEXT NOT NULL,
      position INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS archive (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      buy REAL NOT NULL,
      sell REAL NOT NULL,
      result REAL NOT NULL,
      time TEXT NOT NULL,
      position INTEGER NOT NULL
    );
  `);
  userDbCache.set(userId, db);
  return db;
}

module.exports = { mainDb, getUserDb };

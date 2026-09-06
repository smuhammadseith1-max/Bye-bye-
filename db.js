// Demo persistence layer using SQLite (zero-setup, file-based) so the app
// runs immediately. The schema below mirrors the Postgres schema described
// in README.md — swapping to real Postgres later means pointing an ORM
// (e.g. Prisma/Knex) at DATABASE_URL and re-running these same table defs
// translated to Postgres types (SERIAL, TIMESTAMPTZ, etc). No app logic
// in routes/ needs to change, since all DB access goes through this file.

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const db = new Database(path.join(__dirname, "..", "ai_surplus.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('consumer','vendor','caterer','ngo','delivery','admin')),
  shop_name TEXT,
  shop_lat REAL,
  shop_lng REAL,
  shop_address TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  original_price REAL NOT NULL,
  surplus_price REAL NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','reserved','sold','expired','cancelled')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

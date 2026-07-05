import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Db } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = path.join(__dirname, "..", "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

const emptyDb: Db = {
  applications: [],
  apiKeys: [],
  currentSubscriptionTier: "personal",
  generatedApps: [],
};

function ensureDbFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(emptyDb, null, 2));
  }
}

export function readDb(): Db {
  ensureDbFile();
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw) as Db;
}

export function writeDb(db: Db): void {
  ensureDbFile();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

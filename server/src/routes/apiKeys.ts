import { Router } from "express";
import { v4 as uuid } from "uuid";
import { readDb, writeDb } from "../db.js";
import type { ApiKey } from "../types.js";

export const apiKeysRouter = Router();

function generateKeyValue(): string {
  const random = uuid().replace(/-/g, "");
  return `facet_sk_${random}`;
}

apiKeysRouter.get("/", (_req, res) => {
  const db = readDb();
  res.json(db.apiKeys);
});

apiKeysRouter.post("/", (req, res) => {
  const { name, appIds, expiresAt } = req.body as {
    name?: string;
    appIds?: string[];
    expiresAt?: string | null;
  };
  if (!name) return res.status(400).json({ error: "name is required" });

  const db = readDb();
  const key: ApiKey = {
    id: uuid(),
    name,
    key: generateKeyValue(),
    appIds: appIds ?? [],
    expiresAt: expiresAt ?? null,
    createdAt: new Date().toISOString(),
  };
  db.apiKeys.push(key);
  writeDb(db);
  res.status(201).json(key);
});

apiKeysRouter.post("/:id/regenerate", (req, res) => {
  const db = readDb();
  const key = db.apiKeys.find((k) => k.id === req.params.id);
  if (!key) return res.status(404).json({ error: "API key not found" });
  key.key = generateKeyValue();
  writeDb(db);
  res.json(key);
});

apiKeysRouter.delete("/:id", (req, res) => {
  const db = readDb();
  const before = db.apiKeys.length;
  db.apiKeys = db.apiKeys.filter((k) => k.id !== req.params.id);
  if (db.apiKeys.length === before) {
    return res.status(404).json({ error: "API key not found" });
  }
  writeDb(db);
  res.status(204).end();
});

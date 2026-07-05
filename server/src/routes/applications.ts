import { Router } from "express";
import { v4 as uuid } from "uuid";
import { readDb, writeDb } from "../db.js";
import type { Application, Endpoint } from "../types.js";

export const applicationsRouter = Router();

applicationsRouter.get("/", (_req, res) => {
  const db = readDb();
  res.json(db.applications);
});

applicationsRouter.get("/:id", (req, res) => {
  const db = readDb();
  const app = db.applications.find((a) => a.id === req.params.id);
  if (!app) return res.status(404).json({ error: "Application not found" });
  res.json(app);
});

applicationsRouter.post("/", (req, res) => {
  const { name, abstract } = req.body as { name?: string; abstract?: string };
  if (!name || !abstract) {
    return res.status(400).json({ error: "name and abstract are required" });
  }

  const db = readDb();
  const app: Application = {
    id: uuid(),
    name,
    abstract,
    endpoints: [],
    createdAt: new Date().toISOString(),
  };
  db.applications.push(app);
  writeDb(db);
  res.status(201).json(app);
});

applicationsRouter.put("/:id", (req, res) => {
  const db = readDb();
  const app = db.applications.find((a) => a.id === req.params.id);
  if (!app) return res.status(404).json({ error: "Application not found" });

  const { name, abstract, endpoints, imageUrl } = req.body as {
    name?: string;
    abstract?: string;
    endpoints?: Endpoint[];
    imageUrl?: string;
  };

  if (name !== undefined) app.name = name;
  if (abstract !== undefined) app.abstract = abstract;
  // Cosmetic marketplace image — never fed to the AI build agent.
  if (imageUrl !== undefined) app.imageUrl = imageUrl.trim() || undefined;
  if (endpoints !== undefined) {
    app.endpoints = endpoints.map((ep) => ({
      id: ep.id || uuid(),
      method: ep.method,
      path: ep.path,
      description: ep.description,
      requestFields: ep.requestFields ?? [],
      responseFields: ep.responseFields ?? [],
    }));
  }

  writeDb(db);
  res.json(app);
});

applicationsRouter.delete("/:id", (req, res) => {
  const db = readDb();
  const before = db.applications.length;
  db.applications = db.applications.filter((a) => a.id !== req.params.id);
  if (db.applications.length === before) {
    return res.status(404).json({ error: "Application not found" });
  }
  db.apiKeys.forEach((key) => {
    key.appIds = key.appIds.filter((id) => id !== req.params.id);
  });
  writeDb(db);
  res.status(204).end();
});

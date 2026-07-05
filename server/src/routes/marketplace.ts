import { Router } from "express";
import { readDb } from "../db.js";

export const marketplaceRouter = Router();

marketplaceRouter.get("/", (req, res) => {
  const db = readDb();
  const search = String(req.query.search ?? "").trim().toLowerCase();
  const apps = db.applications
    .filter((a) => !search || a.name.toLowerCase().includes(search))
    .map((a) => ({ id: a.id, name: a.name, abstract: a.abstract, endpointCount: a.endpoints.length }));
  res.json(apps);
});

marketplaceRouter.get("/:id", (req, res) => {
  const db = readDb();
  const app = db.applications.find((a) => a.id === req.params.id);
  if (!app) return res.status(404).json({ error: "Application not found" });

  const builds = db.generatedApps
    .filter((g) => g.applicationId === app.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  res.json({ ...app, builds });
});

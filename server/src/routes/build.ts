import fs from "fs";
import path from "path";
import { Router } from "express";
import { v4 as uuid } from "uuid";
import { DATA_DIR, readDb, writeDb } from "../db.js";
import { generateFrontend, improvePrompt, placeholderHtml } from "../services/openai.js";
import type { GeneratedApp } from "../types.js";

export const buildRouter = Router();

buildRouter.post("/improve-prompt", async (req, res) => {
  const { prompt, applicationId } = req.body as { prompt?: string; applicationId?: string };
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: "prompt is required" });
  }

  let app;
  if (applicationId) {
    const db = readDb();
    app = db.applications.find((a) => a.id === applicationId);
  }

  try {
    const improved = await improvePrompt(prompt.trim(), app);
    res.json({ prompt: improved });
  } catch (err) {
    console.error("Prompt improvement failed:", err);
    res.status(500).json({ error: "Failed to improve prompt" });
  }
});

buildRouter.post("/build", async (req, res) => {
  const { applicationId, prompt } = req.body as { applicationId?: string; prompt?: string };
  if (!applicationId || !prompt) {
    return res.status(400).json({ error: "applicationId and prompt are required" });
  }

  const db = readDb();
  const app = db.applications.find((a) => a.id === applicationId);
  if (!app) return res.status(404).json({ error: "Application not found" });

  const buildId = uuid();
  let html: string;
  try {
    html = await generateFrontend(app, prompt);
  } catch (err) {
    console.error("OpenAI generation failed, falling back to placeholder:", err);
    html = placeholderHtml(app, prompt);
  }

  const fileName = `${buildId}.html`;
  fs.writeFileSync(path.join(DATA_DIR, "generated", fileName), html);

  const record: GeneratedApp = {
    id: buildId,
    applicationId,
    prompt,
    htmlFile: `generated/${fileName}`,
    createdAt: new Date().toISOString(),
  };
  db.generatedApps.push(record);
  writeDb(db);

  res.status(201).json(record);
});

buildRouter.get("/generated/:id", (req, res) => {
  const db = readDb();
  const record = db.generatedApps.find((g) => g.id === req.params.id);
  if (!record) return res.status(404).send("Generated app not found");

  const filePath = path.join(DATA_DIR, record.htmlFile);
  if (!fs.existsSync(filePath)) return res.status(404).send("Generated file missing");

  res.setHeader("Content-Type", "text/html");
  res.send(fs.readFileSync(filePath, "utf-8"));
});

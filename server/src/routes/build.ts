import fs from "fs";
import path from "path";
import { Router } from "express";
import { v4 as uuid } from "uuid";
import { DATA_DIR, readDb, writeDb } from "../db.js";
import { generateSite, improvePrompt, placeholderHtml, refineSite } from "../services/openai.js";
import type { GeneratedApp } from "../types.js";

export const buildRouter = Router();

function contentTypeFor(file: string): string {
  if (file.endsWith(".html")) return "text/html; charset=utf-8";
  if (file.endsWith(".css")) return "text/css; charset=utf-8";
  if (file.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (file.endsWith(".json")) return "application/json; charset=utf-8";
  if (file.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

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
  let files: Record<string, string>;
  try {
    files = await generateSite(app, prompt);
  } catch (err) {
    console.error("OpenAI generation failed, falling back to placeholder:", err);
    files = { "index.html": placeholderHtml(app, prompt) };
  }

  // Each build gets its own directory so its pages can link to one another
  // with relative hrefs (e.g. <a href="tasks.html">) and actually navigate.
  const buildDir = path.join(DATA_DIR, "generated", buildId);
  fs.mkdirSync(buildDir, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(buildDir, path.basename(name)), content);
  }

  const record: GeneratedApp = {
    id: buildId,
    applicationId,
    prompt,
    htmlFile: `generated/${buildId}/index.html`,
    createdAt: new Date().toISOString(),
  };
  db.generatedApps.push(record);
  writeDb(db);

  res.status(201).json(record);
});

// Modify an existing build in place: send the current files + a change request
// to the model and overwrite the build's files with the updated set.
buildRouter.post("/generated/:id/refine", async (req, res) => {
  const { prompt } = req.body as { prompt?: string };
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: "prompt is required" });
  }

  const db = readDb();
  const record = db.generatedApps.find((g) => g.id === req.params.id);
  if (!record) return res.status(404).json({ error: "Build not found" });
  const app = db.applications.find((a) => a.id === record.applicationId);
  if (!app) return res.status(404).json({ error: "Application not found" });

  const buildDir = path.join(DATA_DIR, "generated", record.id);
  if (!fs.existsSync(buildDir)) return res.status(404).json({ error: "Build files missing" });

  const current: Record<string, string> = {};
  for (const name of fs.readdirSync(buildDir)) {
    const filePath = path.join(buildDir, name);
    if (fs.statSync(filePath).isFile()) current[name] = fs.readFileSync(filePath, "utf-8");
  }

  let updated: Record<string, string>;
  try {
    updated = await refineSite(app, current, prompt.trim());
  } catch (err) {
    console.error("Build refinement failed:", err);
    return res.status(500).json({ error: "Failed to modify the build" });
  }

  for (const [name, content] of Object.entries(updated)) {
    fs.writeFileSync(path.join(buildDir, path.basename(name)), content);
  }

  res.json({ ok: true, files: Object.keys(updated) });
});

// A specific file inside a build directory (e.g. /generated/<id>/tasks.html).
buildRouter.get("/generated/:id/:file", (req, res) => {
  const db = readDb();
  const record = db.generatedApps.find((g) => g.id === req.params.id);
  if (!record) return res.status(404).send("Generated app not found");

  const safe = path.basename(req.params.file);
  const filePath = path.join(DATA_DIR, "generated", record.id, safe);
  if (!fs.existsSync(filePath)) return res.status(404).send("File not found");

  res.setHeader("Content-Type", contentTypeFor(safe));
  res.send(fs.readFileSync(filePath, "utf-8"));
});

// The build entry point. Loaded with a trailing slash (/generated/<id>/) so the
// iframe treats it as a directory and relative links between pages resolve.
buildRouter.get("/generated/:id", (req, res) => {
  const db = readDb();
  const record = db.generatedApps.find((g) => g.id === req.params.id);
  if (!record) return res.status(404).send("Generated app not found");

  // New directory-style build.
  const indexPath = path.join(DATA_DIR, "generated", record.id, "index.html");
  if (fs.existsSync(indexPath)) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(fs.readFileSync(indexPath, "utf-8"));
  }

  // Legacy single-file build (older records that stored one .html file).
  const legacyPath = path.join(DATA_DIR, record.htmlFile);
  if (fs.existsSync(legacyPath)) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(fs.readFileSync(legacyPath, "utf-8"));
  }

  return res.status(404).send("Generated file missing");
});

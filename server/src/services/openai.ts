import OpenAI from "openai";
import type { Application } from "../types.js";

function describeEndpoint(app: Application, endpointId?: string): string {
  return app.endpoints
    .map((ep) => {
      const req = ep.requestFields.length
        ? ep.requestFields.map((f) => `${f.name}: ${f.type}`).join(", ")
        : "none";
      const res = ep.responseFields.length
        ? ep.responseFields.map((f) => `${f.name}: ${f.type}`).join(", ")
        : "none";
      return `- ${ep.method} ${ep.path} — ${ep.description}\n  request fields: ${req}\n  response fields: ${res}`;
    })
    .join("\n");
}

function buildPrompt(app: Application, userPrompt: string): { system: string; user: string } {
  const system = [
    "You are the Facet build agent. You generate a small MULTI-PAGE website — a set of self-contained",
    "HTML files — that serves as a custom frontend for a backend application.",
    "",
    "OUTPUT FORMAT — respond with a single JSON object of EXACTLY this shape:",
    '{ "files": { "index.html": "<!doctype html>...", "another-page.html": "<!doctype html>..." } }.',
    "The keys are file names and the values are the complete HTML for each file.",
    '"index.html" is REQUIRED — it is the entry page. Add more .html pages whenever the interface benefits',
    "from separate views (for example a list page plus a create/detail page). Prefer 2 to 4 pages.",
    "Each HTML file must be a COMPLETE, standalone document with its own inline <style> and <script>.",
    "Do not rely on any external files, CDNs, frameworks, or shared stylesheets.",
    "",
    "NAVIGATION — this is critical and is what usually breaks, so follow it exactly:",
    'link between pages using ONLY relative file names, e.g. <a href="tasks.html">Tasks</a> or, in JS,',
    "location.href = 'tasks.html'. All files are served together from one directory, so a bare relative",
    'name like "index.html" or "tasks.html" resolves correctly. NEVER use a leading slash, an absolute',
    "URL, or a <base> tag for navigation. Every link or button that navigates MUST point to a file you",
    "actually include in the files object — no dead ends. Provide a way back to index.html from every page.",
    "",
    "BACKEND — the frontend talks to the backend only through the registered API endpoints listed below,",
    "using relative fetch() calls to their paths. Keep every registered capability reachable in the UI.",
    "",
    "DESIGN BAR — the result must look modern, polished, and premium, like a well-designed 2025 SaaS product:",
    "a cohesive color palette (tasteful gradients and accents), generous whitespace, clear visual hierarchy,",
    "rounded corners, soft shadows/depth, and clean modern typography, with a consistent look across all pages.",
    "Never ship an unstyled or barebones page.",
    "",
    "MOTION — bring the UI to life with tasteful animation using ONLY CSS and vanilla JS (transitions, keyframes,",
    "requestAnimationFrame): subtle entrance/reveal animations as content loads, animated loading indicators while",
    "fetch() is in flight, and gentle feedback on actions. IN PARTICULAR, EVERY button and clickable control MUST",
    "have visible animated states — a smooth hover effect AND a distinct pressed/active effect (animate color,",
    "scale, shadow, or a subtle ripple). Keep motion smooth, fast, and purposeful, never distracting, and respect",
    "prefers-reduced-motion. Make every page fully responsive and accessible.",
    "",
    "Respond with ONLY the JSON object — no markdown fences, no commentary.",
  ].join(" ");

  const user = [
    `Application name: ${app.name}`,
    `Application abstract: ${app.abstract}`,
    "Registered endpoints:",
    describeEndpoint(app),
    "",
    `User's requested interface: ${userPrompt}`,
  ].join("\n");

  return { system, user };
}

export function placeholderHtml(app: Application, userPrompt: string): string {
  const rows = app.endpoints
    .map(
      (ep) =>
        `<tr><td class="method method-${ep.method.toLowerCase()}">${ep.method}</td><td><code>${ep.path}</code></td><td>${ep.description}</td></tr>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${app.name} — Facet Preview</title>
<style>
  :root { color-scheme: dark; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif;
    background: radial-gradient(circle at top left, #1e1b4b, #0b0b14 60%);
    color: #e6e6f0;
    min-height: 100vh;
    padding: 48px 24px;
  }
  .wrap { max-width: 760px; margin: 0 auto; }
  h1 { font-size: 2rem; margin-bottom: 4px; background: linear-gradient(90deg,#a78bfa,#60a5fa); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .abstract { color: #a1a1b5; margin-bottom: 24px; }
  .notice { background: rgba(167,139,250,0.12); border: 1px solid rgba(167,139,250,0.35); border-radius: 12px; padding: 16px 20px; margin-bottom: 32px; }
  .notice strong { color: #c4b5fd; }
  .prompt-box { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px 20px; margin-bottom: 32px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 0.9rem; }
  th { color: #8b8ba7; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
  code { color: #93c5fd; }
  .method { font-weight: 700; font-size: 0.75rem; }
  .method-get { color: #4ade80; }
  .method-post { color: #60a5fa; }
  .method-put, .method-patch { color: #facc15; }
  .method-delete { color: #f87171; }
</style>
</head>
<body>
  <div class="wrap">
    <h1>${app.name}</h1>
    <p class="abstract">${app.abstract}</p>
    <div class="notice">
      <strong>Preview mode.</strong> No <code>OPENAI_API_KEY</code> is configured on the Facet server,
      so this is a placeholder page instead of an AI-generated frontend. Add a key to the server's
      <code>.env</code> file and click Build again to generate the real interface.
    </div>
    <div class="prompt-box">
      <div style="color:#8b8ba7; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:6px;">Requested interface</div>
      <div>${userPrompt}</div>
    </div>
    <table>
      <thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
</body>
</html>`;
}

/**
 * Takes a user's rough interface description and rewrites it into a clearer,
 * more specific, more actionable prompt for the build agent — without inventing
 * features the user didn't ask for. Returns the original prompt unchanged if no
 * API key is configured.
 */
export async function improvePrompt(rawPrompt: string, app?: Application): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return rawPrompt;
  }

  const client = new OpenAI({ apiKey });
  const context = app
    ? `The interface will be generated for an application called "${app.name}" — ${app.abstract}.`
    : "";

  const system = [
    "You are a prompt-refinement assistant for Facet, a tool that turns a plain-language request",
    "into a custom web frontend for an existing API. Rewrite the user's interface description so it is",
    "clearer, more specific, and more actionable for a UI-generation model, while faithfully preserving",
    "the user's original intent and NOT inventing unrelated features. Encourage a clean, modern, visually",
    "polished, and tastefully animated interface. Keep it concise — a short paragraph or a few sentences.",
    "Respond with ONLY the improved prompt text: no preamble, no quotes, no markdown, no commentary.",
  ].join(" ");

  const user = `${context}\n\nUser's current interface description:\n"""${rawPrompt}"""\n\nRewrite it into an improved interface description.`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const improved = completion.choices[0]?.message?.content?.trim();
  return improved && improved.length ? improved : rawPrompt;
}

/** Restrict a model-supplied file name to a safe, flat file within the build dir. */
function sanitizeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "";
  return base.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 64);
}

/**
 * Generates the frontend as a set of named HTML files ({ "index.html": ..., ... }).
 * Returns a single placeholder index.html if no API key is configured or the
 * model response can't be parsed.
 */
export async function generateSite(app: Application, userPrompt: string): Promise<Record<string, string>> {
  const fallback = { "index.html": placeholderHtml(app, userPrompt) };

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return fallback;
  }

  const client = new OpenAI({ apiKey });
  const { system, user } = buildPrompt(app, userPrompt);

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) return fallback;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return fallback;
  }

  const source =
    parsed && typeof parsed === "object" && "files" in parsed && typeof (parsed as any).files === "object"
      ? (parsed as any).files
      : parsed;

  if (!source || typeof source !== "object") return fallback;

  const files: Record<string, string> = {};
  for (const [name, content] of Object.entries(source as Record<string, unknown>)) {
    const safe = sanitizeFileName(name);
    if (safe && typeof content === "string" && content.trim()) {
      files[safe] = content;
    }
  }

  if (!files["index.html"]) {
    const firstHtml = Object.keys(files).find((f) => f.endsWith(".html"));
    if (firstHtml) files["index.html"] = files[firstHtml];
    else return fallback;
  }

  return files;
}

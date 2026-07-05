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
    "You are the Facet build agent. You generate a single, self-contained HTML document",
    "(inline <style> and <script>, no external dependencies) that serves as a custom frontend",
    "for a backend application. The frontend must communicate with the backend exclusively",
    "through the registered API endpoints listed below, using relative fetch() calls to their paths.",
    "Every capability exposed by the registered endpoints should remain reachable somewhere in the UI,",
    "even while you tailor the layout/workflow to the user's request.",
    "",
    "DESIGN BAR — the result must look modern, polished, and premium, like a well-designed 2025 SaaS product:",
    "use a cohesive color palette (tasteful gradients and accent colors), generous whitespace, a clear visual",
    "hierarchy, rounded corners, soft shadows/depth, and clean modern typography. Favor a refined light or dark",
    "theme done well over a plain default-styled page. Never ship an unstyled or barebones HTML page.",
    "",
    "MOTION — bring the interface to life with tasteful animation and micro-interactions, using ONLY CSS and",
    "vanilla JS (CSS transitions/keyframes, requestAnimationFrame): smooth hover and focus states on interactive",
    "elements, subtle entrance/reveal animations as content loads, animated loading indicators (spinners/skeletons)",
    "while fetch() is in flight, and gentle feedback on user actions (button presses, successes, errors).",
    "Keep motion smooth, fast, and purposeful — polished, never gratuitous or distracting. Respect",
    "prefers-reduced-motion. Make the layout fully responsive and keep it accessible.",
    "",
    "Respond with ONLY the raw HTML document — no markdown fences, no commentary.",
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

export async function generateFrontend(app: Application, userPrompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return placeholderHtml(app, userPrompt);
  }

  const client = new OpenAI({ apiKey });
  const { system, user } = buildPrompt(app, userPrompt);

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const html = completion.choices[0]?.message?.content?.trim();
  if (!html) {
    return placeholderHtml(app, userPrompt);
  }

  return html.replace(/^```html\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "");
}

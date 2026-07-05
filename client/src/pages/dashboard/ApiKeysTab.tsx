import { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { Application, ApiKey } from "../../api/types";

export function ApiKeysTab() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [expires, setExpires] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  function refresh() {
    api.listApiKeys().then(setKeys).catch((err) => setError(err.message));
    api.listApplications().then(setApps).catch(() => {});
  }

  useEffect(refresh, []);

  function toggleApp(id: string) {
    setSelectedAppIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  }

  async function handleCreate() {
    if (!name.trim()) return;
    try {
      await api.createApiKey({ name: name.trim(), appIds: selectedAppIds, expiresAt: expires || null });
      setCreating(false);
      setName("");
      setSelectedAppIds([]);
      setExpires("");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create key");
    }
  }

  async function handleRegenerate(id: string) {
    await api.regenerateApiKey(id);
    refresh();
  }

  async function handleDelete(id: string) {
    await api.deleteApiKey(id);
    refresh();
  }

  function appName(id: string) {
    return apps.find((a) => a.id === id)?.name ?? "Unknown app";
  }

  function maskedKey(key: string) {
    return `${key.slice(0, 12)}${"•".repeat(18)}`;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>API Keys</h1>
        <button className="btn btn-primary" onClick={() => setCreating((v) => !v)}>
          {creating ? "Cancel" : "+ New key"}
        </button>
      </div>

      {error && <p style={{ color: "#f87171" }}>{error}</p>}

      {creating && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="field">
            <label>Key name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Production backend" />
          </div>
          <div className="field">
            <label>Grants access to</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {apps.map((a) => (
                <button
                  key={a.id}
                  className="btn"
                  onClick={() => toggleApp(a.id)}
                  style={{
                    background: selectedAppIds.includes(a.id) ? "var(--surface-hover)" : "var(--surface)",
                    borderColor: selectedAppIds.includes(a.id) ? "var(--accent-2)" : "var(--border-strong)",
                  }}
                >
                  {a.name}
                </button>
              ))}
              {apps.length === 0 && <span style={{ color: "var(--text-dim)" }}>No applications yet.</span>}
            </div>
          </div>
          <div className="field" style={{ maxWidth: 240 }}>
            <label>Expires (optional)</label>
            <input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={handleCreate} disabled={!name.trim()}>
            Generate key
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {keys.map((key) => (
          <div key={key.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: "0 0 6px" }}>{key.name}</h3>
                <code
                  style={{ fontSize: "0.85rem", cursor: "pointer" }}
                  onClick={() =>
                    setRevealed((prev) => {
                      const next = new Set(prev);
                      next.has(key.id) ? next.delete(key.id) : next.add(key.id);
                      return next;
                    })
                  }
                  title="Click to reveal/hide"
                >
                  {revealed.has(key.id) ? key.key : maskedKey(key.key)}
                </code>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" onClick={() => handleRegenerate(key.id)}>
                  Regenerate
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(key.id)}>
                  Delete
                </button>
              </div>
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {key.appIds.length === 0 && (
                <span className="pill" style={{ background: "var(--surface)", color: "var(--text-dim)" }}>
                  No apps scoped
                </span>
              )}
              {key.appIds.map((id) => (
                <span key={id} className="pill" style={{ background: "var(--surface)", color: "var(--text-muted)" }}>
                  {appName(id)}
                </span>
              ))}
              <span style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginLeft: "auto" }}>
                {key.expiresAt ? `Expires ${new Date(key.expiresAt).toLocaleDateString()}` : "Never expires"}
              </span>
            </div>
          </div>
        ))}
        {keys.length === 0 && !creating && <p style={{ color: "var(--text-muted)" }}>No API keys yet.</p>}
      </div>
    </div>
  );
}

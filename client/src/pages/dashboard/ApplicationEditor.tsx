import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api/client";
import type { Application, Endpoint, EndpointField, HttpMethod } from "../../api/types";
import { MethodPill } from "../../components/MethodPill";

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

function emptyEndpoint(): Endpoint {
  return {
    id: `new-${Math.random().toString(36).slice(2)}`,
    method: "GET",
    path: "/",
    description: "",
    requestFields: [],
    responseFields: [],
  };
}

function FieldListEditor({
  label,
  fields,
  onChange,
}: {
  label: string;
  fields: EndpointField[];
  onChange: (fields: EndpointField[]) => void;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      {fields.map((f, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            placeholder="field name"
            value={f.name}
            onChange={(e) => {
              const next = [...fields];
              next[i] = { ...next[i], name: e.target.value };
              onChange(next);
            }}
          />
          <input
            placeholder="type (string, number…)"
            value={f.type}
            onChange={(e) => {
              const next = [...fields];
              next[i] = { ...next[i], type: e.target.value };
              onChange(next);
            }}
          />
          <button className="btn btn-danger" onClick={() => onChange(fields.filter((_, idx) => idx !== i))}>
            ✕
          </button>
        </div>
      ))}
      <button className="btn" onClick={() => onChange([...fields, { name: "", type: "string" }])}>
        + Add field
      </button>
    </div>
  );
}

function EndpointEditor({
  endpoint,
  onChange,
  onDelete,
}: {
  endpoint: Endpoint;
  onChange: (ep: Endpoint) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
        onClick={() => setOpen((v) => !v)}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <MethodPill method={endpoint.method} />
          <code>{endpoint.path || "/"}</code>
        </div>
        <button
          className="btn btn-danger"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          Delete
        </button>
      </div>

      {open && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div className="field" style={{ width: 140 }}>
              <label>Method</label>
              <select value={endpoint.method} onChange={(e) => onChange({ ...endpoint, method: e.target.value as HttpMethod })}>
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Path</label>
              <input value={endpoint.path} onChange={(e) => onChange({ ...endpoint, path: e.target.value })} placeholder="/tasks/:id" />
            </div>
          </div>

          <div className="field">
            <label>Description</label>
            <textarea
              rows={2}
              value={endpoint.description}
              onChange={(e) => onChange({ ...endpoint, description: e.target.value })}
              placeholder="What this endpoint does and how it should be used."
            />
          </div>

          <FieldListEditor
            label="Request fields (the tuple it receives)"
            fields={endpoint.requestFields}
            onChange={(requestFields) => onChange({ ...endpoint, requestFields })}
          />
          <FieldListEditor
            label="Response fields (the tuple it returns)"
            fields={endpoint.responseFields}
            onChange={(responseFields) => onChange({ ...endpoint, responseFields })}
          />
        </div>
      )}
    </div>
  );
}

export function ApplicationEditor() {
  const { appId } = useParams<{ appId: string }>();
  const [app, setApp] = useState<Application | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appId) return;
    api.getApplication(appId).then(setApp).catch((err) => setError(err.message));
  }, [appId]);

  async function handleSave() {
    if (!app) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateApplication(app.id, {
        name: app.name,
        abstract: app.abstract,
        endpoints: app.endpoints,
      });
      setApp(updated);
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (error && !app) return <p style={{ color: "#f87171" }}>{error}</p>;
  if (!app) return <p style={{ color: "var(--text-muted)" }}>Loading…</p>;

  return (
    <div>
      <Link to="/dashboard/applications" style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
        ← Back to applications
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", margin: "12px 0 24px" }}>
        <h1 style={{ margin: 0 }}>{app.name || "Untitled application"}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {savedAt && Date.now() - savedAt < 4000 && <span style={{ color: "#4ade80", fontSize: "0.85rem" }}>Saved</span>}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {error && <p style={{ color: "#f87171" }}>{error}</p>}

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="field">
          <label>Name</label>
          <input value={app.name} onChange={(e) => setApp({ ...app, name: e.target.value })} />
        </div>
        <div className="field">
          <label>Abstract</label>
          <textarea rows={3} value={app.abstract} onChange={(e) => setApp({ ...app, abstract: e.target.value })} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Endpoints</h2>
        <button
          className="btn"
          onClick={() => setApp({ ...app, endpoints: [...app.endpoints, emptyEndpoint()] })}
        >
          + Add endpoint
        </button>
      </div>

      {app.endpoints.map((ep, i) => (
        <EndpointEditor
          key={ep.id}
          endpoint={ep}
          onChange={(next) => {
            const endpoints = [...app.endpoints];
            endpoints[i] = next;
            setApp({ ...app, endpoints });
          }}
          onDelete={() => setApp({ ...app, endpoints: app.endpoints.filter((_, idx) => idx !== i) })}
        />
      ))}
      {app.endpoints.length === 0 && <p style={{ color: "var(--text-muted)" }}>No endpoints yet. Add one above.</p>}

      <div style={{ marginTop: 24 }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

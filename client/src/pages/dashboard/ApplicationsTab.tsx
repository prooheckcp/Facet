import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import type { Application } from "../../api/types";
import { usePageTitle } from "../../hooks/usePageTitle";
import { IconEye, IconEdit, IconTrash } from "../../components/icons";

export function ApplicationsTab() {
  usePageTitle("Applications");
  const [apps, setApps] = useState<Application[]>([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [abstract, setAbstract] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  function refresh() {
    api.listApplications().then(setApps).catch((err) => setError(err.message));
  }

  useEffect(refresh, []);

  async function handleCreate() {
    if (!name.trim() || !abstract.trim()) return;
    try {
      const app = await api.createApplication({ name: name.trim(), abstract: abstract.trim() });
      setCreating(false);
      setName("");
      setAbstract("");
      navigate(`/dashboard/applications/${app.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create application");
    }
  }

  async function handleDelete(id: string) {
    await api.deleteApplication(id);
    refresh();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Applications</h1>
        <button className="btn btn-primary" onClick={() => setCreating((v) => !v)}>
          {creating ? "Cancel" : "+ Add application"}
        </button>
      </div>

      {error && <p style={{ color: "#f87171" }}>{error}</p>}

      {creating && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="field">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="TaskFlow" />
          </div>
          <div className="field">
            <label>Abstract</label>
            <textarea
              rows={3}
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="A task management application for teams."
            />
          </div>
          <button className="btn btn-primary" onClick={handleCreate} disabled={!name.trim() || !abstract.trim()}>
            Create application
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {apps.map((app) => (
          <div key={app.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: "0 0 4px" }}>{app.name}</h3>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>{app.abstract}</p>
              <p style={{ margin: "6px 0 0", color: "var(--text-dim)", fontSize: "0.8rem" }}>
                {app.endpoints.length} endpoint{app.endpoints.length === 1 ? "" : "s"}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link
                to={`/marketplace/${app.id}`}
                className="btn"
                title="View this application's marketplace page"
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <IconEye />
                View
              </Link>
              <Link
                to={`/dashboard/applications/${app.id}`}
                className="btn"
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <IconEdit />
                Edit
              </Link>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(app.id)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <IconTrash />
                Delete
              </button>
            </div>
          </div>
        ))}
        {apps.length === 0 && !creating && (
          <p style={{ color: "var(--text-muted)" }}>No applications yet. Create your first one above.</p>
        )}
      </div>
    </div>
  );
}

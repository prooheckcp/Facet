import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api/client";

export function GeneratedAppPage() {
  const { appId, buildId } = useParams<{ appId: string; buildId: string }>();
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!buildId) return;
    api.getGeneratedHtml(buildId).then(setHtml).catch((err) => setError(err.message));
  }, [buildId]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-elevated)",
        }}
      >
        <Link to={`/marketplace/${appId}`} style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          ← Back to application
        </Link>
        <span className="pill" style={{ background: "rgba(96,165,250,0.12)", color: "#60a5fa" }}>
          Facet generated preview
        </span>
      </div>

      <div style={{ flex: 1 }}>
        {error && <p style={{ color: "#f87171", padding: 24 }}>{error}</p>}
        {!error && !html && <p style={{ color: "var(--text-muted)", padding: 24 }}>Loading generated app…</p>}
        {html && (
          <iframe
            title="Generated application"
            srcDoc={html}
            sandbox="allow-scripts allow-forms"
            style={{ width: "100%", height: "100%", border: "none", background: "#fff" }}
          />
        )}
      </div>
    </div>
  );
}

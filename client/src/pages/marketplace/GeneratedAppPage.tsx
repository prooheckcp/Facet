import { Link, useParams } from "react-router-dom";
import { usePageTitle } from "../../hooks/usePageTitle";

export function GeneratedAppPage() {
  const { appId, buildId } = useParams<{ appId: string; buildId: string }>();
  usePageTitle("Generated app");

  // Load the build as a directory URL (trailing slash) so the generated pages
  // can link to one another with relative hrefs and actually navigate.
  const src = buildId ? `/api/generated/${buildId}/` : "";

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
        <span className="pill" style={{ background: "rgba(124,58,237,0.12)", color: "#6b21d6" }}>
          Facet generated preview
        </span>
      </div>

      <div style={{ flex: 1 }}>
        {src && (
          <iframe
            title="Generated application"
            src={src}
            sandbox="allow-scripts allow-forms allow-popups"
            style={{ width: "100%", height: "100%", border: "none", background: "#fff" }}
          />
        )}
      </div>
    </div>
  );
}

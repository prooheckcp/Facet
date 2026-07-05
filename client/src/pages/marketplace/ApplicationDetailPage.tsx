import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../../api/client";
import type { ApplicationDetail } from "../../api/types";
import { TopNav } from "../../components/TopNav";
import { MethodPill } from "../../components/MethodPill";
import { IconSparkle } from "../../components/icons";
import { usePageTitle } from "../../hooks/usePageTitle";
import { staggerContainer, staggerItem } from "../../components/Reveal";

const MotionLink = motion.create(Link);

export function ApplicationDetailPage() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  usePageTitle(app?.name ?? "Application");
  const [prompt, setPrompt] = useState("");
  const [building, setBuilding] = useState(false);
  const [improving, setImproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appId) return;
    api.getMarketplaceApp(appId).then(setApp).catch((err) => setError(err.message));
  }, [appId]);

  async function handleBuild() {
    if (!appId || !prompt.trim()) return;
    setBuilding(true);
    setError(null);
    try {
      const build = await api.build(appId, prompt.trim());
      navigate(`/marketplace/${appId}/view/${build.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Build failed");
    } finally {
      setBuilding(false);
    }
  }

  async function handleImprove() {
    if (!prompt.trim() || improving) return;
    setImproving(true);
    setError(null);
    try {
      const res = await api.improvePrompt(prompt.trim(), appId);
      setPrompt(res.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not improve the prompt");
    } finally {
      setImproving(false);
    }
  }

  if (error && !app) {
    return (
      <div>
        <TopNav />
        <div className="page" style={{ paddingTop: 48 }}>
          <p style={{ color: "#f87171" }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div>
        <TopNav />
        <div className="page" style={{ paddingTop: 48, color: "var(--text-muted)" }}>
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopNav />
      <div className="page" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <Link to="/marketplace" style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          ← Back to marketplace
        </Link>
        {app.imageUrl?.trim() && (
          <img
            src={app.imageUrl}
            alt=""
            style={{
              width: "100%",
              maxHeight: 260,
              objectFit: "cover",
              borderRadius: 14,
              margin: "16px 0 8px",
              display: "block",
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <h1 style={{ marginBottom: 4 }}>{app.name}</h1>
        <p style={{ color: "var(--text-muted)", maxWidth: 640 }}>{app.abstract}</p>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32, marginTop: 32 }}>
          <div>
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ marginTop: 0 }}>Describe your interface</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                e.g. "A kanban board grouped by status" or "A minimal list view focused on today's tasks."
              </p>
              <div className="field">
                <div className="focus-ring-wrap">
                  <span className="focus-ring" aria-hidden />
                  <textarea
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe how you'd like to interact with this application…"
                  />
                </div>
              </div>
              <button
                className="btn"
                onClick={handleImprove}
                disabled={!prompt.trim() || improving || building}
                title={!prompt.trim() ? "Write a description first" : "Let AI refine your description"}
                style={{ color: "#6b21d6", borderColor: "rgba(124,58,237,0.35)", marginBottom: 14 }}
              >
                {improving ? (
                  <>
                    <span className="spinner" />
                    Improving…
                  </>
                ) : (
                  <>
                    <IconSparkle />
                    Improve prompt
                  </>
                )}
              </button>
              {error && <p style={{ color: "#f87171", fontSize: "0.9rem" }}>{error}</p>}
              <div>
                <button
                  className="btn btn-primary"
                  onClick={handleBuild}
                  disabled={building || improving || !prompt.trim()}
                >
                  {building ? "Building…" : "Build"}
                </button>
              </div>
            </div>

            {app.builds.length > 0 && (
              <div className="card">
                <h3 style={{ marginTop: 0 }}>Previous builds</h3>
                <motion.div variants={staggerContainer} initial="hidden" animate="show">
                  {app.builds.map((b) => (
                    <MotionLink
                      key={b.id}
                      variants={staggerItem}
                      whileHover={{ x: 5 }}
                      to={`/marketplace/${app.id}/view/${b.id}`}
                      className="card"
                      style={{ display: "block", marginBottom: 10, padding: 14 }}
                    >
                      <div style={{ fontSize: "0.9rem" }}>{b.prompt}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: 4 }}>
                        {new Date(b.createdAt).toLocaleString()}
                      </div>
                    </MotionLink>
                  ))}
                </motion.div>
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Available endpoints</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {app.endpoints.map((ep) => (
                <div key={ep.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                    <MethodPill method={ep.method} />
                    <code style={{ fontSize: "0.85rem" }}>{ep.path}</code>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>{ep.description}</p>
                </div>
              ))}
              {app.endpoints.length === 0 && (
                <p style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>No endpoints registered yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

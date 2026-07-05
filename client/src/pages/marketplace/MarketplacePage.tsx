import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../../api/client";
import type { MarketplaceApplication } from "../../api/types";
import { TopNav } from "../../components/TopNav";
import { usePageTitle } from "../../hooks/usePageTitle";

const MotionLink = motion.create(Link);

export function MarketplacePage() {
  usePageTitle("Marketplace");
  const [search, setSearch] = useState("");
  const [apps, setApps] = useState<MarketplaceApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .searchMarketplace(search)
      .then((data) => {
        if (!cancelled) setApps(data);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [search]);

  return (
    <div>
      <TopNav />
      <div className="page" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <h1 style={{ marginBottom: 8 }}>Application Marketplace</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 0, marginBottom: 32 }}>
          Pick an application, describe how you want to use it, and Facet builds the interface.
        </p>

        <input
          placeholder="Search applications by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 420, marginBottom: 32 }}
        />

        {error && <p style={{ color: "#f87171" }}>{error}</p>}
        {loading && <p style={{ color: "var(--text-muted)" }}>Loading…</p>}

        {!loading && apps.length === 0 && (
          <p style={{ color: "var(--text-muted)" }}>No applications match your search.</p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {apps.map((app) => (
            <MotionLink key={app.id} to={`/marketplace/${app.id}`} className="app-card" whileHover={{ y: -6 }}>
              <span className="app-card__ring" aria-hidden />
              {app.imageUrl?.trim() && (
                <div className="app-card__cover">
                  <img
                    src={app.imageUrl}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
              <div className="app-card__body">
                <h3 style={{ margin: "0 0 8px", fontSize: "1.15rem" }}>{app.name}</h3>
                <p style={{ color: "var(--text-muted)", margin: "0 0 16px", minHeight: 40, fontSize: "0.95rem" }}>
                  {app.abstract}
                </p>
                <span
                  className="pill"
                  style={{
                    background: "rgba(16,185,129,0.14)",
                    color: "#047857",
                    marginTop: "auto",
                    alignSelf: "flex-start",
                  }}
                >
                  {app.endpointCount} endpoint{app.endpointCount === 1 ? "" : "s"}
                </span>
              </div>
            </MotionLink>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { SubscriptionTier } from "../../api/types";
import { usePageTitle } from "../../hooks/usePageTitle";

export function SubscriptionTab() {
  usePageTitle("Subscription");
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [current, setCurrent] = useState<SubscriptionTier | null>(null);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    api.listTiers().then(setTiers);
    api.getCurrentTier().then(setCurrent);
  }, []);

  async function selectTier(tierId: string) {
    setSwitching(true);
    try {
      const tier = await api.setCurrentTier(tierId);
      setCurrent(tier);
    } finally {
      setSwitching(false);
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Subscription</h1>
      <p style={{ color: "var(--text-muted)", marginTop: 0, marginBottom: 32 }}>
        Your subscription determines your monthly API call limit across all registered applications.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
        {tiers.map((tier) => {
          const isCurrent = current?.id === tier.id;
          return (
            <div
              key={tier.id}
              className="card"
              style={{
                border: isCurrent ? "1px solid var(--accent-2)" : undefined,
                position: "relative",
              }}
            >
              {isCurrent && (
                <span
                  className="pill"
                  style={{ background: "rgba(124,58,237,0.14)", color: "#6b21d6", position: "absolute", top: 20, right: 20 }}
                >
                  Current
                </span>
              )}
              <h3 style={{ margin: "0 0 4px" }}>{tier.name}</h3>
              <div className="gradient-text" style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 16 }}>
                {tier.priceLabel}
              </div>
              <ul style={{ paddingLeft: 18, margin: "0 0 20px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                {tier.features.map((f) => (
                  <li key={f} style={{ marginBottom: 6 }}>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={isCurrent ? "btn" : "btn btn-primary"}
                disabled={isCurrent || switching}
                onClick={() => selectTier(tier.id)}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {isCurrent ? "Selected" : "Switch to this plan"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

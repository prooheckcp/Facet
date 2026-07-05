import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TopNav } from "../../components/TopNav";
import { IconGrid, IconKey, IconCard, IconLogout } from "../../components/icons";

const tabs = [
  // The dashboard index (/dashboard) renders the Applications tab, so treat the
  // bare /dashboard path as the Applications tab being active too.
  { to: "/dashboard/applications", label: "Applications", icon: IconGrid, indexMatch: true },
  { to: "/dashboard/api-keys", label: "API Keys", icon: IconKey },
  { to: "/dashboard/subscription", label: "Subscription", icon: IconCard },
];

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState<string | null>(null);
  const [logoutHover, setLogoutHover] = useState(false);
  const atDashboardIndex = location.pathname === "/dashboard" || location.pathname === "/dashboard/";

  function isTabActive(to: string, indexMatch?: boolean) {
    if (indexMatch && atDashboardIndex) return true;
    return location.pathname === to || location.pathname.startsWith(to + "/");
  }

  const activeTo = tabs.find((t) => isTabActive(t.to, t.indexMatch))?.to ?? null;
  // The sliding highlight follows the hovered item, and rests on the active tab.
  const highlight = hovered ?? activeTo;

  function handleLogout() {
    // Demo only: no real auth — logging out just returns you to the login page.
    navigate("/login");
  }

  return (
    <div>
      <TopNav />
      <div className="page" style={{ paddingTop: 40, paddingBottom: 80, display: "flex", gap: 40 }}>
        <aside style={{ width: 200, flexShrink: 0 }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: 20 }}>Developer</h2>
          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }} onMouseLeave={() => setHovered(null)}>
            {tabs.map((tab) => {
              const active = isTabActive(tab.to, tab.indexMatch);
              const isHighlighted = highlight === tab.to;
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  onMouseEnter={() => setHovered(tab.to)}
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: 10,
                    fontSize: "0.95rem",
                    fontWeight: active ? 600 : 400,
                    color: active || isHighlighted ? "#6b21d6" : "var(--text-muted)",
                    transition: "color 0.2s ease",
                  }}
                >
                  {isHighlighted && (
                    <motion.span
                      layoutId="sidebar-highlight"
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 10,
                        background: "rgba(124,58,237,0.12)",
                        border: "1px solid rgba(124,58,237,0.22)",
                        zIndex: 0,
                      }}
                      transition={{ type: "spring", stiffness: 440, damping: 36 }}
                    />
                  )}
                  <span style={{ position: "relative", zIndex: 1, display: "inline-flex" }}>
                    <tab.icon />
                  </span>
                  <span style={{ position: "relative", zIndex: 1 }}>{tab.label}</span>
                </NavLink>
              );
            })}
            <button
              type="button"
              onClick={handleLogout}
              onMouseEnter={() => setLogoutHover(true)}
              onMouseLeave={() => setLogoutHover(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 8,
                padding: "10px 14px",
                borderRadius: 10,
                border: "none",
                background: logoutHover ? "rgba(220,38,38,0.1)" : "transparent",
                textAlign: "left",
                fontSize: "0.95rem",
                fontWeight: 500,
                color: "#dc2626",
                cursor: "pointer",
                transition: "background 0.15s ease",
              }}
            >
              <IconLogout />
              Log out
            </button>
          </nav>
        </aside>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

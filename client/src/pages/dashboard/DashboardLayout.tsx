import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
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
  const atDashboardIndex = location.pathname === "/dashboard" || location.pathname === "/dashboard/";

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
          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                style={({ isActive }) => {
                  const active = isActive || (tab.indexMatch && atDashboardIndex);
                  return {
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: 10,
                    fontSize: "0.95rem",
                    fontWeight: active ? 600 : 400,
                    color: active ? "#6b21d6" : "var(--text-muted)",
                    background: active ? "rgba(124,58,237,0.1)" : "transparent",
                  };
                }}
              >
                <tab.icon />
                {tab.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 8,
                padding: "10px 14px",
                borderRadius: 10,
                border: "none",
                background: "transparent",
                textAlign: "left",
                fontSize: "0.95rem",
                fontWeight: 500,
                color: "#dc2626",
                cursor: "pointer",
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

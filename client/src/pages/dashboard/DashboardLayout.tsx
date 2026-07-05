import { NavLink, Outlet } from "react-router-dom";
import { TopNav } from "../../components/TopNav";

const tabs = [
  { to: "/dashboard/applications", label: "Applications" },
  { to: "/dashboard/api-keys", label: "API Keys" },
  { to: "/dashboard/subscription", label: "Subscription" },
];

export function DashboardLayout() {
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
                style={({ isActive }) => ({
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontSize: "0.95rem",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#6b21d6" : "var(--text-muted)",
                  background: isActive ? "rgba(124,58,237,0.1)" : "transparent",
                })}
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

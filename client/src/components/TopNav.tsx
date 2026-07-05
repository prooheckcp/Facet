import { Link, NavLink } from "react-router-dom";
import { IconShop, IconWrench, IconUser } from "./icons";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "nav-link nav-link--active" : "nav-link";

export function TopNav() {
  return (
    <div className="top-nav">
      <Link to="/" className="logo" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src="/IconLogo.png" alt="" style={{ height: 30, width: "auto", display: "block" }} />
        <span style={{ fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.01em", color: "var(--text)" }}>Facet</span>
      </Link>
      <nav>
        <NavLink to="/marketplace" className={navLinkClass} title="Marketplace">
          <IconShop />
          <span className="nav-label">Marketplace</span>
        </NavLink>
        <NavLink to="/dashboard" className={navLinkClass} title="Developer Dashboard">
          <IconWrench />
          <span className="nav-label">Developer Dashboard</span>
        </NavLink>
        <Link to="/login" className="btn btn-anim" style={{ padding: "8px 18px" }}>
          <IconUser />
          Log in
        </Link>
      </nav>
    </div>
  );
}

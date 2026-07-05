import { Link } from "react-router-dom";

export function TopNav() {
  return (
    <div className="top-nav">
      <Link to="/" className="logo" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src="/IconLogo.png" alt="" style={{ height: 30, width: "auto", display: "block" }} />
        <span style={{ fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.01em", color: "var(--text)" }}>Facet</span>
      </Link>
      <nav>
        <Link to="/marketplace">Marketplace</Link>
        <Link to="/dashboard">Developer Dashboard</Link>
      </nav>
    </div>
  );
}

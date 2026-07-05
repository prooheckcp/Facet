import { Link } from "react-router-dom";

export function TopNav() {
  return (
    <div className="top-nav">
      <Link to="/" className="logo">
        <span className="gradient-text">Facet</span>
      </Link>
      <nav>
        <Link to="/marketplace">Marketplace</Link>
        <Link to="/dashboard">Developer Dashboard</Link>
      </nav>
    </div>
  );
}

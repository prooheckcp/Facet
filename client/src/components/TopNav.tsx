import { Link } from "react-router-dom";

export function TopNav({ light = false }: { light?: boolean }) {
  return (
    <div className={light ? "top-nav top-nav--light" : "top-nav"}>
      <Link to="/" className="logo">
        <span className={light ? "gradient-text-light" : "gradient-text"}>Facet</span>
      </Link>
      <nav>
        <Link to="/marketplace">Marketplace</Link>
        <Link to="/dashboard">Developer Dashboard</Link>
      </nav>
    </div>
  );
}

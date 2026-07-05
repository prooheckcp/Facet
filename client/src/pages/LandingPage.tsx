import { Link } from "react-router-dom";
import { TopNav } from "../components/TopNav";

export function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--gradient-hero)" }}>
      <TopNav />

      <div className="page" style={{ paddingTop: 96, paddingBottom: 96, textAlign: "center" }}>
        <div
          className="pill"
          style={{
            background: "rgba(167,139,250,0.12)",
            color: "#c4b5fd",
            marginBottom: 24,
            padding: "6px 16px",
          }}
        >
          AI-generated frontends, zero backend changes
        </div>
        <h1 style={{ fontSize: "3.4rem", lineHeight: 1.1, margin: "0 0 20px" }}>
          Your API. <span className="gradient-text">Any interface.</span>
        </h1>
        <p style={{ fontSize: "1.2rem", color: "var(--text-muted)", maxWidth: 640, margin: "0 auto 40px" }}>
          Facet sits between your application's backend and its users. Register your endpoints once —
          every user gets an AI-generated frontend tailored to how they actually want to work.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <Link to="/marketplace" className="btn btn-primary" style={{ padding: "14px 28px", fontSize: "1rem" }}>
            Explore the marketplace →
          </Link>
          <Link to="/dashboard" className="btn" style={{ padding: "14px 28px", fontSize: "1rem" }}>
            Register your app
          </Link>
        </div>
      </div>

      <div className="page" style={{ paddingBottom: 120 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {[
            {
              title: "Describe once",
              body: "Give Facet your app's abstract and describe every endpoint. No SDKs, no code changes to your backend.",
            },
            {
              title: "Ask for anything",
              body: "Users pick your app and describe the interface they want — a Kanban board, a calendar, a minimal task list.",
            },
            {
              title: "Ship the interface",
              body: "The Facet agent reads your metadata and generates a frontend that talks to your real API, end to end.",
            },
          ].map((f) => (
            <div key={f.title} className="card">
              <h3 style={{ marginTop: 0 }}>{f.title}</h3>
              <p style={{ color: "var(--text-muted)", margin: 0 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type Mode = "login" | "register";

export function AuthPage({ initialMode = "login" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const navigate = useNavigate();

  // Demo only: no real auth — any submit "logs you in" and drops you on the dashboard.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate("/dashboard");
  }

  const isLogin = mode === "login";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        background:
          "radial-gradient(circle at 50% 0%, rgba(124,58,237,0.16), transparent 55%)," +
          "radial-gradient(circle at 15% 90%, rgba(59,110,246,0.16), transparent 45%)",
      }}
    >
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <img src="/IconLogo.png" alt="" style={{ height: 34, width: "auto", display: "block" }} />
        <span style={{ fontWeight: 800, fontSize: "1.35rem", color: "var(--text)" }}>Facet</span>
      </Link>

      <div className="card" style={{ width: "100%", maxWidth: 420, padding: 32 }}>
        <h1 style={{ margin: "0 0 6px", fontSize: "1.6rem", letterSpacing: "-0.02em" }}>
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p style={{ margin: "0 0 24px", color: "var(--text-muted)", fontSize: "0.95rem" }}>
          {isLogin
            ? "Log in to manage your applications and API keys."
            : "Register to start turning your API into any interface."}
        </p>

        {/* Mode toggle */}
        <div
          style={{
            display: "flex",
            gap: 4,
            padding: 4,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            marginBottom: 24,
          }}
        >
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 9,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.9rem",
                color: mode === m ? "#fff" : "var(--text-muted)",
                background: mode === m ? "var(--gradient-brand)" : "transparent",
              }}
            >
              {m === "login" ? "Log in" : "Register"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="field">
              <label>Full name</label>
              <input type="text" placeholder="Ada Lovelace" autoComplete="name" />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@company.com" autoComplete="email" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" autoComplete={isLogin ? "current-password" : "new-password"} />
          </div>

          <button className="btn btn-anim" type="submit" style={{ width: "100%", justifyContent: "center", padding: "12px 0", marginTop: 8 }}>
            {isLogin ? "Log in" : "Create account"}
          </button>
        </form>

        <p style={{ margin: "20px 0 0", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
          {isLogin ? "New to Facet? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setMode(isLogin ? "register" : "login")}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#6b21d6", fontWeight: 600 }}
          >
            {isLogin ? "Create an account" : "Log in"}
          </button>
        </p>
      </div>

      <p style={{ marginTop: 20, color: "var(--text-dim)", fontSize: "0.8rem" }}>
        Demo mode — no credentials required.
      </p>
    </div>
  );
}

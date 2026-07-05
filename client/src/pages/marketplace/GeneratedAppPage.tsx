import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { usePageTitle } from "../../hooks/usePageTitle";
import { api } from "../../api/client";
import { IconChat, IconClose, IconSend } from "../../components/icons";

type ChatEntry = { id: number; text: string; status: "sending" | "done" | "error"; error?: string };

export function GeneratedAppPage() {
  const { appId, buildId } = useParams<{ appId: string; buildId: string }>();
  usePageTitle("Generated app");

  // Bumped after each successful edit to force the iframe to reload the updated build.
  const [version, setVersion] = useState(0);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [log, setLog] = useState<ChatEntry[]>([]);
  const nextId = useRef(0);

  // Trailing slash so relative links between the generated pages resolve; the
  // ?v param cache-busts so the iframe reloads after an edit.
  const src = buildId ? `/api/generated/${buildId}/?v=${version}` : "";

  async function send() {
    const text = input.trim();
    if (!text || sending || !buildId) return;

    const id = nextId.current++;
    setLog((l) => [...l, { id, text, status: "sending" }]);
    setInput("");
    setSending(true);
    try {
      await api.refineBuild(buildId, text);
      setLog((l) => l.map((e) => (e.id === id ? { ...e, status: "done" } : e)));
      setVersion((v) => v + 1);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to modify the build";
      setLog((l) => l.map((e) => (e.id === id ? { ...e, status: "error", error: msg } : e)));
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-elevated)",
        }}
      >
        <Link to={`/marketplace/${appId}`} style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          ← Back to application
        </Link>
        <span className="pill" style={{ background: "rgba(124,58,237,0.12)", color: "#6b21d6" }}>
          Facet generated preview
        </span>
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        {src && (
          <iframe
            title="Generated application"
            src={src}
            sandbox="allow-scripts allow-forms allow-popups"
            style={{ width: "100%", height: "100%", border: "none", background: "#fff" }}
          />
        )}

        {/* Chat popup for modifying the build */}
        {open && (
          <div
            style={{
              position: "fixed",
              right: 24,
              bottom: 96,
              width: 360,
              maxWidth: "calc(100vw - 48px)",
              maxHeight: "70vh",
              display: "flex",
              flexDirection: "column",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              boxShadow: "0 24px 60px -20px rgba(40,70,160,0.5)",
              zIndex: 60,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 8,
                padding: "14px 16px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>Modify this build</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>
                  Describe a change and Facet updates the page.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  display: "inline-flex",
                  padding: 4,
                }}
              >
                <IconClose />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {log.length === 0 && (
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Try: <em>“make the header purple”</em>, <em>“add a footer with a home button”</em>, or{" "}
                  <em>“switch to a dark theme with bigger buttons”</em>.
                </p>
              )}
              {log.map((e) => (
                <div key={e.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div
                    style={{
                      alignSelf: "flex-end",
                      maxWidth: "85%",
                      background: "var(--gradient-brand)",
                      color: "#fff",
                      padding: "8px 12px",
                      borderRadius: 12,
                      borderBottomRightRadius: 4,
                      fontSize: "0.9rem",
                    }}
                  >
                    {e.text}
                  </div>
                  <div style={{ alignSelf: "flex-end", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: 6 }}>
                    {e.status === "sending" && (
                      <>
                        <span className="spinner" />
                        <span style={{ color: "var(--text-muted)" }}>Applying changes…</span>
                      </>
                    )}
                    {e.status === "done" && <span style={{ color: "#047857" }}>✓ Applied — preview updated</span>}
                    {e.status === "error" && <span style={{ color: "#dc2626" }}>{e.error}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", padding: 12, borderTop: "1px solid var(--border)" }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={2}
                placeholder="Describe a change…"
                style={{ resize: "none", flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={send}
                disabled={!input.trim() || sending}
                aria-label="Send change request"
                style={{ padding: "10px 12px" }}
              >
                {sending ? (
                  <span className="spinner" style={{ borderColor: "rgba(255,255,255,0.4)", borderTopColor: "#fff" }} />
                ) : (
                  <IconSend />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Floating toggle button */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close chat" : "Modify this build"}
          style={{
            position: "fixed",
            right: 24,
            bottom: 24,
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            background: "var(--gradient-brand)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 14px 30px -8px rgba(124,58,237,0.6)",
            zIndex: 60,
          }}
        >
          {open ? <IconClose size={22} /> : <IconChat size={22} />}
        </button>
      </div>
    </div>
  );
}

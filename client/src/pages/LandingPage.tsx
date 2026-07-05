import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import { TopNav } from "../components/TopNav";
import { Typewriter } from "../components/Typewriter";
import { Reveal, staggerContainer, staggerItem } from "../components/Reveal";

const MotionLink = motion.create(Link);

/* Facet gem mark — the centered logo glyph */
function FacetMark({ size = 88 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden>
      <defs>
        <linearGradient id="facet-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="facet-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ddd6fe" />
          <stop offset="1" stopColor="#c4b5fd" />
        </linearGradient>
        <linearGradient id="facet-c" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#e879f9" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <path d="M50 6 L86 32 L50 94 Z" fill="url(#facet-a)" />
      <path d="M50 6 L14 32 L50 94 Z" fill="url(#facet-b)" />
      <path d="M50 6 L86 32 L64 32 Z" fill="url(#facet-c)" opacity="0.9" />
      <path d="M50 6 L14 32 L36 32 Z" fill="url(#facet-c)" opacity="0.6" />
      <path d="M14 32 L86 32 L50 94 Z" fill="url(#facet-a)" opacity="0.25" />
    </svg>
  );
}

const LIGHT = {
  bg: "#f6f5fc",
  card: "#ffffff",
  text: "#1b1b2e",
  muted: "#6b6b82",
  dim: "#9797ac",
  border: "rgba(27,27,46,0.09)",
  borderStrong: "rgba(27,27,46,0.16)",
};

/* A mock browser window used to fake a Facet-generated website. */
function BrowserMock({
  url,
  children,
  style,
}: {
  url: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        width: 320,
        background: LIGHT.card,
        border: `1px solid ${LIGHT.border}`,
        borderRadius: 16,
        boxShadow: "0 40px 80px -30px rgba(88,40,180,0.5)",
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "10px 12px",
          borderBottom: `1px solid ${LIGHT.border}`,
          background: "#faf9fe",
        }}
      >
        {["#ddd6fe", "#c4b5fd", "#a78bfa"].map((c) => (
          <span key={c} style={{ width: 10, height: 10, borderRadius: 999, background: c }} />
        ))}
        <span
          style={{
            marginLeft: 6,
            flex: 1,
            height: 18,
            borderRadius: 6,
            background: "#efedf7",
            display: "flex",
            alignItems: "center",
            padding: "0 8px",
            fontSize: 9,
            color: "#8b84a3",
            letterSpacing: "0.02em",
          }}
        >
          {url}
        </span>
      </div>
      <div style={{ padding: 14, height: 224, background: LIGHT.card }}>{children}</div>
    </div>
  );
}

const bar = (h: number, c: string): CSSProperties => ({
  flex: 1,
  height: h,
  borderRadius: 4,
  background: c,
  alignSelf: "flex-end",
});
const block = (style: CSSProperties = {}): CSSProperties => ({
  borderRadius: 6,
  background: "#efedf7",
  ...style,
});

/* Three fake generated sites, fanned into a stack. */
function GeneratedStack() {
  const analytics = (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
      <div style={{ display: "flex", gap: 8 }}>
        {["#7c3aed", "#a78bfa", "#c084fc"].map((c) => (
          <div key={c} style={{ flex: 1, borderRadius: 8, padding: 8, background: `${c}18` }}>
            <div style={{ ...block({ width: "60%", height: 6, background: `${c}66` }) }} />
            <div style={{ ...block({ width: "80%", height: 12, marginTop: 6, background: c }) }} />
          </div>
        ))}
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 6 }}>
        {[46, 72, 34, 88, 58, 76, 40].map((h, i) => (
          <div key={i} style={bar(h, i === 3 ? "#7c3aed" : "#c4b5fd")} />
        ))}
      </div>
    </div>
  );

  const storefront = (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, height: "100%" }}>
      <div style={{ ...block({ width: "50%", height: 14, background: "#7c3aed" }) }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flex: 1 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ borderRadius: 8, border: `1px solid ${LIGHT.border}`, padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ ...block({ flex: 1, minHeight: 34, background: i % 2 ? "#ede9fe" : "#f3e8ff" }) }} />
            <div style={{ ...block({ width: "80%", height: 7 }) }} />
            <div style={{ ...block({ width: "40%", height: 7, background: "#a78bfa" }) }} />
          </div>
        ))}
      </div>
    </div>
  );

  const kanban = (
    <div style={{ display: "flex", gap: 8, height: "100%" }}>
      {["#7c3aed", "#a78bfa", "#c084fc"].map((c, col) => (
        <div key={c} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ ...block({ height: 8, borderRadius: 4, background: `${c}80` }) }} />
          {Array.from({ length: 3 - col }).map((_, j) => (
            <div key={j} style={{ borderRadius: 6, border: `1px solid ${LIGHT.border}`, padding: 6, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ ...block({ width: "90%", height: 6 }) }} />
              <div style={{ ...block({ width: "55%", height: 6, background: `${c}66` }) }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <div style={{ position: "relative", height: 380, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <BrowserMock
          url="shopfront.facet.app"
          style={{ position: "absolute", transform: "translateX(-176px) translateY(18px) rotate(-9deg) scale(0.9)", zIndex: 1 }}
        >
          {storefront}
        </BrowserMock>
        <BrowserMock
          url="board.facet.app"
          style={{ position: "absolute", transform: "translateX(176px) translateY(18px) rotate(9deg) scale(0.9)", zIndex: 1 }}
        >
          {kanban}
        </BrowserMock>
        <BrowserMock url="metrics.facet.app" style={{ position: "absolute", zIndex: 2 }}>
          {analytics}
        </BrowserMock>
      </div>
    </div>
  );
}

/* Placeholder marketplace apps shown on the landing page.
   `tint` colors the cover fallback + pill background; `pillText` is an
   AA-contrast shade of the same hue for the pill label; `img` is the
   card cover picture (a stand-in "generated app" screenshot). */
const EXAMPLE_APPS = [
  {
    name: "TaskFlow API",
    abstract: "Project & task management backend with boards, assignees, and due dates.",
    endpoints: 14,
    tint: "#a78bfa",
    pillText: "#6d28d9",
    img: "https://picsum.photos/seed/facet-taskflow/640/360",
  },
  {
    name: "Weatherly",
    abstract: "Global forecast and historical climate data across 40,000 cities.",
    endpoints: 6,
    tint: "#818cf8",
    pillText: "#4338ca",
    img: "https://picsum.photos/seed/facet-weatherly/640/360",
  },
  {
    name: "InvoiceHub",
    abstract: "Billing, invoicing, and payment reconciliation for small businesses.",
    endpoints: 21,
    tint: "#e879f9",
    pillText: "#a21caf",
    img: "https://picsum.photos/seed/facet-invoicehub/640/360",
  },
  {
    name: "Fleetly",
    abstract: "Vehicle tracking, maintenance schedules, and driver logs in real time.",
    endpoints: 18,
    tint: "#c084fc",
    pillText: "#7e22ce",
    img: "https://picsum.photos/seed/facet-fleetly/640/360",
  },
  {
    name: "Pantry",
    abstract: "Inventory and recipe API for kitchens — stock levels and shopping lists.",
    endpoints: 9,
    tint: "#a78bfa",
    pillText: "#6d28d9",
    img: "https://picsum.photos/seed/facet-pantry/640/360",
  },
  {
    name: "PulseCRM",
    abstract: "Contacts, deals, and pipeline analytics for lightweight sales teams.",
    endpoints: 27,
    tint: "#d946ef",
    pillText: "#a21caf",
    img: "https://picsum.photos/seed/facet-pulsecrm/640/360",
  },
];

/* One API, many generated interfaces */
const INTERFACES = [
  {
    title: "Kanban board",
    body: "Drag-and-drop columns for a team that thinks in workflow stages.",
    preview: (
      <div style={{ display: "flex", gap: 8 }}>
        {["#a78bfa", "#60a5fa", "#34d399"].map((c, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ height: 8, borderRadius: 4, background: c, opacity: 0.5 }} />
            {Array.from({ length: 3 - i }).map((_, j) => (
              <div key={j} style={{ height: 22, borderRadius: 6, background: LIGHT.bg, border: `1px solid ${LIGHT.border}` }} />
            ))}
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Calendar",
    body: "A month grid for someone who lives and breathes by dates and deadlines.",
    preview: (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 }}>
        {Array.from({ length: 28 }).map((_, i) => (
          <div
            key={i}
            style={{
              aspectRatio: "1",
              borderRadius: 4,
              background: [4, 9, 15, 22].includes(i) ? "rgba(96,165,250,0.35)" : LIGHT.bg,
              border: `1px solid ${LIGHT.border}`,
            }}
          />
        ))}
      </div>
    ),
  },
  {
    title: "Data table",
    body: "A dense, sortable grid for the power user who wants everything at a glance.",
    preview: (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ width: 20, height: 12, borderRadius: 3, background: i === 0 ? "#a78bfa" : LIGHT.bg, border: `1px solid ${LIGHT.border}` }} />
            <div style={{ flex: 2, height: 12, borderRadius: 3, background: LIGHT.bg, border: `1px solid ${LIGHT.border}` }} />
            <div style={{ flex: 1, height: 12, borderRadius: 3, background: LIGHT.bg, border: `1px solid ${LIGHT.border}` }} />
            <div style={{ flex: 1, height: 12, borderRadius: 3, background: i === 0 ? "rgba(52,211,153,0.4)" : LIGHT.bg, border: `1px solid ${LIGHT.border}` }} />
          </div>
        ))}
      </div>
    ),
  },
];

const STEPS = [
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
];

const STATS = [
  { value: "3 min", label: "From endpoints to a live UI" },
  { value: "0", label: "Backend changes required" },
  { value: "∞", label: "Interfaces per API" },
  { value: "100%", label: "Talks to your real data" },
];

/* An "antigravity"-style field of tiny dots that brighten, grow, and get
   nudged away as the cursor passes. Canvas-based for smooth 60fps. */
function DotField({
  containerRef,
  mouse,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const containerEl = containerRef.current;
    if (!canvasEl || !containerEl) return;
    const context = canvasEl.getContext("2d");
    if (!context) return;
    // Aliases after the guards carry non-null types into the nested closures.
    const canvas = canvasEl;
    const container = containerEl;
    const ctx = context;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const GAP = 26; // spacing between dots
    const BASE_R = 1.1; // idle dot radius
    const RADIUS = 150; // cursor influence radius
    let w = 0;
    let h = 0;
    let raf = 0;
    let mx = -1000;
    let my = -1000;

    function resize() {
      const rect = container.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    function frame() {
      // ease the cursor position for smooth trails
      mx += (mouse.current.x - mx) * 0.18;
      my += (mouse.current.y - my) * 0.18;
      ctx.clearRect(0, 0, w, h);

      for (let gy = GAP / 2; gy < h; gy += GAP) {
        for (let gx = GAP / 2; gx < w; gx += GAP) {
          const dx = gx - mx;
          const dy = gy - my;
          const dist = Math.hypot(dx, dy);
          const t = Math.max(0, 1 - dist / RADIUS); // 0..1 proximity
          const ease = t * t;
          const push = ease * 10; // nudge away from cursor
          const nx = dist > 0.001 ? gx + (dx / dist) * push : gx;
          const ny = dist > 0.001 ? gy + (dy / dist) * push : gy;
          const alpha = 0.12 + ease * 0.78;
          const r = BASE_R + ease * 1.7;
          ctx.beginPath();
          ctx.arc(nx, ny, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(124, 58, 237, ${alpha})`;
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [containerRef, mouse]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}
    />
  );
}

/* Hero wrapper with a dot field + a purple glow that follow the cursor.
   Both layers are pointer-events:none and sit BEHIND the content
   (zIndex 0/1 vs 2), so buttons stay fully clickable. */
function HeroSpotlight({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -1000, y: -1000 });
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  // Snappier spring so the glow tracks the cursor much more tightly.
  const spring = { stiffness: 700, damping: 34, mass: 0.35 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);
  const glow = useMotionTemplate`radial-gradient(420px circle at ${sx}px ${sy}px, rgba(124,58,237,0.3), rgba(168,85,247,0.12) 42%, transparent 66%)`;

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    x.set(px);
    y.set(py);
    mouse.current.x = px;
    mouse.current.y = py;
  }

  function handleLeave() {
    x.set(-400);
    y.set(-400);
    mouse.current.x = -1000;
    mouse.current.y = -1000;
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ position: "relative", overflow: "hidden", ...style }}
    >
      <motion.div aria-hidden style={{ position: "absolute", inset: 0, background: glow, pointerEvents: "none", zIndex: 0 }} />
      <DotField containerRef={ref} mouse={mouse} />
      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div style={{ background: LIGHT.bg, color: LIGHT.text, minHeight: "100vh" }}>
      <TopNav light />

      {/* ---------- HERO ---------- */}
      <HeroSpotlight
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(124,58,237,0.2), transparent 55%)," +
            "radial-gradient(circle at 15% 30%, rgba(167,139,250,0.16), transparent 45%)," +
            "radial-gradient(circle at 85% 20%, rgba(192,132,252,0.16), transparent 45%)",
        }}
      >
        <div
          className="page"
          style={{ paddingTop: 80, paddingBottom: 72, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          {/* centered logo */}
          <FacetMark size={96} />

          <div
            className="pill"
            style={{ background: "rgba(124,58,237,0.12)", color: "#6b21d6", margin: "28px 0 20px", padding: "6px 16px" }}
          >
            AI-generated frontends, zero backend changes
          </div>

          <h1 style={{ fontSize: "clamp(2.1rem, 8vw, 3.4rem)", lineHeight: 1.12, margin: "0 0 20px", letterSpacing: "-0.02em" }}>
            One API.
            <br />
            <Typewriter words={["Any interface.", "Any design.", "Any workflow.", "Any layout.", "Any dashboard.", "Any user."]} />
          </h1>
          <p style={{ fontSize: "1.2rem", color: LIGHT.muted, maxWidth: 640, margin: "0 auto 40px" }}>
            Facet sits between your application's backend and its users. Register your endpoints once —
            every user gets an AI-generated frontend tailored to how they actually want to work.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 64 }}>
            <Link to="/marketplace" className="btn btn-primary" style={{ padding: "14px 28px", fontSize: "1rem" }}>
              Explore the marketplace →
            </Link>
            <Link
              to="/dashboard"
              className="btn"
              style={{ padding: "14px 28px", fontSize: "1rem", background: LIGHT.card, borderColor: LIGHT.borderStrong, color: LIGHT.text }}
            >
              Register your app
            </Link>
          </div>

          {/* stack of "generated" websites */}
          <GeneratedStack />
          <p style={{ color: LIGHT.muted, fontSize: "0.85rem", marginTop: 8, letterSpacing: "0.03em", textTransform: "uppercase", fontWeight: 600 }}>
            Real frontends, generated on demand from one backend
          </p>
        </div>
      </HeroSpotlight>

      {/* ---------- STATS STRIP ---------- */}
      <Reveal className="page" y={20}>
        <div
          style={{
            marginBottom: 96,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 16,
            background: LIGHT.card,
            border: `1px solid ${LIGHT.border}`,
            borderRadius: 18,
            padding: "32px 24px",
            boxShadow: "0 24px 60px -32px rgba(88,60,180,0.25)",
          }}
        >
          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div className="gradient-text-light" style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                {s.value}
              </div>
              <div style={{ color: LIGHT.muted, fontSize: "0.9rem", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ---------- EXAMPLE APPLICATIONS ---------- */}
      <div className="page" style={{ paddingBottom: 96 }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ color: "#6b21d6", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Live on the marketplace
            </div>
            <h2 style={{ fontSize: "clamp(1.7rem, 5vw, 2.2rem)", margin: "8px 0 12px", letterSpacing: "-0.02em" }}>Explore example applications</h2>
            <p style={{ color: LIGHT.muted, maxWidth: 560, margin: "0 auto", fontSize: "1.05rem" }}>
              Real backends, already registered with Facet. Pick one, describe your ideal interface, and watch it get built.
            </p>
          </div>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}
        >
          {EXAMPLE_APPS.map((app) => (
            <MotionLink key={app.name} variants={staggerItem} whileHover={{ y: -6 }} to="/marketplace" className="app-card">
              <span className="app-card__ring" aria-hidden />
              <div className="app-card__cover" style={{ background: `linear-gradient(135deg, ${app.tint}33, ${app.tint}14)` }}>
                <img src={app.img} alt={`${app.name} preview`} loading="lazy" />
              </div>
              <div className="app-card__body">
                <h3 style={{ margin: "0 0 8px", fontSize: "1.15rem" }}>{app.name}</h3>
                <p style={{ color: LIGHT.muted, margin: "0 0 18px", minHeight: 44, fontSize: "0.95rem" }}>{app.abstract}</p>
                <span
                  className="pill"
                  style={{ background: `${app.tint}22`, color: app.pillText, fontWeight: 700, marginTop: "auto", alignSelf: "flex-start" }}
                >
                  {app.endpoints} endpoints
                </span>
              </div>
            </MotionLink>
          ))}
        </motion.div>

        <div style={{ textAlign: "center", marginTop: 36 }}>
          <Link to="/marketplace" className="btn" style={{ background: LIGHT.card, borderColor: LIGHT.borderStrong, color: LIGHT.text, padding: "12px 24px" }}>
            Browse the full marketplace →
          </Link>
        </div>
      </div>

      {/* ---------- INTERFACE VARIETY ---------- */}
      <div style={{ background: LIGHT.card, borderTop: `1px solid ${LIGHT.border}`, borderBottom: `1px solid ${LIGHT.border}` }}>
        <div className="page" style={{ paddingTop: 88, paddingBottom: 88 }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={{ color: "#6b21d6", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                One API, many faces
              </div>
              <h2 style={{ fontSize: "clamp(1.7rem, 5vw, 2.2rem)", margin: "8px 0 12px", letterSpacing: "-0.02em" }}>
                The same endpoints, the interface each user wants
              </h2>
              <p style={{ color: LIGHT.muted, maxWidth: 560, margin: "0 auto", fontSize: "1.05rem" }}>
                Give TaskFlow to three different people and Facet generates three different frontends — all backed by the exact same API.
              </p>
            </div>
          </Reveal>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}
          >
            {INTERFACES.map((iface) => (
              <motion.div
                key={iface.title}
                variants={staggerItem}
                style={{
                  background: LIGHT.bg,
                  border: `1px solid ${LIGHT.border}`,
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <div
                  style={{
                    background: LIGHT.card,
                    border: `1px solid ${LIGHT.border}`,
                    borderRadius: 12,
                    padding: 16,
                    height: 150,
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 18,
                  }}
                >
                  <div style={{ width: "100%" }}>{iface.preview}</div>
                </div>
                <h3 style={{ margin: "0 0 6px", fontSize: "1.1rem" }}>{iface.title}</h3>
                <p style={{ color: LIGHT.muted, margin: 0, fontSize: "0.92rem" }}>{iface.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ---------- HOW IT WORKS ---------- */}
      <div className="page" style={{ paddingTop: 88, paddingBottom: 88 }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div style={{ color: "#6b21d6", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              How it works
            </div>
            <h2 style={{ fontSize: "clamp(1.7rem, 5vw, 2.2rem)", margin: "8px 0 0", letterSpacing: "-0.02em" }}>Three steps to a tailored frontend</h2>
          </div>
        </Reveal>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}
        >
          {STEPS.map((f, i) => (
            <motion.div
              key={f.title}
              variants={staggerItem}
              style={{ background: LIGHT.card, border: `1px solid ${LIGHT.border}`, borderRadius: 16, padding: 28 }}
            >
              <div
                className="gradient-text-light"
                style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 10 }}
              >
                0{i + 1}
              </div>
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: LIGHT.muted, margin: 0 }}>{f.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ---------- CLOSING CTA ---------- */}
      <Reveal className="page">
        <div
          style={{
            marginBottom: 100,
            textAlign: "center",
            borderRadius: 24,
            padding: "64px 32px",
            background:
              "radial-gradient(circle at 30% 20%, rgba(167,139,250,0.24), transparent 60%)," +
              "radial-gradient(circle at 75% 80%, rgba(192,132,252,0.2), transparent 55%)," +
              LIGHT.card,
            border: `1px solid ${LIGHT.border}`,
            boxShadow: "0 30px 70px -40px rgba(88,60,180,0.4)",
          }}
        >
          <FacetMark size={56} />
          <h2 style={{ fontSize: "clamp(1.8rem, 6vw, 2.4rem)", margin: "18px 0 12px", letterSpacing: "-0.02em" }}>
            Bring your API. <span className="gradient-text-light">Leave with an interface.</span>
          </h2>
          <p style={{ color: LIGHT.muted, maxWidth: 520, margin: "0 auto 32px", fontSize: "1.1rem" }}>
            Register your endpoints in minutes and let your users design the frontend they've always wanted.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: "14px 28px", fontSize: "1rem" }}>
              Register your app
            </Link>
            <Link
              to="/marketplace"
              className="btn"
              style={{ padding: "14px 28px", fontSize: "1rem", background: LIGHT.card, borderColor: LIGHT.borderStrong, color: LIGHT.text }}
            >
              Explore the marketplace
            </Link>
          </div>
        </div>
      </Reveal>

      {/* ---------- FOOTER ---------- */}
      <footer style={{ borderTop: `1px solid ${LIGHT.border}`, padding: "32px 24px" }}>
        <div
          className="page"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, padding: 0 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FacetMark size={24} />
            <span style={{ fontWeight: 700 }} className="gradient-text-light">Facet</span>
          </div>
          <div style={{ color: "#6b6b82", fontSize: "0.9rem" }}>
            © 2026 Facet — Your API. Any interface.
          </div>
        </div>
      </footer>
    </div>
  );
}

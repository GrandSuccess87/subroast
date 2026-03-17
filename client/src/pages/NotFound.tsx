import { useLocation } from "wouter";

const FONT_DISPLAY = "Cormorant Garamond, Georgia, serif";
const FONT_MONO = "JetBrains Mono, monospace";
const BG = "oklch(0.09 0.008 60)";
const BORDER = "oklch(0.22 0.007 60)";
const IVORY = "oklch(0.88 0.025 85)";
const FOREGROUND = "oklch(0.93 0.010 80)";
const MUTED = "oklch(0.62 0.006 80)";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
      <div style={{ maxWidth: "400px", width: "100%" }}>

        {/* 404 number */}
        <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.35em", textTransform: "uppercase", color: MUTED, marginBottom: "1rem" }}>
          Error 404
        </p>

        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(3rem, 8vw, 5rem)", fontWeight: 300, fontStyle: "italic", color: FOREGROUND, lineHeight: 1, marginBottom: "1rem" }}>
          Page Not Found
        </h1>

        <div style={{ width: "2rem", height: "0.5px", background: IVORY, margin: "0 auto 1.5rem" }} />

        <p style={{ fontSize: "0.82rem", color: MUTED, lineHeight: 1.7, marginBottom: "2.5rem" }}>
          The page you're looking for doesn't exist. It may have been moved or deleted.
        </p>

        <button
          onClick={() => setLocation("/")}
          style={{ padding: "0.75rem 2rem", background: "transparent", border: `0.5px solid ${IVORY}`, color: IVORY, fontFamily: FONT_MONO, fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", cursor: "pointer" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = IVORY; e.currentTarget.style.color = BG; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = IVORY; }}
        >
          Return Home
        </button>
      </div>
    </div>
  );
}

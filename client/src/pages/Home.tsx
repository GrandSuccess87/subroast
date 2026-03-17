import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { DashboardLayoutSkeleton } from "@/components/DashboardLayoutSkeleton";
import { ArchitecturalIllustration } from "@/components/ArchitecturalIllustration";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

/* ── Intersection-observer fade-up ── */
function useFadeUp(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (delay) el.style.transitionDelay = `${delay}ms`;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return ref;
}

/* ── Intelligence Report Mockup ── */
function ReportMockup() {
  return (
    <div className="relative w-full max-w-[400px] mx-auto lg:mx-0 lg:ml-auto">
      {/* Faint gold aura */}
      <div
        className="absolute -inset-8 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, oklch(0.88 0.025 85 / 0.07) 0%, transparent 70%)",
        }}
      />

      {/* Report document */}
      <div
        className="relative"
        style={{
          background: "oklch(0.12 0.007 60)",
          border: "0.5px solid oklch(0.24 0.007 60)",
        }}
      >
        {/* Report header */}
        <div
          className="px-7 pt-7 pb-5"
          style={{ borderBottom: "0.5px solid oklch(0.20 0.007 60)" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p
                className="eyebrow mb-1"
                style={{ color: "oklch(0.88 0.025 85)", fontSize: "0.6rem" }}
              >
                SubRoast Intelligence
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  color: "oklch(0.38 0 0)",
                  letterSpacing: "0.1em",
                }}
              >
                POST ANALYSIS REPORT
              </p>
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.55rem",
                color: "oklch(0.48 0 0)",
                textAlign: "right",
                letterSpacing: "0.08em",
              }}
            >
              <div>REF-2024-0312</div>
              <div>r/SaaS</div>
            </div>
          </div>

          {/* Title */}
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.05rem",
              fontWeight: 400,
              color: "oklch(0.93 0.010 80)",
              lineHeight: 1.3,
            }}
          >
            "Just launched my SaaS tool for tracking Reddit mentions…"
          </p>
        </div>

        {/* Score grid */}
        <div
          className="grid grid-cols-3"
          style={{ borderBottom: "0.5px solid oklch(0.20 0.007 60)" }}
        >
          {[
            { label: "Clarity", value: "74", sub: "Moderate" },
            { label: "Fit", value: "81", sub: "Strong" },
            { label: "Virality", value: "68", sub: "Fair" },
          ].map((s, i) => (
            <div
              key={s.label}
              className="px-5 py-4 text-center"
              style={{
                borderRight: i < 2 ? "0.5px solid oklch(0.20 0.007 60)" : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "1.75rem",
                  fontWeight: 300,
                  color: "oklch(0.88 0.025 85)",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.55rem",
                  color: "oklch(0.62 0.006 80)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginTop: "0.35rem",
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.5rem",
                  color: "oklch(0.38 0 0)",
                  letterSpacing: "0.08em",
                  marginTop: "0.15rem",
                }}
              >
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Assessment */}
        <div
          className="px-7 py-5"
          style={{ borderBottom: "0.5px solid oklch(0.20 0.007 60)" }}
        >
          <p
            className="eyebrow mb-3"
            style={{ fontSize: "0.58rem", color: "oklch(0.88 0.025 85 / 0.7)" }}
          >
            Assessment
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              fontWeight: 300,
              color: "oklch(0.55 0.006 80)",
              lineHeight: 1.65,
            }}
          >
            This draft reads as promotional rather than conversational. Reddit's
            highest-performing posts lead with a problem, not a product. Recommend
            restructuring the opening to surface the pain point first.
          </p>
        </div>

        {/* Improved draft */}
        <div
          className="px-7 py-5"
          style={{ borderBottom: "0.5px solid oklch(0.20 0.007 60)" }}
        >
          <p
            className="eyebrow mb-3"
            style={{ fontSize: "0.58rem", color: "oklch(0.88 0.025 85 / 0.7)" }}
          >
            Recommended Draft
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              fontWeight: 300,
              color: "oklch(0.72 0.006 80)",
              lineHeight: 1.65,
              fontStyle: "italic",
            }}
          >
            "Has anyone found a reliable way to track when your product gets mentioned
            on Reddit? I built something for this after spending 3 hours manually
            searching…"
          </p>
        </div>

        {/* Virality tip */}
        <div className="px-7 py-5">
          <div className="flex items-start gap-3">
            <div
              style={{
                width: "1px",
                alignSelf: "stretch",
                background: "oklch(0.88 0.025 85 / 0.4)",
                flexShrink: 0,
              }}
            />
            <div>
              <p
                className="eyebrow mb-1.5"
                style={{ fontSize: "0.58rem", color: "oklch(0.88 0.025 85 / 0.7)" }}
              >
                Virality Recommendation
              </p>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.7rem",
                  fontWeight: 300,
                  color: "oklch(0.62 0.006 80)",
                  lineHeight: 1.6,
                }}
              >
                Posts opening with "Has anyone…" receive 2.4× more comments on
                r/SaaS. Optimal posting window: Tuesday–Thursday, 9–11am EST.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Score improved badge */}
      <div
        className="absolute -bottom-3 -right-3 px-3 py-1.5"
        style={{
          background: "oklch(0.88 0.025 85)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          fontWeight: 400,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "oklch(0.09 0.008 60)",
        }}
      >
        +18 pts after revision
      </div>
    </div>
  );
}

/* ── X (Twitter) logo SVG ── */
function XLogo() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 1200 1227"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: 0.4, flexShrink: 0 }}
    >
      <path
        d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"
        fill="oklch(0.55 0.006 80)"
      />
    </svg>
  );
}

/* ── Luxury section divider ── */
function Divider() {
  return (
    <div className="flex items-center gap-6 py-2">
      <div className="flex-1 rule-gold" />
      <div
        style={{
          width: "4px",
          height: "4px",
          background: "oklch(0.88 0.025 85 / 0.5)",
          transform: "rotate(45deg)",
          flexShrink: 0,
        }}
      />
      <div className="flex-1 rule-gold" />
    </div>
  );
}

/* ── Use Case Card ── */
function UseCaseCard({
  tag,
  headline,
  body,
  stat,
}: {
  tag: string;
  headline: string;
  body: string;
  stat: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="card-hover-lift"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "3rem",
        background: "oklch(0.115 0.007 60)",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        borderTop: hovered ? "2px solid oklch(0.78 0.14 65 / 0.75)" : "2px solid transparent",
        transition: "border-top-color 0.3s ease",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.58rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "oklch(0.88 0.025 85)",
          border: "0.5px solid oklch(0.88 0.025 85 / 0.3)",
          padding: "0.2rem 0.6rem",
          alignSelf: "flex-start",
        }}
      >
        {tag}
      </span>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.3rem, 2.5vw, 1.7rem)",
          fontWeight: 400,
          fontStyle: "italic",
          color: hovered ? "oklch(0.98 0.010 80)" : "oklch(0.92 0.006 80)",
          lineHeight: 1.25,
          transition: "color 0.3s ease",
        }}
      >
        {headline}
      </h3>
      <p
        style={{
          fontSize: "0.88rem",
          color: "oklch(0.60 0.006 80)",
          lineHeight: 1.75,
        }}
      >
        {body}
      </p>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          letterSpacing: "0.1em",
          color: hovered ? "oklch(0.72 0.008 75)" : "oklch(0.55 0.006 80)",
          borderTop: "0.5px solid oklch(0.20 0.007 60)",
          paddingTop: "1rem",
          marginTop: "auto",
          transition: "color 0.3s ease",
        }}
      >
        {stat}
      </p>
    </div>
  );
}

/* ── Feature row ── */
function FeatureRow({
  number,
  title,
  desc,
  delay = 0,
}: {
  number: string;
  title: string;
  desc: string;
  delay?: number;
}) {
  const ref = useFadeUp(delay);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      className="fade-up card-hover-lift grid md:grid-cols-[80px_1fr_2fr] gap-6 md:gap-10 py-10 px-4"
      style={{
        borderBottom: "0.5px solid oklch(0.18 0.007 60)",
        borderLeft: hovered ? "2px solid oklch(0.78 0.14 65 / 0.7)" : "2px solid transparent",
        paddingLeft: hovered ? "calc(1rem - 2px)" : "1rem",
        transition: "border-left-color 0.3s ease, padding-left 0.3s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          fontWeight: 300,
          letterSpacing: "0.18em",
          color: hovered ? "oklch(0.88 0.025 85)" : "oklch(0.88 0.025 85 / 0.5)",
          paddingTop: "0.2rem",
          transition: "color 0.3s ease",
        }}
      >
        {number}
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.35rem",
          fontWeight: 400,
          color: hovered ? "oklch(0.98 0.010 80)" : "oklch(0.93 0.010 80)",
          lineHeight: 1.2,
          transition: "color 0.3s ease",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.875rem",
          fontWeight: 300,
          color: "oklch(0.72 0.006 80)",
          lineHeight: 1.75,
        }}
      >
        {desc}
      </div>
    </div>
  );
}

/* ── Demo Illustration Section ── */
function VideoSection() {
  const ref = useFadeUp();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [playing, setPlaying] = useState(false);
  const VIDEO_EMBED_URL = ""; // Drop your Loom/YouTube embed URL here to restore video mode

  return (
    <section
      id="demo"
      style={{
        paddingTop: "clamp(5rem, 10vw, 9rem)",
        paddingBottom: "clamp(5rem, 10vw, 9rem)",
        borderBottom: "0.5px solid oklch(0.18 0.007 60)",
      }}
    >
      <div className="container">
        <div ref={ref} className="fade-up mb-16 max-w-xl">
          <p className="eyebrow mb-5">AI Analysis</p>
          <h2 className="display-lg mb-6">
            The intelligence report
          </h2>
          <div className="rule-gold mb-6" style={{ width: "3rem" }} />

        </div>

              {/* Intelligence Report Mockup — full-width showcase */}
        <div className="relative">
          {/* Wide ambient glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              inset: "-4rem -6rem",
              background:
                "radial-gradient(ellipse 60% 50% at 50% 50%, oklch(0.78 0.14 65 / 0.07) 0%, transparent 70%)",
            }}
          />
          {/* Report card — wider layout */}
          <div
            className="relative grid md:grid-cols-2 gap-0"
            style={{
              background: "oklch(0.12 0.007 60)",
              border: "0.5px solid oklch(0.24 0.007 60)",
              maxWidth: "860px",
            }}
          >
            {/* Left column: header + scores + assessment */}
            <div style={{ borderRight: "0.5px solid oklch(0.20 0.007 60)" }}>
              {/* Report header */}
              <div
                className="px-8 pt-8 pb-6"
                style={{ borderBottom: "0.5px solid oklch(0.20 0.007 60)" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="eyebrow mb-1" style={{ color: "oklch(0.88 0.025 85)", fontSize: "0.6rem" }}>
                      SubRoast Intelligence
                    </p>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "oklch(0.38 0 0)", letterSpacing: "0.1em" }}>
                      POST ANALYSIS REPORT
                    </p>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "oklch(0.48 0 0)", textAlign: "right", letterSpacing: "0.08em" }}>
                    <div>REF-2024-0312</div>
                    <div>r/SaaS</div>
                  </div>
                </div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 400, color: "oklch(0.93 0.010 80)", lineHeight: 1.3 }}>
                  "Just launched my SaaS tool for tracking Reddit mentions…"
                </p>
              </div>

              {/* Score grid */}
              <div className="grid grid-cols-3" style={{ borderBottom: "0.5px solid oklch(0.20 0.007 60)" }}>
                {[{ label: "Clarity", value: "74", sub: "Moderate" }, { label: "Fit", value: "81", sub: "Strong" }, { label: "Virality", value: "68", sub: "Fair" }].map((s, i) => (
                  <div key={s.label} className="px-5 py-5 text-center" style={{ borderRight: i < 2 ? "0.5px solid oklch(0.20 0.007 60)" : "none" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "2rem", fontWeight: 300, color: "oklch(0.88 0.025 85)", lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "oklch(0.62 0.006 80)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "0.4rem" }}>{s.label}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "oklch(0.38 0 0)", letterSpacing: "0.08em", marginTop: "0.15rem" }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Assessment */}
              <div className="px-8 py-6">
                <p className="eyebrow mb-3" style={{ fontSize: "0.58rem", color: "oklch(0.88 0.025 85 / 0.7)" }}>Assessment</p>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", fontWeight: 300, color: "oklch(0.55 0.006 80)", lineHeight: 1.7 }}>
                  This draft reads as promotional rather than conversational. Reddit’s highest-performing posts lead with a problem, not a product. Recommend restructuring the opening to surface the pain point first.
                </p>
              </div>
            </div>

            {/* Right column: recommended draft + virality tip + badge */}
            <div className="relative flex flex-col">
              {/* Recommended draft */}
              <div className="px-8 pt-8 pb-6" style={{ borderBottom: "0.5px solid oklch(0.20 0.007 60)" }}>
                <p className="eyebrow mb-3" style={{ fontSize: "0.58rem", color: "oklch(0.88 0.025 85 / 0.7)" }}>Recommended Draft</p>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", fontWeight: 300, color: "oklch(0.72 0.006 80)", lineHeight: 1.7, fontStyle: "italic" }}>
                  "Has anyone found a reliable way to track when your product gets mentioned on Reddit? I built something for this after spending 3 hours manually searching…"
                </p>
              </div>

              {/* Virality tip */}
              <div className="px-8 py-6" style={{ borderBottom: "0.5px solid oklch(0.20 0.007 60)" }}>
                <div className="flex items-start gap-3">
                  <div style={{ width: "1px", alignSelf: "stretch", background: "oklch(0.88 0.025 85 / 0.4)", flexShrink: 0 }} />
                  <div>
                    <p className="eyebrow mb-2" style={{ fontSize: "0.58rem", color: "oklch(0.88 0.025 85 / 0.7)" }}>Virality Recommendation</p>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", fontWeight: 300, color: "oklch(0.62 0.006 80)", lineHeight: 1.65 }}>
                      Posts opening with “Has anyone…” receive 2.4× more comments on r/SaaS. Optimal posting window: Tuesday–Thursday, 9–11am EST.
                    </p>
                  </div>
                </div>
              </div>

              {/* Lead signal */}
              <div className="px-8 py-6">
                <p className="eyebrow mb-3" style={{ fontSize: "0.58rem", color: "oklch(0.88 0.025 85 / 0.7)" }}>Lead Signal Detected</p>
                <div
                  className="px-4 py-3"
                  style={{ background: "oklch(0.15 0.010 65)", border: "0.5px solid oklch(0.28 0.020 65)" }}
                >
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "oklch(0.78 0.14 65)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" }}>3 warm leads in r/SaaS</p>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 300, color: "oklch(0.55 0.006 80)", lineHeight: 1.6 }}>
                    Posts mentioning “Reddit tracking” or “mentions tool” in the last 48 hours. Outreach drafts ready.
                  </p>
                </div>
              </div>

              {/* Score improved badge */}
              <div
                className="absolute -bottom-3 -right-3 px-3 py-1.5"
                style={{
                  background: "oklch(0.88 0.025 85)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  fontWeight: 400,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "oklch(0.09 0.008 60)",
                }}
              >
                +18 pts after revision
              </div>
            </div>
          </div>

          {/* Caption */}
          <p
            className="mt-5"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              color: "oklch(0.55 0 0)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Six-step intelligence chain — Detect · Analyze · Score · Draft · Queue · Complete
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── Stat bar ── */
function StatBar() {
  const ref = useFadeUp();
  const STATS = [
    { value: "6", label: "Step AI chain" },
    { value: "25", label: "DMs per day" },
    { value: "1–100", label: "Virality score" },
    { value: "7", label: "Day free trial" },
  ];
  return (
    <section
      style={{
        borderTop: "0.5px solid oklch(0.18 0.007 60)",
        borderBottom: "0.5px solid oklch(0.18 0.007 60)",
        background: "oklch(0.10 0.007 60)",
      }}
    >
      <div className="container">
        <div ref={ref} className="fade-up grid grid-cols-2 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="py-8 text-center"
              style={{
                borderRight:
                  i < STATS.length - 1 ? "0.5px solid oklch(0.18 0.007 60)" : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                  fontWeight: 300,
                  color: "oklch(0.88 0.025 85)",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.58rem",
                  color: "oklch(0.38 0 0)",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  marginTop: "0.5rem",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Main ── */
export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  // Set SEO-optimised page title (30–60 chars)
  useEffect(() => {
    document.title = "SubRoast — AI Reddit Growth Tool for Founders";
    return () => { document.title = "SubRoast"; };
  }, []);

  // Redirect authenticated users
  useEffect(() => {
    if (!loading && isAuthenticated) setLocation("/dashboard");
  }, [isAuthenticated, loading, setLocation]);

  // Subtle hero parallax
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onScroll = () => {
      hero.style.transform = `translateY(${window.scrollY * 0.08}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Nav scroll state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (loading) return <DashboardLayoutSkeleton />;

  return (
    <div
      style={{
        minHeight: "100svh",
        background: "oklch(0.09 0.008 60)",
        color: "oklch(0.93 0.010 80)",
      }}
    >
      {/* ── NAV ── */}
      <nav
        className="sticky top-0 z-50"
        style={{
          borderBottom: scrolled ? "0.5px solid oklch(0.22 0.007 60)" : "0.5px solid transparent",
          background: scrolled ? "oklch(0.09 0.008 60 / 0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
          transition: "background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease",
        }}
      >
        <div className="container flex items-center justify-between h-14">
          {/* Logo + Wordmark */}
          <a
            href="/"
            style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}
          >
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663208942813/D6eMQgvSZZr9tsyS9zVhzn/subroast-logo-debossed_490a86ef.png"
              alt="SubRoast"
              style={{ width: "28px", height: "28px", objectFit: "cover", borderRadius: "2px", opacity: 0.9 }}
            />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
                fontWeight: 400,
                fontStyle: "italic",
                color: "oklch(0.93 0.010 80)",
                letterSpacing: "0.01em",
              }}
            >
              SubRoast
            </span>
          </a>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { href: "#lead-intelligence", label: "How It Works" },
              { href: "#safety", label: "Account Safety" },
              { href: "/pricing", label: "Pricing" },
            ].map(({ href, label }) => (
              <a
                key={label}
                href={href}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  fontWeight: 300,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "oklch(0.55 0 0)",
                  textDecoration: "none",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLAnchorElement).style.color = "oklch(0.88 0.025 85)")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLAnchorElement).style.color = "oklch(0.55 0 0)")
                }
              >
                {label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <a href={getLoginUrl()} className="btn-luxury">
            Begin
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{
          minHeight: "calc(100svh - 3.5rem)",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Very subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(oklch(0.88 0.025 85 / 0.03) 0.5px, transparent 0.5px), linear-gradient(90deg, oklch(0.88 0.025 85 / 0.03) 0.5px, transparent 0.5px)`,
            backgroundSize: "80px 80px",
          }}
        />

        {/* SVG noise texture — adds analogue grain depth */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: 0.18, mixBlendMode: "soft-light" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id="hero-noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.72"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#hero-noise)" />
        </svg>

        <div className="container relative w-full">
          <div className="flex flex-col items-center py-24 lg:py-32">

            {/* Center: editorial copy */}
            <div ref={heroRef} style={{ maxWidth: "42rem", width: "100%", textAlign: "center" }}>
              {/* Eyebrow */}
              <p className="eyebrow mb-8">
                AI Intelligence for Reddit
              </p>

              {/* Display headline */}
              <h1 className="display-xl mb-6">
                Stop guessing.
                <br />
                <span style={{ color: "oklch(0.88 0.025 85)" }}>
                  Start winning.
                </span>
              </h1>

              {/* Gold rule */}
              <div
                style={{
                  width: "4rem",
                  height: "0.5px",
                  background: "oklch(0.88 0.025 85 / 0.6)",
                  marginBottom: "2rem",
                  margin: "0 auto 2rem",
                }}
              />

              {/* Body */}
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1rem",
                  fontWeight: 300,
                  color: "oklch(0.62 0.006 80)",
                  lineHeight: 1.8,
                  maxWidth: "52ch",
                  marginBottom: "3rem",
                  margin: "0 auto 3rem",
                }}
              >
                AI roast, virality score, and rewrite for every post.
                Warm leads found, outreach drafted, validation signals surfaced — automatically.
              </p>

              {/* CTAs */}
              <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                {/* Radial amber glow behind the CTA area */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    inset: "-2rem -3rem",
                    background: "radial-gradient(ellipse 70% 80% at 50% 50%, oklch(0.78 0.14 65 / 0.10) 0%, transparent 70%)",
                    zIndex: 0,
                  }}
                />
                <a href={getLoginUrl()} className="btn-luxury-primary" style={{ position: "relative", zIndex: 1, textAlign: "center", justifyContent: "center" }}>
                  Begin free trial
                </a>
                <a href="#lead-intelligence" className="btn-luxury" style={{ position: "relative", zIndex: 1 }}>
                  See how it works
                </a>
              </div>

              {/* Trust line */}
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  color: "oklch(0.78 0.012 80)",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                Seven days complimentary · No card required · Cancel at any time
              </p>
            </div>

            {/* Right: architectural SVG demo — commented out, restore if needed */}
            {/* <div className="hidden lg:flex justify-end items-center">
              <div className="relative w-full max-w-[520px]">
                <div className="absolute -inset-8 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, oklch(0.88 0.025 85 / 0.06) 0%, transparent 70%)" }} />
                <div style={{ border: "0.5px solid oklch(0.22 0.007 60)", overflow: "hidden" }}>
                  <ArchitecturalIllustration />
                </div>
              </div>
            </div> */}
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent, oklch(0.09 0.008 60))",
          }}
        />
      </section>

      {/* ── LEAD INTELLIGENCE DEMO ── */}
      <LeadIntelligenceDemo />

      {/* ── DEMO VIDEO ── */}
      <VideoSection />

      {/* ── USE CASES ── */}
      <section
        style={{
          paddingTop: "clamp(5rem, 10vw, 9rem)",
          paddingBottom: "clamp(5rem, 10vw, 9rem)",
          borderBottom: "0.5px solid oklch(0.18 0.007 60)",
          background: "oklch(0.10 0.007 60)",
        }}
      >
        <div className="container">
          <p className="eyebrow mb-5">Use Cases</p>
          <h2 className="display-md mb-12" style={{ maxWidth: "22ch" }}>
            Three ways founders use SubRoast
          </h2>
          <div className="grid lg:grid-cols-3 gap-px" style={{ border: "0.5px solid oklch(0.18 0.007 60)" }}>
            {[
              {
                tag: "Lead Generation",
                headline: "Find buyers already talking about your product or service",
                body: "Monitor subreddits, score leads by relevance and urgency, draft personalized outreach. You review and send.",
                stat: "High-signal leads only — scored by relevance, urgency, and subreddit fit",
              },
              {
                tag: "Draft & Roast",
                headline: "Write better Reddit content before you hit post",
                body: "Paste your draft. Get a clarity score, subreddit fit, virality rating, and a fully rewritten version.",
                stat: "Know how your post will land — before it does",
              },
              {
                tag: "App Validation",
                headline: "Know if people will pay before you build",
                body: "Surface real complaints in your niche, score them by signal strength, and validate willingness to pay before writing a line of code.",
                stat: "48-hour validation framework, built in",
              },
            ].map(({ tag, headline, body, stat }) => (
              <UseCaseCard key={tag} tag={tag} headline={headline} body={body} stat={stat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF STRIP ── */}
      <section
        style={{
          borderTop: "0.5px solid oklch(0.18 0.007 60)",
          borderBottom: "0.5px solid oklch(0.18 0.007 60)",
          padding: "clamp(2.5rem, 5vw, 4rem) 0",
          background: "oklch(0.07 0.006 60)",
        }}
      >
        <div className="container">
          {/* Eyebrow */}
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "oklch(0.55 0.006 80)",
              textAlign: "center",
              marginBottom: "2.5rem",
            }}
          >
            Early signal
          </p>

          {/* Two-column grid on desktop, stacked on mobile */}
          <div
            className="grid lg:grid-cols-2"
            style={{ gap: "0", maxWidth: "72rem", margin: "0 auto" }}
          >
            {/* Quote 1 — @zara_ferna94287 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.1rem",
                padding: "clamp(1.5rem, 3vw, 2.5rem)",
                borderRight: "0.5px solid oklch(0.18 0.007 60)",
                borderBottom: "0.5px solid oklch(0.18 0.007 60)",
              }}
              className="lg:border-b-0"
            >
              <blockquote
                style={{
                  fontFamily: "var(--font-sans)",
                  fontStyle: "normal",
                  fontSize: "clamp(1rem, 2vw, 1.25rem)",
                  fontWeight: 500,
                  color: "oklch(0.93 0.010 80)",
                  lineHeight: 1.6,
                  margin: 0,
                  padding: 0,
                  border: "none",
                }}
              >
                &ldquo;Day six and already solving real pain points.&rdquo;
              </blockquote>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "auto" }}>
                <XLogo />
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.08em", color: "oklch(0.65 0.006 80)" }}>
                  @zara_ferna94287 &nbsp;&middot;&nbsp; responding to SubRoast&apos;s launch
                </p>
              </div>
            </div>

            {/* Quote 2 — @viberankdev */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.1rem",
                padding: "clamp(1.5rem, 3vw, 2.5rem)",
              }}
            >
              <blockquote
                style={{
                  fontFamily: "var(--font-sans)",
                  fontStyle: "normal",
                  fontSize: "clamp(1rem, 2vw, 1.25rem)",
                  fontWeight: 500,
                  color: "oklch(0.93 0.010 80)",
                  lineHeight: 1.6,
                  margin: 0,
                  padding: 0,
                  border: "none",
                }}
              >
                &ldquo;Reddit moderation is tough — a pre-check tool is a great idea. Scoring warm leads sounds super useful for targeting.&rdquo;
              </blockquote>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "auto" }}>
                <XLogo />
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.08em", color: "oklch(0.65 0.006 80)" }}>
                  @viberankdev &nbsp;&middot;&nbsp; responding to SubRoast&apos;s launch
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SAFETY ── */}
      <section
        id="safety"
        style={{
          paddingTop: "clamp(5rem, 10vw, 9rem)",
          paddingBottom: "clamp(5rem, 10vw, 9rem)",
          borderBottom: "0.5px solid oklch(0.18 0.007 60)",
        }}
      >
        <div className="container max-w-3xl">
          <SafetyBlock />
        </div>
      </section>

      {/* ── CTA ── */}
      <CtaSection />

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: "0.5px solid oklch(0.18 0.007 60)",
          padding: "2rem 0",
        }}
      >
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.9rem",
              fontStyle: "italic",
              color: "oklch(0.58 0 0)",
            }}
          >
            SubRoast
          </span>
          <div className="flex items-center gap-6">
            {[
              { href: "/pricing", label: "Pricing" },
              { href: "/feedback", label: "Feedback" },
            ].map(({ href, label }) => (
              <a
                key={label}
                href={href}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.58rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "oklch(0.62 0.006 80)",
                  textDecoration: "none",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLAnchorElement).style.color = "oklch(0.88 0.025 85)")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLAnchorElement).style.color = "oklch(0.62 0.006 80)")
                }
              >
                {label}
              </a>
            ))}
          </div>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.55rem",
              color: "oklch(0.42 0 0)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            &copy; {new Date().getFullYear()} SubRoast. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ── Lead Intelligence Demo ── */
const CHAIN_STEPS = [
  { id: "scan",    label: "Scanning subreddits",       sub: "r/SaaS · r/startups · r/entrepreneur" },
  { id: "filter",  label: "Spam check running",         sub: "Filtering bots, ad accounts, thin posts" },
  { id: "score",   label: "Scoring relevance",          sub: "Intent · Urgency · Subreddit fit" },
  { id: "draft",   label: "Drafting outreach",          sub: "Personalised to each post" },
  { id: "queue",   label: "Queueing for review",        sub: "Awaiting your approval" },
  { id: "done",    label: "Lead ready",                 sub: "High-signal · Outreach drafted" },
];

const SPAM_POSTS = [
  { text: "Best crypto signals 2024 — join now!", spam: true },
  { text: "How do I find my first SaaS customers?", spam: false },
  { text: "Earn $500/day from home — DM me", spam: true },
  { text: "Struggling to get traction on Reddit", spam: false },
  { text: "FREE followers — click link in bio", spam: true },
];

const COMMENT_TEXT = "Hey — saw your post about Reddit traction. I built SubRoast specifically for this problem. It scores your draft before you post and finds warm leads in your target subreddits. Happy to share more if useful.";

function LeadIntelligenceDemo() {
  const sectionRef = useFadeUp();
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0); // 0=chain, 1=spam, 2=lead, 3=comment
  const [activeStep, setActiveStep] = useState(0);
  const [visiblePosts, setVisiblePosts] = useState(0);
  const [showLead, setShowLead] = useState(false);
  const [typedChars, setTypedChars] = useState(0);

  // Cycle phases automatically
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (phase === 0) {
      if (activeStep < CHAIN_STEPS.length - 1) {
        timeout = setTimeout(() => setActiveStep(s => s + 1), 600);
      } else {
        timeout = setTimeout(() => { setPhase(1); setActiveStep(0); setVisiblePosts(0); }, 1200);
      }
    } else if (phase === 1) {
      if (visiblePosts < SPAM_POSTS.length) {
        timeout = setTimeout(() => setVisiblePosts(v => v + 1), 400);
      } else {
        timeout = setTimeout(() => { setPhase(2); setShowLead(false); setTimeout(() => setShowLead(true), 300); }, 1000);
      }
    } else if (phase === 2) {
      // Hold lead card then move to comment drafting
      timeout = setTimeout(() => { setPhase(3); setTypedChars(0); }, 3500);
    } else {
      // Type out the comment, then restart
      if (typedChars < COMMENT_TEXT.length) {
        timeout = setTimeout(() => setTypedChars(c => c + 1), 28);
      } else {
        timeout = setTimeout(() => { setPhase(0); setActiveStep(0); setVisiblePosts(0); setShowLead(false); setTypedChars(0); }, 3000);
      }
    }
    return () => clearTimeout(timeout);
  }, [phase, activeStep, visiblePosts, typedChars]);

  return (
    <section
      id="lead-intelligence"
      style={{
        paddingTop: "clamp(5rem, 10vw, 9rem)",
        paddingBottom: "clamp(5rem, 10vw, 9rem)",
        borderBottom: "0.5px solid oklch(0.18 0.007 60)",
        background: "oklch(0.09 0.007 60)",
      }}
    >
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div ref={sectionRef} className="fade-up">
            <p className="eyebrow mb-5">Lead Intelligence</p>
            <h2 className="display-lg mb-6">From subreddit to warm lead</h2>
            <div className="rule-gold mb-6" style={{ width: "3rem" }} />
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9375rem", fontWeight: 300, color: "oklch(0.62 0.006 80)", lineHeight: 1.75, maxWidth: "44ch" }}>
              SubRoast runs a six-step AI chain continuously — scanning, filtering spam, scoring intent, drafting personalised DMs, and writing public comment replies before you even open the app.
            </p>
          </div>

          {/* Right: animated demo panel */}
          <div
            style={{
              background: "oklch(0.12 0.007 60)",
              border: "0.5px solid oklch(0.22 0.007 60)",
              minHeight: "340px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Panel header */}
            <div
              style={{
                borderBottom: "0.5px solid oklch(0.18 0.007 60)",
                padding: "0.75rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "oklch(0.78 0.14 65)", animation: "pulse 2s ease-in-out infinite" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.62 0.006 80)" }}>
                {phase === 0 ? "AI chain running" : phase === 1 ? "Spam filter" : phase === 2 ? "Lead ready" : "Drafting comment"}
              </span>
            </div>

            {/* Phase 0: 6-step chain */}
            {phase === 0 && (
              <div style={{ padding: "1.25rem" }}>
                {CHAIN_STEPS.map((step, i) => (
                  <div
                    key={step.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      padding: "0.6rem 0",
                      borderBottom: i < CHAIN_STEPS.length - 1 ? "0.5px solid oklch(0.16 0.007 60)" : "none",
                      opacity: i <= activeStep ? 1 : 0.2,
                      transition: "opacity 0.4s ease",
                    }}
                  >
                    {/* Step indicator */}
                    <div style={{
                      width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0, marginTop: "1px",
                      background: i < activeStep ? "oklch(0.78 0.14 65)" : i === activeStep ? "oklch(0.78 0.14 65 / 0.25)" : "oklch(0.18 0.007 60)",
                      border: i === activeStep ? "1px solid oklch(0.78 0.14 65)" : "1px solid oklch(0.22 0.007 60)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.4s ease",
                    }}>
                      {i < activeStep && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1.5 4L3.5 6L6.5 2" stroke="oklch(0.09 0.008 60)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {i === activeStep && (
                        <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "oklch(0.78 0.14 65)", animation: "pulse 1s ease-in-out infinite" }} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.08em", color: i <= activeStep ? "oklch(0.88 0.025 85)" : "oklch(0.38 0 0)", transition: "color 0.4s ease" }}>
                        {step.label}
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "oklch(0.38 0 0)", letterSpacing: "0.06em", marginTop: "0.15rem" }}>
                        {step.sub}
                      </div>
                    </div>
                    {/* Step number */}
                    <div style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "oklch(0.28 0 0)", letterSpacing: "0.1em" }}>
                      0{i + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Phase 1: spam filter */}
            {phase === 1 && (
              <div style={{ padding: "1.25rem" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "oklch(0.38 0 0)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                  {visiblePosts} of {SPAM_POSTS.length} posts evaluated
                </div>
                {SPAM_POSTS.slice(0, visiblePosts).map((post, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.55rem 0.75rem",
                      marginBottom: "0.4rem",
                      background: post.spam ? "oklch(0.14 0.015 25 / 0.6)" : "oklch(0.14 0.010 140 / 0.4)",
                      border: `0.5px solid ${post.spam ? "oklch(0.35 0.08 25)" : "oklch(0.30 0.06 140)"}`,
                      animation: "fadeSlideIn 0.3s ease forwards",
                    }}
                  >
                    <div style={{
                      width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                      background: post.spam ? "oklch(0.65 0.18 25)" : "oklch(0.65 0.15 140)",
                    }} />
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 300, color: post.spam ? "oklch(0.55 0.006 80)" : "oklch(0.75 0.006 80)", flex: 1, lineHeight: 1.4 }}>
                      {post.text}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase", color: post.spam ? "oklch(0.65 0.18 25)" : "oklch(0.65 0.15 140)", flexShrink: 0 }}>
                      {post.spam ? "Filtered" : "Signal"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Phase 3: comment drafting */}
            {phase === 3 && (
              <div style={{ padding: "1.25rem" }}>
                {/* Context bar */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", padding: "0.5rem 0.75rem", background: "oklch(0.14 0.007 60)", border: "0.5px solid oklch(0.20 0.007 60)" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.78 0.14 65)" }}>r/SaaS</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: "oklch(0.28 0 0)" }}>/</span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 300, color: "oklch(0.62 0.006 80)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    &ldquo;Struggling to get traction on Reddit without sounding like an ad&rdquo;
                  </span>
                </div>
                {/* Comment box */}
                <div style={{ background: "oklch(0.10 0.007 60)", border: "0.5px solid oklch(0.22 0.007 60)", padding: "0.875rem 1rem", minHeight: "120px" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.45 0 0)", marginBottom: "0.6rem" }}>Public comment draft</div>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 300, color: "oklch(0.82 0.006 80)", lineHeight: 1.65 }}>
                    {COMMENT_TEXT.slice(0, typedChars)}
                    <span style={{ display: "inline-block", width: "1px", height: "0.9em", background: "oklch(0.78 0.14 65)", marginLeft: "1px", verticalAlign: "text-bottom", animation: "pulse 1s ease-in-out infinite" }} />
                  </p>
                </div>
                {/* Status */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem" }}>
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "oklch(0.78 0.14 65)", animation: "pulse 1.5s ease-in-out infinite" }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.45 0 0)" }}>AI writing — review before posting</span>
                </div>
              </div>
            )}

            {/* Phase 2: lead card */}
            {phase === 2 && (
              <div
                style={{
                  padding: "1.25rem",
                  opacity: showLead ? 1 : 0,
                  transform: showLead ? "translateY(0)" : "translateY(12px)",
                  transition: "opacity 0.5s ease, transform 0.5s ease",
                }}
              >
                {/* Lead card */}
                <div
                  style={{
                    background: "oklch(0.14 0.010 65)",
                    border: "0.5px solid oklch(0.30 0.025 65)",
                    padding: "1rem 1.25rem",
                  }}
                >
                  {/* Card header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.78 0.14 65)", background: "oklch(0.20 0.020 65)", padding: "0.2rem 0.5rem" }}>r/SaaS</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.65 0.15 140)", background: "oklch(0.16 0.012 140)", padding: "0.2rem 0.5rem" }}>High intent</span>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "oklch(0.38 0 0)", letterSpacing: "0.08em" }}>2h ago</span>
                  </div>
                  {/* Post title */}
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 400, color: "oklch(0.93 0.010 80)", lineHeight: 1.35, marginBottom: "0.6rem" }}>
                    "Struggling to get traction on Reddit without sounding like an ad"
                  </p>
                  {/* Scores */}
                  <div style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem" }}>
                    {[{ l: "Relevance", v: "94" }, { l: "Urgency", v: "87" }, { l: "Fit", v: "91" }].map(s => (
                      <div key={s.l}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", fontWeight: 300, color: "oklch(0.88 0.025 85)", lineHeight: 1 }}>{s.v}</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "oklch(0.38 0 0)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "0.2rem" }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  {/* DM preview */}
                  <div style={{ borderTop: "0.5px solid oklch(0.22 0.007 60)", paddingTop: "0.65rem" }}>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.88 0.025 85 / 0.6)", marginBottom: "0.35rem" }}>Outreach draft ready</p>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 300, color: "oklch(0.62 0.006 80)", lineHeight: 1.6, fontStyle: "italic" }}>
                      "Hey — saw your post about Reddit traction. I built SubRoast specifically for this problem…"
                    </p>
                  </div>
                </div>
                {/* Counter */}
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "oklch(0.38 0 0)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "0.75rem" }}>
                  1 of 12 leads ready for review
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Process step (extracted to avoid hook-in-loop) ── */
function ProcessStep({
  n,
  title,
  body,
  hasBorder,
  delay = 0,
}: {
  n: string;
  title: string;
  body: string;
  hasBorder: boolean;
  delay?: number;
}) {
  const ref = useFadeUp(delay);
  return (
    <div
      ref={ref}
      className="fade-up grid grid-cols-[40px_1fr] gap-8 py-10"
      style={{ borderBottom: hasBorder ? "0.5px solid oklch(0.18 0.007 60)" : "none" }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.5rem",
          fontWeight: 300,
          fontStyle: "italic",
          color: "oklch(0.88 0.025 85 / 0.4)",
          lineHeight: 1,
          paddingTop: "0.15rem",
        }}
      >
        {n}
      </div>
      <div>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.35rem",
            fontWeight: 400,
            color: "oklch(0.93 0.010 80)",
            marginBottom: "0.75rem",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.875rem",
            fontWeight: 300,
            color: "oklch(0.72 0.006 80)",
            lineHeight: 1.75,
          }}
        >
          {body}
        </p>
      </div>
    </div>
  );
}

const SAFETY_ITEMS = [
  "Spam risk score on every lead",
  "Flags templated or bot-like content",
  "Roast catches promo language before you post",
  "One-click send via extension — coming soon",
  "Sends from your browser session — no API token, no bot fingerprint",
  "Your browser session, your account",
];

/* ── Safety block (extracted to avoid hook-in-loop) ── */
function SafetyBlock() {
  const ref = useFadeUp();
  const gridRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(SAFETY_ITEMS.map(() => false));

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          SAFETY_ITEMS.forEach((_, i) => {
            setTimeout(() => {
              setVisibleItems(prev => {
                const next = [...prev];
                next[i] = true;
                return next;
              });
            }, i * 220);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="fade-up grid md:grid-cols-[1fr_2fr] gap-12 items-start">
      <div>
        <p className="eyebrow mb-5">Account safety</p>
        <h2 className="display-md mb-4">
          Rate limiting, built in
        </h2>
        <div
          style={{
            width: "3rem",
            height: "0.5px",
            background: "oklch(0.88 0.025 85 / 0.5)",
          }}
        />
      </div>
      <div ref={gridRef}>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
          {SAFETY_ITEMS.map((item, i) => (
            <div
              key={item}
              className="flex items-start gap-3"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.8125rem",
                fontWeight: 300,
                color: "oklch(0.72 0.006 80)",
                lineHeight: 1.6,
                opacity: visibleItems[i] ? 1 : 0,
                transform: visibleItems[i] ? "translateX(0)" : "translateX(-16px)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
              }}
            >
              <span
                style={{
                  width: "1px",
                  height: "1rem",
                  background: "oklch(0.88 0.025 85 / 0.4)",
                  flexShrink: 0,
                  marginTop: "0.15rem",
                }}
              />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── CTA section (extracted to avoid hook-in-loop) ── */
function CtaSection() {
  const ref = useFadeUp();
  return (
    <section
      style={{
        paddingTop: "clamp(6rem, 12vw, 11rem)",
        paddingBottom: "clamp(6rem, 12vw, 11rem)",
        background: "oklch(0.10 0.007 60)",
        borderBottom: "0.5px solid oklch(0.18 0.007 60)",
      }}
    >
      <div ref={ref} className="fade-up container text-center">
        <p className="eyebrow mb-8 block">Ready to begin</p>
        <a href={getLoginUrl()} className="btn-luxury-primary" style={{ marginBottom: "0" }}>
          Begin free trial — seven days
        </a>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.58rem",
            color: "oklch(0.62 0.008 60)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginTop: "1.5rem",
          }}
        >
          No credit card required · Cancel at any time
        </p>
      </div>
    </section>
  );
}

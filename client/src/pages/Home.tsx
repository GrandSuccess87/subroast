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
          <p className="eyebrow mb-5">In practice</p>
          <h2 className="display-lg mb-6">
            From blank draft to warm leads
          </h2>
          <div className="rule-gold mb-6" style={{ width: "3rem" }} />
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.9375rem",
              fontWeight: 300,
              color: "oklch(0.62 0.006 80)",
              lineHeight: 1.75,
            }}
          >
            Watch the complete six-step intelligence chain — from post analysis
            to personalized outreach — executed in under sixty seconds.
          </p>
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
              { href: "#demo", label: "Walkthrough" },
              { href: "#capabilities", label: "Capabilities" },
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
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center py-24 lg:py-0">

            {/* Left: editorial copy */}
            <div ref={heroRef}>
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
                  maxWidth: "38ch",
                  marginBottom: "3rem",
                }}
              >
                SubRoast gives every Reddit post an AI roast, a virality score,
                and a rewrite — then finds warm leads, drafts personalized
                outreach, and mines Reddit for product validation signals while
                you sleep.
              </p>

              {/* CTAs */}
              <div className="relative flex flex-col sm:flex-row items-start gap-4 mb-10">
                {/* Radial amber glow behind the CTA area */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    inset: "-2rem -3rem",
                    background: "radial-gradient(ellipse 70% 80% at 30% 50%, oklch(0.78 0.14 65 / 0.10) 0%, transparent 70%)",
                    zIndex: 0,
                  }}
                />
                <a href={getLoginUrl()} className="btn-luxury-primary" style={{ position: "relative", zIndex: 1 }}>
                  Begin free trial
                </a>
                <a href="#demo" className="btn-luxury" style={{ position: "relative", zIndex: 1 }}>
                  View walkthrough
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

            {/* Right: architectural SVG demo */}
            <div className="hidden lg:flex justify-end items-center">
              <div
                className="relative w-full max-w-[520px]"
              >
                {/* Faint gold aura */}
                <div
                  className="absolute -inset-8 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse 60% 50% at 50% 50%, oklch(0.88 0.025 85 / 0.06) 0%, transparent 70%)",
                  }}
                />
                <div
                  style={{
                    border: "0.5px solid oklch(0.22 0.007 60)",
                    overflow: "hidden",
                  }}
                >
                  <ArchitecturalIllustration />
                </div>
              </div>
            </div>
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

      {/* ── STAT BAR ── */}
      <StatBar />

      {/* ── DEMO VIDEO ── */}
      <VideoSection />

      {/* ── CAPABILITIES ── */}
      <section
        id="capabilities"
        style={{
          paddingTop: "clamp(5rem, 10vw, 9rem)",
          paddingBottom: "clamp(5rem, 10vw, 9rem)",
          borderBottom: "0.5px solid oklch(0.18 0.007 60)",
        }}
      >
        <div className="container">
          {/* Section header */}
          <div className="grid lg:grid-cols-[1fr_2fr] gap-12 mb-16">
            <div>
              <p className="eyebrow mb-5">Capabilities</p>
              <h2 className="display-md">
                Everything required to win on Reddit
              </h2>
            </div>
            <div className="flex items-end">
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9375rem",
                  fontWeight: 300,
          color: "oklch(0.70 0.006 80)",
          lineHeight: 1.75,
          maxWidth: "48ch",
                }}
              >
                A complete intelligence suite — from post analysis to lead
                generation to personalized outreach — designed for founders who
                treat Reddit as a serious acquisition channel.
              </p>
            </div>
          </div>

          <Divider />

          {/* Feature rows */}
          {[
            {
              number: "01",
              title: "AI Draft & Roast",
              desc: "Paste your draft and receive a structured analysis: clarity score, subreddit fit score, virality score, a brutally honest roast, and a fully rewritten version — all before you publish.",
            },
            {
              number: "02",
              title: "Lead Intelligence",
              desc: "SubRoast monitors your target subreddits continuously, scoring each post by relevance and urgency. Only the highest-signal leads surface in your inbox.",
            },
            {
              number: "03",
              title: "Personalized Outreach",
              desc: "For each lead, the AI reads the original post and drafts a message that references specific details — never a template, always a conversation starter.",
            },
            {
              number: "04",
              title: "Public Comment Drafting",
              desc: "Beyond DMs, SubRoast drafts public comment replies that add genuine value to the thread — positioning you as a peer, not a promoter.",
            },
            {
              number: "05",
              title: "Account Safety",
              desc: "AI spam scoring flags risky leads before you reach out. The upcoming Chrome extension sends from your own browser — no API, no bot flags, no ban risk.",
            },
            {
              number: "06",
              title: "History & Performance",
              desc: "Every post, DM, and comment is logged with status and engagement context. Track what works and refine your approach over time.",
            },
            {
              number: "07",
              title: "App Validation",
              desc: "Run a research campaign to mine Reddit for 40+ unique complaints in a niche. Identify willingness to pay before you write a single line of code — the 48-hour validation framework, built in.",
            },
          ].map((f, i) => (
            <FeatureRow key={f.number} {...f} delay={i * 80} />
          ))}
        </div>
      </section>

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
                body: "SubRoast monitors niche subreddits, scores each post by relevance and urgency, and drafts a personalized DM for every high-signal prospect. You review, copy, and send — no cold lists, no mass blasting.",
                stat: "High-signal leads only — scored by relevance, urgency, and subreddit fit",
              },
              {
                tag: "Draft & Roast",
                headline: "Write better Reddit content before you hit post",
                body: "Paste your draft post or comment and SubRoast's AI gives you a brutally honest score: relevance to the subreddit, likely engagement, tone, and a virality rating from 1–100. Rewrite with confidence, not guesswork.",
                stat: "Know how your post will land — before it does",
              },
              {
                tag: "App Validation",
                headline: "Know if people will pay before you build",
                body: "Run a research campaign to surface real complaints in your target niche. SubRoast finds the posts, scores them by signal strength, and drafts personalised outreach so you can start the conversation.",
                stat: "Surface pain points — then validate willingness to pay before writing a line of code",
              },
            ].map(({ tag, headline, body, stat }) => (
              <UseCaseCard key={tag} tag={tag} headline={headline} body={body} stat={stat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        style={{
          paddingTop: "clamp(5rem, 10vw, 9rem)",
          paddingBottom: "clamp(5rem, 10vw, 9rem)",
          borderBottom: "0.5px solid oklch(0.18 0.007 60)",
          background: "oklch(0.10 0.007 60)",
        }}
      >
        <div className="container">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-start">
            {/* Left */}
            <div>
              <p className="eyebrow mb-5">Process</p>
              <h2 className="display-md mb-6">
                Two steps from draft to leads
              </h2>
              <div
                style={{
                  width: "3rem",
                  height: "0.5px",
                  background: "oklch(0.88 0.025 85 / 0.5)",
                }}
              />
            </div>

            {/* Right: steps */}
            <div>
              <ProcessStep
                n="I"
                title="Roast your post"
                body="Paste your draft. Receive a clarity score, a subreddit fit score, a virality score, a roast, and a rewritten version. Publish only when the numbers say you're ready."
                hasBorder
                delay={0}
              />
              <ProcessStep
                n="II"
                title="Find leads & send outreach"
                body="SubRoast scans your target subreddits, scores each post by relevance, and drafts a personalized DM for every prospect. You review, then send with one click via the browser extension — coming soon."
                hasBorder={false}
                delay={150}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── SAFETY ── */}
      <section
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

/* ── Safety block (extracted to avoid hook-in-loop) ── */
function SafetyBlock() {
  const ref = useFadeUp();
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
      <div>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.9375rem",
            fontWeight: 300,
            color: "oklch(0.72 0.006 80)",
            lineHeight: 1.75,
            marginBottom: "2rem",
          }}
        >
          SubRoast keeps you inside Reddit's unwritten rules. The AI flags risky content before you post. The upcoming Chrome extension sends from your own browser session — no API token, no bot fingerprint, no ban risk.
        </p>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
          {[
            "Spam risk score on every lead",
            "Flags templated or bot-like content",
            "Roast catches promo language before you post",
            "One-click send via extension — coming soon",
            "Sends from your browser session — no API token, no bot fingerprint",
            "Your browser session, your account",
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-3"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.8125rem",
                fontWeight: 300,
                color: "oklch(0.72 0.006 80)",
                lineHeight: 1.6,
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
        <h2 className="display-xl mb-6 mx-auto" style={{ maxWidth: "14ch" }}>
          Post smarter.
          <br />
          <span style={{ color: "oklch(0.88 0.025 85)" }}>Grow faster.</span>
        </h2>
        <div
          style={{
            width: "3rem",
            height: "0.5px",
            background: "oklch(0.88 0.025 85 / 0.5)",
            margin: "0 auto 2.5rem",
          }}
        />
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.9375rem",
            fontWeight: 300,
            color: "oklch(0.70 0.006 80)",
            lineHeight: 1.75,
            maxWidth: "36ch",
            margin: "0 auto 3rem",
          }}
        >
          Connect your Reddit account and receive your first AI analysis in
          under two minutes.
        </p>
        <a href={getLoginUrl()} className="btn-luxury-primary">
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

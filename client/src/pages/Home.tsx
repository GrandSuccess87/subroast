import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { DashboardLayoutSkeleton } from "@/components/DashboardLayoutSkeleton";
import { ArchitecturalIllustration } from "@/components/ArchitecturalIllustration";
import WaitlistGateModal from "@/components/WaitlistGateModal";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

/* ── Inline waitlist form for homepage ── */
function HomeWaitlistForm({ source }: { source: "home_header" | "home_footer" }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const join = trpc.waitlist.join.useMutation({
    onSuccess: () => { setStatus("success"); setEmail(""); setName(""); },
    onError: () => { setStatus("error"); setTimeout(() => setStatus("idle"), 4000); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;
    setStatus("loading");
    join.mutate({ email: email.trim(), name: name.trim(), source });
  };

  if (status === "success") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1.25rem", background: "oklch(0.14 0.010 140 / 0.4)", border: "0.5px solid oklch(0.30 0.06 140)" }}>
        <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "oklch(0.65 0.15 140)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Check size={10} color="oklch(0.09 0.008 60)" strokeWidth={2.5} />
        </div>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.65 0.15 140)" }}>
          You&rsquo;re on the list — we&rsquo;ll be in touch.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.6rem", width: "100%", maxWidth: "400px" }}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        required
        disabled={status === "loading"}
        style={{ width: "100%", padding: "0.65rem 0.875rem", background: "oklch(0.12 0.007 60)", border: "0.5px solid oklch(0.22 0.007 60)", color: "oklch(0.93 0.010 80)", fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 300, outline: "none", boxSizing: "border-box" }}
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        disabled={status === "loading"}
        style={{ width: "100%", padding: "0.65rem 0.875rem", background: "oklch(0.12 0.007 60)", border: "0.5px solid oklch(0.22 0.007 60)", color: "oklch(0.93 0.010 80)", fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 300, outline: "none", boxSizing: "border-box" }}
      />
      <button
        type="submit"
        disabled={status === "loading" || !email.trim() || !name.trim()}
        style={{ width: "100%", padding: "0.75rem 1.25rem", background: "oklch(0.88 0.025 85)", border: "none", color: "oklch(0.09 0.008 60)", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", cursor: status === "loading" ? "not-allowed" : "pointer", opacity: (status === "loading" || !email.trim() || !name.trim()) ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", boxSizing: "border-box" }}
      >
        {status === "loading" ? <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> : "Join the waitlist"}
      </button>
      {status === "error" && (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "oklch(0.65 0.18 25)", letterSpacing: "0.08em" }}>Something went wrong. Please try again.</p>
      )}
    </form>
  );
}

/* ── Intersection-observer fade-up ── */
/* ── Active section tracker for nav highlight ── */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string>("");
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [ids.join(",")]);
  return active;
}

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
  const [modalOpen, setModalOpen] = useState(false);

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

  const NAV_SECTIONS = ["lead-intelligence", "safety", "pricing"];

  function NavLinks() {
    const active = useActiveSection(NAV_SECTIONS);
    const links = [
      { href: "#lead-intelligence", label: "How It Works" },
      { href: "#safety", label: "Account Safety" },
      { href: "#pricing", label: "Pricing" },
    ];
    return (
      <div className="hidden md:flex items-center gap-8">
        {links.map(({ href, label }) => {
          const id = href.slice(1);
          const isActive = active === id;
          return (
            <a
              key={label}
              href={href}
              onClick={(e) => {
                e.preventDefault();
                const target = document.getElementById(id);
                if (target) {
                  const top = target.getBoundingClientRect().top + window.scrollY;
                  window.scrollTo({ top, behavior: "smooth" });
                }
              }}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                fontWeight: isActive ? 500 : 300,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: isActive ? "oklch(0.88 0.025 85)" : "oklch(0.55 0 0)",
                textDecoration: "none",
                transition: "color 0.3s ease, font-weight 0.2s ease",
                borderBottom: isActive ? "0.5px solid oklch(0.88 0.025 85 / 0.6)" : "0.5px solid transparent",
                paddingBottom: "2px",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLAnchorElement).style.color = "oklch(0.88 0.025 85)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLAnchorElement).style.color = isActive ? "oklch(0.88 0.025 85)" : "oklch(0.55 0 0)")
              }
            >
              {label}
            </a>
          );
        })}
      </div>
    );
  }

  if (loading) return <DashboardLayoutSkeleton />;

  return (
    <div
      style={{
        minHeight: "100svh",
        background: "oklch(0.09 0.008 60)",
        color: "oklch(0.93 0.010 80)",
      }}
    >
      <WaitlistGateModal open={modalOpen} onClose={() => setModalOpen(false)} />
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
          <NavLinks />

          {/* CTAs */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <a href={getLoginUrl()} className="btn-luxury">
              Login
            </a>
          </div>
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
          <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center py-20 lg:py-28" style={{ minWidth: 0, overflow: "hidden" }}>

            {/* LEFT: editorial copy */}
            <div ref={heroRef}>
              {/* Eyebrow */}
              <p className="eyebrow mb-8 hero-eyebrow-animate" style={{ textAlign: "center" }}>
                AI Intelligence for Reddit
              </p>

              {/* Display headline */}
              <h1 className="display-xl mb-6 hero-headline-animate">
                Stop guessing.
                <br />
                <span style={{ color: "oklch(0.88 0.025 85)" }}>
                  Start winning.
                </span>
              </h1>

              {/* Gold rule */}
              <div
                className="hero-body-animate"
                style={{
                  width: "4rem",
                  height: "0.5px",
                  background: "oklch(0.88 0.025 85 / 0.6)",
                  marginBottom: "2rem",
                }}
              />

              {/* Body */}
              <p
                className="hero-body-animate"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1rem",
                  fontWeight: 300,
                  color: "oklch(0.62 0.006 80)",
                  lineHeight: 1.8,
                  maxWidth: "48ch",
                  marginBottom: "3rem",
                }}
              >
                AI roast, virality score, and rewrite for every post.
                Warm leads found, outreach drafted, validation signals surfaced — automatically.
              </p>

              {/* CTAs */}
              <div className="relative flex flex-wrap gap-4 mb-10 hero-cta-animate">
                {/* Radial amber glow behind the CTA area */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    inset: "-2rem -3rem",
                    background: "radial-gradient(ellipse 70% 80% at 40% 50%, oklch(0.78 0.14 65 / 0.10) 0%, transparent 70%)",
                    zIndex: 0,
                  }}
                />
                <button
                  onClick={() => setModalOpen(true)}
                  className="btn-luxury-primary"
                  style={{ position: "relative", zIndex: 1, textAlign: "center", justifyContent: "center", border: "none", cursor: "pointer" }}
                >
                  Join the waitlist
                </button>
                <a
                  href="#lead-intelligence"
                  className="btn-luxury"
                  style={{ position: "relative", zIndex: 1 }}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById("lead-intelligence");
                    if (el) {
                      const top = el.getBoundingClientRect().top + window.scrollY;
                      window.scrollTo({ top, behavior: "smooth" });
                    }
                  }}
                >
                  See how it works
                </a>
              </div>

              {/* Trust line */}
              <p
                className="hero-cta-animate"
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

            {/* RIGHT: Lead Intelligence section + animated demo */}
            <div className="hero-cta-animate" style={{ minWidth: 0, overflow: "hidden", width: "100%" }}>
              {/* Section header */}
              <div style={{ marginBottom: "1.5rem" }}>
                <p className="eyebrow mb-3" style={{ color: "oklch(0.88 0.025 85 / 0.7)" }}>Lead Intelligence</p>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.25rem, 2vw, 1.6rem)",
                    fontWeight: 400,
                    color: "oklch(0.93 0.010 80)",
                    lineHeight: 1.25,
                    marginBottom: "0.75rem",
                  }}
                >
                  From subreddit to warm lead
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.875rem",
                    fontWeight: 300,
                    color: "oklch(0.55 0.006 80)",
                    lineHeight: 1.7,
                    maxWidth: "44ch",
                  }}
                >
                  SubRoast runs a six-step AI chain continuously — scanning, filtering spam, scoring intent, drafting personalised DMs, and writing public comment replies before you even open the app.
                </p>
              </div>

              {/* Animated demo panel — inline */}
              <div id="lead-intelligence" style={{ width: "100%", minWidth: 0, overflow: "hidden" }}>
                <HeroDemoPanel />
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
      <CtaSection onOpenModal={() => setModalOpen(true)} />

      {/* ── WHAT'S COMING ── */}
      <HomeWhatsComingSection />

      {/* ── PRICING ── */}
      <HomePricingSection />

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "0.5px solid oklch(0.18 0.007 60)" }}>
        {/* Waitlist strip — commented out, re-enable when ready
        <div
          style={{
            borderBottom: "0.5px solid oklch(0.18 0.007 60)",
            padding: "clamp(3rem, 6vw, 5rem) 0",
            background: "oklch(0.08 0.007 60)",
          }}
        >
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
              <div>
                <p className="eyebrow mb-4">Not ready to start a trial?</p>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                    fontWeight: 300,
                    fontStyle: "italic",
                    color: "oklch(0.93 0.010 80)",
                    lineHeight: 1.15,
                    marginBottom: "0.875rem",
                  }}
                >
                  Join the waitlist.
                  <br />
                  <span style={{ color: "oklch(0.88 0.025 85 / 0.7)" }}>Be first in line.</span>
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.875rem",
                    fontWeight: 300,
                    color: "oklch(0.55 0.006 80)",
                    lineHeight: 1.7,
                    maxWidth: "38ch",
                  }}
                >
                  We'll notify you when early access opens. Free to join, no spam, unsubscribe any time.
                </p>
              </div>
              <div>
                <HomeWaitlistForm source="home_footer" />
              </div>
            </div>
          </div>
        </div>
        */}
        {/* Bottom bar */}
        <div style={{ padding: "1.75rem 0" }}>
          <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontStyle: "italic", color: "oklch(0.58 0 0)" }}>
              SubRoast
            </span>
            <div className="flex items-center gap-6">
              {[
                { href: "#pricing", label: "Pricing" },
                { href: "/dashboard/feedback", label: "Feedback" },
              ].map(({ href, label }) => (
                <a
                  key={label}
                  href={href}
                  onClick={(e) => {
                    if (href.startsWith("#")) {
                      e.preventDefault();
                      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "oklch(0.62 0.006 80)", textDecoration: "none", transition: "color 0.3s ease" }}
                  onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "oklch(0.88 0.025 85)")}
                  onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "oklch(0.62 0.006 80)")}
                >
                  {label}
                </a>
              ))}
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "oklch(0.42 0 0)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              &copy; {new Date().getFullYear()} SubRoast. All rights reserved.
            </p>
          </div>
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

/* ── Shared animated demo panel (used in hero + Lead Intelligence section) ── */
function HeroDemoPanel() {
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
          <div
            style={{
              background: "oklch(0.12 0.007 60)",
              border: "0.5px solid oklch(0.22 0.007 60)",
              height: "420px",
              width: "100%",
              maxWidth: "100%",
              position: "relative",
              overflow: "hidden",
              boxSizing: "border-box",
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
              <div style={{ padding: "1.25rem", width: "100%", boxSizing: "border-box", overflow: "hidden" }}>
                {/* Context bar */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", padding: "0.5rem 0.75rem", background: "oklch(0.14 0.007 60)", border: "0.5px solid oklch(0.20 0.007 60)", overflow: "hidden", minWidth: 0 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.78 0.14 65)", flexShrink: 0 }}>r/SaaS</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: "oklch(0.28 0 0)", flexShrink: 0 }}>/</span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 300, color: "oklch(0.62 0.006 80)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    &ldquo;Struggling to get traction on Reddit without sounding like an ad&rdquo;
                  </span>
                </div>
                {/* Comment box */}
                <div style={{ background: "oklch(0.10 0.007 60)", border: "0.5px solid oklch(0.22 0.007 60)", padding: "0.875rem 1rem", minHeight: "120px", overflow: "hidden", width: "100%", boxSizing: "border-box" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.45 0 0)", marginBottom: "0.6rem" }}>Public comment draft</div>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 300, color: "oklch(0.82 0.006 80)", lineHeight: 1.65, overflowWrap: "break-word", wordBreak: "break-word" }}>
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
  );
}

/* ── Lead Intelligence section (uses HeroDemoPanel) ── */
function LeadIntelligenceDemo() {
  const sectionRef = useFadeUp();
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
          <HeroDemoPanel />
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
function CtaSection({ onOpenModal }: { onOpenModal: () => void }) {
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

        {/* Headline */}
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
            fontWeight: 300,
            fontStyle: "italic",
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            color: "oklch(0.93 0.010 80)",
            marginBottom: "1.75rem",
          }}
        >
          Your next customer<br />is already on Reddit.
        </h2>

        {/* Gold rule */}
        <div className="rule-gold mx-auto mb-6" style={{ width: "3rem" }} />

        {/* Supporting copy */}
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.9375rem",
            fontWeight: 300,
            color: "oklch(0.62 0.006 80)",
            lineHeight: 1.8,
            maxWidth: "46ch",
            margin: "0 auto 3rem",
          }}
        >
          They're describing their exact problem in a thread right now. SubRoast finds them, scores their intent, and hands you a personalised DM — before your competitors even open the app.
        </p>

        <button
          onClick={onOpenModal}
          className="btn-luxury-primary"
          style={{ marginBottom: "0", border: "none", cursor: "pointer" }}
        >
          Join the waitlist
        </button>
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

/* ── Pricing section (landing page) ── */
const HOME_PLANS = [
  {
    key: "starter" as const,
    tier: "I",
    name: "Starter",
    price: 19,
    description: "For founders testing Reddit as a distribution channel.",
    features: [
      "1 outreach campaign",
      "AI Draft & Roast with virality score",
      "Lead discovery via Reddit search",
      "Lead sync: 2× daily",
      "AI-generated personalized DMs",
      "Match scoring (Strong / Partial / Lowest)",
      "Email alerts for new leads",
    ],
    popular: false,
  },
  {
    key: "growth" as const,
    tier: "II",
    name: "Growth",
    price: 39,
    description: "For founders ready to scale Reddit outreach systematically.",
    features: [
      "Everything in Starter",
      "Unlimited outreach campaigns",
      "Lead sync: every 4 hours (6× daily)",
      "App Validation campaigns",
      "One-click send via Chrome extension — coming soon",
      "DM template library — coming soon",
      "Advanced analytics — coming soon",
    ],
    popular: true,
  },
];

/* ── What's Coming ── */
function HomeWhatsComingSection() {
  const ref = useFadeUp();
  const items = [
    {
      icon: "⚡",
      title: "One-click send via Chrome extension",
      description:
        "Send personalised DMs directly from Reddit without leaving the page. Spot a lead, click once, done.",
      eta: "Q2 2026",
    },
    {
      icon: "✉️",
      title: "DM template library",
      description:
        "A curated library of high-converting outreach templates, organised by use case and subreddit type.",
      eta: "Q2 2026",
    },
    {
      icon: "📊",
      title: "Advanced analytics",
      description:
        "Track reply rates, conversion funnels, and subreddit performance across all your campaigns in one view.",
      eta: "Q3 2026",
    },
  ];

  return (
    <section
      style={{
        paddingTop: "clamp(5rem, 10vw, 9rem)",
        paddingBottom: "clamp(5rem, 10vw, 9rem)",
        borderBottom: "0.5px solid oklch(0.18 0.007 60)",
        background: "oklch(0.065 0.007 60)",
      }}
    >
      <div className="container max-w-5xl">
        <div ref={ref} className="fade-up">
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "clamp(2.5rem, 5vw, 4rem)" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.25rem" }}>
              <span className="eyebrow">On the roadmap</span>
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 300,
                fontStyle: "italic",
                color: "oklch(0.93 0.010 80)",
                lineHeight: 1.15,
                marginBottom: "1rem",
              }}
            >
              What's coming next.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
                color: "oklch(0.62 0.006 80)",
                maxWidth: "36rem",
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              We're building fast. Join the waitlist to get early access and shape what we build next.
            </p>
          </div>

          {/* Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {items.map((item) => (
              <div
                key={item.title}
                style={{
                  border: "0.5px solid oklch(0.22 0.007 60)",
                  padding: "2rem 1.75rem",
                  background: "oklch(0.09 0.007 60)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Coming Soon ribbon */}
                <div
                  style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.5rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "oklch(0.78 0.14 65)",
                    border: "0.5px solid oklch(0.78 0.14 65 / 0.4)",
                    padding: "0.2rem 0.5rem",
                    background: "oklch(0.78 0.14 65 / 0.06)",
                  }}
                >
                  {item.eta}
                </div>

                {/* Icon */}
                <div
                  style={{
                    fontSize: "1.6rem",
                    marginBottom: "1rem",
                    lineHeight: 1,
                  }}
                >
                  {item.icon}
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.05rem",
                    fontWeight: 400,
                    fontStyle: "italic",
                    color: "oklch(0.90 0.010 80)",
                    marginBottom: "0.6rem",
                    lineHeight: 1.3,
                    paddingRight: "3.5rem",
                  }}
                >
                  {item.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.82rem",
                    color: "oklch(0.52 0.006 80)",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Subtle CTA */}
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.62rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "oklch(0.45 0.006 80)",
                marginBottom: "1rem",
              }}
            >
              Want early access to these features?
            </p>
            <a
              href="/waitlist"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.62rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "oklch(0.78 0.14 65)",
                textDecoration: "none",
                borderBottom: "0.5px solid oklch(0.78 0.14 65 / 0.5)",
                paddingBottom: "0.1rem",
                transition: "color 0.2s, border-color 0.2s",
              }}
            >
              Join the waitlist →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomePricingSection() {
  const ref = useFadeUp();
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const createCheckout = trpc.subscription.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
        toast.info("Redirecting to secure checkout…");
      }
      setLoadingPlan(null);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to start checkout");
      setLoadingPlan(null);
    },
  });

  const handleSelectPlan = (planKey: "starter" | "growth") => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    setLoadingPlan(planKey);
    createCheckout.mutate({ plan: planKey, origin: window.location.origin });
  };

  return (
    <section
      id="pricing"
      style={{
        paddingTop: "clamp(5rem, 10vw, 9rem)",
        paddingBottom: "clamp(5rem, 10vw, 9rem)",
        borderBottom: "0.5px solid oklch(0.18 0.007 60)",
        background: "oklch(0.09 0.008 60)",
      }}
    >
      <div ref={ref} className="fade-up container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p className="eyebrow mb-5">Investment</p>
          <h2 className="display-lg mb-4">
            Precision outreach,<br />at any scale.
          </h2>
          <div className="rule-gold mx-auto mb-6" style={{ width: "3rem" }} />
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9375rem", fontWeight: 300, color: "oklch(0.62 0.006 80)", lineHeight: 1.75, maxWidth: "40ch", margin: "0 auto" }}>
            Begin with a 7-day free trial. No commitment required.
          </p>
        </div>

        {/* Plan cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5px",
            maxWidth: "780px",
            margin: "0 auto 3rem",
            border: "0.5px solid oklch(0.22 0.007 60)",
          }}
        >
          {HOME_PLANS.map((plan) => {
            const isLoading = loadingPlan === plan.key;
            return (
              <div
                key={plan.key}
                style={{
                  background: plan.popular ? "oklch(0.14 0.007 60)" : "oklch(0.12 0.007 60)",
                  padding: "2.5rem 2rem",
                  display: "flex",
                  flexDirection: "column",
                  borderRight: plan.popular ? "none" : "0.5px solid oklch(0.22 0.007 60)",
                }}
              >
                {/* Tier */}
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "oklch(0.62 0.006 80)", marginBottom: "0.75rem" }}>
                  Tier {plan.tier}
                </p>
                {/* Name */}
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 400, fontStyle: "italic", color: "oklch(0.93 0.010 80)", marginBottom: "0.4rem", lineHeight: 1.1 }}>
                  {plan.name}
                </h3>
                <p style={{ fontSize: "0.82rem", color: "oklch(0.62 0.006 80)", marginBottom: "1.75rem", lineHeight: 1.6 }}>
                  {plan.description}
                </p>
                {/* Price */}
                <div style={{ borderTop: "0.5px solid oklch(0.22 0.007 60)", borderBottom: "0.5px solid oklch(0.22 0.007 60)", padding: "1.25rem 0", marginBottom: "1.75rem" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "2.5rem", fontWeight: 400, color: "oklch(0.93 0.010 80)", lineHeight: 1 }}>
                      ${plan.price}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "oklch(0.62 0.006 80)", letterSpacing: "0.08em" }}>/ month</span>
                  </div>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "oklch(0.62 0.006 80)", letterSpacing: "0.1em", marginTop: "0.35rem" }}>
                    After 7-day free trial
                  </p>
                </div>
                {/* Features */}
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {plan.features.map((feature) => {
                    const isComingSoon = feature.endsWith(" — coming soon");
                    const label = isComingSoon ? feature.replace(" — coming soon", "") : feature;
                    return (
                      <li key={feature} style={{ display: "flex", alignItems: "flex-start", gap: "0.65rem", fontSize: "0.82rem", color: isComingSoon ? "oklch(0.45 0 0)" : "oklch(0.93 0.010 80)", lineHeight: 1.5 }}>
                        <span style={{ width: "14px", height: "14px", border: `0.5px solid ${isComingSoon ? "oklch(0.28 0 0)" : "oklch(0.88 0.025 85 / 0.35)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                          <Check size={8} color={isComingSoon ? "oklch(0.35 0 0)" : "oklch(0.88 0.025 85)"} />
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                          {label}
                          {isComingSoon && (
                            <span style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.48rem",
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              color: "oklch(0.78 0.14 65)",
                              border: "0.5px solid oklch(0.78 0.14 65 / 0.35)",
                              padding: "0.1rem 0.35rem",
                            }}>
                              Soon
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {/* CTA */}
                <button
                  onClick={() => handleSelectPlan(plan.key)}
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    padding: "0.85rem 1.5rem",
                    background: plan.popular ? "oklch(0.88 0.025 85)" : "transparent",
                    border: `0.5px solid ${plan.popular ? "oklch(0.88 0.025 85)" : "oklch(0.22 0.007 60)"}`,
                    color: plan.popular ? "oklch(0.09 0.008 60)" : "oklch(0.93 0.010 80)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.68rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "background 0.25s ease, border-color 0.25s ease, color 0.25s ease",
                  }}
                >
                  {isLoading ? (
                    <><Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Opening checkout…</>
                  ) : (
                    "Start Free Trial (Early Access)"
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Trust line */}
        <p style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "oklch(0.42 0 0)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4rem" }}>
          Seven days complimentary · No card required · Cancel at any time
        </p>

        {/* FAQ accordion */}
        <PricingFAQ />
      </div>
    </section>
  );
}

const PRICING_FAQS = [
  {
    q: "Do I need a credit card for the free trial?",
    a: "Yes — Stripe requires a card to start the trial, but you won’t be charged until Day 7. You’ll receive a reminder on Day 6 so you have time to cancel.",
  },
  {
    q: "What happens after the trial ends?",
    a: "You’ll be automatically charged for the plan you selected. You can cancel anytime from Settings → Manage Billing before the trial ends.",
  },
  {
    q: "Can I switch plans?",
    a: "Yes. You can upgrade from Starter to Growth at any time from Settings → Manage Billing. Stripe prorates the difference automatically.",
  },
  {
    q: "Is this month-to-month?",
    a: "Yes — all plans are billed monthly with no long-term contracts. Cancel anytime, no questions asked.",
  },
];

function PricingFAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <div style={{ flex: 1, height: "0.5px", background: "oklch(0.22 0.007 60)" }} />
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "oklch(0.62 0.006 80)", whiteSpace: "nowrap" }}>
          Common Questions
        </p>
        <div style={{ flex: 1, height: "0.5px", background: "oklch(0.22 0.007 60)" }} />
      </div>
      {PRICING_FAQS.map(({ q, a }, i) => (
        <div
          key={q}
          style={{
            borderBottom: "0.5px solid oklch(0.22 0.007 60)",
            ...(i === 0 ? { borderTop: "0.5px solid oklch(0.22 0.007 60)" } : {}),
          }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              padding: "1.4rem 0",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 400, fontStyle: "italic", color: "oklch(0.93 0.010 80)", lineHeight: 1.4 }}>
              {q}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "oklch(0.62 0.006 80)",
                flexShrink: 0,
                transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                transition: "transform 0.25s ease",
                lineHeight: 1,
              }}
            >
              +
            </span>
          </button>
          <div
            style={{
              overflow: "hidden",
              maxHeight: open === i ? "200px" : "0",
              transition: "max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <p style={{ fontSize: "0.85rem", color: "oklch(0.62 0.006 80)", lineHeight: 1.75, paddingBottom: "1.4rem" }}>
              {a}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

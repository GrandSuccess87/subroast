import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trackHeroCta, trackMidpageCta, trackNavCta } from "@/lib/analytics";
import { DashboardLayoutSkeleton } from "@/components/DashboardLayoutSkeleton";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

/* ─────────────────────────────────────────────
   DESIGN TOKENS (beta site palette)
   ember:  #F67A31 / dark #EC4913 / tint #FFF4EC
   ink:    #14181F / soft #111827
   cream:  #FCF7F1
   font:   Inter
───────────────────────────────────────────── */

/* ── Scroll-activated fade-up ── */
function useFadeUp(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
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

/* ── Eyebrow label ── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      fontSize: "0.7rem",
      fontWeight: 600,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "#F67A31",
      marginBottom: "0.75rem",
    }}>
      {children}
    </p>
  );
}

/* ── Section heading ── */
function SectionHeading({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h2 style={{
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      fontSize: "clamp(1.875rem, 4vw, 2.75rem)",
      fontWeight: 800,
      letterSpacing: "-0.03em",
      lineHeight: 1.1,
      color: "#14181F",
      ...style,
    }}>
      {children}
    </h2>
  );
}

/* ── Primary CTA button (pill, dark fill) ── */
function BtnPrimary({ href, children, onClick, style }: {
  href?: string;
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.875rem 2rem",
    borderRadius: "9999px",
    background: "#111827",
    color: "#fff",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    fontSize: "0.9375rem",
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
    border: "none",
    transition: "background 0.2s ease, transform 0.15s ease",
    ...style,
  };
  if (href) {
    return (
      <a href={href} style={base} onClick={onClick}
        onMouseEnter={e => (e.currentTarget.style.background = "#000")}
        onMouseLeave={e => (e.currentTarget.style.background = "#111827")}
      >
        {children}
      </a>
    );
  }
  return (
    <button style={base} onClick={onClick}
      onMouseEnter={e => (e.currentTarget.style.background = "#000")}
      onMouseLeave={e => (e.currentTarget.style.background = "#111827")}
    >
      {children}
    </button>
  );
}

/* ── Outlined secondary button ── */
function BtnOutline({ href, children, onClick }: {
  href?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.875rem 2rem",
    borderRadius: "9999px",
    background: "transparent",
    color: "#14181F",
    border: "1.5px solid #D1D5DB",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    fontSize: "0.9375rem",
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
    transition: "border-color 0.2s ease, background 0.2s ease",
  };
  if (href) {
    return (
      <a href={href} style={base} onClick={onClick}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#9CA3AF"; e.currentTarget.style.background = "#F9FAFB"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#D1D5DB"; e.currentTarget.style.background = "transparent"; }}
      >
        {children}
      </a>
    );
  }
  return (
    <button style={base} onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#9CA3AF"; e.currentTarget.style.background = "#F9FAFB"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#D1D5DB"; e.currentTarget.style.background = "transparent"; }}
    >
      {children}
    </button>
  );
}

/* ── Feature step card (numbered) ── */
function FeatureCard({ num, title, body }: { num: string; title: string; body: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: "12px",
        padding: "1.75rem",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "2.25rem",
        height: "2.25rem",
        borderRadius: "8px",
        background: "#FFF4EC",
        color: "#F67A31",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        fontSize: "0.8rem",
        fontWeight: 700,
        marginBottom: "1rem",
      }}>
        {num}
      </div>
      <h3 style={{
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        fontSize: "1.0625rem",
        fontWeight: 700,
        color: "#14181F",
        marginBottom: "0.5rem",
        lineHeight: 1.3,
      }}>
        {title}
      </h3>
      <p style={{
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        fontSize: "0.9375rem",
        color: "#6B7280",
        lineHeight: 1.65,
        margin: 0,
      }}>
        {body}
      </p>
    </div>
  );
}

/* ── Audience tag pill ── */
function AudienceTag({ label }: { label: string }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "0.4rem 1rem",
      borderRadius: "9999px",
      border: "1.5px solid #E5E7EB",
      background: "#fff",
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      fontSize: "0.875rem",
      fontWeight: 500,
      color: "#374151",
    }}>
      {label}
    </span>
  );
}

/* ── FAQ accordion item ── */
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #E5E7EB",
      borderRadius: "10px",
      overflow: "hidden",
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 1.5rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: "1rem",
        }}
      >
        <span style={{
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          fontSize: "1rem",
          fontWeight: 600,
          color: "#14181F",
          lineHeight: 1.4,
        }}>
          {question}
        </span>
        <ChevronDown
          size={18}
          style={{
            color: "#9CA3AF",
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>
      {open && (
        <div style={{
          padding: "0 1.5rem 1.25rem",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          fontSize: "0.9375rem",
          color: "#6B7280",
          lineHeight: 1.65,
          borderTop: "1px solid #F3F4F6",
          paddingTop: "1rem",
        }}>
          {answer}
        </div>
      )}
    </div>
  );
}

/* ── Deal list item ── */
function DealItem({ children }: { children: React.ReactNode }) {
  return (
    <li style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "0.75rem",
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      fontSize: "0.9375rem",
      color: "#374151",
      lineHeight: 1.6,
    }}>
      <span style={{ color: "#F67A31", fontWeight: 700, flexShrink: 0, marginTop: "0.05em" }}>→</span>
      {children}
    </li>
  );
}

/* ── Lead Intelligence Demo Panel ── */
const CHAIN_STEPS = [
  { id: "scan",    label: "Scanning subreddits",     sub: "r/SaaS · r/startups · r/entrepreneur" },
  { id: "filter",  label: "Spam check running",       sub: "Filtering bots, ad accounts, thin posts" },
  { id: "extract", label: "Extracting pain points",   sub: "AI reads each post — not just keywords" },
  { id: "intent",  label: "Classifying buyer intent", sub: "🔥 Purchase-Ready · 🎯 Actively Looking · ⚠️ Problem-Aware" },
  { id: "draft",   label: "Drafting outreach",        sub: "Personalised to pain point · awaiting review" },
  { id: "done",    label: "Lead ready",               sub: "Intent-classified · Pain point extracted" },
];

const SPAM_POSTS = [
  { text: "Best crypto signals 2024 — join now!", spam: true },
  { text: "How do I find my first SaaS customers?", spam: false },
  { text: "Earn $500/day from home — DM me", spam: true },
  { text: "Struggling to get traction on Reddit", spam: false },
  { text: "FREE followers — click link in bio", spam: true },
];

const COMMENT_TEXT = "Hey — saw your post about finding SaaS customers on Reddit. I built SubRoast for exactly this — it extracts pain points from posts, classifies buyer intent, and drafts outreach grounded in what people actually said. Happy to share more if useful.";
const LEAD_PAIN_POINT = "Struggling to find first SaaS customers without sounding like an ad.";

function HeroDemoPanel() {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const [activeStep, setActiveStep] = useState(0);
  const [visiblePosts, setVisiblePosts] = useState(0);
  const [showLead, setShowLead] = useState(false);
  const [typedChars, setTypedChars] = useState(0);

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
      timeout = setTimeout(() => { setPhase(3); setTypedChars(0); }, 3500);
    } else {
      if (typedChars < COMMENT_TEXT.length) {
        timeout = setTimeout(() => setTypedChars(c => c + 1), 22);
      } else {
        timeout = setTimeout(() => { setPhase(0); setActiveStep(0); setVisiblePosts(0); setShowLead(false); setTypedChars(0); }, 3000);
      }
    }
    return () => clearTimeout(timeout);
  }, [phase, activeStep, visiblePosts, typedChars]);

  const panelStyle: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: "12px",
    overflow: "hidden",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  };

  const headerStyle: React.CSSProperties = {
    padding: "0.75rem 1rem",
    borderBottom: "1px solid #F3F4F6",
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
  };

  const dotStyle = (color: string): React.CSSProperties => ({
    width: "8px", height: "8px", borderRadius: "50%", background: color,
  });

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <div style={dotStyle("#FC5F57")} />
        <div style={dotStyle("#FDBC2C")} />
        <div style={dotStyle("#34C749")} />
        <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "#9CA3AF", fontWeight: 500 }}>SubRoast — Lead Intelligence</span>
      </div>

      {/* Phase 0: Chain steps */}
      {phase === 0 && (
        <div style={{ padding: "1rem" }}>
          {CHAIN_STEPS.map((step, i) => {
            const done = i < activeStep;
            const active = i === activeStep;
            return (
              <div key={step.id} style={{
                display: "flex", alignItems: "flex-start", gap: "0.75rem",
                padding: "0.5rem 0.25rem",
                opacity: i > activeStep ? 0.3 : 1,
                transition: "opacity 0.3s ease",
              }}>
                <div style={{
                  width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0, marginTop: "1px",
                  background: done ? "#F67A31" : active ? "#FFF4EC" : "#F3F4F6",
                  border: active ? "2px solid #F67A31" : done ? "none" : "2px solid #E5E7EB",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.3s ease",
                }}>
                  {done && <span style={{ color: "#fff", fontSize: "0.6rem", fontWeight: 700 }}>✓</span>}
                  {active && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#F67A31" }} />}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: active ? 600 : 400, color: active ? "#14181F" : done ? "#6B7280" : "#9CA3AF" }}>{step.label}</p>
                  {active && <p style={{ margin: "0.1rem 0 0", fontSize: "0.7rem", color: "#9CA3AF" }}>{step.sub}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Phase 1: Spam filter */}
      {phase === 1 && (
        <div style={{ padding: "1rem" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Spam Filter</p>
          {SPAM_POSTS.slice(0, visiblePosts).map((post, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.4rem 0.5rem", marginBottom: "0.3rem",
              background: post.spam ? "#FEF2F2" : "#F0FDF4",
              borderRadius: "6px",
              animation: "fadeIn 0.3s ease",
            }}>
              <span style={{ fontSize: "0.75rem" }}>{post.spam ? "🚫" : "✅"}</span>
              <span style={{ fontSize: "0.78rem", color: post.spam ? "#EF4444" : "#16A34A", fontWeight: 500 }}>{post.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Phase 2: Lead card */}
      {phase === 2 && (
        <div style={{ padding: "1rem" }}>
          <div style={{
            opacity: showLead ? 1 : 0,
            transform: showLead ? "translateY(0)" : "translateY(8px)",
            transition: "all 0.4s ease",
            background: "#FFF4EC",
            border: "1px solid #FCD9BD",
            borderRadius: "8px",
            padding: "1rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.75rem" }}>🔥</span>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#F67A31", letterSpacing: "0.06em", textTransform: "uppercase" }}>Purchase-Ready · r/SaaS</span>
            </div>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "#374151", lineHeight: 1.5 }}>{LEAD_PAIN_POINT}</p>
          </div>
        </div>
      )}

      {/* Phase 3: Typing outreach */}
      {phase === 3 && (
        <div style={{ padding: "1rem" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Drafting outreach…</p>
          <div style={{
            background: "#F9FAFB",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            padding: "0.875rem",
            fontSize: "0.82rem",
            color: "#374151",
            lineHeight: 1.6,
            minHeight: "80px",
          }}>
            {COMMENT_TEXT.slice(0, typedChars)}
            <span style={{ borderRight: "2px solid #F67A31", marginLeft: "1px", animation: "blink 1s step-end infinite" }}>&nbsp;</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN HOME COMPONENT
══════════════════════════════════════════ */
export default function Home() {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroRef = useFadeUp(0);
  const problemRef = useFadeUp(0);
  const featuresRef = useFadeUp(0);
  const dealRef = useFadeUp(0);
  const audienceRef = useFadeUp(0);
  const faqRef = useFadeUp(0);
  const ctaRef = useFadeUp(0);

  if (loading) return <DashboardLayoutSkeleton />;

  const FAQ_ITEMS = [
    {
      question: "What exactly does SubRoast do?",
      answer: "SubRoast monitors the subreddits where your customers hang out, reads every post for buyer intent, extracts the exact pain point, ranks lead quality, and drafts personalised outreach — all in one workflow.",
    },
    {
      question: "Is this a spam tool?",
      answer: "No. SubRoast finds conversations where you're genuinely relevant and helps you respond like a person. If you want mass-DM automation, this isn't for you.",
    },
    {
      question: "Does this violate Reddit's rules?",
      answer: "SubRoast reads public conversations and helps you decide where to engage. You post as yourself, manually, in communities whose rules you follow. Nothing is automated on your behalf.",
    },
    {
      question: "How many free syncs do I get?",
      answer: "You get 3 free syncs to start — no credit card required. Each sync scans your target subreddits, extracts pain points, and classifies buyer intent across all discovered posts.",
    },
    {
      question: "What happens after the free syncs?",
      answer: "Early users get founding-member pricing locked in. We're optimising for learning right now, not revenue — so pricing will be fair and transparent when it arrives.",
    },
    {
      question: "What data do you store?",
      answer: "Your searches and feedback are used to improve SubRoast, never sold or shared. Ask us to delete your account and data and we will, same day.",
    },
  ];

  return (
    <div style={{
      minHeight: "100svh",
      background: "#FCF7F1",
      color: "#14181F",
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .hero-grad { background: radial-gradient(circle at 50% 0px, rgba(246,122,49,0.10), rgba(0,0,0,0) 60%); }
        .grad-text {
          background: linear-gradient(135deg, #F67A31, #F0B429);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky",
        top: "1rem",
        zIndex: 50,
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "0 1.25rem",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: "9999px",
          background: scrolled ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          border: "1px solid #F3F4F6",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          paddingLeft: "1.5rem",
          paddingRight: "0.5rem",
          paddingTop: "0.5rem",
          paddingBottom: "0.5rem",
          transition: "background 0.3s ease, box-shadow 0.3s ease",
        }}>
          {/* Logo */}
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none" }}>
            <span style={{
              fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "#14181F",
              letterSpacing: "-0.02em",
            }}>
              Sub<span style={{ color: "#F67A31" }}>Roast</span>
            </span>
          </a>

          {/* Nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {/* Beta badge */}
            <span style={{
              display: "none",
              alignItems: "center",
              borderRadius: "9999px",
              background: "rgba(246,122,49,0.1)",
              color: "#F67A31",
              fontSize: "0.8rem",
              fontWeight: 600,
              padding: "0.375rem 1rem",
            }}
              className="md-inline-flex"
            >
              AI Reddit Growth Tool
            </span>

            {/* CTA */}
            <BtnPrimary href={getLoginUrl()} onClick={trackNavCta} style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>
              {user ? "Dashboard" : "Get Early Access"}
            </BtnPrimary>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header className="hero-grad" style={{
        marginTop: "-4rem",
        paddingTop: "clamp(7rem, 14vw, 11rem)",
        paddingBottom: "clamp(4rem, 8vw, 7rem)",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 1.5rem", textAlign: "center" }}>
          <div ref={heroRef}>
            {/* Badge */}
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: "9999px",
              border: "1px solid rgba(246,122,49,0.25)",
              background: "rgba(246,122,49,0.06)",
              padding: "0.5rem 1.25rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#F67A31",
              marginBottom: "2rem",
            }}>
              AI Reddit Growth Tool · For Indie Founders
            </span>

            {/* Headline */}
            <h1 style={{
              fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
              fontSize: "clamp(2.5rem, 7vw, 5rem)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: "#14181F",
              marginBottom: "1.5rem",
            }}>
              Know exactly what your buyers need —{" "}
              <span className="grad-text">before you reach out.</span>
            </h1>

            {/* Sub */}
            <p style={{
              maxWidth: "600px",
              margin: "0 auto 2.5rem",
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              color: "#6B7280",
              lineHeight: 1.65,
              fontWeight: 400,
            }}>
              SubRoast extracts the exact pain points behind every Reddit post, classifies each lead by purchase intent, and surfaces the patterns that tell you what to build — and who to reach out to first.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.875rem", justifyContent: "center", marginBottom: "1.5rem" }}>
              <BtnPrimary href={getLoginUrl("/onboarding")} onClick={trackHeroCta} style={{ padding: "1rem 2.25rem", fontSize: "1rem" }}>
                Get Early Access
              </BtnPrimary>
              <BtnOutline href="#how-it-works">
                See how it works
              </BtnOutline>
            </div>

            {/* Trust */}
            <p style={{
              fontSize: "0.8rem",
              color: "#9CA3AF",
              letterSpacing: "0.06em",
            }}>
              3 free syncs · No credit card · No commitment
            </p>
          </div>
        </div>

        {/* Demo panel */}
        <div style={{ maxWidth: "640px", margin: "3rem auto 0", padding: "0 1.5rem" }}>
          <HeroDemoPanel />
        </div>
      </header>

      {/* ── THE PROBLEM ── */}
      <section style={{ padding: "clamp(4rem, 8vw, 7rem) 0", background: "#FCF7F1" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 1.5rem", textAlign: "center" }}>
          <div ref={problemRef}>
            <Eyebrow>The Problem</Eyebrow>
            <SectionHeading>
              You know the leads are there.{" "}
              <span style={{ color: "#F67A31" }}>Finding them is the job you never get to.</span>
            </SectionHeading>
            <p style={{
              marginTop: "1.5rem",
              fontSize: "1.0625rem",
              color: "#6B7280",
              lineHeight: 1.7,
              maxWidth: "56ch",
              margin: "1.5rem auto 0",
            }}>
              Prospecting on Reddit today means keyword-searching a dozen subreddits, skimming hundred-comment threads, guessing who's actually ready to buy, and drafting replies that don't get you banned.
            </p>
            <p style={{
              marginTop: "1rem",
              fontSize: "1.0625rem",
              color: "#6B7280",
              lineHeight: 1.7,
              maxWidth: "56ch",
              margin: "1rem auto 0",
            }}>
              Most founders try it for a week, land one good conversation, and quit. The leads didn't dry up — the manual work did.
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: "clamp(4rem, 8vw, 7rem) 0", background: "#fff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div ref={featuresRef} style={{ textAlign: "center", marginBottom: "3rem" }}>
            <Eyebrow>What We're Building</Eyebrow>
            <SectionHeading>What SubRoast does instead</SectionHeading>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}>
            <FeatureCard
              num="01"
              title="Finds the conversations"
              body="Monitors the subreddits where your customers hang out — automatically, continuously, without you lifting a finger."
            />
            <FeatureCard
              num="02"
              title="Reads for intent"
              body={`Separates “ugh, this problem” from “what should I buy?” using AI that understands context, not just keywords.`}
            />
            <FeatureCard
              num="03"
              title="Summarises the thread"
              body="So you know the full context before you click — pain point, sentiment, and what's already been said."
            />
            <FeatureCard
              num="04"
              title="Ranks lead quality"
              body="Spend your time on the ten that matter, not the hundred that don't. Intent-classified into 5 buyer tiers."
            />
            <FeatureCard
              num="05"
              title="Drafts the outreach"
              body="A starting point in your voice, tuned to not sound like outreach — grounded in what the person actually said."
            />
            <div style={{
              background: "#FFF4EC",
              border: "1px dashed #FCD9BD",
              borderRadius: "12px",
              padding: "1.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <p style={{
                fontStyle: "italic",
                fontSize: "0.9375rem",
                color: "#9A3412",
                lineHeight: 1.6,
                textAlign: "center",
                margin: 0,
              }}>
                It's early. Some of it is rough. That's exactly why you're here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE DEAL ── */}
      <section style={{ padding: "clamp(4rem, 8vw, 7rem) 0", background: "#FCF7F1" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div ref={dealRef} style={{ textAlign: "center", marginBottom: "3rem" }}>
            <Eyebrow>The Deal</Eyebrow>
            <SectionHeading>An invitation to build, not a free trial.</SectionHeading>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            maxWidth: "800px",
            margin: "0 auto",
          }}>
            {/* What you get */}
            <div style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: "12px",
              padding: "2rem",
            }}>
              <p style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#F67A31",
                marginBottom: "1.25rem",
              }}>
                What you get
              </p>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <DealItem>Full free access for the whole beta</DealItem>
                <DealItem>A direct line to the founder</DealItem>
                <DealItem>Feature requests that genuinely steer the roadmap</DealItem>
                <DealItem>Founding-member pricing locked in, if we ever charge you</DealItem>
                <DealItem>Credit in the launch notes, if you want it</DealItem>
              </ul>
            </div>

            {/* What we ask */}
            <div style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: "12px",
              padding: "2rem",
            }}>
              <p style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#6B7280",
                marginBottom: "1.25rem",
              }}>
                What we ask
              </p>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <DealItem>Use it on your real business for a few weeks</DealItem>
                <DealItem>One 30-minute conversation about what worked and what didn't</DealItem>
                <DealItem>Honesty — the blunter the better</DealItem>
              </ul>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <BtnPrimary href={getLoginUrl("/onboarding")} onClick={trackMidpageCta} style={{ padding: "1rem 2.5rem", fontSize: "1rem" }}>
              Get Early Access
            </BtnPrimary>
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section style={{ padding: "clamp(4rem, 8vw, 7rem) 0", background: "#fff" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 1.5rem", textAlign: "center" }}>
          <div ref={audienceRef}>
            <Eyebrow>Who It's For</Eyebrow>
            <SectionHeading>Built for founders whose customers argue in public.</SectionHeading>

            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.625rem",
              justifyContent: "center",
              margin: "2rem 0",
            }}>
              {["SaaS founders", "Indie hackers", "Solo founders", "Agencies", "Consultants", "AI builders", "Bootstrappers"].map(tag => (
                <AudienceTag key={tag} label={tag} />
              ))}
            </div>

            <div style={{
              background: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: "10px",
              padding: "1.25rem 1.5rem",
              maxWidth: "600px",
              margin: "0 auto",
              textAlign: "left",
            }}>
              <p style={{ margin: 0, fontSize: "0.9375rem", color: "#374151", lineHeight: 1.65 }}>
                <strong>Who it's not for:</strong> if you want a tool to mass-DM strangers or blast promo comments across Reddit, this isn't it, and we won't build it. SubRoast is for showing up usefully in conversations that are already about you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (3-step) ── */}
      <section style={{ padding: "clamp(4rem, 8vw, 7rem) 0", background: "#FCF7F1" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <Eyebrow>How It Works</Eyebrow>
            <SectionHeading>Three steps from subreddit to outreach</SectionHeading>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.5rem",
          }}>
            {[
              {
                num: "01",
                title: "Extract",
                body: "SubRoast scans your target subreddits and uses AI to extract the exact pain point from every post — not just keyword matches.",
              },
              {
                num: "02",
                title: "Classify",
                body: "Each lead is classified into one of 5 buyer intent tiers — from 🔥 Purchase-Ready to 👀 Unclassified — so you prioritise the warmest leads first.",
              },
              {
                num: "03",
                title: "Outreach",
                body: "Generate a personalised DM draft grounded in the lead's actual pain point. Review, copy, and send — no automation required.",
              },
            ].map(({ num, title, body }) => (
              <FeatureCard key={num} num={num} title={title} body={body} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "clamp(4rem, 8vw, 7rem) 0", background: "#fff" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div ref={faqRef} style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <Eyebrow>FAQ</Eyebrow>
            <SectionHeading>Fair questions</SectionHeading>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {FAQ_ITEMS.map(item => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: "clamp(4rem, 8vw, 7rem) 0", background: "#FCF7F1", borderTop: "1px solid #F3F4F6" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 1.5rem", textAlign: "center" }}>
          <div ref={ctaRef}>
            <Eyebrow>Early Access</Eyebrow>
            <SectionHeading>Early users shape the product.</SectionHeading>
            <p style={{
              marginTop: "1.25rem",
              marginBottom: "2rem",
              fontSize: "1.0625rem",
              color: "#6B7280",
              lineHeight: 1.65,
            }}>
              3 free syncs to get started. No credit card required. Founding-member pricing locked in for early users.
            </p>
            <BtnPrimary
              href={getLoginUrl("/onboarding")}
              onClick={trackMidpageCta}
              style={{ padding: "1.125rem 2.75rem", fontSize: "1.0625rem" }}
            >
              Get Founder Access
            </BtnPrimary>
            <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#9CA3AF" }}>
              3 free syncs · No credit card · No commitment
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid #E5E7EB",
        background: "#FCF7F1",
        padding: "2rem 0",
      }}>
        <div style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}>
          <span style={{
            fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
            fontSize: "1rem",
            fontWeight: 800,
            color: "#14181F",
            letterSpacing: "-0.02em",
          }}>
            Sub<span style={{ color: "#F67A31" }}>Roast</span>
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <a href="/dashboard/feedback" style={{
              fontSize: "0.8rem",
              color: "#9CA3AF",
              textDecoration: "none",
              fontWeight: 500,
              transition: "color 0.2s ease",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F67A31")}
              onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
            >
              Feedback
            </a>
            <a href={getLoginUrl()} style={{
              fontSize: "0.8rem",
              color: "#9CA3AF",
              textDecoration: "none",
              fontWeight: 500,
              transition: "color 0.2s ease",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F67A31")}
              onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
            >
              Login
            </a>
          </div>

          <p style={{ fontSize: "0.8rem", color: "#9CA3AF" }}>
            © {new Date().getFullYear()} SubRoast. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

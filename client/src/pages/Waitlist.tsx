import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2, Check } from "lucide-react";

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

/* ── Waitlist email form ── */
type WaitlistSource = "header" | "footer" | "home_header" | "home_footer";

function WaitlistForm({
  source,
  placeholder = "your@email.com",
  buttonLabel = "Join the waitlist",
  compact = false,
}: {
  source: WaitlistSource;
  placeholder?: string;
  buttonLabel?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const join = trpc.waitlist.join.useMutation({
    onSuccess: () => {
      setStatus("success");
      setEmail("");
      setName("");
    },
    onError: (err) => {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setTimeout(() => setStatus("idle"), 4000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    join.mutate({ email: email.trim(), name: name.trim() || undefined, source });
  };

  if (status === "success") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: compact ? "0.75rem 1.25rem" : "1rem 1.5rem",
          background: "oklch(0.14 0.010 140 / 0.4)",
          border: "0.5px solid oklch(0.30 0.06 140)",
          animation: "fadeSlideIn 0.4s ease forwards",
        }}
      >
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "oklch(0.65 0.15 140)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Check size={11} color="oklch(0.09 0.008 60)" strokeWidth={2.5} />
        </div>
        <div>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "oklch(0.65 0.15 140)",
              marginBottom: "0.15rem",
            }}
          >
            You&rsquo;re on the list
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              fontWeight: 300,
              color: "oklch(0.72 0.006 80)",
              lineHeight: 1.5,
            }}
          >
            We&rsquo;ll notify you when early access opens.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      {!compact && (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          disabled={status === "loading"}
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            background: "oklch(0.12 0.007 60)",
            border: "0.5px solid oklch(0.22 0.007 60)",
            color: "oklch(0.93 0.010 80)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.875rem",
            fontWeight: 300,
            outline: "none",
            marginBottom: "0.75rem",
            boxSizing: "border-box",
            transition: "border-color 0.2s ease",
          }}
          onFocus={(e) => (e.target.style.borderColor = "oklch(0.88 0.025 85 / 0.5)")}
          onBlur={(e) => (e.target.style.borderColor = "oklch(0.22 0.007 60)")}
        />
      )}
      <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          required
          disabled={status === "loading"}
          style={{
            flex: 1,
            padding: compact ? "0.65rem 0.875rem" : "0.75rem 1rem",
            background: "oklch(0.12 0.007 60)",
            border: "0.5px solid oklch(0.22 0.007 60)",
            color: "oklch(0.93 0.010 80)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.875rem",
            fontWeight: 300,
            outline: "none",
            minWidth: 0,
            transition: "border-color 0.2s ease",
          }}
          onFocus={(e) => (e.target.style.borderColor = "oklch(0.88 0.025 85 / 0.5)")}
          onBlur={(e) => (e.target.style.borderColor = "oklch(0.22 0.007 60)")}
        />
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          style={{
            padding: compact ? "0.65rem 1.25rem" : "0.75rem 1.5rem",
            background: "oklch(0.88 0.025 85)",
            border: "0.5px solid oklch(0.88 0.025 85)",
            color: "oklch(0.09 0.008 60)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            cursor: status === "loading" ? "not-allowed" : "pointer",
            opacity: status === "loading" || !email.trim() ? 0.6 : 1,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexShrink: 0,
            whiteSpace: "nowrap",
            transition: "opacity 0.2s ease",
          }}
        >
          {status === "loading" ? (
            <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            buttonLabel
          )}
        </button>
      </div>
      {status === "error" && (
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            color: "oklch(0.65 0.18 25)",
            letterSpacing: "0.08em",
            marginTop: "0.5rem",
          }}
        >
          {errorMsg}
        </p>
      )}
    </form>
  );
}

/* ── Lead Intelligence Demo Panel ── */
const CHAIN_STEPS = [
  { id: "scan",   label: "Scanning subreddits",  sub: "r/SaaS · r/startups · r/entrepreneur" },
  { id: "filter", label: "Spam check running",    sub: "Filtering bots, ad accounts, thin posts" },
  { id: "score",  label: "Scoring relevance",     sub: "Intent · Urgency · Subreddit fit" },
  { id: "draft",  label: "Drafting outreach",     sub: "Personalised to each post" },
  { id: "queue",  label: "Queueing for review",   sub: "Awaiting your approval" },
  { id: "done",   label: "Lead ready",            sub: "High-signal · Outreach drafted" },
];

const SPAM_POSTS = [
  { text: "Best crypto signals 2024 — join now!", spam: true },
  { text: "How do I find my first SaaS customers?", spam: false },
  { text: "Earn $500/day from home — DM me", spam: true },
  { text: "Struggling to get traction on Reddit", spam: false },
  { text: "FREE followers — click link in bio", spam: true },
  { text: "Anyone else validating a B2B tool on Reddit?", spam: false },
];

const COMMENT_TEXT = "Hey — saw your post about Reddit traction. I built SubRoast specifically for this problem. It scores your draft before you post and finds warm leads in your target subreddits. Happy to share more if useful.";

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
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0, background: post.spam ? "oklch(0.65 0.18 25)" : "oklch(0.65 0.15 140)" }} />
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", padding: "0.5rem 0.75rem", background: "oklch(0.14 0.007 60)", border: "0.5px solid oklch(0.20 0.007 60)", overflow: "hidden", minWidth: 0 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.78 0.14 65)", flexShrink: 0 }}>r/SaaS</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: "oklch(0.28 0 0)", flexShrink: 0 }}>/</span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 300, color: "oklch(0.62 0.006 80)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              &ldquo;Struggling to get traction on Reddit without sounding like an ad&rdquo;
            </span>
          </div>
          <div style={{ background: "oklch(0.10 0.007 60)", border: "0.5px solid oklch(0.22 0.007 60)", padding: "0.875rem 1rem", minHeight: "120px", overflow: "hidden", width: "100%", boxSizing: "border-box" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.45 0 0)", marginBottom: "0.6rem" }}>Public comment draft</div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 300, color: "oklch(0.82 0.006 80)", lineHeight: 1.65, overflowWrap: "break-word", wordBreak: "break-word" }}>
              {COMMENT_TEXT.slice(0, typedChars)}
              <span style={{ display: "inline-block", width: "1px", height: "0.9em", background: "oklch(0.78 0.14 65)", marginLeft: "1px", verticalAlign: "text-bottom", animation: "pulse 1s ease-in-out infinite" }} />
            </p>
          </div>
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
          <div
            style={{
              background: "oklch(0.14 0.010 65)",
              border: "0.5px solid oklch(0.30 0.025 65)",
              padding: "1rem 1.25rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.78 0.14 65)", background: "oklch(0.20 0.020 65)", padding: "0.2rem 0.5rem" }}>r/SaaS</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.65 0.15 140)", background: "oklch(0.16 0.012 140)", padding: "0.2rem 0.5rem" }}>High intent</span>
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "oklch(0.38 0 0)", letterSpacing: "0.08em" }}>2h ago</span>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 400, color: "oklch(0.93 0.010 80)", lineHeight: 1.35, marginBottom: "0.6rem" }}>
              &ldquo;Struggling to get traction on Reddit without sounding like an ad&rdquo;
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 300, color: "oklch(0.55 0.006 80)", lineHeight: 1.6, marginBottom: "1rem" }}>
              Founder asking for advice on authentic Reddit marketing. Mentions failed posts, engagement drops. Strong buying signal.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", paddingTop: "0.75rem", borderTop: "0.5px solid oklch(0.22 0.007 60)" }}>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.45 0 0)", marginBottom: "0.2rem" }}>Match</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "oklch(0.88 0.025 85)" }}>94</div>
              </div>
              <div style={{ width: "0.5px", height: "2rem", background: "oklch(0.22 0.007 60)" }} />
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.45 0 0)", marginBottom: "0.2rem" }}>Intent</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "oklch(0.65 0.15 140)" }}>Strong</div>
              </div>
              <div style={{ width: "0.5px", height: "2rem", background: "oklch(0.22 0.007 60)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.45 0 0)", marginBottom: "0.2rem" }}>DM status</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "oklch(0.78 0.14 65)" }}>Draft ready</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Safety items ── */
const SAFETY_ITEMS = [
  "Spam risk score on every lead",
  "Flags templated or bot-like content",
  "Roast catches promo language before you post",
  "One-click send via extension — coming soon",
  "Sends from your browser session — no API token, no bot fingerprint",
  "Your browser session, your account",
];

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
        <h2 className="display-md mb-4">Rate limiting, built in</h2>
        <div style={{ width: "3rem", height: "0.5px", background: "oklch(0.88 0.025 85 / 0.5)" }} />
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
              <span style={{ width: "1px", height: "1rem", background: "oklch(0.88 0.025 85 / 0.4)", flexShrink: 0, marginTop: "0.15rem" }} />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Process step ── */
function ProcessStep({ n, title, body, hasBorder, delay }: {
  n: string; title: string; body: string; hasBorder: boolean; delay?: number;
}) {
  const ref = useFadeUp(delay);
  return (
    <div
      ref={ref}
      className="fade-up grid grid-cols-[40px_1fr] gap-8 py-10"
      style={{ borderBottom: hasBorder ? "0.5px solid oklch(0.18 0.007 60)" : "none" }}
    >
      <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 300, fontStyle: "italic", color: "oklch(0.88 0.025 85 / 0.4)", lineHeight: 1, paddingTop: "0.15rem" }}>
        {n}
      </div>
      <div>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 400, color: "oklch(0.93 0.010 80)", marginBottom: "0.75rem", lineHeight: 1.2 }}>
          {title}
        </h3>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", fontWeight: 300, color: "oklch(0.72 0.006 80)", lineHeight: 1.75 }}>
          {body}
        </p>
      </div>
    </div>
  );
}

/* ── Use case card ── */
function UseCaseCard({ tag, headline, body, stat }: { tag: string; headline: string; body: string; stat: string }) {
  const ref = useFadeUp();
  return (
    <div
      ref={ref}
      className="fade-up"
      style={{
        padding: "2.5rem 2rem",
        background: "oklch(0.09 0.008 60)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "oklch(0.78 0.14 65)" }}>
        {tag}
      </span>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 400, color: "oklch(0.93 0.010 80)", lineHeight: 1.25 }}>
        {headline}
      </h3>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 300, color: "oklch(0.62 0.006 80)", lineHeight: 1.7, flex: 1 }}>
        {body}
      </p>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", color: "oklch(0.55 0 0)", borderTop: "0.5px solid oklch(0.18 0.007 60)", paddingTop: "1rem" }}>
        {stat}
      </p>
    </div>
  );
}

/* ── Main Waitlist page ── */
export default function Waitlist() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.title = "SubRoast — Join the Waitlist";
    return () => { document.title = "SubRoast"; };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          transition: "background 0.4s ease, border-color 0.4s ease",
        }}
      >
        <div className="container flex items-center justify-between h-14">
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}>
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663208942813/D6eMQgvSZZr9tsyS9zVhzn/subroast-logo-debossed_490a86ef.png"
              alt="SubRoast"
              style={{ width: "28px", height: "28px", objectFit: "cover", borderRadius: "2px", opacity: 0.9 }}
            />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 400, fontStyle: "italic", color: "oklch(0.93 0.010 80)", letterSpacing: "0.01em" }}>
              SubRoast
            </span>
          </a>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { href: "#how-it-works", label: "How It Works" },
              { href: "#safety", label: "Account Safety" },
            ].map(({ href, label }) => (
              <a
                key={label}
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  const id = href.slice(1);
                  const el = document.getElementById(id);
                  if (el) {
                    const top = el.getBoundingClientRect().top + window.scrollY;
                    window.scrollTo({ top, behavior: "smooth" });
                  }
                }}
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
                onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "oklch(0.88 0.025 85)")}
                onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "oklch(0.55 0 0)")}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Nav CTA — waitlist form */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <WaitlistForm source="header" placeholder="your@email.com" buttonLabel="Join" compact />
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
        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(oklch(0.88 0.025 85 / 0.03) 0.5px, transparent 0.5px), linear-gradient(90deg, oklch(0.88 0.025 85 / 0.03) 0.5px, transparent 0.5px)`,
            backgroundSize: "80px 80px",
          }}
        />
        {/* SVG noise texture */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.18, mixBlendMode: "soft-light" }} xmlns="http://www.w3.org/2000/svg">
          <filter id="hero-noise-wl">
            <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#hero-noise-wl)" />
        </svg>

        <div className="container relative w-full">
          <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center py-20 lg:py-28" style={{ minWidth: 0, overflow: "hidden" }}>

            {/* LEFT: editorial copy */}
            <div>
              {/* Eyebrow */}
              <p className="eyebrow mb-8 hero-eyebrow-animate">
                AI Intelligence for Reddit
              </p>

              {/* Waitlist badge */}
              <div
                className="hero-eyebrow-animate"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.35rem 0.875rem",
                  background: "oklch(0.88 0.025 85 / 0.08)",
                  border: "0.5px solid oklch(0.88 0.025 85 / 0.25)",
                  marginBottom: "1.5rem",
                }}
              >
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "oklch(0.78 0.14 65)", animation: "pulse 2s ease-in-out infinite" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "oklch(0.88 0.025 85 / 0.8)" }}>
                  Early access — limited spots
                </span>
              </div>

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
                  marginBottom: "2.5rem",
                }}
              >
                AI roast, virality score, and rewrite for every post.
                Warm leads found, outreach drafted, validation signals surfaced — automatically.
              </p>

              {/* Waitlist form (hero) */}
              <div className="hero-cta-animate" style={{ maxWidth: "440px", marginBottom: "1.5rem" }}>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.58rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "oklch(0.55 0 0)",
                    marginBottom: "0.875rem",
                  }}
                >
                  Reserve your early access spot
                </p>
                <WaitlistForm source="home_header" />
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
                Free to join · No spam · Unsubscribe any time
              </p>
            </div>

            {/* RIGHT: Lead Intelligence demo */}
            <div className="hero-cta-animate" style={{ minWidth: 0, overflow: "hidden", width: "100%" }}>
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
              <div id="how-it-works" style={{ width: "100%", minWidth: 0, overflow: "hidden" }}>
                <HeroDemoPanel />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, oklch(0.09 0.008 60))" }}
        />
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

      {/* ── PROCESS ── */}
      <section
        style={{
          paddingTop: "clamp(5rem, 10vw, 9rem)",
          paddingBottom: "clamp(5rem, 10vw, 9rem)",
          borderBottom: "0.5px solid oklch(0.18 0.007 60)",
        }}
      >
        <div className="container max-w-3xl">
          <p className="eyebrow mb-12">How it works</p>
          {[
            {
              n: "01",
              title: "Connect your Reddit account",
              body: "Link your existing Reddit account via OAuth. SubRoast never stores your password — it uses a secure token that you can revoke at any time.",
            },
            {
              n: "02",
              title: "Define your target audience",
              body: "Tell SubRoast which subreddits to monitor and what kind of posts signal buying intent for your product. The AI learns from your feedback over time.",
            },
            {
              n: "03",
              title: "Review AI-drafted outreach",
              body: "Every lead arrives with a personalised DM and a public comment draft. You approve, edit, or skip — SubRoast never sends without your explicit review.",
            },
            {
              n: "04",
              title: "Post with confidence",
              body: "Use the Draft & Roast tool to score any post before publishing. Get a virality rating, clarity score, and a fully rewritten version in seconds.",
            },
          ].map(({ n, title, body }, i, arr) => (
            <ProcessStep key={n} n={n} title={title} body={body} hasBorder={i < arr.length - 1} delay={i * 80} />
          ))}
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

      {/* ── WAITLIST CTA SECTION ── */}
      <section
        style={{
          paddingTop: "clamp(6rem, 12vw, 11rem)",
          paddingBottom: "clamp(6rem, 12vw, 11rem)",
          background: "oklch(0.10 0.007 60)",
          borderBottom: "0.5px solid oklch(0.18 0.007 60)",
        }}
      >
        <div className="container text-center">
          <p className="eyebrow mb-8 block">Be first in line</p>

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

          <div className="rule-gold mx-auto mb-6" style={{ width: "3rem" }} />

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

          <div style={{ maxWidth: "480px", margin: "0 auto" }}>
            <WaitlistForm source="home_footer" buttonLabel="Reserve my spot" />
          </div>

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
            Free to join · No spam · Unsubscribe any time
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "0.5px solid oklch(0.18 0.007 60)", padding: "2rem 0" }}>
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontStyle: "italic", color: "oklch(0.58 0 0)" }}>
            SubRoast
          </span>

          {/* Footer waitlist form */}
          <div style={{ maxWidth: "360px", width: "100%" }}>
            <WaitlistForm source="footer" placeholder="your@email.com" buttonLabel="Join" compact />
          </div>

          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "oklch(0.42 0 0)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            &copy; {new Date().getFullYear()} SubRoast. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

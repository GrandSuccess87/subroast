import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  AlertTriangle,
  ArrowRight,
  BarChart2,
  CheckCircle2,
  Flame,
  MessageSquare,
  Play,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "@/components/DashboardLayoutSkeleton";

/* ── Intersection-observer fade-up hook ── */
function useFadeUp() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ── Product mockup ── */
function ProductMockup() {
  return (
    <div className="relative w-full max-w-[420px] mx-auto lg:mx-0">
      {/* Ambient glow */}
      <div
        className="absolute -inset-6 rounded-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.78 0.18 65 / 0.12) 0%, transparent 70%)",
        }}
      />
      <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Traffic-light bar */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/30">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          <span
            className="ml-2 text-[11px] text-muted-foreground"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            subroast.com / analyze
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* Draft snippet */}
          <div className="rounded-lg bg-muted/40 border border-border/50 p-3">
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              "Just launched my SaaS tool for tracking Reddit mentions. Would love feedback from
              r/SaaS — has anyone found a good workflow for this?"
            </p>
          </div>

          {/* Score row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Clarity", value: 74, color: "text-blue-400", bar: "bg-blue-400" },
              { label: "Fit", value: 81, color: "text-primary", bar: "bg-primary" },
              { label: "Virality", value: 68, color: "text-cyan-400", bar: "bg-cyan-400" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-lg bg-muted/30 border border-border/40 p-2.5 text-center"
              >
                <div
                  className={`text-xl font-bold ${s.color}`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {s.value}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
                <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.bar}`}
                    style={{ width: `${s.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Roast */}
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Flame className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">AI Roast</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              "This reads like a press release. Redditors don't want to 'provide feedback' — they
              want to solve a problem. Lead with the pain, not the product."
            </p>
          </div>

          {/* Tip */}
          <div className="rounded-lg bg-muted/30 border border-border/40 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">Virality tip</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Open with a question. Posts that start with "Has anyone…" get 2.4× more comments.
            </p>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -bottom-3 -right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg"
        style={{ boxShadow: "0 4px 20px oklch(0.78 0.18 65 / 0.4)" }}>
        <Zap className="w-3 h-3" />
        Score improved +18 pts
      </div>
    </div>
  );
}

/* ── Step card ── */
function StepCard({
  step,
  icon: Icon,
  title,
  desc,
  color,
  bg,
  border,
}: {
  step: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
}) {
  const ref = useFadeUp();
  return (
    <div ref={ref} className={`fade-up relative rounded-2xl border ${border} bg-card p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <span
          className={`text-3xl font-black ${color} opacity-20`}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {step}
        </span>
      </div>
      <h3 className="font-bold text-base mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

/* ── Feature card ── */
function FeatureCard({
  icon: Icon,
  title,
  desc,
  color,
  bg,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
  bg: string;
}) {
  const ref = useFadeUp();
  return (
    <div
      ref={ref}
      className="fade-up p-5 rounded-xl bg-card border border-border hover:border-primary/40 transition-all"
    >
      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-4.5 h-4.5 ${color}`} />
      </div>
      <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

/* ── Demo Video Section ── */
function VideoSection() {
  const ref = useFadeUp();
  const [playing, setPlaying] = useState(false);

  // Replace VIDEO_URL with your actual Loom/YouTube embed URL when ready
  // For now we show a polished placeholder that accepts a real URL
  const VIDEO_EMBED_URL = ""; // e.g. "https://www.loom.com/embed/YOUR_ID" or "https://www.youtube.com/embed/YOUR_ID"

  return (
    <section className="py-20 border-b border-border/40">
      <div className="container">
        <div ref={ref} className="fade-up text-center mb-10">
          <p
            className="label-mono text-primary mb-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            See it in action
          </p>
          <h2
            className="text-4xl font-bold mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            From blank draft to warm leads
            <br />
            <em className="not-italic text-primary">in under 60 seconds</em>
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Watch how SubRoast analyzes a Reddit post, scores it, generates a personalized DM,
            and queues it — all in one click.
          </p>
        </div>

        {/* Video frame */}
        <div className="relative max-w-3xl mx-auto">
          {/* Ambient glow behind video */}
          <div
            className="absolute -inset-4 rounded-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, oklch(0.78 0.18 65 / 0.08) 0%, transparent 70%)",
            }}
          />

          <div className="relative rounded-2xl border border-border overflow-hidden bg-card shadow-2xl aspect-video">
            {VIDEO_EMBED_URL && playing ? (
              <iframe
                src={VIDEO_EMBED_URL + "?autoplay=1"}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
                title="SubRoast product demo"
              />
            ) : (
              /* Placeholder / poster */
              <div className="w-full h-full flex flex-col items-center justify-center relative">
                {/* Dark grid background */}
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: `linear-gradient(oklch(0.78 0.18 65) 1px, transparent 1px), linear-gradient(90deg, oklch(0.78 0.18 65) 1px, transparent 1px)`,
                    backgroundSize: "32px 32px",
                  }}
                />

                {/* Fake timeline / progress bar at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background/80 to-transparent flex items-center px-5 gap-3">
                  <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
                    <div className="h-full w-1/3 rounded-full bg-primary opacity-60" />
                  </div>
                  <span
                    className="text-[10px] text-muted-foreground shrink-0"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    0:42 / 1:58
                  </span>
                </div>

                {/* Step labels */}
                <div className="absolute top-5 left-5 right-5 flex items-center gap-2 flex-wrap">
                  {["Reading post", "Scoring lead", "Crafting DM", "DM ready", "Done"].map(
                    (label, i) => (
                      <span
                        key={label}
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          i < 3
                            ? "bg-primary/15 border-primary/30 text-primary"
                            : "bg-muted/40 border-border/40 text-muted-foreground"
                        }`}
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {label}
                      </span>
                    )
                  )}
                </div>

                {/* Play button */}
                <button
                  onClick={() => VIDEO_EMBED_URL ? setPlaying(true) : undefined}
                  className="play-btn relative z-10"
                  aria-label="Play demo video"
                  title={VIDEO_EMBED_URL ? "Play demo" : "Demo video coming soon"}
                >
                  <Play className="w-7 h-7 text-primary-foreground fill-current ml-1" />
                </button>

                {!VIDEO_EMBED_URL && (
                  <p
                    className="mt-4 text-xs text-muted-foreground relative z-10"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Demo video coming soon
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Caption */}
          <p className="text-center text-xs text-muted-foreground mt-4"
            style={{ fontFamily: "var(--font-mono)" }}>
            The full 6-step AI chain: Reading → Scoring → Crafting DM → DM ready → Comment → Done
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── Safety section ── */
function SafetySection() {
  const ref = useFadeUp();
  const SAFETY_ITEMS = [
    "Max 5 posts/day with 30-min cooldown",
    "Max 25 DMs/day at 5/hour",
    "2–10 min randomized delays between DMs",
    "Alerts you after repeated failures so you stay in control",
    "Warning at 80% of daily limit",
  ];
  return (
    <section className="py-20 border-b border-border/40">
      <div className="container max-w-2xl mx-auto text-center">
        <div ref={ref} className="fade-up">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h2
            className="text-3xl font-bold mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Rate limiting built in
          </h2>
          <p className="text-base text-muted-foreground mb-8 leading-relaxed">
            SubRoast enforces Reddit's unwritten rules automatically so you never have to think
            about it.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto">
            {SAFETY_ITEMS.map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Bottom CTA section ── */
function CtaSection() {
  const ref = useFadeUp();
  return (
    <section className="py-24 bg-card/20">
      <div ref={ref} className="fade-up container text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          7-day free trial — no credit card
        </div>
        <h2
          className="text-4xl sm:text-5xl font-bold mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Ready to post smarter?
        </h2>
        <p className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto leading-relaxed">
          Connect your Reddit account and get your first AI roast in under 2 minutes.
        </p>
        <a
          href={getLoginUrl()}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all btn-primary-glow hover:-translate-y-0.5"
        >
          <Zap className="w-4 h-4" />
          Start free trial
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}

/* ── Data ── */
const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Draft & Roast",
    desc: "Get a brutally honest review, a roast, and an improved version of your post — all in one click.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: MessageSquare,
    title: "Personalized DM Generation",
    desc: "AI writes a custom outreach message for each lead based on their actual Reddit post.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    icon: Shield,
    title: "Account Safety",
    desc: "Warnings at 80% daily limit. Your Reddit account stays safe.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: BarChart2,
    title: "History & Insights",
    desc: "Track all posts with status, links, and Reddit engagement tips like 'questions get 2× comments'.",
    color: "text-rose-400",
    bg: "bg-rose-400/10",
  },
  {
    icon: TrendingUp,
    title: "Virality Score",
    desc: "Get a 1–100 virality score on every post before you publish, with a specific tip to improve it.",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Flame,
    title: "Roast your post",
    desc: "Paste your draft and get an AI roast, a clarity score, a fit score, a virality score, and a rewritten version — before you ever hit submit.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    step: "02",
    icon: Search,
    title: "Find leads & send DMs",
    desc: "AI monitors your target subreddits 24/7, scores each post by relevance, and drafts a personalized DM for every prospect it finds.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
  },
];

/* ── Main component ── */
export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  useEffect(() => {
    document.title = "SubRoast — AI Reddit Growth Tool for Founders";
    const desc = document.querySelector('meta[name="description"]');
    if (desc)
      desc.setAttribute(
        "content",
        "SubRoast scores your Reddit posts with AI, schedules them at peak times, and finds leads while you sleep. Built for indie SaaS founders."
      );
  }, []);

  /* Subtle parallax for hero copy block */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onScroll = () => {
      const y = window.scrollY;
      hero.style.transform = `translateY(${y * 0.12}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (loading) return <DashboardLayoutSkeleton />;

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── NAV ── */}
      <nav className="border-b border-border/40 bg-background/85 backdrop-blur-md sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663208942813/BEbgHhBeLfKnEwiD.png"
              alt="SubRoast"
              className="w-7 h-7 rounded-lg object-cover"
            />
            <span
              className="font-bold text-sm tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              SubRoast
            </span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Demo
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              How it works
            </a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Features
            </a>
            <a href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Pricing
            </a>
            <a
              href={getLoginUrl()}
              className="text-sm font-medium px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors btn-primary-glow"
            >
              Sign in
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: "calc(100svh - 3.5rem)" }}
      >
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(oklch(0.78 0.18 65) 1px, transparent 1px), linear-gradient(90deg, oklch(0.78 0.18 65) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
        {/* Top-left glow */}
        <div
          className="absolute -top-20 -left-20 w-[600px] h-[500px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top left, oklch(0.78 0.18 65 / 0.08) 0%, transparent 65%)",
          }}
        />
        {/* Bottom-right glow */}
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at bottom right, oklch(0.62 0.16 200 / 0.05) 0%, transparent 65%)",
          }}
        />

        <div className="container relative py-16 pb-28 lg:py-24 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: editorial copy */}
            <div ref={heroRef} className="text-center lg:text-left">
              {/* Eyebrow label */}
              <div className="inline-flex items-center gap-2 mb-6">
                <span className="label-mono text-primary" style={{ fontFamily: "var(--font-mono)" }}>
                  AI Reddit Coach
                </span>
                <span className="w-px h-3 bg-border" />
                <span className="label-mono text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                  for indie SaaS founders
                </span>
              </div>

              {/* Display headline */}
              <h1
                className="text-5xl sm:text-6xl lg:text-[4.25rem] font-bold tracking-tight leading-[1.08] mb-6"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Stop guessing.
                <br />
                <em className="not-italic text-primary">Start winning</em>
                <br />
                on Reddit.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed mx-auto lg:mx-0">
                SubRoast gives every post an AI roast, a virality score, and a rewrite — then
                finds warm leads and drafts personalized DMs while you sleep.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-8">
                <a
                  href={getLoginUrl()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all btn-primary-glow hover:-translate-y-0.5"
                >
                  <Zap className="w-4 h-4" />
                  Start free — 7 days on us
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#demo"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground/70 font-medium text-sm hover:text-foreground hover:border-primary/40 transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  Watch demo
                </a>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2.5">
                {[
                  { icon: CheckCircle2, text: "No credit card required", color: "text-primary" },
                  { icon: CheckCircle2, text: "Cancel anytime", color: "text-primary" },
                  { icon: AlertTriangle, text: "Account safety built in", color: "text-amber-400" },
                ].map(({ icon: Icon, text, color }) => (
                  <div key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon className={`w-3.5 h-3.5 ${color} shrink-0`} />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: product mockup */}
            <div className="flex justify-center lg:justify-end">
              <ProductMockup />
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, oklch(0.09 0.006 250))" }}
        />
      </section>

      {/* ── STAT BAR ── */}
      <section className="border-y border-border/40 bg-card/30">
        <div className="container py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: "6-step", label: "AI chain" },
              { value: "25/day", label: "DM rate limit" },
              { value: "1–100", label: "Virality score" },
              { value: "7 days", label: "Free trial" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-mono)" }}>
                  {value}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO VIDEO ── */}
      <div id="demo">
        <VideoSection />
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 border-b border-border/40">
        <div className="container">
          <div className="text-center mb-14">
            <p className="label-mono text-primary mb-3" style={{ fontFamily: "var(--font-mono)" }}>
              Simple by design
            </p>
            <h2 className="text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
              How SubRoast works
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Two steps from blank draft to warm leads in your inbox.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto relative">
            <div
              className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px"
              style={{ background: "linear-gradient(90deg, oklch(0.78 0.18 65 / 0.3), oklch(0.62 0.16 200 / 0.3))" }}
            />
            {HOW_IT_WORKS.map((step) => (
              <StepCard key={step.step} {...step} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 border-b border-border/40 bg-card/20">
        <div className="container">
          <div className="text-center mb-12">
            <p className="label-mono text-primary mb-3" style={{ fontFamily: "var(--font-mono)" }}>
              Full toolkit
            </p>
            <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Everything you need to win on Reddit
            </h2>
            <p className="text-muted-foreground text-sm">Without getting banned.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SAFETY ── */}
      <SafetySection />

      {/* ── BOTTOM CTA ── */}
      <CtaSection />

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/40 py-6">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663208942813/BEbgHhBeLfKnEwiD.png"
              alt="SubRoast"
              className="w-5 h-5 rounded object-cover"
            />
            <span style={{ fontFamily: "var(--font-display)" }}>SubRoast</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <span>Built for indie SaaS founders</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

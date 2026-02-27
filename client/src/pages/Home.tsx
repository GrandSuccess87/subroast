import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  AlertTriangle,
  ArrowRight,
  BarChart2,
  CalendarClock,
  CheckCircle2,
  Flame,
  MessageSquare,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "@/components/DashboardLayoutSkeleton";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Draft & Roast",
    desc: "Get a brutally honest review, a roast, and an improved version of your post — all in one click.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: CalendarClock,
    title: "Smart Scheduling",
    desc: "SubRoast auto-posts at the right moment with 30-min cooldowns and 5/day limits.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
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
    color: "text-amber-400",
    bg: "bg-amber-400/10",
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

const SAFETY_ITEMS = [
  "Max 5 posts/day with 30-min cooldown",
  "Max 25 DMs/day at 5/hour",
  "2–10 min randomized delays between DMs",
  "Alerts you after repeated failures so you stay in control",
  "Warning at 80% of daily limit",
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
    icon: CalendarClock,
    title: "Schedule it automatically",
    desc: "SubRoast picks the optimal posting time, enforces cooldowns, and posts on your behalf — no manual timing needed.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  {
    step: "03",
    icon: Search,
    title: "Find leads & send DMs",
    desc: "AI monitors your target subreddits 24/7, scores each post by relevance, and drafts a personalized DM for every prospect it finds.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
  },
];

// Inline product mockup — shows a fake roast result card
function ProductMockup() {
  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0">
      {/* Glow behind the card */}
      <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl" />

      <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Mockup header bar */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/30">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          <span className="ml-2 text-xs text-muted-foreground font-mono">subroast.app / draft</span>
        </div>

        <div className="p-5 space-y-4">
          {/* Post snippet */}
          <div className="rounded-lg bg-muted/40 border border-border/50 p-3">
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              "Just launched my SaaS tool for tracking Reddit mentions. Would love feedback from r/SaaS — has anyone found a good workflow for this?"
            </p>
          </div>

          {/* Score row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Clarity", value: 74, color: "text-blue-400", bar: "bg-blue-400" },
              { label: "Fit", value: 81, color: "text-primary", bar: "bg-primary" },
              { label: "Virality", value: 68, color: "text-cyan-400", bar: "bg-cyan-400" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-muted/30 border border-border/40 p-2.5 text-center">
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
                <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${s.value}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Roast */}
          <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-amber-300">AI Roast</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              "This reads like a press release. Redditors don't want to 'provide feedback' — they want to solve a problem. Lead with the pain, not the product."
            </p>
          </div>

          {/* Tip */}
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">Virality tip</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Open with a question. Posts that start with "Has anyone..." get 2.4× more comments.
            </p>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -bottom-3 -right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/30">
        <Zap className="w-3 h-3" />
        Score improved 18pts
      </div>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  // SEO: set page title and meta description dynamically for crawlers
  useEffect(() => {
    document.title = "SubRoast — AI Reddit Growth Tool for Founders";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "SubRoast scores your Reddit posts with AI, schedules them at peak times, and finds leads while you sleep. Built for indie SaaS founders.");
  }, []);

  if (loading) return <DashboardLayoutSkeleton />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663208942813/BEbgHhBeLfKnEwiD.png"
              alt="SubRoast"
              className="w-7 h-7 rounded-lg object-cover"
            />
            <span className="font-bold text-sm tracking-tight">SubRoast</span>
          </div>
          <div className="flex items-center gap-4">
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
              className="text-sm font-medium px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Sign in
            </a>
          </div>
        </div>
      </nav>

      {/* ── ASYMMETRIC HERO ── */}
      <section className="relative overflow-hidden min-h-[calc(100svh-3.5rem)]">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(oklch(0.65 0.19 145) 1px, transparent 1px), linear-gradient(90deg, oklch(0.65 0.19 145) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Left glow */}
        <div className="absolute top-0 left-0 w-[500px] h-[400px] bg-primary/8 rounded-full blur-3xl -translate-x-1/3" />

        <div className="container relative py-16 pb-32 lg:py-24 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: copy */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5">
                Stop guessing.
                <br />
                <span className="text-primary">Start winning</span>
                <br />
                on Reddit.
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed mx-auto lg:mx-0">
                SubRoast gives every post an AI roast, a virality score, and a rewrite — then schedules it at the perfect time and finds leads while you sleep.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-8">
                <a
                  href={getLoginUrl()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5"
                >
                  <Zap className="w-4 h-4" />
                  Start free — 7 days on us
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground/70 font-medium text-sm hover:text-foreground hover:border-border/80 transition-all"
                >
                  See how it works
                </a>
              </div>

              {/* Trust row */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  No credit card required
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  Cancel anytime
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  Account safety built in
                </div>
              </div>
            </div>

            {/* Right: product mockup */}
            <div className="flex justify-center lg:justify-end">
              <ProductMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-16 border-t border-border/50">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-2">Simple by design</p>
            <h2 className="text-3xl font-bold mb-3">How SubRoast works</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Three steps from blank draft to scheduled post to warm leads in your inbox.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-primary/30 via-blue-400/30 to-purple-400/30" />

            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className={`relative rounded-2xl border ${step.border} bg-card p-6`}>
                {/* Step number */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${step.bg} flex items-center justify-center`}>
                    <step.icon className={`w-5 h-5 ${step.color}`} />
                  </div>
                  <span className={`text-3xl font-black ${step.color} opacity-20`}>{step.step}</span>
                </div>
                <h3 className="font-bold text-base mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-16 border-t border-border/50 bg-card/20">
        <div className="container">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-2">Full toolkit</p>
            <h2 className="text-3xl font-bold mb-2">Everything you need to win on Reddit</h2>
            <p className="text-muted-foreground text-sm">Without getting banned.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-5 rounded-xl bg-card border border-border hover:border-border/80 transition-all group"
              >
                <div className={`w-9 h-9 rounded-lg ${f.bg} flex items-center justify-center mb-3`}>
                  <f.icon className={`w-4.5 h-4.5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SAFETY ── */}
      <section className="py-14 border-t border-border/50">
        <div className="container max-w-2xl mx-auto text-center">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Rate limiting built in</h2>
          <p className="text-base text-muted-foreground mb-8">
            SubRoast enforces Reddit's unwritten rules automatically so you never have to think about it.
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
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-16 border-t border-border/50 bg-card/20">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            7-day free trial — no credit card
          </div>
          <h2 className="text-3xl font-bold mb-3">Ready to post smarter?</h2>
          <p className="text-muted-foreground text-sm mb-7 max-w-sm mx-auto">
            Connect your Reddit account and get your first AI roast in under 2 minutes.
          </p>
          <a
            href={getLoginUrl()}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5"
          >
            <Zap className="w-4 h-4" />
            Start free trial
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="container flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663208942813/BEbgHhBeLfKnEwiD.png"
              alt="SubRoast"
              className="w-5 h-5 rounded object-cover"
            />
            <span>SubRoast</span>
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

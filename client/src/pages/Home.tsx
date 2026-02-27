import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  AlertTriangle,
  ArrowRight,
  BarChart2,
  CalendarClock,
  CheckCircle2,
  MessageSquare,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Draft & Roast",
    desc: "Get a brutal honest review, a roast, and an improved version of your post — all in one click.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: CalendarClock,
    title: "Smart Scheduling",
    desc: "Pick a time, SubSignal auto-posts at the right moment with 30-min cooldowns and 5/day limits.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: MessageSquare,
    title: "Rate-Limited DM Campaigns",
    desc: "Upload a username list, send DMs at 5/hour with 2–10 min randomized delays. Max 25/day.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    icon: Shield,
    title: "Account Safety",
    desc: "Auto-pause after 3 failures, warnings at 80% daily limit. Your Reddit account stays safe.",
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
];

const SAFETY_ITEMS = [
  "Max 5 posts/day with 30-min cooldown",
  "Max 25 DMs/day at 5/hour",
  "2–10 min randomized delays between DMs",
  "Auto-pause after 3 consecutive failures",
  "Warning at 80% of daily limit",
];

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm tracking-tight">SubSignal</span>
          </div>
          <a
            href={getLoginUrl()}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(oklch(0.65 0.19 145) 1px, transparent 1px), linear-gradient(90deg, oklch(0.65 0.19 145) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Green glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl" />

        <div className="container relative pt-20 pb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            For indie SaaS founders
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-4">
            SubSignal: Stop guessing
            <br />
            <span className="text-primary">on Reddit</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            Draft smarter posts and DMs with AI feedback, schedule auto-posting with
            rate-limit safety, and run outreach campaigns — all without risking your account.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href={getLoginUrl()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              <Zap className="w-4 h-4" />
              Connect Reddit
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground/70 font-medium text-sm hover:text-foreground hover:border-border/80 transition-all"
            >
              See how it works
            </a>
          </div>

          {/* Safety callout */}
          <div className="mt-10 inline-flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-left max-w-lg mx-auto">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300/80 leading-relaxed">
              <span className="font-semibold text-amber-300">Built-in Reddit safety:</span>{" "}
              Max 5 posts/day with 30-min cooldown. Max 25 DMs/day at 5/hour with 2–10 min
              randomized delays. Auto-pause after 3 failures.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 border-t border-border/50">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Everything you need to win on Reddit</h2>
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

      {/* Safety section */}
      <section className="py-14 border-t border-border/50 bg-card/30">
        <div className="container max-w-2xl mx-auto text-center">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Rate limiting built in</h2>
          <p className="text-sm text-muted-foreground mb-6">
            SubSignal enforces Reddit's unwritten rules automatically so you never have to think about it.
          </p>
          <div className="grid sm:grid-cols-2 gap-2 text-left max-w-md mx-auto">
            {SAFETY_ITEMS.map((item) => (
              <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="py-16 border-t border-border/50">
        <div className="container text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to post smarter?</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Connect your Reddit account and start in under 5 minutes.
          </p>
          <a
            href={getLoginUrl()}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5"
          >
            <Zap className="w-4 h-4" />
            Connect Reddit
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="container flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
              <Zap className="w-3 h-3 text-primary" />
            </div>
            <span>SubSignal</span>
          </div>
          <span>Built for indie SaaS founders</span>
        </div>
      </footer>
    </div>
  );
}

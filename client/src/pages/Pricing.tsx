import { useState } from "react";
import { useLocation } from "wouter";
import { Check, ArrowLeft, Loader2, Flame } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const FOUNDER_FEATURES = [
  "Unlimited outreach campaigns",
  "Unlimited lead syncs",
  "Buyer intent detection & heat scoring",
  "AI-generated personalized DMs",
  "AI Draft & Roast with virality score",
  "Pain point clustering across leads",
  "Email alerts for new leads",
  "Lock in early pricing forever",
];

const FAQS = [
  {
    q: "Do I need a credit card to get started?",
    a: "No — you can sign up and run your first campaign with 3 free syncs, no card required. A card is only needed when you're ready to unlock unlimited access.",
  },
  {
    q: "What happens after my 3 free syncs?",
    a: "You keep all the leads you've already found. To continue syncing and finding new leads, you'll need to upgrade to the Founder Plan.",
  },
  {
    q: "Will my Founder pricing be locked in?",
    a: "Yes. Founders who subscribe early lock in their rate for the lifetime of their subscription — even as the price increases for new users.",
  },
  {
    q: "How does lead sync work?",
    a: "SubRoast automatically scans your target subreddits for posts matching your keywords and scores each lead by intent and relevance. You can also trigger a manual sync anytime from your campaign dashboard.",
  },
  {
    q: "Is this month-to-month?",
    a: "Yes — billed monthly with no long-term contracts. Cancel anytime, no questions asked.",
  },
];

const FONT_DISPLAY = "Cormorant Garamond, Georgia, serif";
const FONT_MONO = "JetBrains Mono, monospace";
const BG = "oklch(0.09 0.008 60)";
const SURFACE = "oklch(0.12 0.007 60)";
const SURFACE_RAISED = "oklch(0.14 0.007 60)";
const BORDER = "oklch(0.22 0.007 60)";
const BORDER_ACCENT = "oklch(0.88 0.025 85 / 0.35)";
const IVORY = "oklch(0.88 0.025 85)";
const IVORY_DIM = "oklch(0.88 0.025 85 / 0.55)";
const FOREGROUND = "oklch(0.93 0.010 80)";
const MUTED = "oklch(0.62 0.006 80)";
const ORANGE = "oklch(0.72 0.18 50)";

export default function Pricing() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { data: spots } = trpc.subscription.getFounderSpots.useQuery(undefined, {
    staleTime: 30_000,
  });

  const createCheckout = trpc.subscription.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
        toast.info("Redirecting to secure checkout...");
      }
      setIsLoading(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to start checkout");
      setIsLoading(false);
    },
  });

  const handleGetAccess = () => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    setIsLoading(true);
    createCheckout.mutate({ plan: "founder", origin: window.location.origin });
  };

  const priceLabel = spots?.priceLabel ?? "$25/month";
  const spotsLabel = spots?.spotsLabel ?? "";
  const priceUsd = Math.round((spots?.priceUsd ?? 2500) / 100);

  return (
    <div style={{ minHeight: "100vh", background: BG, color: FOREGROUND, fontFamily: "Inter, sans-serif" }}>
      {/* Nav */}
      <nav style={{ borderBottom: `0.5px solid ${BORDER}`, padding: "0 2rem", height: "3.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", background: BG }}>
        <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", color: MUTED, cursor: "pointer", fontFamily: FONT_MONO, fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          <ArrowLeft size={12} />
          Back
        </button>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: "1rem", fontStyle: "italic", color: FOREGROUND, letterSpacing: "0.01em" }}>SubRoast</span>
        <div style={{ width: "4rem" }} />
      </nav>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "5rem 2rem 8rem" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "6rem" }}>
          <p style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", letterSpacing: "0.32em", textTransform: "uppercase", color: IVORY, marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
            <span style={{ display: "inline-block", width: "2rem", height: "0.5px", background: IVORY_DIM }} />
            Founder Access
            <span style={{ display: "inline-block", width: "2rem", height: "0.5px", background: IVORY_DIM }} />
          </p>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(2.8rem, 7vw, 5rem)", fontWeight: 300, fontStyle: "italic", lineHeight: 1.1, letterSpacing: "-0.01em", color: FOREGROUND, marginBottom: "1.5rem" }}>
            Early users<br />shape the product.
          </h1>
          <p style={{ fontSize: "0.95rem", color: MUTED, maxWidth: "440px", margin: "0 auto 2rem", lineHeight: 1.7 }}>
            3 free syncs to get started. No credit card required.
          </p>
          {spotsLabel && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", border: `0.5px solid ${BORDER_ACCENT}`, padding: "0.4rem 1.2rem", fontFamily: FONT_MONO, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: IVORY }}>
              <Flame size={10} color={ORANGE} />
              {spotsLabel}
            </div>
          )}
        </div>

        {/* Single Plan Card */}
        <div style={{ maxWidth: "480px", margin: "0 auto 6rem", border: `0.5px solid ${BORDER}` }}>
          <div style={{ background: SURFACE_RAISED, padding: "3rem 2.5rem", display: "flex", flexDirection: "column" }}>

            {/* Label */}
            <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase", color: MUTED, marginBottom: "0.75rem" }}>
              Founder Plan
            </p>

            {/* Name */}
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "2.2rem", fontWeight: 400, fontStyle: "italic", color: FOREGROUND, marginBottom: "0.5rem", lineHeight: 1.1 }}>
              Unlimited Access
            </h2>
            <p style={{ fontSize: "0.82rem", color: MUTED, marginBottom: "2rem", lineHeight: 1.6 }}>
              For founders ready to turn Reddit conversations into customers.
            </p>

            {/* Price */}
            <div style={{ borderTop: `0.5px solid ${BORDER}`, borderBottom: `0.5px solid ${BORDER}`, padding: "1.5rem 0", marginBottom: "2rem" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: "2.8rem", fontWeight: 400, color: FOREGROUND, lineHeight: 1 }}>
                  ${priceUsd}
                </span>
                <span style={{ fontFamily: FONT_MONO, fontSize: "0.7rem", color: MUTED, letterSpacing: "0.08em" }}>
                  / month
                </span>
              </div>
              {spotsLabel && (
                <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", color: ORANGE, letterSpacing: "0.1em", marginTop: "0.4rem" }}>
                  {spotsLabel}
                </p>
              )}
            </div>

            {/* Features */}
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2.5rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {FOUNDER_FEATURES.map((feature) => (
                <li key={feature} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", fontSize: "0.82rem", color: FOREGROUND, lineHeight: 1.5 }}>
                  <span style={{ width: "14px", height: "14px", border: `0.5px solid ${BORDER_ACCENT}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                    <Check size={8} color={IVORY} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              onClick={handleGetAccess}
              disabled={isLoading}
              onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.background = "oklch(0.94 0.030 85)"; e.currentTarget.style.boxShadow = "0 6px 20px oklch(0.78 0.14 65 / 0.30)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = IVORY; e.currentTarget.style.boxShadow = "none"; }}
              style={{ width: "100%", padding: "0.9rem 1.5rem", background: IVORY, border: `0.5px solid ${IVORY}`, color: BG, fontFamily: FONT_MONO, fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "background 0.25s ease, box-shadow 0.25s ease" }}
            >
              {isLoading ? (
                <><Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Opening checkout...</>
              ) : (
                `Get Founder Access — ${priceLabel}`
              )}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "4rem" }}>
          <div style={{ flex: 1, height: "0.5px", background: BORDER }} />
          <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.28em", textTransform: "uppercase", color: MUTED }}>
            Common Questions
          </p>
          <div style={{ flex: 1, height: "0.5px", background: BORDER }} />
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          {FAQS.map(({ q, a }, i) => (
            <div key={q} style={{ borderBottom: `0.5px solid ${BORDER}`, padding: "1.75rem 0", ...(i === 0 ? { borderTop: `0.5px solid ${BORDER}` } : {}) }}>
              <p style={{ fontFamily: FONT_DISPLAY, fontSize: "1.05rem", fontWeight: 400, fontStyle: "italic", color: FOREGROUND, marginBottom: "0.6rem", lineHeight: 1.4 }}>
                {q}
              </p>
              <p style={{ fontSize: "0.82rem", color: MUTED, lineHeight: 1.7 }}>
                {a}
              </p>
            </div>
          ))}
        </div>


      </div>
    </div>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { Check, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const PLANS = [
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
    cta: "Begin 7-Day Trial",
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
      "AI auto-scheduling",
      "DM template library",
      "Advanced analytics",
    ],
    cta: "Begin 7-Day Trial",
    popular: true,
  },
];

const FAQS = [
  {
    q: "Do I need a credit card for the free trial?",
    a: "Yes — Stripe requires a card to start the trial, but you won't be charged until Day 7. You'll receive a reminder on Day 6 so you have time to cancel.",
  },
  {
    q: "What happens after the trial ends?",
    a: "You'll be automatically charged for the plan you selected. You can cancel anytime from Settings → Manage Billing before the trial ends.",
  },
  {
    q: "Can I switch plans?",
    a: "Yes. You can upgrade from Starter to Growth at any time from Settings → Manage Billing. Stripe prorates the difference.",
  },
  {
    q: "What is the campaign limit on Starter?",
    a: "Starter includes 1 active outreach campaign. Upgrade to Growth for unlimited campaigns.",
  },
  {
    q: "Is this month-to-month?",
    a: "Yes — all plans are billed monthly with no long-term contracts. Cancel anytime.",
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
const MUTED = "oklch(0.52 0.006 80)";

export default function Pricing() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const createCheckout = trpc.subscription.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
        toast.info("Redirecting to secure checkout...");
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
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        color: FOREGROUND,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Nav */}
      <nav
        style={{
          borderBottom: `0.5px solid ${BORDER}`,
          padding: "0 2rem",
          height: "3.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: `${BG}`,
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "none",
            border: "none",
            color: MUTED,
            cursor: "pointer",
            fontFamily: FONT_MONO,
            fontSize: "0.7rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          <ArrowLeft size={12} />
          Back
        </button>
        <span
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: "1rem",
            fontStyle: "italic",
            color: FOREGROUND,
            letterSpacing: "0.01em",
          }}
        >
          SubRoast
        </span>
        <div style={{ width: "4rem" }} />
      </nav>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "5rem 2rem 8rem" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "6rem" }}>
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: "0.65rem",
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: IVORY,
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
            }}
          >
            <span style={{ display: "inline-block", width: "2rem", height: "0.5px", background: IVORY_DIM }} />
            Investment
            <span style={{ display: "inline-block", width: "2rem", height: "0.5px", background: IVORY_DIM }} />
          </p>
          <h1
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "clamp(2.8rem, 7vw, 5rem)",
              fontWeight: 300,
              fontStyle: "italic",
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
              color: FOREGROUND,
              marginBottom: "1.5rem",
            }}
          >
            Precision outreach,<br />at any scale.
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: MUTED,
              maxWidth: "440px",
              margin: "0 auto 2rem",
              lineHeight: 1.7,
            }}
          >
            Begin with a 7-day free trial. No commitment required.
            Cancel from Settings at any time.
          </p>
          {/* Trial badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              border: `0.5px solid ${BORDER_ACCENT}`,
              padding: "0.4rem 1.2rem",
              fontFamily: FONT_MONO,
              fontSize: "0.65rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: IVORY,
            }}
          >
            <Check size={10} />
            7-day free trial · Cancel anytime
          </div>
        </div>

        {/* Plan Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5px",
            marginBottom: "6rem",
            border: `0.5px solid ${BORDER}`,
          }}
        >
          {PLANS.map((plan) => {
            const isLoading = loadingPlan === plan.key;
            return (
              <div
                key={plan.key}
                style={{
                  background: plan.popular ? SURFACE_RAISED : SURFACE,
                  padding: "3rem 2.5rem",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  borderRight: plan.popular ? "none" : `0.5px solid ${BORDER}`,
                }}
              >
                {plan.popular && (
                  <div
                    style={{
                      position: "absolute",
                      top: "1.5rem",
                      right: "1.5rem",
                      fontFamily: FONT_MONO,
                      fontSize: "0.6rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: IVORY,
                      border: `0.5px solid ${BORDER_ACCENT}`,
                      padding: "0.25rem 0.6rem",
                    }}
                  >
                    Recommended
                  </div>
                )}

                {/* Tier label */}
                <p
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: "0.6rem",
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    color: MUTED,
                    marginBottom: "0.75rem",
                  }}
                >
                  Tier {plan.tier}
                </p>

                {/* Plan name */}
                <h2
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: "2.2rem",
                    fontWeight: 400,
                    fontStyle: "italic",
                    color: FOREGROUND,
                    marginBottom: "0.5rem",
                    lineHeight: 1.1,
                  }}
                >
                  {plan.name}
                </h2>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: MUTED,
                    marginBottom: "2rem",
                    lineHeight: 1.6,
                  }}
                >
                  {plan.description}
                </p>

                {/* Price */}
                <div
                  style={{
                    borderTop: `0.5px solid ${BORDER}`,
                    borderBottom: `0.5px solid ${BORDER}`,
                    padding: "1.5rem 0",
                    marginBottom: "2rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: "2.8rem",
                        fontWeight: 400,
                        color: FOREGROUND,
                        lineHeight: 1,
                      }}
                    >
                      ${plan.price}
                    </span>
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: "0.7rem",
                        color: MUTED,
                        letterSpacing: "0.08em",
                      }}
                    >
                      / month
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: "0.6rem",
                      color: MUTED,
                      letterSpacing: "0.1em",
                      marginTop: "0.4rem",
                    }}
                  >
                    After 7-day free trial
                  </p>
                </div>

                {/* Features */}
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 2.5rem",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.85rem",
                  }}
                >
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                        fontSize: "0.82rem",
                        color: feature.toLowerCase().includes("coming soon") ? MUTED : FOREGROUND,
                        lineHeight: 1.5,
                      }}
                    >
                      <span
                        style={{
                          width: "14px",
                          height: "14px",
                          border: `0.5px solid ${BORDER_ACCENT}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "1px",
                        }}
                      >
                        <Check size={8} color={IVORY} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handleSelectPlan(plan.key)}
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    padding: "0.9rem 1.5rem",
                    background: plan.popular ? IVORY : "transparent",
                    border: `0.5px solid ${plan.popular ? IVORY : BORDER}`,
                    color: plan.popular ? BG : FOREGROUND,
                    fontFamily: FONT_MONO,
                    fontSize: "0.68rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "opacity 0.2s",
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                      Opening checkout...
                    </>
                  ) : (
                    plan.cta
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            marginBottom: "4rem",
          }}
        >
          <div style={{ flex: 1, height: "0.5px", background: BORDER }} />
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: "0.6rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: MUTED,
            }}
          >
            Common Questions
          </p>
          <div style={{ flex: 1, height: "0.5px", background: BORDER }} />
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          {FAQS.map(({ q, a }, i) => (
            <div
              key={q}
              style={{
                borderBottom: `0.5px solid ${BORDER}`,
                padding: "1.75rem 0",
                ...(i === 0 ? { borderTop: `0.5px solid ${BORDER}` } : {}),
              }}
            >
              <p
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: "1.05rem",
                  fontWeight: 400,
                  fontStyle: "italic",
                  color: FOREGROUND,
                  marginBottom: "0.6rem",
                  lineHeight: 1.4,
                }}
              >
                {q}
              </p>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: MUTED,
                  lineHeight: 1.7,
                }}
              >
                {a}
              </p>
            </div>
          ))}
        </div>

        {/* Test card notice */}
        <p
          style={{
            textAlign: "center",
            fontFamily: FONT_MONO,
            fontSize: "0.6rem",
            color: MUTED,
            letterSpacing: "0.08em",
            marginTop: "4rem",
          }}
        >
          Testing? Use card{" "}
          <span
            style={{
              border: `0.5px solid ${BORDER}`,
              padding: "0.1rem 0.4rem",
              background: SURFACE,
            }}
          >
            4242 4242 4242 4242
          </span>{" "}
          with any future expiry and any CVC.
        </p>
      </div>
    </div>
  );
}

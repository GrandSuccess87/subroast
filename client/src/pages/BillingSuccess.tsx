import { useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

const FONT_DISPLAY = "Cormorant Garamond, Georgia, serif";
const FONT_MONO = "JetBrains Mono, monospace";
const BG = "oklch(0.09 0.008 60)";
const SURFACE = "oklch(0.12 0.007 60)";
const BORDER = "oklch(0.22 0.007 60)";
const IVORY = "oklch(0.88 0.025 85)";
const FOREGROUND = "oklch(0.93 0.010 80)";
const MUTED = "oklch(0.62 0.006 80)";

export default function BillingSuccess() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  useEffect(() => {
    utils.subscription.getStatus.invalidate();
  }, [utils]);

  const steps = [
    "Create your first outreach campaign in DM Campaigns",
    "Hit \"Sync Leads\" to discover Reddit posts matching your keywords",
    "Generate AI-personalized DMs and start outreach",
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ maxWidth: "440px", width: "100%", textAlign: "center" }}>

        {/* Icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
          <div style={{ width: "64px", height: "64px", border: `0.5px solid oklch(0.88 0.025 85 / 0.4)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle size={28} color={IVORY} />
          </div>
        </div>

        {/* Headline */}
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 300, fontStyle: "italic", color: FOREGROUND, lineHeight: 1.1, marginBottom: "0.75rem" }}>
          You're all set.
        </h1>
        <p style={{ fontSize: "0.85rem", color: MUTED, lineHeight: 1.7, marginBottom: "0.4rem" }}>
          You're a Founder. Your pricing is locked in for life.
        </p>
        <p style={{ fontFamily: FONT_MONO, fontSize: "0.62rem", color: MUTED, letterSpacing: "0.08em", marginBottom: "2.5rem" }}>
          Unlimited campaigns. Unlimited syncs. Early users shape the product.
        </p>

        {/* Steps */}
        <div style={{ border: `0.5px solid ${BORDER}`, background: SURFACE, marginBottom: "2rem", textAlign: "left" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: `0.5px solid ${BORDER}` }}>
            <p style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase", color: MUTED }}>
              What to do next
            </p>
          </div>
          {steps.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "1rem", padding: "0.85rem 1.25rem", borderBottom: i < steps.length - 1 ? `0.5px solid ${BORDER}` : "none" }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", color: IVORY, flexShrink: 0, marginTop: "2px" }}>0{i + 1}</span>
              <p style={{ fontSize: "0.8rem", color: MUTED, lineHeight: 1.5 }}>{step}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate("/dashboard")}
          style={{ width: "100%", padding: "0.85rem 1.5rem", background: IVORY, border: `0.5px solid ${IVORY}`, color: BG, fontFamily: FONT_MONO, fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
        >
          Go to Dashboard <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

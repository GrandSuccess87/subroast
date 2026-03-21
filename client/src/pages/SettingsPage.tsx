import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Clock,
  CreditCard,
  Loader2,
  Settings,
  Shield,
  User,
  Zap,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const FONT_DISPLAY = "Cormorant Garamond, Georgia, serif";
const FONT_MONO = "JetBrains Mono, monospace";
const SURFACE = "oklch(0.12 0.007 60)";
const SURFACE_RAISED = "oklch(0.14 0.007 60)";
const BORDER = "oklch(0.22 0.007 60)";
const IVORY = "oklch(0.88 0.025 85)";
const FOREGROUND = "oklch(0.93 0.010 80)";
const MUTED = "oklch(0.62 0.006 80)";
const BG = "oklch(0.09 0.008 60)";

export default function SettingsPage() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [, navigate] = useLocation();

  const { data: subStatus, isLoading: subLoading } = trpc.subscription.getStatus.useQuery();

  const createPortalSession = trpc.subscription.createPortalSession.useMutation({
    onSuccess: ({ url }) => { if (url) window.open(url, "_blank"); },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const sectionStyle: React.CSSProperties = {
    border: `0.5px solid ${BORDER}`,
    background: SURFACE,
    marginBottom: "1.5px",
  };

  const sectionHeaderStyle: React.CSSProperties = {
    padding: "1.25rem 1.5rem",
    borderBottom: `0.5px solid ${BORDER}`,
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const sectionBodyStyle: React.CSSProperties = {
    padding: "1.5rem",
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 300, fontStyle: "italic", color: FOREGROUND, lineHeight: 1.1, marginBottom: "0.4rem" }}>
            Settings
          </h1>
          <p style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED }}>
            Account & billing management
          </p>
        </div>

        {/* Reddit Connection */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <Zap size={12} color={IVORY} />
            <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: MUTED, flex: 1 }}>
              Reddit Connection
            </p>
            <span style={{ fontFamily: FONT_MONO, fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.75 0.14 65)", border: "0.5px solid oklch(0.75 0.14 65 / 0.35)", padding: "0.15rem 0.5rem" }}>
              Coming Soon
            </span>
          </div>
          <div style={sectionBodyStyle}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "1rem", border: `0.5px solid ${BORDER}`, background: SURFACE_RAISED }}>
              <Clock size={13} color={MUTED} style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <p style={{ fontSize: "0.82rem", color: FOREGROUND, fontWeight: 500, marginBottom: "0.4rem" }}>
                  One-click send via Chrome extension — coming soon
                </p>
                <p style={{ fontSize: "0.75rem", color: MUTED, lineHeight: 1.6 }}>
                  SubRoast is building a Chrome extension that lets you send DMs, comments, and posts directly from your own browser session — no Reddit API, no bot flags, no ban risk. Until then, use the Copy &amp; Open workflow to paste drafts directly on Reddit.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Billing */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <CreditCard size={12} color={IVORY} />
            <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: MUTED }}>
              Billing & Plan
            </p>
          </div>
          <div style={sectionBodyStyle}>
            {subLoading ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: MUTED, fontSize: "0.8rem" }}>
                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                Loading...
              </div>
            ) : subStatus ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Plan status row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", border: `0.5px solid ${BORDER}`, background: SURFACE_RAISED }}>
                  <div>
                    <p style={{ fontSize: "0.85rem", color: FOREGROUND, fontWeight: 500, textTransform: "capitalize", marginBottom: "0.2rem" }}>
                      {subStatus.plan === "none" ? "No active plan" : `${subStatus.plan} Plan`}
                    </p>
                    {subStatus.isTrialing && subStatus.trialDaysLeft !== undefined && (
                      <p style={{ fontFamily: FONT_MONO, fontSize: "0.62rem", color: "oklch(0.78 0.14 65)", letterSpacing: "0.08em" }}>
                        Free trial — {subStatus.trialDaysLeft} day{subStatus.trialDaysLeft !== 1 ? "s" : ""} remaining
                      </p>
                    )}
                    {subStatus.subscriptionStatus === "active" && !subStatus.isTrialing && (
                      <p style={{ fontFamily: FONT_MONO, fontSize: "0.62rem", color: IVORY, letterSpacing: "0.08em" }}>Active subscription</p>
                    )}
                    {subStatus.plan === "none" && (
                      <p style={{ fontFamily: FONT_MONO, fontSize: "0.62rem", color: MUTED, letterSpacing: "0.08em" }}>Start a free trial to unlock campaigns</p>
                    )}
                  </div>
                  <span style={{
                    fontFamily: FONT_MONO,
                    fontSize: "0.55rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: subStatus.hasActiveAccess ? IVORY : MUTED,
                    border: `0.5px solid ${subStatus.hasActiveAccess ? "oklch(0.88 0.025 85 / 0.4)" : BORDER}`,
                    padding: "0.2rem 0.5rem",
                  }}>
                    {subStatus.hasActiveAccess ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Campaign limit */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: MUTED }}>
                  <Shield size={12} color={MUTED} />
                  {subStatus.campaignLimit === null
                    ? "Unlimited campaigns (Growth plan)"
                    : `${subStatus.campaignLimit} campaign max on ${subStatus.plan === "none" ? "free trial" : subStatus.plan + " plan"}`}
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  {subStatus.plan === "none" ? (
                    <button
                      onClick={() => navigate("/pricing")}
                      style={{ padding: "0.65rem 1.25rem", background: IVORY, border: `0.5px solid ${IVORY}`, color: BG, fontFamily: FONT_MONO, fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}
                    >
                      <Zap size={11} /> Start Free Trial
                    </button>
                  ) : (
                    <button
                      onClick={() => createPortalSession.mutate({ origin: window.location.origin })}
                      disabled={createPortalSession.isPending}
                      style={{ padding: "0.65rem 1.25rem", background: "transparent", border: `0.5px solid ${BORDER}`, color: MUTED, fontFamily: FONT_MONO, fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}
                    >
                      {createPortalSession.isPending ? <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> : <CreditCard size={11} />}
                      Manage Billing
                    </button>
                  )}
                  {subStatus.plan !== "growth" && subStatus.plan !== "none" && (
                    <button
                      onClick={() => navigate("/pricing")}
                      style={{ padding: "0.65rem 1.25rem", background: "transparent", border: `0.5px solid oklch(0.88 0.025 85 / 0.35)`, color: IVORY, fontFamily: FONT_MONO, fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}
                    >
                      <Zap size={11} /> Get priority access
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: "0.8rem", color: MUTED }}>Unable to load billing info.</p>
            )}
          </div>
        </div>

        {/* Account */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <User size={12} color={MUTED} />
            <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: MUTED }}>
              Account
            </p>
          </div>
          <div style={{ ...sectionBodyStyle, display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: "40px", height: "40px", border: `0.5px solid oklch(0.88 0.025 85 / 0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_DISPLAY, fontSize: "1.2rem", fontStyle: "italic", color: IVORY, flexShrink: 0 }}>
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div>
              <p style={{ fontSize: "0.85rem", color: FOREGROUND, fontWeight: 500 }}>{user?.name ?? "User"}</p>
              <p style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", color: MUTED, marginTop: "0.15rem", letterSpacing: "0.05em" }}>{user?.email ?? ""}</p>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

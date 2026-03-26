import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  CheckCircle,
  CreditCard,
  ExternalLink,
  Loader2,
  LogOut,
  Settings,
  Shield,
  User,
  Zap,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useEffect } from "react";

const FONT_DISPLAY = "Cormorant Garamond, Georgia, serif";
const FONT_MONO = "JetBrains Mono, monospace";
const SURFACE = "oklch(0.12 0.007 60)";
const SURFACE_RAISED = "oklch(0.14 0.007 60)";
const BORDER = "oklch(0.22 0.007 60)";
const IVORY = "oklch(0.88 0.025 85)";
const FOREGROUND = "oklch(0.93 0.010 80)";
const MUTED = "oklch(0.62 0.006 80)";
const BG = "oklch(0.09 0.008 60)";
const GREEN = "oklch(0.72 0.14 145)";

export default function SettingsPage() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [location, navigate] = useLocation();

  const { data: subStatus, isLoading: subLoading } = trpc.subscription.getStatus.useQuery();
  const { data: redditAccount, isLoading: redditLoading } = trpc.reddit.getAccount.useQuery();
  const { data: connectUrlData } = trpc.reddit.getConnectUrl.useQuery(
    { origin: typeof window !== "undefined" ? window.location.origin : "" },
    { enabled: !redditAccount && !redditLoading }
  );

  const disconnectReddit = trpc.reddit.disconnect.useMutation({
    onSuccess: () => {
      toast.success("Reddit account disconnected.");
      utils.reddit.getAccount.invalidate();
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const createPortalSession = trpc.subscription.createPortalSession.useMutation({
    onSuccess: ({ url }) => { if (url) window.open(url, "_blank"); },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  // Show success toast when redirected back after connecting Reddit
  useEffect(() => {
    if (location.includes("reddit_connected=1")) {
      toast.success("Reddit account connected successfully!");
      utils.reddit.getAccount.invalidate();
    }
  }, []);

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
            <svg width="12" height="12" viewBox="0 0 20 20" fill={IVORY} xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="10" fill="currentColor" />
              <path d="M16.67 10a1.46 1.46 0 0 0-2.47-1 7.12 7.12 0 0 0-3.85-1.23l.65-3.08 2.13.45a1 1 0 1 0 .14-.55l-2.38-.5a.26.26 0 0 0-.31.2l-.73 3.44a7.14 7.14 0 0 0-3.89 1.23 1.46 1.46 0 1 0-1.61 2.39 2.87 2.87 0 0 0 0 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 0 0 0-.44 1.46 1.46 0 0 0 .57-1.35zm-9.4 1.09a1 1 0 1 1 1 1 1 1 0 0 1-1-1zm5.57 2.64a3.54 3.54 0 0 1-2.84.5 3.54 3.54 0 0 1-2.84-.5.26.26 0 0 1 .37-.37 3 3 0 0 0 2.47.38 3 3 0 0 0 2.47-.38.26.26 0 0 1 .37.37zm-.21-1.64a1 1 0 1 1 1-1 1 1 0 0 1-1 1z" fill={BG} />
            </svg>
            <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: MUTED, flex: 1 }}>
              Reddit Account
            </p>
            {redditAccount && (
              <span style={{ fontFamily: FONT_MONO, fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: GREEN, border: `0.5px solid ${GREEN}40`, padding: "0.15rem 0.5rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <CheckCircle size={9} /> Connected
              </span>
            )}
          </div>
          <div style={sectionBodyStyle}>
            {redditLoading ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: MUTED, fontSize: "0.8rem" }}>
                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                Loading...
              </div>
            ) : redditAccount ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Connected account row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", border: `0.5px solid ${BORDER}`, background: SURFACE_RAISED }}>
                  <div>
                    <p style={{ fontSize: "0.85rem", color: FOREGROUND, fontWeight: 500, marginBottom: "0.2rem" }}>
                      u/{redditAccount.redditUsername}
                    </p>
                    <p style={{ fontFamily: FONT_MONO, fontSize: "0.62rem", color: redditAccount.isPaused ? "oklch(0.72 0.18 25)" : GREEN, letterSpacing: "0.08em" }}>
                      {redditAccount.isPaused ? `Paused — ${redditAccount.pauseReason ?? "rate limit reached"}` : "Active · Lead sync enabled"}
                    </p>
                  </div>
                  <button
                    onClick={() => disconnectReddit.mutate()}
                    disabled={disconnectReddit.isPending}
                    style={{ padding: "0.5rem 0.875rem", background: "transparent", border: `0.5px solid oklch(0.72 0.18 25 / 0.4)`, color: "oklch(0.72 0.18 25)", fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem", touchAction: "manipulation" }}
                  >
                    {disconnectReddit.isPending ? <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} /> : <LogOut size={10} />}
                    Disconnect
                  </button>
                </div>
                <p style={{ fontSize: "0.75rem", color: MUTED, lineHeight: 1.6 }}>
                  Your Reddit account is used for lead sync and DM drafting. SubRoast never stores your password — access is via a secure OAuth token you can revoke at any time.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <p style={{ fontSize: "0.82rem", color: FOREGROUND, lineHeight: 1.65 }}>
                  Connect your Reddit account to enable lead sync and DM drafting. SubRoast uses OAuth — no password stored, revoke access at any time from Reddit settings.
                </p>
                <a
                  href={connectUrlData?.url ?? "#"}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.25rem", background: IVORY, border: `0.5px solid ${IVORY}`, color: BG, fontFamily: FONT_MONO, fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", textDecoration: "none", alignSelf: "flex-start", touchAction: "manipulation" }}
                  onClick={(e) => {
                    if (!connectUrlData?.url) { e.preventDefault(); toast.error("Loading connect URL…"); }
                  }}
                >
                  <ExternalLink size={11} />
                  Connect Reddit Account
                </a>
              </div>
            )}
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
                      style={{ padding: "0.65rem 1.25rem", background: IVORY, border: `0.5px solid ${IVORY}`, color: BG, fontFamily: FONT_MONO, fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", touchAction: "manipulation" }}
                    >
                      <Zap size={11} /> Start Free Trial
                    </button>
                  ) : (
                    <button
                      onClick={() => createPortalSession.mutate({ origin: window.location.origin })}
                      disabled={createPortalSession.isPending}
                      style={{ padding: "0.65rem 1.25rem", background: "transparent", border: `0.5px solid ${BORDER}`, color: MUTED, fontFamily: FONT_MONO, fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", touchAction: "manipulation" }}
                    >
                      {createPortalSession.isPending ? <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> : <CreditCard size={11} />}
                      Manage Billing
                    </button>
                  )}
                  {subStatus.plan !== "growth" && subStatus.plan !== "none" && (
                    <button
                      onClick={() => navigate("/pricing")}
                      style={{ padding: "0.65rem 1.25rem", background: "transparent", border: `0.5px solid oklch(0.88 0.025 85 / 0.35)`, color: IVORY, fontFamily: FONT_MONO, fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", touchAction: "manipulation" }}
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

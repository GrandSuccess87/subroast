import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import OnboardingChecklist from "@/components/OnboardingChecklist";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useLocation } from "wouter";

const FONT_DISPLAY = "Cormorant Garamond, Georgia, serif";
const FONT_MONO = "JetBrains Mono, monospace";
const SURFACE = "oklch(0.12 0.007 60)";
const BORDER = "oklch(0.22 0.007 60)";
const IVORY = "oklch(0.88 0.025 85)";
const IVORY_DIM = "oklch(0.88 0.025 85 / 0.5)";
const FOREGROUND = "oklch(0.93 0.010 80)";
const MUTED = "oklch(0.76 0.022 82)";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: account } = trpc.reddit.getAccount.useQuery();
  const { data: outreachCampaigns } = trpc.outreach.listCampaigns.useQuery();
  const { data: allLeads } = trpc.outreach.getAllLeads.useQuery();
  const { data: history } = trpc.history.list.useQuery();
  const { data: subStatus } = trpc.subscription.getStatus.useQuery();

  const totalCampaigns = outreachCampaigns?.length ?? 0;
  const totalLeads = allLeads?.length ?? 0;
  const dmsDrafted = allLeads?.filter((l) => l.dmDraft).length ?? 0;
  const totalPosted = history?.filter((h) => h.status === "posted").length ?? 0;

  const isStarter = !subStatus || subStatus.plan === "starter" || subStatus.plan === "trial";
  const campaignLimit = isStarter ? 1 : null;
  const firstName = user?.name?.split(" ")[0] ?? "there";

  const STATS = [
    { label: "Leads Found", value: totalLeads, icon: Users },
    { label: "DMs Drafted", value: dmsDrafted, icon: MessageSquare },
    { label: "Posts Published", value: totalPosted, icon: TrendingUp },
    {
      label: "Campaigns",
      value: totalCampaigns,
      icon: Target,
      warn: campaignLimit !== null && totalCampaigns >= campaignLimit,
      sub: campaignLimit !== null ? `${totalCampaigns}/${campaignLimit} on Starter` : null,
    },
  ] as Array<{ label: string; value: number; icon: React.ElementType; warn?: boolean; sub?: string | null }>;

  const QUICK_ACTIONS = [
    {
      title: "Draft & Roast",
      desc: "Get AI feedback on your next post",
      icon: Sparkles,
      href: "/dashboard/roast",
    },
    {
      title: "DM Campaign",
      desc: "Send rate-limited outreach",
      icon: MessageSquare,
      href: "/dashboard/campaigns",
    },
  ];

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Greeting */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h1
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              fontWeight: 300,
              fontStyle: "italic",
              color: FOREGROUND,
              lineHeight: 1.1,
              marginBottom: "0.4rem",
            }}
          >
            Hey {firstName}
          </h1>
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: "0.65rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: MUTED,
            }}
          >
            Reddit activity overview
          </p>
        </div>

        {/* Status banners */}
        {!account && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              border: `0.5px solid ${BORDER}`,
              background: SURFACE,
              marginBottom: "1.5rem",
            }}
          >
            <span className="coming-soon-dot" />
            <p style={{ fontSize: "0.8rem", color: MUTED, lineHeight: 1.5 }}>
              <span style={{ color: FOREGROUND, fontWeight: 500 }}>One-click send via Chrome extension — coming soon.</span>{" "}
              Use Copy &amp; Open to send DMs and comments manually in the meantime.
            </p>
          </div>
        )}

        {account && !account.isPaused && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              border: `0.5px solid oklch(0.88 0.025 85 / 0.25)`,
              background: "oklch(0.88 0.025 85 / 0.04)",
              marginBottom: "1.5rem",
            }}
          >
            <CheckCircle2 size={14} color={IVORY} />
            <p style={{ fontSize: "0.8rem", color: FOREGROUND }}>
              Connected as <span style={{ color: IVORY }}>u/{account.redditUsername}</span>
            </p>
          </div>
        )}

        {account?.isPaused && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              padding: "1rem",
              border: "0.5px solid oklch(0.55 0.18 25 / 0.4)",
              background: "oklch(0.55 0.18 25 / 0.05)",
              marginBottom: "1.5rem",
            }}
          >
            <AlertTriangle size={14} color="oklch(0.65 0.18 35)" style={{ flexShrink: 0, marginTop: "1px" }} />
            <div>
              <p style={{ fontSize: "0.82rem", color: "oklch(0.75 0.12 35)", fontWeight: 500 }}>Account auto-paused</p>
              <p style={{ fontSize: "0.75rem", color: MUTED, marginTop: "0.2rem" }}>{account.pauseReason}</p>
            </div>
          </div>
        )}

        {campaignLimit !== null && totalCampaigns >= campaignLimit && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              border: "0.5px solid oklch(0.75 0.15 65 / 0.3)",
              background: "oklch(0.75 0.15 65 / 0.04)",
              marginBottom: "1.5rem",
              fontSize: "0.8rem",
              color: "oklch(0.80 0.12 65)",
            }}
          >
            <AlertTriangle size={13} style={{ flexShrink: 0 }} />
            <span>
              Free during beta — full access unlocking soon.{" "}
              <button
                onClick={() => setLocation("/pricing")}
                style={{
                  background: "none",
                  border: "none",
                  color: IVORY,
                  cursor: "pointer",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  fontSize: "inherit",
                  fontFamily: "inherit",
                  padding: 0,
                }}
              >
                Get priority access
              </button>.
            </span>
          </div>
        )}

        {/* Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            border: `0.5px solid ${BORDER}`,
            marginBottom: "2.5rem",
          }}
        >
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              style={{
                padding: "1.5rem",
                borderRight: i < STATS.length - 1 ? `0.5px solid ${BORDER}` : "none",
                background: SURFACE,
              }}
            >
              <p
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: "0.6rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: MUTED,
                  marginBottom: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <stat.icon size={10} />
                {stat.label}
                {stat.warn && <AlertTriangle size={9} color="oklch(0.75 0.15 65)" />}
              </p>
              <p
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: "2rem",
                  fontWeight: 400,
                  color: FOREGROUND,
                  lineHeight: 1,
                  marginBottom: stat.sub ? "0.3rem" : 0,
                }}
              >
                {stat.value}
              </p>
              {stat.sub && (
                <p style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", color: "oklch(0.75 0.12 65)", letterSpacing: "0.08em" }}>
                  {stat.sub}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Onboarding checklist */}
        <OnboardingChecklist />

        {/* Quick actions */}
        <div style={{ marginTop: "2.5rem" }}>
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: "0.6rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: MUTED,
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <span style={{ display: "inline-block", width: "1.5rem", height: "0.5px", background: BORDER }} />
            Quick Actions
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1px",
              border: `0.5px solid ${BORDER}`,
            }}
          >
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.title}
                onClick={() => setLocation(action.href)}
                style={{
                  textAlign: "left",
                  padding: "1.5rem",
                  background: SURFACE,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "oklch(0.16 0.007 60)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = SURFACE)}
              >
                <action.icon size={16} color={IVORY_DIM} />
                <p
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: "1.1rem",
                    fontStyle: "italic",
                    color: FOREGROUND,
                    fontWeight: 400,
                  }}
                >
                  {action.title}
                </p>
                <p style={{ fontSize: "0.75rem", color: MUTED, lineHeight: 1.5 }}>{action.desc}</p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontFamily: FONT_MONO,
                    fontSize: "0.6rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: IVORY_DIM,
                    marginTop: "0.5rem",
                  }}
                >
                  Open <ArrowRight size={10} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Active campaigns shortcut */}
        {totalCampaigns > 0 && (
          <div
            onClick={() => setLocation("/dashboard/campaigns")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "1.25rem 1.5rem",
              border: `0.5px solid ${BORDER}`,
              background: SURFACE,
              cursor: "pointer",
              marginTop: "1px",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "oklch(0.16 0.007 60)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = SURFACE)}
          >
            <MessageSquare size={16} color={IVORY_DIM} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.85rem", color: FOREGROUND, fontWeight: 500 }}>
                {totalCampaigns} DM campaign{totalCampaigns !== 1 ? "s" : ""}
              </p>
              <p style={{ fontSize: "0.75rem", color: MUTED, marginTop: "0.15rem" }}>
                {totalLeads} leads found across all campaigns
              </p>
            </div>
            <ArrowRight size={14} color={MUTED} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

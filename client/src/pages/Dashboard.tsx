import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import OnboardingChecklist from "@/components/OnboardingChecklist";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  History,
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useLocation } from "wouter";

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

  // Plan limits
  const isStarter = !subStatus || subStatus.plan === "starter" || subStatus.plan === "trial";
  const campaignLimit = isStarter ? 1 : null; // null = unlimited

  const firstName = user?.name?.split(" ")[0] ?? "there";

  const STATS = [
    {
      label: "Leads found",
      value: totalLeads,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
      warn: false,
      sub: null as string | null,
    },
    {
      label: "DMs drafted",
      value: dmsDrafted,
      icon: MessageSquare,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      warn: false,
      sub: null as string | null,
    },
    {
      label: "Posts published",
      value: totalPosted,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      warn: false,
      sub: null as string | null,
    },
    {
      label: "Campaigns",
      value: totalCampaigns,
      icon: Target,
      color: campaignLimit !== null && totalCampaigns >= campaignLimit ? "text-amber-400" : "text-blue-400",
      bg: campaignLimit !== null && totalCampaigns >= campaignLimit ? "bg-amber-400/10" : "bg-blue-400/10",
      warn: campaignLimit !== null && totalCampaigns >= campaignLimit,
      sub: campaignLimit !== null ? `${totalCampaigns}/${campaignLimit} on Starter` : null,
    },
  ];

  const QUICK_ACTIONS = [
    {
      title: "Draft & Roast",
      desc: "Get AI feedback on your next post",
      icon: Sparkles,
      href: "/dashboard/roast",
      color: "text-primary",
      bg: "bg-primary/10",
      hoverBorder: "hover:border-primary/30",
    },
    {
      title: "DM Campaign",
      desc: "Send rate-limited outreach",
      icon: MessageSquare,
      href: "/dashboard/campaigns",
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      hoverBorder: "hover:border-purple-400/30",
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hey {firstName} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's your Reddit activity overview.</p>
        </div>

        {/* Reddit API coming soon badge */}
        {!account && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border">
            <div className="w-2 h-2 rounded-full bg-primary/60 shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Reddit direct posting coming soon.</span>{" "}
              Use Copy &amp; Open to send DMs and comments manually in the meantime.
            </p>
          </div>
        )}

        {/* Reddit connected */}
        {account && !account.isPaused && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <p className="text-sm text-primary/90">
              Connected as <span className="font-semibold">u/{account.redditUsername}</span>
            </p>
          </div>
        )}

        {account?.isPaused && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-300">Account auto-paused</p>
              <p className="text-xs text-red-300/60 mt-0.5">{account.pauseReason}</p>
            </div>
          </div>
        )}

        {/* Campaign limit warning for Starter plan */}
        {campaignLimit !== null && totalCampaigns >= campaignLimit && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-sm text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>You’ve reached the {campaignLimit}-campaign limit on your current plan.{" "}
              <button onClick={() => setLocation("/pricing")} className="underline underline-offset-2 hover:text-amber-200 transition-colors">Upgrade for unlimited campaigns</button>.
            </span>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STATS.map((stat) => (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  {stat.warn && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <div className="text-xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                {stat.sub && (
                  <div className="text-[10px] text-amber-400 mt-1">{stat.sub}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Onboarding checklist — shown to new users until all steps complete or dismissed */}
        <OnboardingChecklist />

        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Quick actions</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.title}
                onClick={() => setLocation(action.href)}
                className={`text-left p-4 rounded-xl bg-card border border-border ${action.hoverBorder} transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 group`}
              >
                <div className={`w-9 h-9 rounded-lg ${action.bg} flex items-center justify-center mb-3`}>
                  <action.icon className={`w-4 h-4 ${action.color}`} />
                </div>
                <p className="text-sm font-semibold text-foreground">{action.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
                <div className={`flex items-center gap-1 mt-3 text-xs ${action.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <span>Get started</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Active campaigns shortcut */}
        {totalCampaigns > 0 && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border cursor-pointer hover:border-purple-400/30 transition-colors"
            onClick={() => setLocation("/dashboard/campaigns")}
          >
            <div className="w-8 h-8 rounded-lg bg-purple-400/10 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {totalCampaigns} DM campaign{totalCampaigns !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-muted-foreground">{totalLeads} leads found across all campaigns</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

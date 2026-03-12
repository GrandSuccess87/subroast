import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  MessageSquare,
  RefreshCw,
  Settings,
  Shield,
  Unlink,
  User,
  Zap,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [, navigate] = useLocation();
  const { data: account, isLoading: accountLoading } = trpc.reddit.getAccount.useQuery();
  const { data: rateLimits } = trpc.reddit.getRateLimitStatus.useQuery();
  const { data: subStatus, isLoading: subLoading } = trpc.subscription.getStatus.useQuery();

  const createPortalSession = trpc.subscription.createPortalSession.useMutation({
    onSuccess: ({ url }) => {
      if (url) window.open(url, "_blank");
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const disconnectReddit = trpc.reddit.disconnect.useMutation({
    onSuccess: () => {
      toast.success("Reddit account disconnected");
      utils.reddit.getAccount.invalidate();
      utils.reddit.getRateLimitStatus.invalidate();
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const unpauseAccount = trpc.reddit.unpauseAccount.useMutation({
    onSuccess: () => {
      toast.success("Account unpaused");
      utils.reddit.getAccount.invalidate();
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const handleConnectReddit = () => {
    window.location.href = "/api/reddit/connect";
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Settings</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-10.5">Manage your account and billing settings.</p>
        </div>

        {/* Reddit Connection — Coming Soon */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Reddit Connection
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 font-medium">Coming Soon</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border">
              <Clock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Direct Reddit integration is pending API approval</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  We've submitted our Reddit API application and are awaiting approval. In the meantime, SubRoast generates your DMs, comments, and posts — you copy and paste them directly on Reddit. Full one-click sending will be enabled once approved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Billing & Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </div>
            ) : subStatus ? (
              <>
                {/* Current plan badge */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                  <div>
                    <p className="text-sm font-semibold text-foreground capitalize">
                      {subStatus.plan === "none" ? "No active plan" : `${subStatus.plan} Plan`}
                    </p>
                    {subStatus.isTrialing && subStatus.trialDaysLeft !== undefined && (
                      <p className="text-xs text-amber-400 mt-0.5">
                        Free trial — {subStatus.trialDaysLeft} day{subStatus.trialDaysLeft !== 1 ? "s" : ""} remaining
                      </p>
                    )}
                    {subStatus.subscriptionStatus === "active" && !subStatus.isTrialing && (
                      <p className="text-xs text-primary mt-0.5">Active subscription</p>
                    )}
                    {subStatus.plan === "none" && (
                      <p className="text-xs text-muted-foreground mt-0.5">Start a free trial to unlock campaigns</p>
                    )}
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${
                    subStatus.hasActiveAccess
                      ? "bg-primary/15 text-primary border-primary/20"
                      : "bg-muted text-muted-foreground border-border"
                  }`}>
                    {subStatus.hasActiveAccess ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Campaign limit info */}
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                  {subStatus.campaignLimit === null
                    ? "Unlimited campaigns (Growth plan)"
                    : `${subStatus.campaignLimit} campaign max on ${subStatus.plan === "none" ? "free trial" : subStatus.plan + " plan"}`}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 flex-wrap">
                  {subStatus.plan === "none" ? (
                    <Button
                      size="sm"
                      className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => navigate("/pricing")}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Start Free Trial
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-border text-muted-foreground hover:text-foreground"
                      onClick={() => createPortalSession.mutate({ origin: window.location.origin })}
                      disabled={createPortalSession.isPending}
                    >
                      {createPortalSession.isPending
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <><CreditCard className="w-3.5 h-3.5" />Manage Billing</>}
                    </Button>
                  )}
                  {subStatus.plan !== "growth" && subStatus.plan !== "none" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() => navigate("/pricing")}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Upgrade to Growth
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Unable to load billing info.</div>
            )}
          </CardContent>
        </Card>

        {/* Account info */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{user?.name ?? "User"}</p>
                <p className="text-xs text-muted-foreground">{user?.email ?? ""}</p>
              </div>
            </div>
          </CardContent>
        </Card>


      </div>
    </DashboardLayout>
  );
}

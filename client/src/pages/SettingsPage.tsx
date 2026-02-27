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
          <p className="text-sm text-muted-foreground ml-10.5">Manage your Reddit connection and account limits.</p>
        </div>

        {/* Reddit Connection */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Reddit Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {accountLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </div>
            ) : account ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">u/{account.redditUsername}</p>
                      <p className="text-xs text-muted-foreground">Scopes: submit, privatemessages, read</p>
                    </div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20 font-medium">Connected</span>
                </div>

                {account.isPaused && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-400/5 border border-red-400/20">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-300">Account auto-paused</p>
                      <p className="text-xs text-red-400/70 mt-0.5">{account.pauseReason}</p>
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0 border-red-400/30 text-red-400 hover:bg-red-400/10 h-7 text-xs" onClick={() => unpauseAccount.mutate()} disabled={unpauseAccount.isPending}>
                      {unpauseAccount.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <><RefreshCw className="w-3 h-3 mr-1" />Unpause</>}
                    </Button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleConnectReddit} className="gap-1.5 border-border text-muted-foreground hover:text-foreground">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reconnect
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => disconnectReddit.mutate()} disabled={disconnectReddit.isPending} className="gap-1.5 border-red-400/20 text-red-400 hover:bg-red-400/10">
                    {disconnectReddit.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Unlink className="w-3.5 h-3.5" />Disconnect</>}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">No Reddit account connected</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Connect your Reddit account to start posting and sending DMs.</p>
                  </div>
                </div>
                <Button onClick={handleConnectReddit} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Zap className="w-4 h-4" />
                  Connect Reddit Account
                </Button>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground/60">Required permissions:</p>
                  <ul className="space-y-0.5 ml-1">
                    <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-muted-foreground/50 shrink-0" />submit — post to subreddits</li>
                    <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-muted-foreground/50 shrink-0" />privatemessages — send DMs</li>
                    <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-muted-foreground/50 shrink-0" />read — verify posts and check status</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Limits */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Daily Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-border bg-muted/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Posts</span>
                </div>
                <div className="text-3xl font-bold text-foreground">5</div>
                <div className="text-xs text-muted-foreground mt-0.5">per day</div>
                {rateLimits && (
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Used today</span>
                      <span className="font-medium text-foreground">{rateLimits.postsToday}/5</span>
                    </div>
                    <div className="h-1 rounded-full bg-border overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min((rateLimits.postsToday / 5) * 100, 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 rounded-xl border border-border bg-muted/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-400/10 flex items-center justify-center">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-foreground">DMs</span>
                </div>
                <div className="text-3xl font-bold text-foreground">25</div>
                <div className="text-xs text-muted-foreground mt-0.5">per day</div>
                {rateLimits && (
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Used today</span>
                      <span className="font-medium text-foreground">{rateLimits.dmsToday}/25</span>
                    </div>
                    <div className="h-1 rounded-full bg-border overflow-hidden">
                      <div className="h-full rounded-full bg-purple-400 transition-all" style={{ width: `${Math.min((rateLimits.dmsToday / 25) * 100, 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/20 border border-border space-y-2">
              <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Rate limit rules</p>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                {[
                  { icon: Clock, text: "30-minute cooldown between posts", color: "text-primary" },
                  { icon: Clock, text: "Max 5 DMs per hour", color: "text-primary" },
                  { icon: Clock, text: "2–10 minute randomized delays between DMs", color: "text-primary" },
                  { icon: AlertTriangle, text: "Warning shown at 80% of daily limit", color: "text-amber-400" },
                  { icon: Shield, text: "Account auto-pauses after 3 consecutive failures", color: "text-red-400" },
                ].map(({ icon: Icon, text, color }) => (
                  <div key={text} className="flex items-start gap-2">
                    <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${color}`} />
                    <span>{text}</span>
                  </div>
                ))}
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

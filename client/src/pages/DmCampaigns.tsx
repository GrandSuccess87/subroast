import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
  MessageSquare,
  Pause,
  Play,
  Plus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground border-border" },
  active: { label: "Active", color: "bg-primary/15 text-primary border-primary/20" },
  paused: { label: "Paused", color: "bg-amber-400/15 text-amber-400 border-amber-400/20" },
  completed: { label: "Done", color: "bg-blue-400/15 text-blue-400 border-blue-400/20" },
};

const RECIPIENT_STATUS: Record<string, string> = {
  pending: "bg-amber-400/15 text-amber-400 border-amber-400/20",
  sent: "bg-primary/15 text-primary border-primary/20",
  failed: "bg-red-400/15 text-red-400 border-red-400/20",
  skipped: "bg-muted text-muted-foreground border-border",
};

function parseUsernames(text: string): string[] {
  return text
    .split(/[\n,\s]+/)
    .map((u) => u.replace(/^@/, "").replace(/^u\//, "").trim())
    .filter((u) => u.length > 0 && u.length <= 64);
}

export default function DmCampaigns() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [usernamesText, setUsernamesText] = useState("");
  const [expandedCampaign, setExpandedCampaign] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: account } = trpc.reddit.getAccount.useQuery();
  const { data: rateLimits } = trpc.reddit.getRateLimitStatus.useQuery();
  const { data: campaigns, isLoading } = trpc.dm.listCampaigns.useQuery();

  const { data: recipients } = trpc.dm.getCampaignRecipients.useQuery(
    { campaignId: expandedCampaign! },
    { enabled: expandedCampaign !== null }
  );

  const createCampaign = trpc.dm.createCampaign.useMutation({
    onSuccess: () => {
      toast.success("Campaign created! DMs will send automatically.");
      setName(""); setSubject(""); setMessage(""); setUsernamesText("");
      setShowForm(false);
      utils.dm.listCampaigns.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to create campaign"),
  });

  const pauseCampaign = trpc.dm.pauseCampaign.useMutation({
    onSuccess: () => { toast.success("Campaign paused"); utils.dm.listCampaigns.invalidate(); },
  });

  const resumeCampaign = trpc.dm.resumeCampaign.useMutation({
    onSuccess: () => { toast.success("Campaign resumed"); utils.dm.listCampaigns.invalidate(); },
  });

  const usernames = parseUsernames(usernamesText);
  const isOverLimit = usernames.length > 25;

  const handleCreate = () => {
    if (!name.trim()) return toast.error("Campaign name is required");
    if (!subject.trim()) return toast.error("Subject is required");
    if (!message.trim()) return toast.error("Message is required");
    if (usernames.length === 0) return toast.error("Add at least one username");
    if (isOverLimit) return toast.error("Maximum 25 recipients per campaign");
    createCampaign.mutate({ name, subject, message, usernames });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-purple-400/10 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-purple-400" />
              </div>
              <h1 className="text-xl font-bold text-foreground">DM Campaigns</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-10.5">
              Rate-limited outreach: 5/hour, 25/day, 2–10 min random delays.
            </p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              New Campaign
            </Button>
          )}
        </div>

        {/* Rate limit bar */}
        {rateLimits && (
          <div className="flex items-center gap-4 p-3 rounded-lg bg-card border border-border text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>DMs today: <span className="text-foreground font-medium">{rateLimits.dmsToday}/{rateLimits.maxDmsPerDay}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>This hour: <span className="text-foreground font-medium">{rateLimits.dmsThisHour}/{rateLimits.maxDmsPerHour}</span></span>
            </div>
            {rateLimits.dmWarning && (
              <div className="flex items-center gap-1.5 text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>80% of daily limit used</span>
              </div>
            )}
          </div>
        )}

        {/* No Reddit account */}
        {!account && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-300">Connect your Reddit account in Settings to send DMs.</p>
          </div>
        )}

        {/* New campaign form */}
        {showForm && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">New DM Campaign</CardTitle>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Campaign name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Product launch outreach" className="bg-muted/40 border-border" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">DM subject</Label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Quick question about your post" className="bg-muted/40 border-border" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Message</Label>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your DM message. Keep it personal and genuine." className="min-h-[120px] resize-none bg-muted/40 border-border text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Recipients (max 25)</Label>
                <Textarea
                  value={usernamesText}
                  onChange={(e) => setUsernamesText(e.target.value)}
                  placeholder={"Enter Reddit usernames, one per line:\nusername1\nusername2\nusername3"}
                  className="min-h-[100px] resize-none bg-muted/40 border-border font-mono text-sm"
                />
                <div className={`flex justify-between text-xs ${isOverLimit ? "text-red-400" : "text-muted-foreground"}`}>
                  <span>{usernames.length > 0 && `${usernames.length} recipient${usernames.length !== 1 ? "s" : ""} parsed`}</span>
                  <span className={isOverLimit ? "font-semibold" : ""}>{usernames.length}/25 max</span>
                </div>
                {usernames.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {usernames.slice(0, 8).map((u) => (
                      <span key={u} className="text-xs bg-muted/60 border border-border px-2 py-0.5 rounded font-mono text-muted-foreground">u/{u}</span>
                    ))}
                    {usernames.length > 8 && <span className="text-xs text-muted-foreground">+{usernames.length - 8} more</span>}
                  </div>
                )}
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground/70">Rate limiting applied automatically:</p>
                <p>• Max 5 DMs/hour, 25 DMs/day</p>
                <p>• 2–10 minute randomized delays between sends</p>
                <p>• Account auto-pauses after 3 consecutive failures</p>
              </div>
              <div className="flex gap-2 pt-1">
                <Button onClick={handleCreate} disabled={createCampaign.isPending || !account || isOverLimit} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  {createCampaign.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : <><MessageSquare className="w-4 h-4" />Create Campaign</>}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)} className="border-border">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campaigns list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Campaigns ({campaigns.length})</h2>
            {campaigns.map((campaign) => {
              const progress = campaign.totalRecipients > 0
                ? Math.round(((campaign.sentCount + campaign.failedCount) / campaign.totalRecipients) * 100)
                : 0;
              const isExpanded = expandedCampaign === campaign.id;
              const cfg = STATUS_CONFIG[campaign.status] ?? STATUS_CONFIG.draft;

              return (
                <Card key={campaign.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-foreground truncate">{campaign.name}</p>
                            <span className={`text-[11px] px-1.5 py-0.5 rounded border font-medium ${cfg.color}`}>{cfg.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{campaign.subject}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {campaign.status === "active" && (
                            <button onClick={() => pauseCampaign.mutate({ campaignId: campaign.id })} className="text-muted-foreground hover:text-amber-400 transition-colors p-1" title="Pause">
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {campaign.status === "paused" && (
                            <button onClick={() => resumeCampaign.mutate({ campaignId: campaign.id })} className="text-muted-foreground hover:text-primary transition-colors p-1" title="Resume">
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => setExpandedCampaign(isExpanded ? null : campaign.id)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {campaign.sentCount} sent, {campaign.failedCount} failed
                          </span>
                          <span>{progress}% complete</span>
                        </div>
                        <div className="h-1 rounded-full bg-border overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      </div>

                      {/* Recipients */}
                      {isExpanded && recipients && (
                        <div className="mt-2 pt-3 border-t border-border">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Recipients</p>
                          <div className="space-y-1 max-h-48 overflow-y-auto">
                            {recipients.map((r) => (
                              <div key={r.id} className="flex items-center justify-between text-xs py-0.5">
                                <span className="font-mono text-foreground/80">u/{r.username}</span>
                                <div className="flex items-center gap-2">
                                  {r.scheduledAt && r.status === "pending" && (
                                    <span className="text-muted-foreground">{new Date(r.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                  )}
                                  <span className={`px-1.5 py-0.5 rounded border font-medium ${RECIPIENT_STATUS[r.status] ?? ""}`}>{r.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          !showForm && (
            <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border bg-card/50">
              <div className="w-12 h-12 rounded-xl bg-purple-400/10 flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-purple-400/60" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No campaigns yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs text-center">
                Create a DM campaign to send rate-limited outreach to a list of Reddit users.
              </p>
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
}

import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  Clipboard,
  ClipboardCheck,
  ExternalLink,
  Flame,
  Inbox,
  Loader2,
  MessageSquare,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Send,
  SkipForward,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

// ─── Sync timing helpers ──────────────────────────────────────────────────────

/** Sync interval in ms based on plan */
function getSyncIntervalMs(plan: string | undefined): number {
  // Growth: every 4 hours; Starter/trial/none: twice daily (12h)
  return plan === "growth" ? 4 * 60 * 60 * 1000 : 12 * 60 * 60 * 1000;
}

/** Human-readable relative time (e.g. "3 min ago", "2 hr ago") */
function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} hr ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

/** Human-readable countdown (e.g. "in 2 hr 15 min") */
function countdown(targetMs: number): string {
  const diff = targetMs - Date.now();
  if (diff <= 0) return "soon";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
}

type Campaign = {
  id: number;
  name: string;
  offering: string;
  websiteUrl?: string | null;
  subreddits: string[];
  keywords: string[];
  aiPromptInstructions?: string | null;
  reviewMode: "auto_send" | "review_first";
  status: "active" | "paused" | "completed";
  leadsFound: number;
  dmsSent: number;
  lastSyncAt?: number | null;
};

type Lead = {
  id: number;
  campaignId: number;
  redditPostId: string;
  redditPostUrl: string;
  subreddit: string;
  postTitle: string;
  postBody?: string | null;
  authorUsername: string;
  matchScore: "strong" | "partial" | "lowest";
  matchedKeywords: string[];
  dmDraft?: string | null;
  status: "new" | "dm_generated" | "queued" | "sent" | "skipped" | "failed";
  discoveredAt: number;
  // Roast Engine fields
  fitScore?: number | null;
  urgencyScore?: number | null;
  sentimentScore?: number | null;
  leadHeat?: "cold" | "warm" | "hot" | "on_fire" | null;
  intentType?: "hiring" | "buying" | "seeking_advice" | "venting" | "unknown" | null;
  roastInsight?: string | null;
  roastReplyDraft?: string | null;
  pipelineStage?: "new" | "replied" | "interested" | "converted" | "skipped" | null;
  commentDraft?: string | null;
  commentSentAt?: number | null;
};

// ─── Roast Engine UI helpers ──────────────────────────────────────────────────

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground uppercase tracking-wide">{label}</span>
        <span className="text-[10px] font-bold text-foreground">{value}</span>
      </div>
      <div className="h-1 rounded-full bg-muted/50 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function IntentBadge({ intent }: { intent: string }) {
  // Only show actionable intents — skip venting/unknown
  const actionable: Record<string, { label: string; color: string }> = {
    hiring: { label: "Hiring", color: "bg-violet-400/15 text-violet-400 border-violet-400/20" },
    buying: { label: "Buying", color: "bg-primary/15 text-primary border-primary/20" },
    seeking_advice: { label: "Seeking Advice", color: "bg-amber-400/15 text-amber-400 border-amber-400/20" },
  };
  const cfg = actionable[intent];
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function MatchBadge({ score }: { score: "strong" | "partial" | "lowest" }) {
  // Only show strong/partial — lowest adds noise
  if (score === "lowest") return null;
  const cfg = {
    strong: { label: "Strong match", color: "bg-primary/15 text-primary border-primary/20" },
    partial: { label: "Partial match", color: "bg-amber-400/15 text-amber-400 border-amber-400/20" },
  };
  const { label, color } = cfg[score];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${color}`}>
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: Campaign["status"] }) {
  const cfg = {
    active: { label: "Active", color: "bg-primary/15 text-primary border-primary/20" },
    paused: { label: "Paused", color: "bg-amber-400/15 text-amber-400 border-amber-400/20" },
    completed: { label: "Completed", color: "bg-muted text-muted-foreground border-border" },
  };
  const { label, color } = cfg[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${color}`}>
      {label}
    </span>
  );
}

function NewCampaignForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [offering, setOffering] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [subreddits, setSubreddits] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [subInput, setSubInput] = useState("");
  const [kwInput, setKwInput] = useState("");
  const [aiInstructions, setAiInstructions] = useState("");
  const [reviewMode, setReviewMode] = useState<"auto_send" | "review_first">("review_first");
  const [aiRecs, setAiRecs] = useState<{ subreddits: string[]; keywords: string[]; reasoning: string } | null>(null);

  const utils = trpc.useUtils();

  const getRecs = trpc.outreach.getRecommendations.useMutation({
    onSuccess: (data) => {
      setAiRecs(data);
      toast.success("AI recommendations ready!");
    },
    onError: (err) => toast.error(err.message),
  });

  const [, navigate] = useLocation();

  const createCampaign = trpc.outreach.createCampaign.useMutation({
    onSuccess: () => {
      toast.success("Campaign created!");
      utils.outreach.listCampaigns.invalidate();
      onSuccess();
    },
    onError: (err) => {
      if (err.message === "CAMPAIGN_LIMIT_REACHED") {
        toast.error("Campaign limit reached. Upgrade to Growth for unlimited campaigns.", {
          action: {
            label: "Upgrade",
            onClick: () => navigate("/pricing"),
          },
          duration: 8000,
        });
      } else if (err.message === "UPGRADE_REQUIRED") {
        toast.error("Start a free trial to create campaigns.", {
          action: {
            label: "View Plans",
            onClick: () => navigate("/pricing"),
          },
          duration: 8000,
        });
      } else {
        toast.error(err.message);
      }
    },
  });

  const addSub = () => {
    const s = subInput.trim().replace(/^r\//, "");
    if (s && !subreddits.includes(s)) setSubreddits([...subreddits, s]);
    setSubInput("");
  };

  const addKw = () => {
    const k = kwInput.trim();
    if (k && !keywords.includes(k)) setKeywords([...keywords, k]);
    setKwInput("");
  };

  const applyRecs = () => {
    if (!aiRecs) return;
    setSubreddits((prev) => Array.from(new Set([...prev, ...aiRecs.subreddits])));
    setKeywords((prev) => Array.from(new Set([...prev, ...aiRecs.keywords])));
    toast.success("AI recommendations applied!");
  };

  const handleCreate = () => {
    if (!name.trim()) return toast.error("Campaign name is required");
    if (!offering.trim()) return toast.error("Offering description is required");
    if (subreddits.length === 0) return toast.error("Add at least one subreddit");
    if (keywords.length === 0) return toast.error("Add at least one keyword");
    createCampaign.mutate({
      name,
      offering,
      websiteUrl: websiteUrl || undefined,
      subreddits,
      keywords,
      aiPromptInstructions: aiInstructions || undefined,
      reviewMode,
    });
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">New Outreach Campaign</CardTitle>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Campaign name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. SaaS Founders Outreach" className="bg-muted/40 border-border" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Website URL (optional)</Label>
            <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://yourapp.com" className="bg-muted/40 border-border" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">What are you offering?</Label>
          <Textarea
            value={offering}
            onChange={(e) => setOffering(e.target.value)}
            placeholder="Describe your product/service and who it helps. e.g. 'A Reddit scheduling tool for indie SaaS founders who want to grow without getting banned.'"
            className="min-h-[80px] resize-none bg-muted/40 border-border text-sm"
          />
        </div>

        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs font-semibold text-foreground">AI Subreddit & Keyword Recommendations</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => getRecs.mutate({ offering, websiteUrl: websiteUrl || undefined })}
              disabled={getRecs.isPending || !offering.trim()}
              className="h-6 px-2 text-[10px] text-primary hover:text-primary/80 hover:bg-primary/10"
            >
              {getRecs.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Get AI Recs"}
            </Button>
          </div>
          {aiRecs ? (
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground">{aiRecs.reasoning}</p>
              <div className="flex flex-wrap gap-1">
                {aiRecs.subreddits.map((s) => (
                  <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-400/10 text-blue-400 border border-blue-400/20">r/{s}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {aiRecs.keywords.map((k) => (
                  <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{k}</span>
                ))}
              </div>
              <Button size="sm" onClick={applyRecs} className="h-6 px-2 text-[10px] bg-primary text-primary-foreground hover:bg-primary/90">
                Apply All Recommendations
              </Button>
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground">Fill in your offering above and click "Get AI Recs" to get subreddit and keyword suggestions.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Target subreddits</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">r/</span>
              <Input
                value={subInput}
                onChange={(e) => setSubInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSub()}
                placeholder="SaaS"
                className="pl-7 bg-muted/40 border-border text-sm"
              />
            </div>
            <Button size="sm" variant="outline" onClick={addSub} className="border-border shrink-0">Add</Button>
          </div>
          {subreddits.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {subreddits.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-muted/60 border border-border text-foreground">
                  r/{s}
                  <button onClick={() => setSubreddits(subreddits.filter((x) => x !== s))} className="text-muted-foreground hover:text-red-400">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Keywords to monitor</Label>
          <div className="flex gap-2">
            <Input
              value={kwInput}
              onChange={(e) => setKwInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addKw()}
              placeholder="struggling with churn, need analytics tool..."
              className="flex-1 bg-muted/40 border-border text-sm"
            />
            <Button size="sm" variant="outline" onClick={addKw} className="border-border shrink-0">Add</Button>
          </div>
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((k) => (
                <span key={k} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-muted/60 border border-border text-foreground">
                  {k}
                  <button onClick={() => setKeywords(keywords.filter((x) => x !== k))} className="text-muted-foreground hover:text-red-400">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">AI DM tone/style instructions (optional)</Label>
          <Input
            value={aiInstructions}
            onChange={(e) => setAiInstructions(e.target.value)}
            placeholder="e.g. Be casual and friendly, mention free trial, avoid technical jargon"
            className="bg-muted/40 border-border text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">DM review mode</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setReviewMode("review_first")}
              className={`p-3 rounded-lg border text-left transition-all ${
                reviewMode === "review_first"
                  ? "bg-primary/10 border-primary/40 text-foreground"
                  : "bg-muted/20 border-border text-muted-foreground hover:border-border/80"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <p className="text-xs font-semibold">Review First</p>
              </div>
              <p className="text-[10px] text-muted-foreground">You approve each DM before it's sent</p>
            </button>
            <button
              onClick={() => setReviewMode("auto_send")}
              className={`p-3 rounded-lg border text-left transition-all ${
                reviewMode === "auto_send"
                  ? "bg-primary/10 border-primary/40 text-foreground"
                  : "bg-muted/20 border-border text-muted-foreground hover:border-border/80"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <p className="text-xs font-semibold">Auto-Send</p>
              </div>
              <p className="text-[10px] text-muted-foreground">AI drafts and queues DMs automatically</p>
            </button>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button onClick={handleCreate} disabled={createCampaign.isPending} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            {createCampaign.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : <><Target className="w-4 h-4" />Create Campaign</>}
          </Button>
          <Button variant="outline" onClick={onCancel} className="border-border">Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Animated step progress indicator ───────────────────────────────────────
function ProgressSteps({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div className="flex items-center gap-0.5 py-0.5 overflow-x-auto">
      {steps.map((label, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={i} className="flex items-center gap-0.5">
            <div className={`flex flex-col items-center gap-0.5 min-w-[36px] transition-all duration-300 ${
              done ? "text-primary" : active ? "text-foreground" : "text-muted-foreground/40"
            }`}>
              {done ? (
                <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
              ) : active ? (
                <Loader2 className="w-3 h-3 animate-spin shrink-0" />
              ) : (
                <div className="w-3 h-3 rounded-full border border-muted-foreground/30 shrink-0" />
              )}
              <span className={`text-[9px] leading-tight text-center ${active ? "font-medium" : ""}`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-2 h-px mb-3 transition-all duration-500 shrink-0 ${
                done ? "bg-primary" : "bg-border"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function LeadCard({ lead, onGenerateDm, onSendDm, onSkip, onQueue, onCancelQueue, onUpdateDraft, onRoast, onGenerateComment, onSendComment, onMarkContacted, onReDraftDm, isChaining }: {
  lead: Lead;
  onGenerateDm: (id: number) => void;
  onSendDm: (id: number) => void;
  onSkip: (id: number) => void;
  onQueue: (id: number) => void;
  onCancelQueue: (id: number) => void;
  onUpdateDraft: (id: number, draft: string) => void;
  onRoast: (id: number) => void;
  onGenerateComment: (id: number) => void;
  onSendComment: (id: number) => void;
  onMarkContacted: (id: number) => void;
  onReDraftDm: (id: number) => void;
  isChaining: boolean;
}) {
  const [expandedDm, setExpandedDm] = useState(false);
  const [expandedComment, setExpandedComment] = useState(false);
  const [editingDraft, setEditingDraft] = useState(false);
  const [draftText, setDraftText] = useState(lead.dmDraft ?? "");
  const [copiedDm, setCopiedDm] = useState(false);
  const [copiedComment, setCopiedComment] = useState(false);
  const [roastStep, setRoastStep] = useState<number | null>(null);
  const [dmStep, setDmStep] = useState<number | null>(null);
  const [commentStep, setCommentStep] = useState<number | null>(null);
  const roastTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dmTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const commentTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup timers on unmount
  useEffect(() => () => {
    if (roastTimerRef.current) clearInterval(roastTimerRef.current);
    if (dmTimerRef.current) clearInterval(dmTimerRef.current);
    if (commentTimerRef.current) clearInterval(commentTimerRef.current);
  }, []);

  const startRoastProgress = () => {
    setRoastStep(0);
    let step = 0;
    roastTimerRef.current = setInterval(() => {
      step++;
      if (step >= 2) { clearInterval(roastTimerRef.current!); roastTimerRef.current = null; }
      setRoastStep(step);
    }, 2200);
  };

  const startDmProgress = () => {
    setDmStep(0);
    let step = 0;
    dmTimerRef.current = setInterval(() => {
      step++;
      if (step >= 2) { clearInterval(dmTimerRef.current!); dmTimerRef.current = null; }
      setDmStep(step);
    }, 2500);
  };

  const startCommentProgress = () => {
    setCommentStep(0);
    let step = 0;
    commentTimerRef.current = setInterval(() => {
      step++;
      if (step >= 2) { clearInterval(commentTimerRef.current!); commentTimerRef.current = null; }
      setCommentStep(step);
    }, 2200);
  };

  const isRoasted = lead.fitScore != null;
  const isActionable = lead.status === "new" || lead.status === "dm_generated";

  const copyToClipboard = (text: string, type: "dm" | "comment") => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === "dm") { setCopiedDm(true); setTimeout(() => setCopiedDm(false), 2000); }
      else { setCopiedComment(true); setTimeout(() => setCopiedComment(false), 2000); }
      toast.success("Copied to clipboard!");
    });
  };

  return (
    <Card className={`bg-card border-border transition-all ${lead.status === "skipped" ? "opacity-40" : ""}`}>
      <CardContent className="p-4 space-y-3">
        {/* ── Header row ── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">r/{lead.subreddit}</span>
            <MatchBadge score={lead.matchScore} />
            {lead.intentType && <IntentBadge intent={lead.intentType} />}
            {lead.status === "queued" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded border bg-blue-400/10 text-blue-400 border-blue-400/20">Queued</span>
            )}
            {lead.status === "sent" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded border bg-primary/10 text-primary border-primary/20">Sent</span>
            )}
            {lead.matchedKeywords.length > 0 && (
              <div className="flex gap-1">
                {lead.matchedKeywords.slice(0, 2).map((k) => (
                  <span key={k} className="text-[9px] px-1 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border">{k}</span>
                ))}
                {lead.matchedKeywords.length > 2 && (
                  <span className="text-[9px] text-muted-foreground">+{lead.matchedKeywords.length - 2}</span>
                )}
              </div>
            )}
          </div>

          <a
            href={lead.redditPostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-2 flex items-start gap-1"
          >
            {lead.postTitle}
            <ExternalLink className="w-3 h-3 shrink-0 mt-0.5 text-muted-foreground" />
          </a>

          <p className="text-xs text-muted-foreground mt-1">
            u/{lead.authorUsername} · {new Date(lead.discoveredAt).toLocaleDateString()}
          </p>

          {/* ── Chain progress bar — sits just below username/date when chaining ── */}
          {isChaining && (
            <div className="mt-2">
              <ProgressSteps
                steps={["Reading", "Scoring", "Crafting DM", "DM ready", "Comment", "Done"]}
                currentStep={
                  roastStep !== null ? roastStep
                  : dmStep !== null ? dmStep + 2
                  : (commentStep ?? 0) + 4
                }
              />
            </div>
          )}
        </div>

        {/* ── Roast scores (Fit + Urgency only) ── */}
        {isRoasted && (
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/20 border border-border">
            <ScoreBar label="Fit" value={lead.fitScore!} color="bg-primary" />
            <ScoreBar label="Urgency" value={lead.urgencyScore!} color="bg-orange-400" />
          </div>
        )}

        {/* ── Roast insight ── */}
        {lead.roastInsight && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/15">
            <Sparkles className="w-3 h-3 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-foreground/80 leading-relaxed">{lead.roastInsight}</p>
          </div>
        )}

        {/* ── DM draft loading skeleton ── */}
        {!lead.dmDraft && dmStep !== null && (
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2 flex items-center gap-2 text-[11px] text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin text-primary shrink-0" />
            Loading DM draft...
          </div>
        )}

        {/* ── DM draft — show when DM ready step reached (dmStep >= 1) or comment phase started ── */}
        {lead.dmDraft && (!isChaining || (dmStep !== null && dmStep >= 1) || commentStep !== null) && (
          <div className="rounded-lg border border-border bg-muted/20 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
              <button
                onClick={() => setExpandedDm(!expandedDm)}
                className="text-[11px] text-primary hover:text-primary/80 flex items-center gap-1"
              >
                <Bot className="w-3 h-3" />
                {expandedDm ? "Hide DM draft" : "View DM draft"}
              </button>
              <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-1.5">
                {/* Re-draft DM */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { startDmProgress(); onReDraftDm(lead.id); }}
                  disabled={isChaining}
                  className="h-6 px-2 text-[10px] border-border text-muted-foreground hover:text-primary hover:border-primary/40 gap-1"
                  title="Regenerate DM draft"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  Re-draft
                </Button>
                {/* Copy & Open DM — inline in DM section */}
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(lead.dmDraft!);
                    window.open(`https://www.reddit.com/user/${lead.authorUsername}`, "_blank");
                    toast.success("DM copied! Opening Reddit profile to send manually.");
                  }}
                  className="h-6 px-2 text-[10px] bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
                >
                  <Clipboard className="w-3 h-3" />
                  Copy & Open
                </Button>
              </div>
            </div>
            {expandedDm && (
              <div className="p-3 space-y-2">
                {editingDraft ? (
                  <div className="space-y-2">
                    <Textarea
                      value={draftText}
                      onChange={(e) => setDraftText(e.target.value)}
                      className="min-h-[100px] resize-none bg-muted/40 border-border text-xs"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => { onUpdateDraft(lead.id, draftText); setEditingDraft(false); }}
                        className="h-6 px-2 text-[10px] bg-primary text-primary-foreground"
                      >
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingDraft(false)} className="h-6 px-2 text-[10px]">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">{lead.dmDraft}</p>
                    <button
                      onClick={() => { setDraftText(lead.dmDraft ?? ""); setEditingDraft(true); }}
                      className="absolute top-0 right-0 text-[10px] text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Comment draft loading skeleton — only while comment phase is in progress ── */}
        {!(lead as any).commentDraft && commentStep !== null && commentStep < 2 && (
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2 flex items-center gap-2 text-[11px] text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin text-primary shrink-0" />
            Loading comment draft...
          </div>
        )}

        {/* ── Comment draft — show only when Done step reached (commentStep >= 2) or chain complete ── */}
        {(lead as any).commentDraft && (!isChaining || (commentStep !== null && commentStep >= 2)) && (
          <div className="rounded-lg border border-border bg-muted/20 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
              <button
                onClick={() => setExpandedComment(!expandedComment)}
                className="text-[11px] text-primary hover:text-primary/80 flex items-center gap-1"
              >
                <MessageSquare className="w-3 h-3" />
                {expandedComment ? "Hide comment draft" : "View comment draft"}
              </button>
              <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-1.5">
                {/* Re-draft Comment */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { startCommentProgress(); onGenerateComment(lead.id); }}
                  disabled={isChaining}
                  className="h-6 px-2 text-[10px] border-border text-muted-foreground hover:text-primary hover:border-primary/40 gap-1"
                  title="Regenerate comment draft"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  Re-draft
                </Button>
                {/* Copy & Open Comment — inline in comment section */}
                {!lead.commentSentAt ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText((lead as any).commentDraft!);
                      window.open(lead.redditPostUrl, "_blank");
                      toast.success("Comment copied! Opening post to paste manually.");
                    }}
                    variant="outline"
                    className="h-6 px-2 text-[10px] border-primary/40 text-primary hover:bg-primary/10 gap-1"
                  >
                    <Clipboard className="w-3 h-3" />
                    Copy & Open
                  </Button>
                ) : (
                  <span className="text-[10px] text-primary flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Sent
                  </span>
                )}
              </div>
            </div>
            {expandedComment && (
              <div className="p-3">
                <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">{(lead as any).commentDraft}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Action row ── */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-border/50">
          {/* Analyze & Draft — combined single button when neither is done yet */}
          {!isRoasted && isActionable && !lead.dmDraft && !isChaining && (
            (roastStep !== null || dmStep !== null || commentStep !== null) ? (
              <ProgressSteps
                steps={["Reading", "Scoring", "Crafting DM", "DM ready", "Comment", "Done"]}
                currentStep={
                  roastStep !== null ? roastStep
                  : dmStep !== null ? dmStep + 2
                  : (commentStep ?? 0) + 4
                }
              />
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  startRoastProgress();
                  onRoast(lead.id);
                }}
                className="h-7 px-2.5 text-[10px] bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Analyze & Draft
              </Button>
            )
          )}

          {/* Full chain in progress — progress bar is now pinned at top of card */}

          {/* Analyze only — if DM already exists */}
          {!isRoasted && isActionable && lead.dmDraft && (
            roastStep !== null ? (
              <ProgressSteps
                steps={["Reading", "Scoring", "Done"]}
                currentStep={roastStep}
              />
            ) : (
              <Button
                size="sm"
                onClick={() => { startRoastProgress(); onRoast(lead.id); }}
                variant="outline"
                className="h-7 px-2.5 text-[10px] border-border gap-1"
              >
                <TrendingUp className="w-3 h-3" />
                Analyze Lead
              </Button>
            )
          )}

          {/* Draft DM only — if already roasted but no DM yet */}
          {isRoasted && isActionable && !lead.dmDraft && !isChaining && (
            dmStep !== null ? (
              <ProgressSteps
                steps={["Reading", "Crafting DM", "Done"]}
                currentStep={dmStep}
              />
            ) : (
              <Button
                size="sm"
                onClick={() => { startDmProgress(); onGenerateDm(lead.id); }}
                variant="outline"
                className="h-7 px-2.5 text-[10px] border-border gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Draft DM
              </Button>
            )
          )}

          {/* Draft Comment standalone — only show when not chaining and no DM draft yet (standalone comment progress) */}
          {isActionable && !isChaining && !lead.dmDraft && (
            (lead as any).commentDraft ? null : commentStep !== null ? (
              <ProgressSteps
                steps={["Reading", "Commenting", "Done"]}
                currentStep={commentStep}
              />
            ) : null
          )}

          {/* Mark as Contacted */}
          {isActionable && lead.pipelineStage !== "replied" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMarkContacted(lead.id)}
              className="h-7 px-2.5 text-[10px] border-green-500/30 text-green-400 hover:bg-green-500/10 gap-1"
            >
              <CheckCircle2 className="w-3 h-3" />
              Mark Contacted
            </Button>
          )}
          {lead.pipelineStage === "replied" && (
            <span className="text-[10px] text-green-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Contacted
            </span>
          )}

          {/* Skip */}
          {isActionable && lead.pipelineStage !== "replied" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSkip(lead.id)}
              className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground gap-1"
            >
              <SkipForward className="w-3 h-3" />
              Skip
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CampaignDetail({ campaign, onBack }: { campaign: Campaign; onBack: () => void }) {
  const utils = trpc.useUtils();
  const [activeFilter, setActiveFilter] = useState<"all" | "new" | "dm_generated" | "queued" | "sent" | "skipped">("all");
  // Tracks which lead is mid-chain (Analyze → DM → Comment) so each onSuccess knows what to fire next
  const chainLeadIdRef = useRef<number | null>(null);

  const { data: leads = [], isLoading: leadsLoading } = trpc.outreach.getLeads.useQuery({ campaignId: campaign.id });

  const syncLeads = trpc.outreach.syncLeads.useMutation({
    onSuccess: (data) => {
      toast.success(`Found ${data.newLeads} new leads!`);
      utils.outreach.getLeads.invalidate({ campaignId: campaign.id });
      utils.outreach.listCampaigns.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const generateDm = trpc.outreach.generateDm.useMutation({
    onSuccess: (data, variables) => {
      const isChaining = chainLeadIdRef.current === variables.leadId;
      if (!isChaining) {
        // Only show toasts when not in chain mode (manual DM generation)
        if (data.sent) {
          toast.success("DM sent!");
        } else if (data.queued) {
          toast.success("Rate limit reached — DM queued for delivery shortly");
        } else if (data.reason?.startsWith("send_failed")) {
          toast.error(`Draft saved, but send failed: ${data.reason.replace("send_failed: ", "")}`);
        } else {
          toast.success("DM drafted!");
        }
      }
      // Suppress no_reddit_account toast entirely during chain — progress bar shows status
      utils.outreach.getLeads.invalidate({ campaignId: campaign.id });
      // Auto-chain: if this was triggered by Analyze & Draft, continue to comment generation
      if (isChaining) {
        generateComment.mutate({ leadId: variables.leadId });
        // Keep chainLeadIdRef set so comment generation knows it's in chain
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const skipLead = trpc.outreach.skipLead.useMutation({
    onSuccess: () => utils.outreach.getLeads.invalidate({ campaignId: campaign.id }),
    onError: (err) => toast.error(err.message),
  });

  const queueLead = trpc.outreach.queueLead.useMutation({
    onSuccess: () => {
      toast.success("Lead queued for sending!");
      utils.outreach.getLeads.invalidate({ campaignId: campaign.id });
    },
    onError: (err) => toast.error(err.message),
  });

  const updateDraft = trpc.outreach.updateDmDraft.useMutation({
    onSuccess: () => {
      toast.success("Draft updated");
      utils.outreach.getLeads.invalidate({ campaignId: campaign.id });
    },
    onError: (err) => toast.error(err.message),
  });

  const roastLead = trpc.outreach.roastLead.useMutation({
    onSuccess: (_, variables) => {
      utils.outreach.getLeads.invalidate({ campaignId: campaign.id });
      // Auto-chain: if this was triggered by Analyze & Draft, continue to DM generation
      const chainId = chainLeadIdRef.current;
      if (chainId !== null && chainId === variables.leadId) {
        // Suppress intermediate toast during chain — progress bar shows status
        generateDm.mutate({ leadId: chainId });
      } else {
        toast.success("Lead analyzed!");
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const cancelQueue = trpc.outreach.cancelQueuedLead.useMutation({
    onSuccess: () => {
      toast.success("DM removed from queue");
      utils.outreach.getLeads.invalidate({ campaignId: campaign.id });
    },
    onError: (err) => toast.error(err.message),
  });

  const generateComment = trpc.outreach.generateComment.useMutation({
    onSuccess: (_, variables) => {
      // Clear chain ref when comment generation completes
      if (chainLeadIdRef.current === variables.leadId) {
        chainLeadIdRef.current = null;
        toast.success("✅ All done — DM & comment drafted!");
      } else {
        toast.success("Comment draft ready!");
      }
      utils.outreach.getLeads.invalidate({ campaignId: campaign.id });
    },
    onError: (err) => toast.error(err.message),
  });

  const sendDm = trpc.outreach.sendDm.useMutation({
    onSuccess: (data) => {
      if (data.sent) {
        toast.success("DM sent!");
      } else if (data.queued) {
        toast.success("Rate limit reached — DM queued for delivery shortly");
      } else {
        toast.info("Draft saved");
      }
      utils.outreach.getLeads.invalidate({ campaignId: campaign.id });
    },
    onError: (err) => toast.error(err.message),
  });

  const sendComment = trpc.outreach.sendComment.useMutation({
    onSuccess: () => {
      toast.success("Comment posted to Reddit!");
      utils.outreach.getLeads.invalidate({ campaignId: campaign.id });
    },
    onError: (err) => toast.error(err.message),
  });

  const markContacted = trpc.outreach.updatePipelineStage.useMutation({
    onSuccess: () => {
      toast.success("Lead marked as contacted!");
      utils.outreach.getLeads.invalidate({ campaignId: campaign.id });
    },
    onError: (err) => toast.error(err.message),
  });

  const updateCampaign = trpc.outreach.updateCampaign.useMutation({
    onSuccess: () => {
      toast.success("Campaign updated");
      utils.outreach.listCampaigns.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const filteredLeads = leads.filter((l) => activeFilter === "all" || l.status === activeFilter);

  const filterCounts = {
    all: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    dm_generated: leads.filter((l) => l.status === "dm_generated").length,
    queued: leads.filter((l) => l.status === "queued").length,
    sent: leads.filter((l) => l.status === "sent").length,
    skipped: leads.filter((l) => l.status === "skipped").length,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground truncate">{campaign.name}</h2>
            <StatusBadge status={campaign.status} />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{campaign.offering.slice(0, 80)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => syncLeads.mutate({ campaignId: campaign.id })}
            disabled={syncLeads.isPending || campaign.status !== "active"}
            className="h-7 px-2 text-xs border-border gap-1"
          >
            {syncLeads.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Sync Leads
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => updateCampaign.mutate({
              id: campaign.id,
              status: campaign.status === "active" ? "paused" : "active",
            })}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            {campaign.status === "active" ? <><Pause className="w-3 h-3" />Pause</> : <><Play className="w-3 h-3" />Resume</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Leads Found", value: campaign.leadsFound },
          { label: "DMs Sent", value: campaign.dmsSent },
          { label: "Subreddits", value: campaign.subreddits.length },
          { label: "Keywords", value: campaign.keywords.length },
        ].map(({ label, value }) => (
          <div key={label} className="p-3 rounded-lg bg-card border border-border text-center">
            <p className="text-lg font-bold text-foreground">{value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs ${
        campaign.reviewMode === "auto_send"
          ? "bg-muted/30 border-border text-muted-foreground"
          : "bg-primary/5 border-primary/20 text-primary"
      }`}>
        {campaign.reviewMode === "auto_send" ? <Zap className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
        <span className="font-medium">{campaign.reviewMode === "auto_send" ? "Auto-Send mode" : "Review First mode"}</span>
        <span className="text-muted-foreground">
          {campaign.reviewMode === "auto_send"
            ? "— You review each DM before it's sent"
            : "— You review each DM before it's sent"}
        </span>
        {campaign.reviewMode === "auto_send" && (
          <span className="ml-auto shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded border bg-muted/60 text-muted-foreground border-border">
            Coming soon
          </span>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Leads Inbox</h3>
          </div>
          {campaign.lastSyncAt && (
            <p className="text-[10px] text-muted-foreground">
              Last sync: {new Date(campaign.lastSyncAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex gap-1 p-1 rounded-lg bg-muted/40 border border-border mb-3 overflow-x-auto">
          {(["all", "new", "dm_generated", "queued", "sent", "skipped"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-shrink-0 py-1 px-2.5 rounded-md text-[10px] font-medium transition-all ${
                activeFilter === f
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "dm_generated" ? "Drafted" : f.charAt(0).toUpperCase() + f.slice(1)}
              {filterCounts[f] > 0 && (
                <span className="ml-1 text-[9px] opacity-70">({filterCounts[f]})</span>
              )}
            </button>
          ))}
        </div>

        {leadsLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}

        {!leadsLoading && filteredLeads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-border bg-card/50">
            <Inbox className="w-8 h-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              {leads.length === 0 ? "No leads yet — click Sync Leads to discover prospects" : "No leads in this filter"}
            </p>
          </div>
        )}

        <div className="space-y-2">
          {filteredLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead as Lead}
              onGenerateDm={(id) => generateDm.mutate({ leadId: id })}
              onSendDm={(id) => sendDm.mutate({ leadId: id })}
              onSkip={(id) => skipLead.mutate({ leadId: id })}
              onQueue={(id) => queueLead.mutate({ leadId: id })}
              onCancelQueue={(id) => cancelQueue.mutate({ leadId: id })}
              onUpdateDraft={(id, draft) => updateDraft.mutate({ leadId: id, dmDraft: draft })}
              onRoast={(id) => { chainLeadIdRef.current = id; roastLead.mutate({ leadId: id }); }}
              onGenerateComment={(id) => generateComment.mutate({ leadId: id })}
              onSendComment={(id) => sendComment.mutate({ leadId: id })}
              onMarkContacted={(id) => markContacted.mutate({ leadId: id, stage: "replied" })}
              onReDraftDm={(id) => generateDm.mutate({ leadId: id })}
              isChaining={chainLeadIdRef.current === lead.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DmCampaigns() {
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [, navigate] = useLocation();

  const utils = trpc.useUtils();
  const { data: campaigns = [], isLoading } = trpc.outreach.listCampaigns.useQuery();
  const { data: subStatus } = trpc.subscription.getStatus.useQuery();

  const syncIntervalMs = getSyncIntervalMs(subStatus?.plan);

  const deleteCampaign = trpc.outreach.deleteCampaign.useMutation({
    onSuccess: () => {
      toast.success("Campaign archived");
      utils.outreach.listCampaigns.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  if (selectedCampaign) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <CampaignDetail
            campaign={selectedCampaign}
            onBack={() => setSelectedCampaign(null)}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-lg bg-violet-400/10 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4 text-violet-400" />
                </div>
                <h1 className="text-xl font-bold text-foreground">DM Campaigns</h1>
              </div>
              <p className="text-sm text-muted-foreground ml-10.5">
                Monitor subreddits for leads, AI-draft personalized DMs, and send with rate-limited safety.
              </p>
            </div>
            {!showNewForm && (() => {
              // campaignLimit is null for growth (unlimited), 1 for starter/trial
              const atLimit = subStatus?.campaignLimit !== null && campaigns.length >= (subStatus?.campaignLimit ?? 1);
              if (atLimit) return null;
              return (
                <Button onClick={() => setShowNewForm(true)} size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
                  <Plus className="w-4 h-4" />
                  New Campaign
                </Button>
              );
            })()}
          </div>
          {!showNewForm && (() => {
            // campaignLimit is null for growth (unlimited), 1 for starter/trial
            const atLimit = subStatus?.campaignLimit !== null && campaigns.length >= (subStatus?.campaignLimit ?? 1);
            if (!atLimit) return null;
            return (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-amber-400">Starter plan — 1 campaign limit</p>
                  <p className="text-xs text-muted-foreground">Upgrade to Growth for unlimited campaigns, priority sync, and DM templates.</p>
                </div>
                <Button
                  onClick={() => navigate("/pricing")}
                  size="sm"
                  className="gap-1.5 bg-amber-500 text-white hover:bg-amber-400 shrink-0"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Upgrade
                </Button>
              </div>
            );
          })()}
        </div>

        {showNewForm && (
          <NewCampaignForm
            onSuccess={() => setShowNewForm(false)}
            onCancel={() => setShowNewForm(false)}
          />
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}

        {!isLoading && campaigns.length === 0 && !showNewForm && (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border bg-card/50">
            <div className="w-12 h-12 rounded-xl bg-violet-400/10 flex items-center justify-center mb-3">
              <Target className="w-6 h-6 text-violet-400/60" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No campaigns yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1 mb-4">Create your first outreach campaign to start finding leads.</p>
            <Button onClick={() => setShowNewForm(true)} size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              Create Campaign
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="bg-card border-border hover:border-border/80 transition-all cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-violet-400/10 flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0" onClick={() => setSelectedCampaign(campaign)}>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-foreground">{campaign.name}</p>
                      <StatusBadge status={campaign.status} />
                      {campaign.reviewMode === "auto_send" && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded border bg-amber-400/10 text-amber-400 border-amber-400/20 flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5" />Auto
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{campaign.offering.slice(0, 80)}</p>
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                      <span>{campaign.subreddits.length} subreddits</span>
                      <span>{campaign.keywords.length} keywords</span>
                      <span className="text-primary font-medium">{campaign.leadsFound} leads found</span>
                      <span>{campaign.dmsSent} DMs sent</span>
                    </div>
                    {/* Sync timing row */}
                    <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-muted-foreground/70">
                      <Clock className="w-3 h-3 shrink-0" />
                      {campaign.lastSyncAt ? (
                        <>
                          <span>Last synced {relativeTime(campaign.lastSyncAt)}</span>
                          <span className="text-muted-foreground/40">&middot;</span>
                          <span>Next sync {countdown(campaign.lastSyncAt + syncIntervalMs)}</span>
                        </>
                      ) : (
                        <span>Not yet synced &mdash; click Sync Leads to discover your first prospects</span>
                      )}
                    </div>
                    {campaign.subreddits.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {campaign.subreddits.slice(0, 4).map((s) => (
                          <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border">r/{s}</span>
                        ))}
                        {campaign.subreddits.length > 4 && (
                          <span className="text-[9px] text-muted-foreground">+{campaign.subreddits.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteCampaign.mutate({ id: campaign.id }); }}
                      className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="Archive campaign"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSelectedCampaign(campaign)}
                      className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

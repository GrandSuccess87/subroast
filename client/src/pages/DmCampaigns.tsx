import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  Clipboard,
  ExternalLink,
  Flame,
  GripVertical,
  Inbox,
  Loader2,
  MessageSquare,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Send,
  ShieldAlert,
  SkipForward,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

// ─── Design tokens ────────────────────────────────────────────────────────────
const FONT_DISPLAY = "Cormorant Garamond, Georgia, serif";
const FONT_MONO = "JetBrains Mono, monospace";
const BG = "oklch(0.09 0.008 60)";
const SURFACE = "oklch(0.12 0.007 60)";
const SURFACE_RAISED = "oklch(0.14 0.007 60)";
const BORDER = "oklch(0.22 0.007 60)";
const IVORY = "oklch(0.88 0.025 85)";
const FOREGROUND = "oklch(0.93 0.010 80)";
const MUTED = "oklch(0.62 0.006 80)";
const DANGER = "oklch(0.65 0.18 25)";
const AMBER = "oklch(0.78 0.14 65)";

// ─── Sync timing helpers ──────────────────────────────────────────────────────
function getSyncIntervalMs(plan: string | undefined): number {
  return plan === "growth" ? 4 * 60 * 60 * 1000 : 12 * 60 * 60 * 1000;
}

function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} hr ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function countdown(targetMs: number): string {
  const diff = targetMs - Date.now();
  if (diff <= 0) return "soon";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Campaign = {
  id: number; name: string; offering: string; websiteUrl?: string | null;
  subreddits: string[]; keywords: string[]; aiPromptInstructions?: string | null;
  campaignType: "outreach" | "validation"; reviewMode: "auto_send" | "review_first"; status: "active" | "paused" | "completed";
  leadsFound: number; dmsSent: number; lastSyncAt?: number | null;
  minSubSize?: number | null; maxSubSize?: number | null;
};

type Lead = {
  id: number; campaignId: number; redditPostId: string; redditPostUrl: string;
  subreddit: string; postTitle: string; postBody?: string | null; authorUsername: string;
  matchScore: "strong" | "partial" | "lowest"; matchedKeywords: string[];
  dmDraft?: string | null; status: "new" | "dm_generated" | "queued" | "sent" | "skipped" | "failed";
  discoveredAt: number; fitScore?: number | null; urgencyScore?: number | null;
  sentimentScore?: number | null; leadHeat?: "cold" | "warm" | "hot" | "on_fire" | null;
  intentType?: "hiring" | "buying" | "seeking_advice" | "venting" | "unknown" | null;
  roastInsight?: string | null; roastReplyDraft?: string | null;
  pipelineStage?: "new" | "replied" | "interested" | "converted" | "skipped" | null;
  commentDraft?: string | null; commentSentAt?: number | null;
  spamScore?: number | null; spamFlags?: string | null;
  isFavorited?: boolean;
};

// ─── Shared input style ───────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", background: SURFACE_RAISED, border: `0.5px solid ${BORDER}`,
  color: FOREGROUND, fontFamily: "Inter, sans-serif", fontSize: "0.82rem",
  padding: "0.6rem 0.75rem", outline: "none", boxSizing: "border-box",
};

// ─── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.2rem" }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED }}>{label}</span>
        <span style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", color: FOREGROUND, fontWeight: 600 }}>{value}</span>
      </div>
      <div style={{ height: "2px", background: `oklch(0.22 0.007 60)`, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: color, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

// ─── Intent badge ─────────────────────────────────────────────────────────────
function IntentBadge({ intent }: { intent: string }) {
  const actionable: Record<string, { label: string; color: string; border: string }> = {
    hiring: { label: "Hiring", color: "oklch(0.72 0.12 280)", border: "oklch(0.72 0.12 280 / 0.35)" },
    buying: { label: "Buying", color: IVORY, border: "oklch(0.88 0.025 85 / 0.35)" },
    seeking_advice: { label: "Seeking Advice", color: AMBER, border: "oklch(0.78 0.14 65 / 0.35)" },
  };
  const cfg = actionable[intent];
  if (!cfg) return null;
  return (
    <span style={{ fontFamily: FONT_MONO, fontSize: "0.52rem", letterSpacing: "0.1em", textTransform: "uppercase", color: cfg.color, border: `0.5px solid ${cfg.border}`, padding: "0.1rem 0.35rem" }}>
      {cfg.label}
    </span>
  );
}

// ─── Match badge ──────────────────────────────────────────────────────────────
function MatchBadge({ score }: { score: "strong" | "partial" | "lowest" }) {
  if (score === "lowest") return null;
  const cfg = {
    strong: { label: "Strong match", color: IVORY, border: "oklch(0.88 0.025 85 / 0.35)" },
    partial: { label: "Partial match", color: AMBER, border: "oklch(0.78 0.14 65 / 0.35)" },
  };
  const { label, color, border } = cfg[score];
  return (
    <span style={{ fontFamily: FONT_MONO, fontSize: "0.52rem", letterSpacing: "0.1em", textTransform: "uppercase", color, border: `0.5px solid ${border}`, padding: "0.1rem 0.35rem" }}>
      {label}
    </span>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Campaign["status"] }) {
  const cfg = {
    active: { label: "Active", color: IVORY, border: "oklch(0.88 0.025 85 / 0.35)" },
    paused: { label: "Paused", color: AMBER, border: "oklch(0.78 0.14 65 / 0.35)" },
    completed: { label: "Completed", color: MUTED, border: BORDER },
  };
  const { label, color, border } = cfg[status];
  return (
    <span style={{ fontFamily: FONT_MONO, fontSize: "0.52rem", letterSpacing: "0.1em", textTransform: "uppercase", color, border: `0.5px solid ${border}`, padding: "0.1rem 0.35rem" }}>
      {label}
    </span>
  );
}

// ─── Progress steps ───────────────────────────────────────────────────────────
function ProgressSteps({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", overflowX: "auto", padding: "0.25rem 0" }}>
      {steps.map((label, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", minWidth: "36px", color: done ? IVORY : active ? FOREGROUND : MUTED, transition: "color 0.3s" }}>
              {done ? <CheckCircle2 size={10} /> : active ? <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} /> : <div style={{ width: "10px", height: "10px", borderRadius: "50%", border: `0.5px solid ${MUTED}` }} />}
              <span style={{ fontFamily: FONT_MONO, fontSize: "0.5rem", letterSpacing: "0.05em", textAlign: "center", fontWeight: active ? 600 : 400 }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: "8px", height: "0.5px", background: done ? IVORY : BORDER, marginBottom: "12px", transition: "background 0.5s", flexShrink: 0 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Edit campaign modal ────────────────────────────────────────────────────────────────────────────────────
function EditCampaignModal({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const utils = trpc.useUtils();
  const [name, setName] = useState(campaign.name);
  const [offering, setOffering] = useState(campaign.offering);
  const [websiteUrl, setWebsiteUrl] = useState(campaign.websiteUrl ?? "");
  const [subreddits, setSubreddits] = useState<string[]>(campaign.subreddits);
  const [keywords, setKeywords] = useState<string[]>(campaign.keywords);
  const [subInput, setSubInput] = useState("");
  const [kwInput, setKwInput] = useState("");
  const [aiInstructions, setAiInstructions] = useState(campaign.aiPromptInstructions ?? "");

  // Sync state when campaign prop changes (e.g. after a save + invalidate)
  useEffect(() => {
    setName(campaign.name);
    setOffering(campaign.offering);
    setWebsiteUrl(campaign.websiteUrl ?? "");
    setSubreddits(campaign.subreddits);
    setKeywords(campaign.keywords);
    setAiInstructions(campaign.aiPromptInstructions ?? "");
  }, [campaign.id, campaign.keywords.join(","), campaign.subreddits.join(",")]);

  // Drag-to-reorder state
  const [dragKwIdx, setDragKwIdx] = useState<number | null>(null);
  const [dragSubIdx, setDragSubIdx] = useState<number | null>(null);

  const handleKwDragStart = (idx: number) => setDragKwIdx(idx);
  const handleKwDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragKwIdx === null || dragKwIdx === idx) return;
    const reordered = [...keywords];
    const [moved] = reordered.splice(dragKwIdx, 1);
    reordered.splice(idx, 0, moved);
    setKeywords(reordered);
    setDragKwIdx(idx);
  };
  const handleKwDragEnd = () => setDragKwIdx(null);

  const handleSubDragStart = (idx: number) => setDragSubIdx(idx);
  const handleSubDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragSubIdx === null || dragSubIdx === idx) return;
    const reordered = [...subreddits];
    const [moved] = reordered.splice(dragSubIdx, 1);
    reordered.splice(idx, 0, moved);
    setSubreddits(reordered);
    setDragSubIdx(idx);
  };
  const handleSubDragEnd = () => setDragSubIdx(null);

  const updateCampaign = trpc.outreach.updateCampaign.useMutation({
    onSuccess: () => { toast.success("Campaign updated!"); utils.outreach.listCampaigns.invalidate(); onClose(); },
    onError: (err) => toast.error(err.message),
  });

  const addSub = () => { const s = subInput.trim().replace(/^r\//, ""); if (s && !subreddits.includes(s)) setSubreddits([...subreddits, s]); setSubInput(""); };
  const addKw = () => { const k = kwInput.trim(); if (k && !keywords.includes(k)) setKeywords([...keywords, k]); setKwInput(""); };

  const handleSave = () => {
    if (!name.trim()) return toast.error("Campaign name is required");
    if (!offering.trim()) return toast.error("Offering description is required");
    if (subreddits.length === 0) return toast.error("Add at least one subreddit");
    if (keywords.length === 0) return toast.error("Add at least one keyword");
    updateCampaign.mutate({ id: campaign.id, name, offering, websiteUrl: websiteUrl || undefined, subreddits, keywords, aiPromptInstructions: aiInstructions || undefined });
  };

  const labelStyle: React.CSSProperties = { fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: "0.4rem" };
  const tagStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: "0.3rem", fontFamily: FONT_MONO, fontSize: "0.6rem", color: FOREGROUND, border: `0.5px solid ${BORDER}`, background: SURFACE_RAISED, padding: "0.2rem 0.5rem" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "oklch(0 0 0 / 0.7)", backdropFilter: "blur(4px)" }} />
      {/* Modal */}
      <div style={{ position: "relative", width: "100%", maxWidth: "640px", maxHeight: "90vh", overflowY: "auto", background: SURFACE, border: `0.5px solid ${BORDER}`, zIndex: 1 }}>
        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: `0.5px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: SURFACE, zIndex: 2 }}>
          <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: MUTED }}>Edit Campaign</p>
          <button onClick={onClose} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer" }}><X size={14} /></button>
        </div>
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Name + URL */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Campaign Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Website URL (optional)</label>
              <input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://yourapp.com" style={inputStyle} />
            </div>
          </div>
          {/* Offering */}
          <div>
            <label style={labelStyle}>What are you offering?</label>
            <textarea value={offering} onChange={(e) => setOffering(e.target.value)} style={{ ...inputStyle, minHeight: "80px", resize: "vertical", lineHeight: 1.6 }} />
          </div>
          {/* Subreddits */}
          <div>
            <label style={labelStyle}>Target Subreddits</label>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: MUTED, fontSize: "0.82rem" }}>r/</span>
                <input value={subInput} onChange={(e) => setSubInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSub()} placeholder="SaaS" style={{ ...inputStyle, paddingLeft: "1.8rem" }} />
              </div>
              <button onClick={addSub} style={{ padding: "0.6rem 1rem", background: "transparent", border: `0.5px solid ${BORDER}`, color: MUTED, fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.1em", cursor: "pointer", flexShrink: 0 }}>Add</button>
            </div>
            {subreddits.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                {subreddits.map((s, idx) => (
                  <span
                    key={s}
                    draggable
                    onDragStart={() => handleSubDragStart(idx)}
                    onDragOver={(e) => handleSubDragOver(e, idx)}
                    onDragEnd={handleSubDragEnd}
                    style={{ ...tagStyle, cursor: "grab", opacity: dragSubIdx === idx ? 0.5 : 1 }}
                  >
                    <GripVertical size={8} style={{ color: MUTED, flexShrink: 0 }} />
                    r/{s}
                    <button onClick={() => setSubreddits(subreddits.filter((x) => x !== s))} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", padding: 0, display: "flex" }}><X size={9} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* Keywords */}
          <div>
            <label style={labelStyle}>Keywords to Monitor</label>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <input value={kwInput} onChange={(e) => setKwInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addKw()} placeholder="add a keyword..." style={{ ...inputStyle, flex: 1 }} />
              <button onClick={addKw} style={{ padding: "0.6rem 1rem", background: "transparent", border: `0.5px solid ${BORDER}`, color: MUTED, fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.1em", cursor: "pointer", flexShrink: 0 }}>Add</button>
            </div>
            {keywords.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                {keywords.map((k, idx) => (
                  <span
                    key={k}
                    draggable
                    onDragStart={() => handleKwDragStart(idx)}
                    onDragOver={(e) => handleKwDragOver(e, idx)}
                    onDragEnd={handleKwDragEnd}
                    style={{ ...tagStyle, cursor: "grab", opacity: dragKwIdx === idx ? 0.5 : 1 }}
                  >
                    <GripVertical size={8} style={{ color: MUTED, flexShrink: 0 }} />
                    {k}
                    <button onClick={() => setKeywords(keywords.filter((x) => x !== k))} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", padding: 0, display: "flex" }}><X size={9} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* AI instructions */}
          <div>
            <label style={labelStyle}>AI DM Tone/Style Instructions (optional)</label>
            <input value={aiInstructions} onChange={(e) => setAiInstructions(e.target.value)} placeholder="e.g. Be casual and friendly, mention free trial" style={inputStyle} />
          </div>
          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={handleSave}
              disabled={updateCampaign.isPending}
              style={{ padding: "0.65rem 1.5rem", background: updateCampaign.isPending ? SURFACE_RAISED : IVORY, border: `0.5px solid ${updateCampaign.isPending ? BORDER : IVORY}`, color: updateCampaign.isPending ? MUTED : BG, fontFamily: FONT_MONO, fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: updateCampaign.isPending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              {updateCampaign.isPending ? <><Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> Saving...</> : <><Pencil size={11} /> Save Changes</>}
            </button>
            <button onClick={onClose} style={{ padding: "0.65rem 1.25rem", background: "transparent", border: `0.5px solid ${BORDER}`, color: MUTED, fontFamily: FONT_MONO, fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── New campaign form ────────────────────────────────────────────────────────────────────────────────────
function NewCampaignForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [offering, setOffering] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [subreddits, setSubreddits] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [subInput, setSubInput] = useState("");
  const [kwInput, setKwInput] = useState("");
  const [aiInstructions, setAiInstructions] = useState("");
  const [campaignType, setCampaignType] = useState<"outreach" | "validation">("outreach");
  const [reviewMode, setReviewMode] = useState<"auto_send" | "review_first">("review_first");
  const [aiRecs, setAiRecs] = useState<{ subreddits: string[]; keywords: string[]; reasoning: string } | null>(null);
  const [minSubSize, setMinSubSize] = useState<string>("");
  const [maxSubSize, setMaxSubSize] = useState<string>("");
  const [showSizeFilter, setShowSizeFilter] = useState(false);

  const utils = trpc.useUtils();
  const [, navigate] = useLocation();

  const getRecs = trpc.outreach.getRecommendations.useMutation({
    onSuccess: (data) => { setAiRecs(data); toast.success("AI recommendations ready!"); },
    onError: (err) => toast.error(err.message),
  });

  const createCampaign = trpc.outreach.createCampaign.useMutation({
    onSuccess: () => { toast.success("Campaign created!"); utils.outreach.listCampaigns.invalidate(); onSuccess(); },
    onError: (err) => {
      if (err.message === "CAMPAIGN_LIMIT_REACHED") {
        toast.error("Free during beta — full access unlocking soon.", { action: { label: "Get priority access", onClick: () => navigate("/pricing") }, duration: 8000 });
      } else if (err.message === "UPGRADE_REQUIRED") {
        toast.error("Free during beta — full access unlocking soon.", { action: { label: "Get priority access", onClick: () => navigate("/pricing") }, duration: 8000 });
      } else if (err.message === "VALIDATION_REQUIRES_GROWTH") {
        toast.error("Free during beta — full access unlocking soon.", { action: { label: "Get priority access", onClick: () => navigate("/pricing") }, duration: 8000 });
      } else {
        toast.error(err.message);
      }
    },
  });

  const addSub = () => { const s = subInput.trim().replace(/^r\//, ""); if (s && !subreddits.includes(s)) setSubreddits([...subreddits, s]); setSubInput(""); };
  const addKw = () => { const k = kwInput.trim(); if (k && !keywords.includes(k)) setKeywords([...keywords, k]); setKwInput(""); };
  const applyRecs = () => { if (!aiRecs) return; setSubreddits((prev) => Array.from(new Set([...prev, ...aiRecs.subreddits]))); setKeywords((prev) => Array.from(new Set([...prev, ...aiRecs.keywords]))); toast.success("AI recommendations applied!"); };

  const handleCreate = () => {
    if (!name.trim()) return toast.error("Campaign name is required");
    if (!offering.trim()) return toast.error("Offering description is required");
    if (subreddits.length === 0) return toast.error("Add at least one subreddit");
    if (keywords.length === 0) return toast.error("Add at least one keyword");
    createCampaign.mutate({ name, offering, websiteUrl: websiteUrl || undefined, subreddits, keywords, aiPromptInstructions: aiInstructions || undefined, campaignType, reviewMode, minSubSize: minSubSize ? parseInt(minSubSize) : undefined, maxSubSize: maxSubSize ? parseInt(maxSubSize) : undefined });
  };

  const labelStyle: React.CSSProperties = { fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: "0.4rem" };
  const tagStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: "0.3rem", fontFamily: FONT_MONO, fontSize: "0.6rem", color: FOREGROUND, border: `0.5px solid ${BORDER}`, background: SURFACE_RAISED, padding: "0.2rem 0.5rem" };

  return (
    <div style={{ border: `0.5px solid ${BORDER}`, background: SURFACE }}>
      <div style={{ padding: "1.25rem 1.5rem", borderBottom: `0.5px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: MUTED }}>New Outreach Campaign</p>
        <button onClick={onCancel} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer" }}><X size={14} /></button>
      </div>
      <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Name + URL */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>Campaign Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. SaaS Founders Outreach" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Website URL (optional)</label>
            <input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://yourapp.com" style={inputStyle} />
          </div>
        </div>

        {/* Offering */}
        <div>
          <label style={labelStyle}>What are you offering?</label>
          <textarea value={offering} onChange={(e) => setOffering(e.target.value)} placeholder="Describe your product/service and who it helps..." style={{ ...inputStyle, minHeight: "80px", resize: "vertical", lineHeight: 1.6 }} />
        </div>

        {/* AI Recs */}
        <div style={{ border: `0.5px solid oklch(0.88 0.025 85 / 0.2)`, background: "oklch(0.88 0.025 85 / 0.03)", padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Sparkles size={12} color={IVORY} />
              <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: FOREGROUND }}>AI Subreddit & Keyword Recs</p>
            </div>
            <button
              onClick={() => getRecs.mutate({ offering, websiteUrl: websiteUrl || undefined, minSubSize: minSubSize ? parseInt(minSubSize) : undefined, maxSubSize: maxSubSize ? parseInt(maxSubSize) : undefined })}
              disabled={getRecs.isPending || !offering.trim()}
              style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.1em", color: IVORY, background: "none", border: `0.5px solid oklch(0.88 0.025 85 / 0.4)`, padding: "0.3rem 0.75rem", cursor: !offering.trim() || getRecs.isPending ? "not-allowed" : "pointer", opacity: !offering.trim() ? 0.5 : 1, display: "flex", alignItems: "center", gap: "0.3rem" }}
            >
              {getRecs.isPending ? <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} /> : null}
              Get AI Recs
            </button>
          </div>
          {aiRecs ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <p style={{ fontSize: "0.75rem", color: MUTED, lineHeight: 1.5 }}>{aiRecs.reasoning}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                {aiRecs.subreddits.map((s) => <span key={s} style={{ ...tagStyle, color: "oklch(0.72 0.12 220)", borderColor: "oklch(0.72 0.12 220 / 0.35)" }}>r/{s}</span>)}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                {aiRecs.keywords.map((k) => <span key={k} style={tagStyle}>{k}</span>)}
              </div>
              <button onClick={applyRecs} style={{ alignSelf: "flex-start", fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: BG, background: IVORY, border: `0.5px solid ${IVORY}`, padding: "0.35rem 0.85rem", cursor: "pointer" }}>
                Apply All
              </button>
            </div>
          ) : (
            <p style={{ fontSize: "0.75rem", color: MUTED }}>Fill in your offering above and click "Get AI Recs" to get suggestions.</p>
          )}
        </div>

        {/* Subreddits */}
        <div>
          <label style={labelStyle}>Target Subreddits</label>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: MUTED, fontSize: "0.82rem" }}>r/</span>
              <input value={subInput} onChange={(e) => setSubInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSub()} placeholder="SaaS" style={{ ...inputStyle, paddingLeft: "1.8rem" }} />
            </div>
            <button onClick={addSub} style={{ padding: "0.6rem 1rem", background: "transparent", border: `0.5px solid ${BORDER}`, color: MUTED, fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.1em", cursor: "pointer", flexShrink: 0 }}>Add</button>
          </div>
          {subreddits.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {subreddits.map((s) => (
                <span key={s} style={tagStyle}>r/{s}
                  <button onClick={() => setSubreddits(subreddits.filter((x) => x !== s))} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", padding: 0, display: "flex" }}><X size={9} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Keywords */}
        <div>
          <label style={labelStyle}>Keywords to Monitor</label>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <input value={kwInput} onChange={(e) => setKwInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addKw()} placeholder="struggling with churn, need analytics tool..." style={{ ...inputStyle, flex: 1 }} />
            <button onClick={addKw} style={{ padding: "0.6rem 1rem", background: "transparent", border: `0.5px solid ${BORDER}`, color: MUTED, fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.1em", cursor: "pointer", flexShrink: 0 }}>Add</button>
          </div>
          {keywords.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {keywords.map((k) => (
                <span key={k} style={tagStyle}>{k}
                  <button onClick={() => setKeywords(keywords.filter((x) => x !== k))} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", padding: 0, display: "flex" }}><X size={9} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Subreddit Size Filter */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showSizeFilter ? "0.75rem" : 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Subreddit Size Filter</label>
              <span style={{ fontFamily: FONT_MONO, fontSize: "0.48rem", letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, border: `0.5px solid ${BORDER}`, padding: "0.05rem 0.3rem" }}>optional</span>
            </div>
            <button
              onClick={() => setShowSizeFilter(!showSizeFilter)}
              style={{ background: "none", border: `0.5px solid ${BORDER}`, color: MUTED, fontFamily: FONT_MONO, fontSize: "0.55rem", letterSpacing: "0.1em", padding: "0.2rem 0.5rem", cursor: "pointer" }}
            >
              {showSizeFilter ? "Hide" : "Set filter"}
            </button>
          </div>
          {showSizeFilter && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <p style={{ fontSize: "0.72rem", color: MUTED, lineHeight: 1.5 }}>
                Filter subreddits by subscriber count. Sweet spot for high signal-to-noise: <span style={{ color: IVORY }}>10k – 150k members</span>.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={labelStyle}>Min subscribers</label>
                  <input
                    type="number"
                    value={minSubSize}
                    onChange={(e) => setMinSubSize(e.target.value)}
                    placeholder="e.g. 10000"
                    min={0}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Max subscribers</label>
                  <input
                    type="number"
                    value={maxSubSize}
                    onChange={(e) => setMaxSubSize(e.target.value)}
                    placeholder="e.g. 150000"
                    min={0}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {[
                  { label: "Niche (10k–50k)", min: "10000", max: "50000" },
                  { label: "Mid (10k–150k)", min: "10000", max: "150000" },
                  { label: "Large (150k+)", min: "150000", max: "" },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => { setMinSubSize(preset.min); setMaxSubSize(preset.max); }}
                    style={{ fontFamily: FONT_MONO, fontSize: "0.52rem", letterSpacing: "0.08em", color: minSubSize === preset.min && maxSubSize === preset.max ? IVORY : MUTED, background: "transparent", border: `0.5px solid ${minSubSize === preset.min && maxSubSize === preset.max ? "oklch(0.88 0.025 85 / 0.4)" : BORDER}`, padding: "0.2rem 0.5rem", cursor: "pointer" }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI instructions */}
        <div>
          <label style={labelStyle}>AI DM Tone/Style Instructions (optional)</label>
          <input value={aiInstructions} onChange={(e) => setAiInstructions(e.target.value)} placeholder="e.g. Be casual and friendly, mention free trial, avoid technical jargon" style={inputStyle} />
        </div>

        {/* Campaign type */}
        <div>
          <label style={labelStyle}>Campaign Type</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <button
              onClick={() => setCampaignType("outreach")}
              style={{ padding: "0.85rem 1rem", background: campaignType === "outreach" ? "oklch(0.88 0.025 85 / 0.06)" : "transparent", border: `0.5px solid ${campaignType === "outreach" ? "oklch(0.88 0.025 85 / 0.4)" : BORDER}`, textAlign: "left", cursor: "pointer", transition: "all 0.15s" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                <Target size={12} color={IVORY} />
                <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: FOREGROUND }}>Lead Outreach</p>
              </div>
              <p style={{ fontSize: "0.72rem", color: MUTED, lineHeight: 1.4 }}>Find buyers and draft personalized DMs</p>
            </button>
            <button
              onClick={() => setCampaignType("validation")}
              style={{ padding: "0.85rem 1rem", background: campaignType === "validation" ? "oklch(0.88 0.025 85 / 0.06)" : "transparent", border: `0.5px solid ${campaignType === "validation" ? "oklch(0.88 0.025 85 / 0.4)" : BORDER}`, textAlign: "left", cursor: "pointer", transition: "all 0.15s", position: "relative" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                <Sparkles size={12} color={AMBER} />
                <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: FOREGROUND }}>App Validation</p>
                <span style={{ fontFamily: FONT_MONO, fontSize: "0.48rem", letterSpacing: "0.12em", textTransform: "uppercase", color: AMBER, border: `0.5px solid ${AMBER}50`, padding: "0.05rem 0.3rem" }}>Growth</span>
              </div>
              <p style={{ fontSize: "0.72rem", color: MUTED, lineHeight: 1.4 }}>Surface complaints and validate willingness to pay</p>
            </button>
          </div>
        </div>

        {/* Review mode */}
        <div>
          <label style={labelStyle}>DM Review Mode</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {/* Review First — selectable */}
            <button
              onClick={() => setReviewMode("review_first")}
              style={{ padding: "0.85rem 1rem", background: reviewMode === "review_first" ? "oklch(0.88 0.025 85 / 0.06)" : "transparent", border: `0.5px solid ${reviewMode === "review_first" ? "oklch(0.88 0.025 85 / 0.4)" : BORDER}`, textAlign: "left", cursor: "pointer", transition: "all 0.15s" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                <CheckCircle2 size={12} color={IVORY} />
                <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: FOREGROUND }}>Review First</p>
              </div>
              <p style={{ fontSize: "0.72rem", color: MUTED, lineHeight: 1.4 }}>You approve each DM before it's sent</p>
            </button>

            {/* One-Click Send via Extension — coming soon, disabled */}
            <div
              style={{ padding: "0.85rem 1rem", background: "transparent", border: `0.5px solid ${BORDER}`, textAlign: "left", opacity: 0.5, cursor: "not-allowed", position: "relative" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                <Zap size={12} color={AMBER} />
                <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: FOREGROUND }}>One-Click Send</p>
                <span style={{ fontFamily: FONT_MONO, fontSize: "0.48rem", letterSpacing: "0.12em", textTransform: "uppercase", color: AMBER, border: `0.5px solid ${AMBER}50`, padding: "0.05rem 0.3rem", display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: AMBER, display: "inline-block", animation: "pulse 2s ease-in-out infinite" }} />
                  Coming soon
                </span>
              </div>
              <p style={{ fontSize: "0.72rem", color: MUTED, lineHeight: 1.4 }}>Send from your own browser — no API, no ban risk</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={handleCreate}
            disabled={createCampaign.isPending}
            style={{ padding: "0.65rem 1.5rem", background: createCampaign.isPending ? SURFACE_RAISED : IVORY, border: `0.5px solid ${createCampaign.isPending ? BORDER : IVORY}`, color: createCampaign.isPending ? MUTED : BG, fontFamily: FONT_MONO, fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: createCampaign.isPending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            {createCampaign.isPending ? <><Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> Creating...</> : <><Target size={11} /> Create Campaign</>}
          </button>
          <button onClick={onCancel} style={{ padding: "0.65rem 1.25rem", background: "transparent", border: `0.5px solid ${BORDER}`, color: MUTED, fontFamily: FONT_MONO, fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Lead card ────────────────────────────────────────────────────────────────
function LeadCard({ lead, onGenerateDm, onSendDm, onSkip, onQueue, onCancelQueue, onUpdateDraft, onRoast, onGenerateComment, onSendComment, onMarkContacted, onReDraftDm, onCheckSpam, isChaining, onToggleFavorite }: {
  lead: Lead; onGenerateDm: (id: number) => void; onSendDm: (id: number) => void;
  onSkip: (id: number) => void; onQueue: (id: number) => void; onCancelQueue: (id: number) => void;
  onUpdateDraft: (id: number, draft: string) => void; onRoast: (id: number) => void;
  onGenerateComment: (id: number) => void; onSendComment: (id: number) => void;
  onMarkContacted: (id: number) => void; onReDraftDm: (id: number) => void;
  onCheckSpam: (id: number) => void; isChaining: boolean;
  onToggleFavorite: (id: number, isFavorited: boolean) => void;
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

  useEffect(() => () => {
    if (roastTimerRef.current) clearInterval(roastTimerRef.current);
    if (dmTimerRef.current) clearInterval(dmTimerRef.current);
    if (commentTimerRef.current) clearInterval(commentTimerRef.current);
  }, []);

  const startRoastProgress = () => {
    setRoastStep(0); let step = 0;
    roastTimerRef.current = setInterval(() => { step++; if (step >= 2) { clearInterval(roastTimerRef.current!); roastTimerRef.current = null; } setRoastStep(step); }, 2200);
  };
  const startDmProgress = () => {
    setDmStep(0); let step = 0;
    dmTimerRef.current = setInterval(() => { step++; if (step >= 2) { clearInterval(dmTimerRef.current!); dmTimerRef.current = null; } setDmStep(step); }, 2500);
  };
  const startCommentProgress = () => {
    setCommentStep(0); let step = 0;
    commentTimerRef.current = setInterval(() => { step++; if (step >= 2) { clearInterval(commentTimerRef.current!); commentTimerRef.current = null; } setCommentStep(step); }, 2200);
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

  const monoBtn: React.CSSProperties = { fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", background: "transparent", border: `0.5px solid ${BORDER}`, color: MUTED, padding: "0.3rem 0.65rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.3rem" };
  const primaryBtn: React.CSSProperties = { ...monoBtn, background: IVORY, border: `0.5px solid ${IVORY}`, color: BG };

  return (
    <div style={{ border: `0.5px solid ${BORDER}`, background: SURFACE, opacity: lead.status === "skipped" ? 0.4 : 1, transition: "opacity 0.2s" }}>
      <div style={{ padding: "1rem 1.25rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
            {/* Favorite toggle */}
            <button
              onClick={() => onToggleFavorite(lead.id, !lead.isFavorited)}
              title={lead.isFavorited ? "Remove from favorites" : "Save as favorite"}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "0.1rem 0.2rem",
                color: lead.isFavorited ? "oklch(0.78 0.14 65)" : MUTED,
                fontSize: "0.9rem",
                lineHeight: 1,
                transition: "color 0.15s, transform 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.2)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
            >
              {lead.isFavorited ? "★" : "☆"}
            </button>
            <span style={{ fontFamily: FONT_MONO, fontSize: "0.62rem", color: MUTED }}>r/{lead.subreddit}</span>
            <MatchBadge score={lead.matchScore} />
            {lead.intentType && <IntentBadge intent={lead.intentType} />}
            {lead.status === "queued" && <span style={{ fontFamily: FONT_MONO, fontSize: "0.52rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.72 0.12 220)", border: `0.5px solid oklch(0.72 0.12 220 / 0.35)`, padding: "0.1rem 0.35rem" }}>Queued</span>}
            {lead.status === "sent" && <span style={{ fontFamily: FONT_MONO, fontSize: "0.52rem", letterSpacing: "0.1em", textTransform: "uppercase", color: IVORY, border: `0.5px solid oklch(0.88 0.025 85 / 0.35)`, padding: "0.1rem 0.35rem" }}>Sent</span>}
            {lead.matchedKeywords.length > 0 && (
              <div style={{ display: "flex", gap: "0.25rem" }}>
                {lead.matchedKeywords.slice(0, 2).map((k) => (
                  <span key={k} style={{ fontFamily: FONT_MONO, fontSize: "0.52rem", color: MUTED, border: `0.5px solid ${BORDER}`, padding: "0.1rem 0.3rem" }}>{k}</span>
                ))}
                {lead.matchedKeywords.length > 2 && <span style={{ fontFamily: FONT_MONO, fontSize: "0.52rem", color: MUTED }}>+{lead.matchedKeywords.length - 2}</span>}
              </div>
            )}
          </div>

          <a href={lead.redditPostUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85rem", color: FOREGROUND, textDecoration: "none", display: "flex", alignItems: "flex-start", gap: "0.35rem", lineHeight: 1.4, marginBottom: "0.25rem" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = IVORY)} onMouseLeave={(e) => (e.currentTarget.style.color = FOREGROUND)}>
            {lead.postTitle}
            <ExternalLink size={11} color={MUTED} style={{ flexShrink: 0, marginTop: "2px" }} />
          </a>

          <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", color: MUTED }}>
            u/{lead.authorUsername} · {new Date(lead.discoveredAt).toLocaleDateString()}
          </p>

          {isChaining && <div style={{ marginTop: "0.75rem" }}><ProgressSteps steps={["Reading", "Scoring", "Crafting DM", "DM ready", "Comment", "Done"]} currentStep={roastStep !== null ? roastStep : dmStep !== null ? dmStep + 2 : (commentStep ?? 0) + 4} /></div>}
        </div>

        {/* Roast scores */}
        {isRoasted && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", padding: "0.85rem 1rem", border: `0.5px solid ${BORDER}`, background: SURFACE_RAISED, marginBottom: "0.75rem" }}>
            <ScoreBar label="Fit" value={lead.fitScore!} color={IVORY} />
            <ScoreBar label="Urgency" value={lead.urgencyScore!} color={AMBER} />
          </div>
        )}

        {/* Roast insight */}
        {lead.roastInsight && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", padding: "0.75rem 0.85rem", border: `0.5px solid oklch(0.88 0.025 85 / 0.2)`, background: "oklch(0.88 0.025 85 / 0.03)", marginBottom: "0.75rem" }}>
            <Sparkles size={11} color={IVORY} style={{ flexShrink: 0, marginTop: "2px" }} />
            <p style={{ fontSize: "0.75rem", color: FOREGROUND, lineHeight: 1.6, opacity: 0.85 }}>{lead.roastInsight}</p>
          </div>
        )}

        {/* Spam Risk badge */}
        {lead.spamScore != null && (() => {
          const score = lead.spamScore;
          const flags: string[] = (() => { try { return JSON.parse(lead.spamFlags || "[]"); } catch { return []; } })();
          const isHighRisk = score >= 51;
          const color = score >= 76 ? "oklch(0.65 0.22 25)" : score >= 51 ? "oklch(0.75 0.18 55)" : "oklch(0.72 0.15 145)";
          const label = score >= 76 ? "HIGH SPAM RISK" : score >= 51 ? "SUSPICIOUS" : "LOW RISK";
          return (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", padding: "0.65rem 0.85rem", border: `0.5px solid ${color}40`, background: `${color}08`, marginBottom: "0.75rem" }}>
              <ShieldAlert size={11} color={color} style={{ flexShrink: 0, marginTop: "2px" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: flags.length > 0 ? "0.3rem" : 0 }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: "0.55rem", letterSpacing: "0.1em", color, textTransform: "uppercase" }}>{label}</span>
                  <span style={{ fontFamily: FONT_MONO, fontSize: "0.55rem", color: MUTED }}>{score}/100</span>
                  {isHighRisk && <span style={{ fontFamily: FONT_MONO, fontSize: "0.52rem", color, border: `0.5px solid ${color}50`, padding: "0.05rem 0.3rem" }}>Skip recommended</span>}
                </div>
                {flags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                    {flags.map((f, i) => <span key={i} style={{ fontFamily: FONT_MONO, fontSize: "0.52rem", color: MUTED, background: "oklch(0.18 0 0)", padding: "0.1rem 0.3rem" }}>{f}</span>)}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* DM draft loading */}
        {!lead.dmDraft && dmStep !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.65rem 0.85rem", border: `0.5px solid ${BORDER}`, background: SURFACE_RAISED, marginBottom: "0.75rem" }}>
            <Loader2 size={11} color={IVORY} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
            <span style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", color: MUTED }}>Loading DM draft...</span>
          </div>
        )}

        {/* DM draft */}
        {lead.dmDraft && (!isChaining || (dmStep !== null && dmStep >= 1) || commentStep !== null) && (
          <div style={{ border: `0.5px solid ${BORDER}`, background: SURFACE_RAISED, marginBottom: "0.75rem", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.85rem", borderBottom: `0.5px solid ${BORDER}` }}>
              <button onClick={() => setExpandedDm(!expandedDm)} style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.1em", color: IVORY, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Bot size={11} /> {expandedDm ? "Hide DM draft" : "View DM draft"}
              </button>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button onClick={() => { startDmProgress(); onReDraftDm(lead.id); }} disabled={isChaining} style={{ ...monoBtn, fontSize: "0.55rem" }}>
                  <RefreshCw size={9} /> Re-draft
                </button>
                <button onClick={() => { navigator.clipboard.writeText(lead.dmDraft!); window.open(`https://www.reddit.com/user/${lead.authorUsername}`, "_blank"); toast.success("DM copied! Opening Reddit profile to send manually."); }} style={primaryBtn}>
                  <Clipboard size={9} /> Copy & Open
                </button>
              </div>
            </div>
            {expandedDm && (
              <div style={{ padding: "0.85rem" }}>
                {editingDraft ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <textarea value={draftText} onChange={(e) => setDraftText(e.target.value)} style={{ ...inputStyle, minHeight: "100px", resize: "vertical", lineHeight: 1.6 }} />
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button onClick={() => { onUpdateDraft(lead.id, draftText); setEditingDraft(false); }} style={primaryBtn}>Save</button>
                      <button onClick={() => setEditingDraft(false)} style={monoBtn}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ position: "relative" }} className="group">
                    <p style={{ fontSize: "0.78rem", color: FOREGROUND, lineHeight: 1.7, whiteSpace: "pre-wrap", opacity: 0.85 }}>{lead.dmDraft}</p>
                    <button onClick={() => { setDraftText(lead.dmDraft ?? ""); setEditingDraft(true); }} style={{ ...monoBtn, position: "absolute", top: 0, right: 0, fontSize: "0.52rem", opacity: 0 }} className="group-hover:opacity-100">Edit</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Comment draft loading */}
        {!(lead as any).commentDraft && commentStep !== null && commentStep < 2 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.65rem 0.85rem", border: `0.5px solid ${BORDER}`, background: SURFACE_RAISED, marginBottom: "0.75rem" }}>
            <Loader2 size={11} color={IVORY} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
            <span style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", color: MUTED }}>Loading comment draft...</span>
          </div>
        )}

        {/* Comment draft */}
        {(lead as any).commentDraft && (!isChaining || (commentStep !== null && commentStep >= 2)) && (
          <div style={{ border: `0.5px solid ${BORDER}`, background: SURFACE_RAISED, marginBottom: "0.75rem", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.85rem", borderBottom: `0.5px solid ${BORDER}` }}>
              <button onClick={() => setExpandedComment(!expandedComment)} style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.1em", color: IVORY, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <MessageSquare size={11} /> {expandedComment ? "Hide comment draft" : "View comment draft"}
              </button>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button onClick={() => { startCommentProgress(); onGenerateComment(lead.id); }} disabled={isChaining} style={{ ...monoBtn, fontSize: "0.55rem" }}>
                  <RefreshCw size={9} /> Re-draft
                </button>
                {!(lead as any).commentSentAt ? (
                  <button onClick={() => { navigator.clipboard.writeText((lead as any).commentDraft!); window.open(lead.redditPostUrl, "_blank"); toast.success("Comment copied! Opening post to paste manually."); }} style={monoBtn}>
                    <Clipboard size={9} /> Copy & Open
                  </button>
                ) : (
                  <span style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", color: IVORY, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                    <CheckCircle2 size={10} /> Sent
                  </span>
                )}
              </div>
            </div>
            {expandedComment && (
              <div style={{ padding: "0.85rem" }}>
                <p style={{ fontSize: "0.78rem", color: FOREGROUND, lineHeight: 1.7, whiteSpace: "pre-wrap", opacity: 0.85 }}>{(lead as any).commentDraft}</p>
              </div>
            )}
          </div>
        )}

        {/* Action row */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", paddingTop: "0.75rem", borderTop: `0.5px solid ${BORDER}` }}>
          {/* Analyze & Draft — combined */}
          {!isRoasted && isActionable && !lead.dmDraft && !isChaining && (
            (roastStep !== null || dmStep !== null || commentStep !== null) ? (
              <ProgressSteps steps={["Reading", "Scoring", "Crafting DM", "DM ready", "Comment", "Done"]} currentStep={roastStep !== null ? roastStep : dmStep !== null ? dmStep + 2 : (commentStep ?? 0) + 4} />
            ) : (
              <button onClick={() => { startRoastProgress(); onRoast(lead.id); }} style={primaryBtn}>
                <Sparkles size={10} /> Analyze & Draft
              </button>
            )
          )}

          {/* Analyze only */}
          {!isRoasted && isActionable && lead.dmDraft && (
            roastStep !== null ? (
              <ProgressSteps steps={["Reading", "Scoring", "Done"]} currentStep={roastStep} />
            ) : (
              <button onClick={() => { startRoastProgress(); onRoast(lead.id); }} style={monoBtn}>
                <TrendingUp size={10} /> Analyze Lead
              </button>
            )
          )}

          {/* Draft DM only */}
          {isRoasted && isActionable && !lead.dmDraft && !isChaining && (
            dmStep !== null ? (
              <ProgressSteps steps={["Reading", "Crafting DM", "Done"]} currentStep={dmStep} />
            ) : (
              <button onClick={() => { startDmProgress(); onGenerateDm(lead.id); }} style={monoBtn}>
                <Sparkles size={10} /> Draft DM
              </button>
            )
          )}

          {/* Mark Contacted */}
          {isActionable && lead.pipelineStage !== "replied" && (
            <button onClick={() => onMarkContacted(lead.id)} style={{ ...monoBtn, color: "oklch(0.72 0.15 145)", borderColor: "oklch(0.72 0.15 145 / 0.35)" }}>
              <CheckCircle2 size={10} /> Mark Contacted
            </button>
          )}
          {lead.pipelineStage === "replied" && (
            <span style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", color: "oklch(0.72 0.15 145)", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <CheckCircle2 size={10} /> Contacted
            </span>
          )}

          {/* Spam Check */}
          {isActionable && (
            <button
              onClick={() => onCheckSpam(lead.id)}
              style={{ ...monoBtn, color: lead.spamScore != null ? (lead.spamScore >= 51 ? "oklch(0.65 0.22 25)" : "oklch(0.72 0.15 145)") : MUTED, borderColor: lead.spamScore != null ? (lead.spamScore >= 51 ? "oklch(0.65 0.22 25 / 0.35)" : "oklch(0.72 0.15 145 / 0.35)") : "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = FOREGROUND)} onMouseLeave={(e) => (e.currentTarget.style.color = lead.spamScore != null ? (lead.spamScore >= 51 ? "oklch(0.65 0.22 25)" : "oklch(0.72 0.15 145)") : MUTED)}>
              <ShieldAlert size={10} /> {lead.spamScore != null ? `Spam ${lead.spamScore}` : "Spam Check"}
            </button>
          )}

          {/* Skip */}
          {isActionable && lead.pipelineStage !== "replied" && (
            <button onClick={() => onSkip(lead.id)} style={{ ...monoBtn, borderColor: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = FOREGROUND)} onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}>
              <SkipForward size={10} /> Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Campaign detail ──────────────────────────────────────────────────────────
function CampaignDetail({ campaign, onBack }: { campaign: Campaign; onBack: () => void }) {
  const utils = trpc.useUtils();
  const [activeFilter, setActiveFilter] = useState<"all" | "new" | "dm_generated" | "queued" | "sent" | "skipped">("all");
  const chainLeadIdRef = useRef<number | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  const { data: leads = [], isLoading: leadsLoading } = trpc.outreach.getLeads.useQuery(
    { campaignId: campaign.id },
    { refetchInterval: 60_000 }
  );
  const { data: rateLimits } = trpc.reddit.getRateLimitStatus.useQuery();

  const syncLeads = trpc.outreach.syncLeads.useMutation({
    onSuccess: (data) => {
      const spamNote = data.spamFiltered > 0 ? ` · ${data.spamFiltered} spam filtered` : "";
      toast.success(`Found ${data.newLeads} new leads!${spamNote}`);
      utils.outreach.getLeads.invalidate({ campaignId: campaign.id });
      utils.outreach.listCampaigns.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const generateDm = trpc.outreach.generateDm.useMutation({
    onSuccess: (data, variables) => {
      const isChaining = chainLeadIdRef.current === variables.leadId;
      if (!isChaining) {
        if (data.sent) toast.success("DM sent!");
        else if (data.queued) toast.success("Rate limit reached — DM queued for delivery shortly");
        else if (data.reason?.startsWith("send_failed")) toast.error(`Draft saved, but send failed: ${data.reason.replace("send_failed: ", "")}`);
        else toast.success("DM drafted!");
      }
      utils.outreach.getLeads.invalidate({ campaignId: campaign.id });
      if (isChaining) generateComment.mutate({ leadId: variables.leadId });
    },
    onError: (err) => toast.error(err.message),
  });

  const skipLead = trpc.outreach.skipLead.useMutation({ onSuccess: () => utils.outreach.getLeads.invalidate({ campaignId: campaign.id }), onError: (err) => toast.error(err.message) });
  const queueLead = trpc.outreach.queueLead.useMutation({ onSuccess: () => { toast.success("Lead queued for sending!"); utils.outreach.getLeads.invalidate({ campaignId: campaign.id }); }, onError: (err) => toast.error(err.message) });
  const updateDraft = trpc.outreach.updateDmDraft.useMutation({ onSuccess: () => { toast.success("Draft updated"); utils.outreach.getLeads.invalidate({ campaignId: campaign.id }); }, onError: (err) => toast.error(err.message) });

  const roastLead = trpc.outreach.roastLead.useMutation({
    onSuccess: (_, variables) => {
      utils.outreach.getLeads.invalidate({ campaignId: campaign.id });
      const chainId = chainLeadIdRef.current;
      if (chainId !== null && chainId === variables.leadId) generateDm.mutate({ leadId: chainId });
      else toast.success("Lead analyzed!");
    },
    onError: (err) => toast.error(err.message),
  });

  const cancelQueue = trpc.outreach.cancelQueuedLead.useMutation({ onSuccess: () => { toast.success("DM removed from queue"); utils.outreach.getLeads.invalidate({ campaignId: campaign.id }); }, onError: (err) => toast.error(err.message) });

  const generateComment = trpc.outreach.generateComment.useMutation({
    onSuccess: (_, variables) => {
      if (chainLeadIdRef.current === variables.leadId) { chainLeadIdRef.current = null; toast.success("✅ All done — DM & comment drafted!"); }
      else toast.success("Comment draft ready!");
      utils.outreach.getLeads.invalidate({ campaignId: campaign.id });
    },
    onError: (err) => toast.error(err.message),
  });

  const sendDm = trpc.outreach.sendDm.useMutation({
    onSuccess: (data) => {
      if (data.sent) toast.success("DM sent!");
      else if (data.queued) toast.success("Rate limit reached — DM queued for delivery shortly");
      else toast.info("Draft saved");
      utils.outreach.getLeads.invalidate({ campaignId: campaign.id });
    },
    onError: (err) => toast.error(err.message),
  });

  const sendComment = trpc.outreach.sendComment.useMutation({ onSuccess: () => { toast.success("Comment posted to Reddit!"); utils.outreach.getLeads.invalidate({ campaignId: campaign.id }); }, onError: (err) => toast.error(err.message) });
  const markContacted = trpc.outreach.updatePipelineStage.useMutation({ onSuccess: () => { toast.success("Lead marked as contacted!"); utils.outreach.getLeads.invalidate({ campaignId: campaign.id }); }, onError: (err) => toast.error(err.message) });
  const updateCampaign = trpc.outreach.updateCampaign.useMutation({ onSuccess: () => { toast.success("Campaign updated"); utils.outreach.listCampaigns.invalidate(); }, onError: (err) => toast.error(err.message) });
  const scoreSpamRisk = trpc.outreach.scoreSpamRisk.useMutation({ onSuccess: (data) => { toast.success(`Spam check complete — score: ${data.spamScore}/100`); utils.outreach.getLeads.invalidate({ campaignId: campaign.id }); }, onError: (err) => toast.error(err.message) });
  const toggleFavorite = trpc.outreach.toggleFavorite.useMutation({
    onMutate: async ({ leadId, isFavorited }) => {
      await utils.outreach.getLeads.cancel({ campaignId: campaign.id });
      const prev = utils.outreach.getLeads.getData({ campaignId: campaign.id });
      utils.outreach.getLeads.setData({ campaignId: campaign.id }, (old) =>
        old ? old.map((l) => l.id === leadId ? { ...l, isFavorited } : l) : old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) utils.outreach.getLeads.setData({ campaignId: campaign.id }, ctx.prev);
      toast.error("Failed to update favorite");
    },
    onSettled: () => utils.outreach.getLeads.invalidate({ campaignId: campaign.id }),
  });

  const filteredLeads = leads.filter((l) => activeFilter === "all" || l.status === activeFilter);
  const filterCounts = { all: leads.length, new: leads.filter((l) => l.status === "new").length, dm_generated: leads.filter((l) => l.status === "dm_generated").length, queued: leads.filter((l) => l.status === "queued").length, sent: leads.filter((l) => l.status === "sent").length, skipped: leads.filter((l) => l.status === "skipped").length };

  const monoBtn: React.CSSProperties = { fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", background: "transparent", border: `0.5px solid ${BORDER}`, color: MUTED, padding: "0.4rem 0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.3rem" };

  return (
    <div>
      {/* Back + header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "2rem" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", padding: "0.2rem", marginTop: "0.3rem" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = FOREGROUND)} onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 300, fontStyle: "italic", color: FOREGROUND, lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{campaign.name}</h2>
            <StatusBadge status={campaign.status} />
          </div>
          <p style={{ fontFamily: FONT_MONO, fontSize: "0.62rem", color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{campaign.offering.slice(0, 80)}</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
          <button onClick={() => syncLeads.mutate({ campaignId: campaign.id })} disabled={syncLeads.isPending || campaign.status !== "active"} style={{ ...monoBtn, opacity: (syncLeads.isPending || campaign.status !== "active") ? 0.5 : 1 }}>
            {syncLeads.isPending ? <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} /> : <RefreshCw size={10} />} Sync Leads
          </button>
          <button onClick={() => setShowEdit(true)} style={monoBtn}>
            <Pencil size={10} /> Edit
          </button>
          <button onClick={() => updateCampaign.mutate({ id: campaign.id, status: campaign.status === "active" ? "paused" : "active" })} style={monoBtn}>
            {campaign.status === "active" ? <><Pause size={10} /> Pause</> : <><Play size={10} /> Resume</>}
          </button>
        </div>
        {showEdit && <EditCampaignModal key={campaign.id + '-' + campaign.keywords.length + '-' + campaign.subreddits.length} campaign={campaign} onClose={() => setShowEdit(false)} />}
      </div>

      {/* Stats grid — commented out, kept in backlog for future consideration
      {(() => {
        const hotLeads = leads.filter((l) => l.leadHeat === "hot" || l.leadHeat === "on_fire").length;
        const scoredLeads = leads.filter((l) => l.fitScore != null);
        const avgFit = scoredLeads.length > 0 ? Math.round(scoredLeads.reduce((s, l) => s + (l.fitScore ?? 0), 0) / scoredLeads.length) : null;
        const lastSync = campaign.lastSyncAt ? new Date(campaign.lastSyncAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Never";
        const syncsUsed = (campaign as any).dailySyncsUsed ?? 0;
        const syncsLimit = 6;
        const stats = [
          { label: "Hot Leads", value: hotLeads.toString(), accent: hotLeads > 0 ? AMBER : IVORY },
          { label: "Avg Fit Score", value: avgFit != null ? `${avgFit}/100` : "—", accent: avgFit != null && avgFit >= 70 ? "oklch(0.72 0.14 145)" : IVORY },
          { label: "Last Sync", value: lastSync, small: true, accent: IVORY },
          { label: "Syncs Today", value: `${syncsUsed}/${syncsLimit}`, accent: syncsUsed >= syncsLimit ? DANGER : IVORY },
        ];
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5px", marginBottom: "1.5rem" }}>
            {stats.map(({ label, value, accent, small }) => (
              <div key={label} style={{ padding: "1rem", border: `0.5px solid ${BORDER}`, background: SURFACE, textAlign: "center" }}>
                <p style={{ fontFamily: FONT_MONO, fontSize: small ? "0.75rem" : "1.4rem", color: accent, fontWeight: 600, lineHeight: 1 }}>{value}</p>
                <p style={{ fontFamily: FONT_MONO, fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginTop: "0.35rem" }}>{label}</p>
              </div>
            ))}
          </div>
        );
      })()}
      */}

      {/* Funnel metrics row */}
      {campaign.leadsFound > 0 && (() => {
        const total = campaign.leadsFound;
        const dmsSent = leads.filter((l) => l.status === "sent").length;
        const conversations = leads.filter((l) => l.pipelineStage === "replied" || l.pipelineStage === "interested" || l.pipelineStage === "converted").length;
        const converted = leads.filter((l) => l.pipelineStage === "converted").length;
        const pct = (n: number, d: number) => d > 0 ? Math.round((n / d) * 100) : 0;
        const stages = [
          { label: "Leads Found", value: total, rate: null },
          { label: "DMs Sent", value: dmsSent, rate: pct(dmsSent, total) },
          { label: "Conversations", value: conversations, rate: pct(conversations, dmsSent) },
          { label: "Converted", value: converted, rate: pct(converted, conversations) },
        ];
        return (
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ fontFamily: FONT_MONO, fontSize: "0.52rem", letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED, marginBottom: "0.6rem" }}>Funnel</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5px" }}>
              {stages.map((s, i) => (
                <div key={s.label} style={{ padding: "0.75rem 1rem", border: `0.5px solid ${BORDER}`, background: SURFACE, position: "relative" }}>
                  {i > 0 && (
                    <span style={{ position: "absolute", left: -10, top: "50%", transform: "translateY(-50%)", color: MUTED, fontSize: "0.6rem", zIndex: 1 }}>›</span>
                  )}
                  <p style={{ fontFamily: FONT_MONO, fontSize: "1.1rem", color: IVORY, fontWeight: 600, lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontFamily: FONT_MONO, fontSize: "0.52rem", letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, marginTop: "0.25rem" }}>{s.label}</p>
                  {s.rate !== null && (
                    <p style={{ fontFamily: FONT_MONO, fontSize: "0.52rem", color: s.rate >= 10 ? "oklch(0.72 0.14 145)" : MUTED, marginTop: "0.2rem" }}>{s.rate}%</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Rate limit indicator row */}
      {rateLimits && (
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "0.6rem 1rem", border: `0.5px solid ${BORDER}`, background: SURFACE, marginBottom: "0.75rem", fontFamily: FONT_MONO, fontSize: "0.6rem", color: MUTED }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            DMs today: <span style={{ color: rateLimits.dmWarning ? "oklch(0.78 0.14 65)" : FOREGROUND }}>{rateLimits.dmsToday}/{rateLimits.maxDmsPerDay}</span>
          </span>
          {rateLimits.dmsThisHour > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: MUTED }}>
              This hour: <span style={{ color: FOREGROUND }}>{rateLimits.dmsThisHour}/{rateLimits.maxDmsPerHour}</span>
            </span>
          )}
        </div>
      )}

      {/* Size filter badge — only shown when a filter is active */}
      {(campaign.minSubSize || campaign.maxSubSize) && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: "0.52rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED }}>Sub filter</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", color: "oklch(0.72 0.12 220)", border: "0.5px solid oklch(0.72 0.12 220 / 0.3)", padding: "0.1rem 0.45rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            {campaign.minSubSize ? `${(campaign.minSubSize / 1000).toFixed(0)}k` : "any"}
            {" – "}
            {campaign.maxSubSize ? `${(campaign.maxSubSize / 1000).toFixed(0)}k` : "∞"}
            {" members"}
          </span>
        </div>
      )}

      {/* Review mode banner */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.75rem 1rem", border: `0.5px solid ${campaign.reviewMode === "auto_send" ? BORDER : "oklch(0.88 0.025 85 / 0.25)"}`, background: campaign.reviewMode === "auto_send" ? SURFACE : "oklch(0.88 0.025 85 / 0.03)", marginBottom: "1.5rem" }}>
        {campaign.reviewMode === "auto_send" ? <Zap size={12} color={AMBER} /> : <CheckCircle2 size={12} color={IVORY} />}
        <span style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: campaign.reviewMode === "auto_send" ? AMBER : IVORY }}>
          {campaign.reviewMode === "auto_send" ? "One-Click Send mode" : "Review First mode"}
        </span>
        <span style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", color: MUTED }}>— You review each DM before it's sent</span>
        {campaign.reviewMode === "auto_send" && (
          <span style={{ marginLeft: "auto", fontFamily: FONT_MONO, fontSize: "0.52rem", letterSpacing: "0.1em", textTransform: "uppercase", color: AMBER, border: `0.5px solid ${AMBER}50`, padding: "0.1rem 0.4rem", display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: AMBER, display: "inline-block", animation: "pulse 2s ease-in-out infinite" }} />
            Extension coming soon
          </span>
        )}
      </div>

      {/* Leads inbox */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Inbox size={13} color={MUTED} />
            <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED }}>Leads Inbox</p>
          </div>
          {campaign.lastSyncAt && (
            <p style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", color: MUTED }}>Last sync: {new Date(campaign.lastSyncAt).toLocaleString()}</p>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "1.5px", marginBottom: "1rem", overflowX: "auto" }}>
          {(["all", "new", "dm_generated", "queued", "sent", "skipped"] as const).map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{ padding: "0.5rem 0.85rem", background: activeFilter === f ? SURFACE_RAISED : "transparent", border: `0.5px solid ${activeFilter === f ? BORDER : "transparent"}`, color: activeFilter === f ? FOREGROUND : MUTED, fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", flexShrink: 0, transition: "all 0.15s" }}>
              {f === "dm_generated" ? "Drafted" : f.charAt(0).toUpperCase() + f.slice(1)}
              {filterCounts[f] > 0 && <span style={{ marginLeft: "0.3rem", opacity: 0.6 }}>({filterCounts[f]})</span>}
            </button>
          ))}
        </div>

        {leadsLoading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem" }}>
            <Loader2 size={20} color={IVORY} style={{ animation: "spin 1s linear infinite" }} />
          </div>
        )}

        {!leadsLoading && filteredLeads.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 2rem", border: `0.5px dashed ${BORDER}`, background: SURFACE, textAlign: "center", gap: "0.6rem" }}>
            <Inbox size={24} color={MUTED} />
            <p style={{ fontFamily: FONT_DISPLAY, fontSize: "1.1rem", fontStyle: "italic", color: MUTED }}>
              {leads.length === 0 ? "No leads yet — click Sync Leads to discover prospects" : "No leads in this filter"}
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5px" }}>
          {filteredLeads.map((lead) => (
            <LeadCard
              key={lead.id} lead={lead as Lead}
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
              onCheckSpam={(id) => scoreSpamRisk.mutate({ leadId: id })}
              isChaining={chainLeadIdRef.current === lead.id}
              onToggleFavorite={(id, fav) => toggleFavorite.mutate({ leadId: id, isFavorited: fav })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DmCampaigns() {
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [, navigate] = useLocation();

  const utils = trpc.useUtils();
  const { data: campaigns = [], isLoading } = trpc.outreach.listCampaigns.useQuery();
  const { data: subStatus } = trpc.subscription.getStatus.useQuery();

  const syncIntervalMs = getSyncIntervalMs(subStatus?.plan);

  const deleteCampaign = trpc.outreach.deleteCampaign.useMutation({
    onSuccess: () => { toast.success("Campaign archived"); utils.outreach.listCampaigns.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  if (selectedCampaign) {
    return (
      <DashboardLayout>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <CampaignDetail campaign={selectedCampaign} onBack={() => setSelectedCampaign(null)} />
        </div>
      </DashboardLayout>
    );
  }

  const atLimit = subStatus?.campaignLimit !== null && campaigns.length >= (subStatus?.campaignLimit ?? 1);

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2.5rem" }}>
          <div>
            <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 300, fontStyle: "italic", color: FOREGROUND, lineHeight: 1.1, marginBottom: "0.4rem" }}>
              DM Campaigns
            </h1>
            <p style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED }}>
              Monitor subreddits · AI-draft personalized DMs · Send safely
            </p>
          </div>
          {!showNewForm && !atLimit && (
            <button onClick={() => setShowNewForm(true)} style={{ padding: "0.65rem 1.25rem", background: IVORY, border: `0.5px solid ${IVORY}`, color: BG, fontFamily: FONT_MONO, fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
              <Plus size={11} /> New Campaign
            </button>
          )}
        </div>

        {/* Beta limit banner */}
        {!showNewForm && atLimit && (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", border: `0.5px solid oklch(0.78 0.14 65 / 0.35)`, background: "oklch(0.78 0.14 65 / 0.04)", marginBottom: "1.5rem" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: AMBER, marginBottom: "0.25rem" }}>Free during beta</p>
              <p style={{ fontSize: "0.78rem", color: MUTED, lineHeight: 1.5 }}>Full access — unlimited campaigns, priority sync, and DM templates — unlocking soon.</p>
            </div>
            <button onClick={() => navigate("/pricing")} style={{ padding: "0.6rem 1.1rem", background: AMBER, border: `0.5px solid ${AMBER}`, color: BG, fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", flexShrink: 0 }}>
              <Zap size={10} /> Get priority access
            </button>
          </div>
        )}

        {/* New campaign form */}
        {showNewForm && (
          <div style={{ marginBottom: "2rem" }}>
            <NewCampaignForm onSuccess={() => setShowNewForm(false)} onCancel={() => setShowNewForm(false)} />
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem" }}>
            <Loader2 size={20} color={IVORY} style={{ animation: "spin 1s linear infinite" }} />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && campaigns.length === 0 && !showNewForm && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "5rem 2rem", border: `0.5px dashed ${BORDER}`, background: SURFACE, textAlign: "center", gap: "0.75rem" }}>
            <Target size={28} color={MUTED} />
            <p style={{ fontFamily: FONT_DISPLAY, fontSize: "1.3rem", fontStyle: "italic", color: MUTED }}>No campaigns yet</p>
            <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", color: MUTED, letterSpacing: "0.1em" }}>Create your first outreach campaign to start finding leads.</p>
            <button onClick={() => setShowNewForm(true)} style={{ padding: "0.65rem 1.5rem", background: IVORY, border: `0.5px solid ${IVORY}`, color: BG, fontFamily: FONT_MONO, fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.5rem" }}>
              <Plus size={11} /> Create Campaign
            </button>
          </div>
        )}

        {/* Campaign list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5px" }}>
          {campaigns.map((campaign) => (
            <div key={campaign.id} style={{ border: `0.5px solid ${BORDER}`, background: SURFACE, cursor: "pointer", transition: "border-color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "oklch(0.88 0.025 85 / 0.3)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}>
              <div style={{ padding: "1.25rem", display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                <div style={{ width: "36px", height: "36px", border: `0.5px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Target size={16} color={MUTED} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }} onClick={() => setSelectedCampaign(campaign)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
                    <p style={{ fontSize: "0.88rem", color: FOREGROUND, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{campaign.name}</p>
                    <StatusBadge status={campaign.status} />
                    {campaign.reviewMode === "auto_send" && (
                      <span style={{ fontFamily: FONT_MONO, fontSize: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase", color: AMBER, border: `0.5px solid oklch(0.78 0.14 65 / 0.35)`, padding: "0.1rem 0.3rem", display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
                        <Zap size={8} />1-Click
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "0.78rem", color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "0.5rem" }}>{campaign.offering.slice(0, 80)}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem 1.5rem", fontFamily: FONT_MONO, fontSize: "0.58rem", color: MUTED, flexWrap: "wrap" }}>
                    <span>{campaign.subreddits.length} subreddits</span>
                    <span>{campaign.keywords.length} keywords</span>
                    <span style={{ color: IVORY }}>{campaign.leadsFound} leads found</span>
                    <span>{campaign.dmsSent} DMs sent</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.4rem", fontFamily: FONT_MONO, fontSize: "0.55rem", color: MUTED, opacity: 0.7 }}>
                    <Clock size={9} />
                    {campaign.lastSyncAt ? (
                      <>Last synced {relativeTime(campaign.lastSyncAt)} · Next sync {countdown(campaign.lastSyncAt + syncIntervalMs)}</>
                    ) : (
                      <>Not yet synced — click Sync Leads to discover your first prospects</>
                    )}
                  </div>
                  {campaign.subreddits.length > 0 && (
                    <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                      {campaign.subreddits.slice(0, 4).map((s) => (
                        <span key={s} style={{ fontFamily: FONT_MONO, fontSize: "0.52rem", color: MUTED, border: `0.5px solid ${BORDER}`, padding: "0.1rem 0.3rem" }}>r/{s}</span>
                      ))}
                      {campaign.subreddits.length > 4 && <span style={{ fontFamily: FONT_MONO, fontSize: "0.52rem", color: MUTED }}>+{campaign.subreddits.length - 4}</span>}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", flexShrink: 0 }}>
                  <button onClick={(e) => { e.stopPropagation(); deleteCampaign.mutate({ id: campaign.id }); }} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", padding: "0.4rem" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = DANGER)} onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}>
                    <Trash2 size={13} />
                  </button>
                  <button onClick={() => setSelectedCampaign(campaign)} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", padding: "0.4rem" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = FOREGROUND)} onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

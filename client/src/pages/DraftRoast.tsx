import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import {
  CheckCircle2,
  ClipboardCopy,
  Flame,
  Loader2,
  Rocket,
  Sparkles,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const FONT_DISPLAY = "Cormorant Garamond, Georgia, serif";
const FONT_MONO = "JetBrains Mono, monospace";
const BG = "oklch(0.09 0.008 60)";
const SURFACE = "oklch(0.12 0.007 60)";
const SURFACE_RAISED = "oklch(0.14 0.007 60)";
const BORDER = "oklch(0.22 0.007 60)";
const IVORY = "oklch(0.88 0.025 85)";
const IVORY_DIM = "oklch(0.88 0.025 85 / 0.5)";
const FOREGROUND = "oklch(0.93 0.010 80)";
const MUTED = "oklch(0.52 0.006 80)";

type AnalysisResult = {
  review: {
    clarity: "High" | "Medium" | "Low";
    subreddit_fit: "High" | "Medium" | "Low";
    promo_risk: "Low" | "Medium" | "High";
    explanation: string;
  };
  virality: { score: number; tip: string };
  roast: string;
  improved_title: string;
  improved_draft: string;
  improved_virality: { score: number; tip: string };
  recommended_subreddit: string;
  subreddit_reasoning: string;
};

function ScorePill({ value, type }: { value: string; type: "positive" | "negative" }) {
  const isGood = type === "positive" ? value === "High" : value === "Low";
  const isMid = value === "Medium";
  const color = isGood ? IVORY : isMid ? "oklch(0.78 0.14 65)" : "oklch(0.65 0.18 25)";
  const borderColor = isGood
    ? "oklch(0.88 0.025 85 / 0.4)"
    : isMid
    ? "oklch(0.78 0.14 65 / 0.35)"
    : "oklch(0.65 0.18 25 / 0.35)";
  return (
    <span
      style={{
        fontFamily: FONT_MONO,
        fontSize: "0.6rem",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color,
        border: `0.5px solid ${borderColor}`,
        padding: "0.2rem 0.5rem",
      }}
    >
      {value}
    </span>
  );
}

function ViralityGauge({ score }: { score: number }) {
  const clamped = Math.max(1, Math.min(100, score));
  const color =
    clamped >= 70 ? IVORY : clamped >= 40 ? "oklch(0.78 0.14 65)" : "oklch(0.65 0.18 25)";
  const label =
    clamped >= 70 ? "High Potential" : clamped >= 40 ? "Moderate" : "Low Potential";
  const radius = 42;
  const circumference = Math.PI * radius;
  const progress = (clamped / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
      <div style={{ position: "relative", width: "112px", height: "64px", overflow: "hidden" }}>
        <svg width="112" height="64" viewBox="0 0 112 64" style={{ overflow: "visible" }}>
          <path d="M 14 56 A 42 42 0 0 1 98 56" fill="none" stroke={BORDER} strokeWidth="6" strokeLinecap="butt" />
          <path
            d="M 14 56 A 42 42 0 0 1 98 56"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="butt"
            strokeDasharray={`${progress} ${circumference}`}
            style={{ transition: "stroke-dasharray 0.8s ease" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: "2px",
          }}
        >
          <span style={{ fontFamily: FONT_MONO, fontSize: "1.6rem", fontWeight: 400, color, lineHeight: 1 }}>
            {clamped}
          </span>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontFamily: FONT_MONO, fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color }}>
          {label}
        </p>
        <p style={{ fontFamily: FONT_MONO, fontSize: "0.55rem", color: MUTED, letterSpacing: "0.1em", marginTop: "0.15rem" }}>
          Virality Score
        </p>
      </div>
    </div>
  );
}

export default function DraftRoast() {
  const [content, setContent] = useState("");
  const [subreddit, setSubreddit] = useState("");
  const [title, setTitle] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<"review" | "roast" | "improved">("review");

  const analyzeMutation = trpc.roast.analyze.useMutation({
    onSuccess: (data: AnalysisResult) => {
      setResult(data);
      setActiveTab("review");
      toast.success("Analysis complete!");
    },
    onError: (err: { message: string }) => {
      toast.error(err.message);
    },
  });

  const handleAnalyze = () => {
    if (!content.trim()) { toast.error("Please enter your post content"); return; }
    analyzeMutation.mutate({ content, subreddit: subreddit.trim() || "general" });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: SURFACE,
    border: `0.5px solid ${BORDER}`,
    color: FOREGROUND,
    fontFamily: "Inter, sans-serif",
    fontSize: "0.82rem",
    padding: "0.6rem 0.75rem",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h1
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
              fontWeight: 300,
              fontStyle: "italic",
              color: FOREGROUND,
              lineHeight: 1.1,
              marginBottom: "0.4rem",
            }}
          >
            Draft & Roast
          </h1>
          <p style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED }}>
            AI review · virality score · roast · improved version
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5px", alignItems: "start" }}>

          {/* Input panel */}
          <div style={{ border: `0.5px solid ${BORDER}`, background: SURFACE }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: `0.5px solid ${BORDER}` }}>
              <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: MUTED }}>
                Your Draft
              </p>
            </div>
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Subreddit */}
              <div>
                <label style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: "0.4rem" }}>
                  Subreddit (optional)
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: MUTED, fontSize: "0.82rem", fontFamily: FONT_MONO }}>r/</span>
                  <input
                    placeholder="SaaS"
                    value={subreddit}
                    onChange={(e) => setSubreddit(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: "2rem" }}
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: "0.4rem" }}>
                  Post title (optional)
                </label>
                <input
                  placeholder="My SaaS hit $1K MRR — here's what worked"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Content */}
              <div>
                <label style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: "0.4rem" }}>
                  Post or DM content
                </label>
                <textarea
                  placeholder="Paste your Reddit post or DM draft here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{ ...inputStyle, minHeight: "200px", resize: "vertical", lineHeight: 1.6 }}
                />
                <p style={{ fontFamily: FONT_MONO, fontSize: "0.55rem", color: MUTED, textAlign: "right", marginTop: "0.25rem", letterSpacing: "0.08em" }}>
                  {content.length} chars
                </p>
              </div>

              {/* Analyze button */}
              <button
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending || !content.trim()}
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  background: content.trim() && !analyzeMutation.isPending ? IVORY : SURFACE_RAISED,
                  border: `0.5px solid ${content.trim() && !analyzeMutation.isPending ? IVORY : BORDER}`,
                  color: content.trim() && !analyzeMutation.isPending ? BG : MUTED,
                  fontFamily: FONT_MONO,
                  fontSize: "0.65rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  cursor: analyzeMutation.isPending || !content.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  transition: "all 0.2s",
                }}
              >
                {analyzeMutation.isPending ? (
                  <><Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Analyzing...</>
                ) : (
                  <><Sparkles size={12} /> Analyze & Roast</>
                )}
              </button>
            </div>
          </div>

          {/* Results panel */}
          <div>
            {!result && !analyzeMutation.isPending && (
              <div
                style={{
                  border: `0.5px dashed ${BORDER}`,
                  background: SURFACE,
                  minHeight: "300px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: "0.75rem",
                  padding: "2rem",
                  textAlign: "center",
                }}
              >
                <Sparkles size={24} color={IVORY_DIM} />
                <p style={{ fontFamily: FONT_DISPLAY, fontSize: "1.1rem", fontStyle: "italic", color: MUTED }}>
                  AI analysis will appear here
                </p>
                <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", color: MUTED, letterSpacing: "0.1em" }}>
                  Paste your draft and click Analyze
                </p>
              </div>
            )}

            {analyzeMutation.isPending && (
              <div
                style={{
                  border: `0.5px solid ${BORDER}`,
                  background: SURFACE,
                  minHeight: "300px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <Loader2 size={24} color={IVORY_DIM} style={{ animation: "spin 1s linear infinite" }} />
                <p style={{ fontFamily: FONT_DISPLAY, fontSize: "1.1rem", fontStyle: "italic", color: MUTED }}>
                  Analyzing your draft...
                </p>
                <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", color: MUTED, letterSpacing: "0.1em" }}>
                  Roast incoming
                </p>
              </div>
            )}

            {result && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5px" }}>

                {/* Virality score card */}
                <div
                  style={{
                    border: `0.5px solid ${BORDER}`,
                    background: SURFACE,
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5rem",
                  }}
                >
                  <ViralityGauge score={activeTab === "improved" ? result.improved_virality.score : result.virality.score} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: IVORY, marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <TrendingUp size={10} />
                      {activeTab === "improved" ? "Improved Score" : "Virality Tip"}
                    </p>
                    <p style={{ fontSize: "0.78rem", color: FOREGROUND, lineHeight: 1.6 }}>
                      {activeTab === "improved" ? result.improved_virality.tip : result.virality.tip}
                    </p>
                    <p style={{ fontFamily: FONT_MONO, fontSize: "0.55rem", color: MUTED, marginTop: "0.4rem", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <Zap size={9} /> Apply the tip, then re-analyze for a higher score
                    </p>
                  </div>
                </div>

                {/* Tab bar */}
                <div
                  style={{
                    display: "flex",
                    border: `0.5px solid ${BORDER}`,
                    background: SURFACE,
                  }}
                >
                  {(["review", "roast", "improved"] as const).map((tab, i) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        flex: 1,
                        padding: "0.65rem",
                        background: activeTab === tab ? SURFACE_RAISED : "transparent",
                        border: "none",
                        borderRight: i < 2 ? `0.5px solid ${BORDER}` : "none",
                        color: activeTab === tab ? FOREGROUND : MUTED,
                        fontFamily: FONT_MONO,
                        fontSize: "0.58rem",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {tab === "review" ? "Review" : tab === "roast" ? "Roast" : "Improved"}
                    </button>
                  ))}
                </div>

                {/* Review tab */}
                {activeTab === "review" && (
                  <div style={{ border: `0.5px solid ${BORDER}`, background: SURFACE }}>
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: `0.5px solid ${BORDER}` }}>
                      <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: MUTED }}>
                        Post Review
                      </p>
                    </div>
                    <div style={{ padding: "1.25rem 1.5rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5px", marginBottom: "1.25rem", border: `0.5px solid ${BORDER}` }}>
                        {[
                          { label: "Clarity", value: result.review.clarity, type: "positive" as const },
                          { label: "Sub Fit", value: result.review.subreddit_fit, type: "positive" as const },
                          { label: "Promo Risk", value: result.review.promo_risk, type: "negative" as const },
                        ].map((item, i) => (
                          <div key={item.label} style={{ padding: "1rem", background: SURFACE_RAISED, borderRight: i < 2 ? `0.5px solid ${BORDER}` : "none", textAlign: "center" }}>
                            <p style={{ fontFamily: FONT_MONO, fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED, marginBottom: "0.5rem" }}>
                              {item.label}
                            </p>
                            <ScorePill value={item.value} type={item.type} />
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: "0.8rem", color: FOREGROUND, lineHeight: 1.7, marginBottom: "1rem" }}>
                        {result.review.explanation}
                      </p>
                      {result.review.promo_risk === "High" && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", padding: "0.75rem 1rem", border: "0.5px solid oklch(0.65 0.18 25 / 0.35)", background: "oklch(0.65 0.18 25 / 0.05)" }}>
                          <XCircle size={13} color="oklch(0.65 0.18 25)" style={{ flexShrink: 0, marginTop: "1px" }} />
                          <p style={{ fontSize: "0.75rem", color: "oklch(0.72 0.12 30)", lineHeight: 1.5 }}>
                            High promo risk — Reddit may remove this post. Consider the improved version.
                          </p>
                        </div>
                      )}
                      {result.review.promo_risk === "Low" && result.review.clarity === "High" && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", padding: "0.75rem 1rem", border: `0.5px solid oklch(0.88 0.025 85 / 0.25)`, background: "oklch(0.88 0.025 85 / 0.04)" }}>
                          <CheckCircle2 size={13} color={IVORY} style={{ flexShrink: 0, marginTop: "1px" }} />
                          <p style={{ fontSize: "0.75rem", color: IVORY, lineHeight: 1.5 }}>
                            Looks good — low promo risk and high clarity.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Roast tab */}
                {activeTab === "roast" && (
                  <div style={{ border: `0.5px solid ${BORDER}`, background: SURFACE }}>
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: `0.5px solid ${BORDER}`, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Flame size={13} color="oklch(0.72 0.18 45)" />
                      <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: MUTED }}>
                        The Roast
                      </p>
                    </div>
                    <div style={{ padding: "1.5rem" }}>
                      <div style={{ padding: "1.25rem", border: "0.5px solid oklch(0.72 0.18 45 / 0.25)", background: "oklch(0.72 0.18 45 / 0.04)", marginBottom: "0.75rem" }}>
                        <p style={{ fontFamily: FONT_DISPLAY, fontSize: "1rem", fontStyle: "italic", color: FOREGROUND, lineHeight: 1.7 }}>
                          "{result.roast}"
                        </p>
                      </div>
                      <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", color: MUTED, letterSpacing: "0.08em" }}>
                        This is what a Redditor might say. Take it seriously — they will.
                      </p>
                    </div>
                  </div>
                )}

                {/* Improved tab */}
                {activeTab === "improved" && (
                  <div style={{ border: `0.5px solid ${BORDER}`, background: SURFACE }}>
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: `0.5px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: MUTED }}>
                        Improved Draft
                      </p>
                      <button
                        onClick={() => copyToClipboard(`${result.improved_title}\n\n${result.improved_draft}`)}
                        style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontFamily: FONT_MONO, fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
                      >
                        <ClipboardCopy size={10} /> Copy all
                      </button>
                    </div>
                    <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div style={{ padding: "1rem", border: `0.5px solid oklch(0.88 0.025 85 / 0.25)`, background: "oklch(0.88 0.025 85 / 0.04)" }}>
                        <p style={{ fontFamily: FONT_MONO, fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase", color: IVORY, marginBottom: "0.4rem" }}>
                          Suggested Title
                        </p>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
                          <p style={{ fontSize: "0.85rem", color: FOREGROUND, lineHeight: 1.5, flex: 1 }}>{result.improved_title}</p>
                          <button onClick={() => copyToClipboard(result.improved_title)} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", flexShrink: 0 }}>
                            <ClipboardCopy size={12} />
                          </button>
                        </div>
                      </div>
                      <div style={{ padding: "1rem", border: `0.5px solid ${BORDER}`, background: SURFACE_RAISED }}>
                        <p style={{ fontSize: "0.8rem", color: FOREGROUND, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{result.improved_draft}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ready to Post */}
                <div style={{ border: `0.5px solid oklch(0.88 0.025 85 / 0.3)`, background: SURFACE }}>
                  <div style={{ padding: "1.25rem 1.5rem", borderBottom: `0.5px solid ${BORDER}`, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Rocket size={12} color={IVORY} />
                    <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: IVORY }}>
                      Ready to Post
                    </p>
                  </div>
                  <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.75rem 1rem", border: `0.5px solid oklch(0.88 0.025 85 / 0.2)`, background: "oklch(0.88 0.025 85 / 0.04)" }}>
                      <Sparkles size={12} color={IVORY_DIM} style={{ flexShrink: 0, marginTop: "2px" }} />
                      <div>
                        <p style={{ fontSize: "0.78rem", color: FOREGROUND, marginBottom: "0.2rem" }}>
                          AI recommends: <span style={{ color: IVORY }}>r/{result.recommended_subreddit}</span>
                        </p>
                        <p style={{ fontSize: "0.72rem", color: MUTED, lineHeight: 1.5 }}>{result.subreddit_reasoning}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${result.improved_title}\n\n${result.improved_draft}`);
                        window.open(`https://www.reddit.com/r/${result.recommended_subreddit}/submit`, "_blank");
                        toast.success(`Title + post copied! Opening r/${result.recommended_subreddit} to submit.`);
                      }}
                      style={{
                        width: "100%",
                        padding: "0.85rem",
                        background: IVORY,
                        border: `0.5px solid ${IVORY}`,
                        color: BG,
                        fontFamily: FONT_MONO,
                        fontSize: "0.65rem",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <ClipboardCopy size={12} /> Copy & Open r/{result.recommended_subreddit}
                    </button>
                    <p style={{ fontFamily: FONT_MONO, fontSize: "0.55rem", color: MUTED, textAlign: "center", letterSpacing: "0.08em" }}>
                      Copies your improved post to clipboard and opens the subreddit submission page
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

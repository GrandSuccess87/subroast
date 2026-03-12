import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useLocation } from "wouter";

type AnalysisResult = {
  review: {
    clarity: "High" | "Medium" | "Low";
    subreddit_fit: "High" | "Medium" | "Low";
    promo_risk: "Low" | "Medium" | "High";
    explanation: string;
  };
  virality: {
    score: number;
    tip: string;
  };
  roast: string;
  improved_draft: string;
  recommended_subreddit: string;
  subreddit_reasoning: string;
};

function ScoreBadge({ value, type }: { value: string; type: "positive" | "negative" }) {
  const isGood = type === "positive" ? value === "High" : value === "Low";
  const isMid = value === "Medium";
  const color = isGood
    ? "bg-primary/15 text-primary border-primary/20"
    : isMid
    ? "bg-amber-400/15 text-amber-400 border-amber-400/20"
    : "bg-red-400/15 text-red-400 border-red-400/20";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${color}`}>
      {value}
    </span>
  );
}

function ViralityGauge({ score }: { score: number }) {
  const clampedScore = Math.max(1, Math.min(100, score));
  const color =
    clampedScore >= 70
      ? "#10b981" // green
      : clampedScore >= 40
      ? "#f59e0b" // amber
      : "#ef4444"; // red

  const label =
    clampedScore >= 70 ? "High Viral Potential" : clampedScore >= 40 ? "Moderate Potential" : "Low Potential";

  // SVG arc gauge
  const radius = 42;
  const circumference = Math.PI * radius; // half circle
  const progress = (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-16 overflow-hidden">
        <svg width="112" height="64" viewBox="0 0 112 64" className="overflow-visible">
          {/* Background arc */}
          <path
            d="M 14 56 A 42 42 0 0 1 98 56"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d="M 14 56 A 42 42 0 0 1 98 56"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            style={{ transition: "stroke-dasharray 0.8s ease" }}
          />
        </svg>
        {/* Score number centered */}
        <div className="absolute inset-0 flex items-end justify-center pb-0">
          <span className="text-2xl font-black" style={{ color }}>
            {clampedScore}
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color }}>
          {label}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Virality Score</p>
      </div>
    </div>
  );
}

// PostNowResult type — kept for when Reddit API is re-enabled (see REDDIT_INTEGRATION.md)
// type PostNowResult = { action: "posted" | "scheduled"; postUrl: string | null; scheduledAt: number | null; reasoning: string; message: string };

export default function DraftRoast() {
  const [, setLocation] = useLocation();
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

  // COMMENTED OUT: Post at Optimal Time + handlePostNow — requires Reddit API approval
  // Re-enable when Reddit API is approved. See REDDIT_INTEGRATION.md for full details.
  // const postNowMutation = trpc.schedule.postNow.useMutation({ ... });
  // const handlePostNow = () => { ... };

  const handleAnalyze = () => {
    if (!content.trim()) {
      toast.error("Please enter your post content");
      return;
    }
    analyzeMutation.mutate({ content, subreddit: subreddit.trim() || "general" });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Draft & Roast</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-10.5">
            Paste your Reddit post or DM draft — get an AI review, virality score, roast, and improved version.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Input panel */}
          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground">Your draft</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Subreddit (optional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">r/</span>
                    <Input
                      placeholder="SaaS"
                      value={subreddit}
                      onChange={(e) => setSubreddit(e.target.value)}
                      className="pl-7 bg-muted/40 border-border text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Post title (for posting — optional if using first line)</Label>
                  <Input
                    placeholder="My SaaS hit $1K MRR — here's what worked"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-muted/40 border-border text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Post or DM content</Label>
                  <Textarea
                    placeholder="Paste your Reddit post or DM draft here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[220px] resize-none bg-muted/40 border-border text-foreground placeholder:text-muted-foreground/50 text-sm leading-relaxed"
                  />
                  <p className="text-xs text-muted-foreground text-right">{content.length} chars</p>
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzeMutation.isPending || !content.trim()}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze & Roast
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* POST AT OPTIMAL TIME — commented out, requires Reddit API approval (see REDDIT_INTEGRATION.md) */}
          </div>

          {/* Results panel */}
          <div>
            {!result && !analyzeMutation.isPending && (
              <div className="h-full flex items-center justify-center rounded-xl border border-dashed border-border bg-card/50 min-h-[300px]">
                <div className="text-center px-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-primary/60" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">AI analysis will appear here</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Paste your draft and click Analyze</p>
                </div>
              </div>
            )}

            {analyzeMutation.isPending && (
              <div className="h-full flex items-center justify-center rounded-xl border border-border bg-card min-h-[300px]">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Analyzing your draft...</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Roasting incoming 🔥</p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-3">
                {/* Virality Score — always visible at top */}
                <Card className="bg-card border-border overflow-hidden">
                  <div className="flex items-center gap-4 p-4">
                    <ViralityGauge score={result.virality.score} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-primary" />
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Virality Tip</p>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{result.virality.tip}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <p className="text-[10px] text-muted-foreground/70">Apply the tip, then re-analyze for a higher score</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Tab buttons */}
                <div className="flex gap-1 p-1 rounded-lg bg-muted/40 border border-border">
                  {(["review", "roast", "improved"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all capitalize ${
                        activeTab === tab
                          ? "bg-card text-foreground shadow-sm border border-border"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab === "review" ? "📊 Review" : tab === "roast" ? "🔥 Roast" : "✨ Improved"}
                    </button>
                  ))}
                </div>

                {/* Review tab */}
                {activeTab === "review" && (
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold">Post Review</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 rounded-lg bg-muted/40 border border-border">
                          <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wide">Clarity</p>
                          <ScoreBadge value={result.review.clarity} type="positive" />
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/40 border border-border">
                          <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wide">Sub Fit</p>
                          <ScoreBadge value={result.review.subreddit_fit} type="positive" />
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/40 border border-border">
                          <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wide">Promo Risk</p>
                          <ScoreBadge value={result.review.promo_risk} type="negative" />
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30 border border-border">
                        <p className="text-xs text-foreground/80 leading-relaxed">{result.review.explanation}</p>
                      </div>
                      {result.review.promo_risk === "High" && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-400/5 border border-red-400/20">
                          <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-red-300/80">High promo risk — Reddit may remove this post. Consider the improved version.</p>
                        </div>
                      )}
                      {result.review.promo_risk === "Low" && result.review.clarity === "High" && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <p className="text-xs text-primary/80">Looks good! Low promo risk and high clarity.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Roast tab */}
                {activeTab === "roast" && (
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <CardTitle className="text-sm font-semibold">The Roast</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 rounded-lg bg-orange-400/5 border border-orange-400/20">
                        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line italic">
                          "{result.roast}"
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        This is what a Redditor might say. Take it seriously — they will.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Improved tab */}
                {activeTab === "improved" && (
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">Improved Draft</CardTitle>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(result.improved_draft)}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <ClipboardCopy className="w-3.5 h-3.5 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                          {result.improved_draft}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ── Ready to Post panel ── */}
                <Card className="bg-card border-primary/20 border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Rocket className="w-4 h-4 text-primary" />
                      Ready to Post
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/15">
                      <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-foreground">AI recommends:</span>
                          <span className="text-xs font-bold text-primary">r/{result.recommended_subreddit}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{result.subreddit_reasoning}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/20 border border-border">
                      <p className="text-xs text-muted-foreground mb-1 font-medium">Post content (improved draft)</p>
                      <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3 whitespace-pre-wrap">
                        {result.improved_draft}
                      </p>
                    </div>
                    <Button
                      className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => {
                        const sub = result.recommended_subreddit;
                        navigator.clipboard.writeText(result.improved_draft);
                        window.open(`https://www.reddit.com/r/${sub}/submit`, "_blank");
                        toast.success(`Post copied! Opening r/${sub} to submit.`);
                      }}
                    >
                      <ClipboardCopy className="w-4 h-4" />
                      Copy & Open r/{result.recommended_subreddit}
                    </Button>
                    <p className="text-[10px] text-muted-foreground text-center">
                      Copies your improved post to clipboard and opens the subreddit submission page
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

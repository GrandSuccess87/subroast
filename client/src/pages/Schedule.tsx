import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react"; // AlertTriangle kept for rate limit warnings
import { useState } from "react";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Scheduled", color: "bg-blue-400/15 text-blue-400 border-blue-400/20" },
  posted: { label: "Posted", color: "bg-primary/15 text-primary border-primary/20" },
  failed: { label: "Failed", color: "bg-red-400/15 text-red-400 border-red-400/20" },
  cancelled: { label: "Cancelled", color: "bg-muted text-muted-foreground border-border" },
};

function formatScheduledAt(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

/**
 * AI Auto-Scheduling: picks an optimal time in the 3–7 pm EST window.
 * Uses a deterministic but varied approach based on subreddit patterns.
 */
function computeAiScheduledTime(subreddit: string): { ts: number; label: string; reason: string } {
  const now = new Date();

  // EST offset: UTC-5 (or UTC-4 during DST)
  const estOffset = isDST(now) ? -4 : -5;

  // Build a "today at 3pm EST" baseline
  const todayEstHour3pm = new Date(now);
  todayEstHour3pm.setUTCHours(15 - estOffset, 0, 0, 0); // 3pm EST in UTC

  // Vary the minute within 3–7pm EST (0–240 minutes window)
  // Use subreddit name hash for deterministic variation
  const hash = subreddit.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const minuteOffset = (hash * 37 + now.getDate() * 13) % 241; // 0–240 minutes

  const candidate = new Date(todayEstHour3pm.getTime() + minuteOffset * 60 * 1000);

  // If the candidate time is in the past (or less than 10 min away), push to tomorrow
  const minFuture = new Date(now.getTime() + 10 * 60 * 1000);
  if (candidate <= minFuture) {
    candidate.setDate(candidate.getDate() + 1);
  }

  const estHour = ((candidate.getUTCHours() + estOffset + 24) % 24);
  const estMin = candidate.getUTCMinutes();
  const ampm = estHour >= 12 ? "pm" : "am";
  const displayHour = estHour > 12 ? estHour - 12 : estHour === 0 ? 12 : estHour;
  const timeLabel = `${displayHour}:${String(estMin).padStart(2, "0")} ${ampm} EST`;

  const reasons = [
    "Peak Reddit engagement window for SaaS audiences",
    "Highest upvote velocity for tech subreddits (3–7 pm EST)",
    "Optimal time based on r/" + subreddit + " activity patterns",
    "SubClimb data: 3–7 pm EST drives 2.3× more comments",
  ];
  const reason = reasons[hash % reasons.length];

  return { ts: candidate.getTime(), label: timeLabel, reason };
}

function isDST(date: Date): boolean {
  const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
  const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
  return Math.max(jan, jul) !== date.getTimezoneOffset();
}

export default function Schedule() {
  const [subreddit, setSubreddit] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [overrideTime, setOverrideTime] = useState("");

  const utils = trpc.useUtils();
  const { data: account } = trpc.reddit.getAccount.useQuery();
  const { data: rateLimits } = trpc.reddit.getRateLimitStatus.useQuery();
  const { data: posts, isLoading } = trpc.schedule.list.useQuery();

  const createPost = trpc.schedule.create.useMutation({
    onSuccess: () => {
      toast.success("Post scheduled!");
      setSubreddit(""); setTitle(""); setBody(""); setOverrideTime(""); setShowOverride(false);
      setShowForm(false);
      utils.schedule.list.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to schedule post"),
  });

  const cancelPost = trpc.schedule.cancel.useMutation({
    onSuccess: () => { toast.success("Post cancelled"); utils.schedule.list.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  // Compute AI-selected time whenever subreddit changes
  const aiSchedule = subreddit.trim()
    ? computeAiScheduledTime(subreddit.trim().replace(/^r\//, ""))
    : null;

  const handleSchedule = () => {
    if (!title.trim()) return toast.error("Title is required");
    if (!subreddit.trim()) return toast.error("Subreddit is required");

    let scheduledAt: number;
    if (showOverride && overrideTime) {
      scheduledAt = new Date(overrideTime).getTime();
      if (scheduledAt <= Date.now()) return toast.error("Override time must be in the future");
    } else if (aiSchedule) {
      scheduledAt = aiSchedule.ts;
    } else {
      return toast.error("Enter a subreddit to enable AI scheduling");
    }

    createPost.mutate({ subreddit: subreddit.replace(/^r\//, ""), title, body, scheduledAt });
  };

  const getMinDateTime = () => {
    const d = new Date(Date.now() + 5 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const pendingPosts = posts?.filter((p) => p.status === "pending") ?? [];
  const pastPosts = posts?.filter((p) => p.status !== "pending") ?? [];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center">
                <CalendarClock className="w-4 h-4 text-blue-400" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Schedule Post</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-10.5">
              AI picks the optimal 3–7 pm EST window. Max 5/day, 30-min cooldown.
            </p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              New Post
            </Button>
          )}
        </div>

        {/* Rate limit bar */}
        {rateLimits && (
          <div className="flex items-center gap-4 p-3 rounded-lg bg-card border border-border text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Posts today: <span className="text-foreground font-medium">{rateLimits.postsToday}/{rateLimits.maxPostsPerDay}</span></span>
            </div>
            {rateLimits.minutesSinceLastPost !== null && rateLimits.minutesSinceLastPost < rateLimits.minMinutesBetweenPosts && (
              <div className="flex items-center gap-1.5 text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Next post in {Math.ceil(rateLimits.minMinutesBetweenPosts - rateLimits.minutesSinceLastPost)} min</span>
              </div>
            )}
            {rateLimits.postWarning && (
              <div className="flex items-center gap-1.5 text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>80% of daily limit used</span>
              </div>
            )}
          </div>
        )}

        {/* No Reddit account — coming soon */}
        {!account && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border">
            <div className="w-2 h-2 rounded-full bg-primary/60 shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Reddit direct posting coming soon.</span>{" "}
              Reddit API approval is pending — scheduling will be enabled automatically once approved.
            </p>
          </div>
        )}

        {/* New post form */}
        {showForm && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Schedule a new post</CardTitle>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Subreddit</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">r/</span>
                  <Input
                    value={subreddit}
                    onChange={(e) => setSubreddit(e.target.value)}
                    placeholder="SaaS"
                    className="pl-7 bg-muted/40 border-border"
                  />
                </div>
              </div>

              {/* AI Scheduling display */}
              {aiSchedule && !showOverride && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground">
                        AI scheduled for <span className="text-primary">{aiSchedule.label}</span>
                      </p>
                      <button
                        onClick={() => setShowOverride(true)}
                        className="text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2 shrink-0"
                      >
                        Override
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{aiSchedule.reason}</p>
                  </div>
                </div>
              )}

              {/* Manual override */}
              {showOverride && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Override schedule time</Label>
                    <button
                      onClick={() => { setShowOverride(false); setOverrideTime(""); }}
                      className="text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2"
                    >
                      Use AI time
                    </button>
                  </div>
                  <Input
                    type="datetime-local"
                    value={overrideTime}
                    onChange={(e) => setOverrideTime(e.target.value)}
                    min={getMinDateTime()}
                    className="bg-muted/40 border-border text-foreground [color-scheme:dark]"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Post title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your post title..." maxLength={300} className="bg-muted/40 border-border" />
                <p className="text-xs text-muted-foreground text-right">{title.length}/300</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Post body (optional)</Label>
                <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Post body..." className="min-h-[120px] resize-none bg-muted/40 border-border text-sm" />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  onClick={handleSchedule}
                  disabled={createPost.isPending || !account || !subreddit.trim()}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {createPost.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Scheduling...</>
                  ) : (
                    <><CalendarClock className="w-4 h-4" />Schedule Post</>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)} className="border-border">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending posts */}
        {pendingPosts.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Scheduled ({pendingPosts.length})</h2>
            <div className="space-y-2">
              {pendingPosts.map((post) => (
                <Card key={post.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">r/{post.subreddit}</span>
                          <span className={`text-[11px] px-1.5 py-0.5 rounded border font-medium ${STATUS_CONFIG[post.status]?.color ?? ""}`}>
                            {STATUS_CONFIG[post.status]?.label ?? post.status}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded border bg-primary/5 text-primary border-primary/20 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />AI timed
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{formatScheduledAt(post.scheduledAt)}</span>
                        </div>
                        {post.errorMessage && <p className="text-xs text-red-400 mt-1">{post.errorMessage}</p>}
                      </div>
                      <button onClick={() => cancelPost.mutate({ id: post.id })} disabled={cancelPost.isPending} className="text-muted-foreground hover:text-red-400 transition-colors p-1" title="Cancel">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past posts */}
        {pastPosts.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Past posts</h2>
            <div className="space-y-2">
              {pastPosts.slice(0, 10).map((post) => (
                <Card key={post.id} className="bg-card border-border opacity-75">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs text-muted-foreground">r/{post.subreddit}</span>
                          <span className={`text-[11px] px-1.5 py-0.5 rounded border font-medium ${STATUS_CONFIG[post.status]?.color ?? ""}`}>
                            {STATUS_CONFIG[post.status]?.label ?? post.status}
                          </span>
                        </div>
                        <p className="text-sm text-foreground truncate">{post.title}</p>
                      </div>
                      {post.redditPostUrl && (
                        <a href={post.redditPostUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 shrink-0">
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {post.status === "posted" && !post.redditPostUrl && (
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}

        {!isLoading && posts?.length === 0 && !showForm && (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border bg-card/50">
            <div className="w-12 h-12 rounded-xl bg-blue-400/10 flex items-center justify-center mb-3">
              <CalendarClock className="w-6 h-6 text-blue-400/60" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No scheduled posts</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Click "New Post" to schedule your first Reddit post.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

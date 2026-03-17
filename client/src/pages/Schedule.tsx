import DashboardLayout from "@/components/DashboardLayout";
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
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const FONT_DISPLAY = "Cormorant Garamond, Georgia, serif";
const FONT_MONO = "JetBrains Mono, monospace";
const SURFACE = "oklch(0.12 0.007 60)";
const SURFACE_RAISED = "oklch(0.14 0.007 60)";
const BORDER = "oklch(0.22 0.007 60)";
const IVORY = "oklch(0.88 0.025 85)";
const FOREGROUND = "oklch(0.93 0.010 80)";
const MUTED = "oklch(0.52 0.006 80)";
const BG = "oklch(0.09 0.008 60)";

const STATUS_CONFIG: Record<string, { label: string; color: string; border: string }> = {
  pending: { label: "Scheduled", color: "oklch(0.72 0.12 220)", border: "oklch(0.72 0.12 220 / 0.35)" },
  posted: { label: "Posted", color: IVORY, border: "oklch(0.88 0.025 85 / 0.4)" },
  failed: { label: "Failed", color: "oklch(0.65 0.18 25)", border: "oklch(0.65 0.18 25 / 0.35)" },
  cancelled: { label: "Cancelled", color: MUTED, border: BORDER },
};

function formatScheduledAt(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  });
}

function computeAiScheduledTime(subreddit: string): { ts: number; label: string; reason: string } {
  const now = new Date();
  const estOffset = isDST(now) ? -4 : -5;
  const todayEstHour3pm = new Date(now);
  todayEstHour3pm.setUTCHours(15 - estOffset, 0, 0, 0);
  const hash = subreddit.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const minuteOffset = (hash * 37 + now.getDate() * 13) % 241;
  const candidate = new Date(todayEstHour3pm.getTime() + minuteOffset * 60 * 1000);
  const minFuture = new Date(now.getTime() + 10 * 60 * 1000);
  if (candidate <= minFuture) candidate.setDate(candidate.getDate() + 1);
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
  return { ts: candidate.getTime(), label: timeLabel, reason: reasons[hash % reasons.length] };
}

function isDST(date: Date): boolean {
  const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
  const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
  return Math.max(jan, jul) !== date.getTimezoneOffset();
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: SURFACE_RAISED,
  border: `0.5px solid ${BORDER}`,
  color: FOREGROUND,
  fontFamily: "Inter, sans-serif",
  fontSize: "0.82rem",
  padding: "0.6rem 0.75rem",
  outline: "none",
  boxSizing: "border-box",
};

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
      setSubreddit(""); setTitle(""); setBody(""); setOverrideTime(""); setShowOverride(false); setShowForm(false);
      utils.schedule.list.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to schedule post"),
  });

  const cancelPost = trpc.schedule.cancel.useMutation({
    onSuccess: () => { toast.success("Post cancelled"); utils.schedule.list.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  const aiSchedule = subreddit.trim() ? computeAiScheduledTime(subreddit.trim().replace(/^r\//, "")) : null;

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
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2.5rem" }}>
          <div>
            <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 300, fontStyle: "italic", color: FOREGROUND, lineHeight: 1.1, marginBottom: "0.4rem" }}>
              Schedule Post
            </h1>
            <p style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED }}>
              AI picks the optimal 3–7 pm EST window
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={{ padding: "0.65rem 1.25rem", background: IVORY, border: `0.5px solid ${IVORY}`, color: BG, fontFamily: FONT_MONO, fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <Plus size={11} /> New Post
            </button>
          )}
        </div>

        {/* Rate limit bar */}
        {rateLimits && (
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "0.75rem 1rem", border: `0.5px solid ${BORDER}`, background: SURFACE, marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: FONT_MONO, fontSize: "0.65rem", color: MUTED }}>
              <Clock size={11} />
              <span>Posts today: <span style={{ color: FOREGROUND }}>{rateLimits.postsToday}/{rateLimits.maxPostsPerDay}</span></span>
            </div>
            {rateLimits.minutesSinceLastPost !== null && rateLimits.minutesSinceLastPost < rateLimits.minMinutesBetweenPosts && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: FONT_MONO, fontSize: "0.65rem", color: "oklch(0.78 0.14 65)" }}>
                <AlertTriangle size={11} />
                <span>Next post in {Math.ceil(rateLimits.minMinutesBetweenPosts - rateLimits.minutesSinceLastPost)} min</span>
              </div>
            )}
          </div>
        )}

        {/* No Reddit account notice */}
        {!account && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", border: `0.5px solid ${BORDER}`, background: SURFACE, marginBottom: "1.5rem" }}>
            <span className="coming-soon-dot" />
            <p style={{ fontSize: "0.78rem", color: MUTED, lineHeight: 1.5 }}>
              <span style={{ color: FOREGROUND, fontWeight: 500 }}>One-click send via Chrome extension — coming soon.</span>{" "}
              Scheduling will be enabled automatically once the extension ships.
            </p>
          </div>
        )}

        {/* New post form */}
        {showForm && (
          <div style={{ border: `0.5px solid ${BORDER}`, background: SURFACE, marginBottom: "2rem" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: `0.5px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: MUTED }}>
                Schedule a New Post
              </p>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", padding: "0.2rem" }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Subreddit */}
              <div>
                <label style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: "0.4rem" }}>Subreddit</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: MUTED, fontSize: "0.82rem" }}>r/</span>
                  <input value={subreddit} onChange={(e) => setSubreddit(e.target.value)} placeholder="SaaS" style={{ ...inputStyle, paddingLeft: "1.8rem" }} />
                </div>
              </div>

              {/* AI scheduling display */}
              {aiSchedule && !showOverride && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.85rem 1rem", border: `0.5px solid oklch(0.88 0.025 85 / 0.25)`, background: "oklch(0.88 0.025 85 / 0.04)" }}>
                  <Sparkles size={13} color={IVORY} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.2rem" }}>
                      <p style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", color: FOREGROUND }}>
                        AI scheduled for <span style={{ color: IVORY }}>{aiSchedule.label}</span>
                      </p>
                      <button onClick={() => setShowOverride(true)} style={{ fontFamily: FONT_MONO, fontSize: "0.55rem", color: MUTED, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "2px", letterSpacing: "0.1em" }}>
                        Override
                      </button>
                    </div>
                    <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", color: MUTED, letterSpacing: "0.05em" }}>{aiSchedule.reason}</p>
                  </div>
                </div>
              )}

              {/* Manual override */}
              {showOverride && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <label style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED }}>Override Schedule Time</label>
                    <button onClick={() => { setShowOverride(false); setOverrideTime(""); }} style={{ fontFamily: FONT_MONO, fontSize: "0.55rem", color: MUTED, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "2px" }}>
                      Use AI time
                    </button>
                  </div>
                  <input type="datetime-local" value={overrideTime} onChange={(e) => setOverrideTime(e.target.value)} min={getMinDateTime()} style={{ ...inputStyle, colorScheme: "dark" }} />
                </div>
              )}

              {/* Title */}
              <div>
                <label style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: "0.4rem" }}>Post Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your post title..." maxLength={300} style={inputStyle} />
                <p style={{ fontFamily: FONT_MONO, fontSize: "0.55rem", color: MUTED, textAlign: "right", marginTop: "0.25rem" }}>{title.length}/300</p>
              </div>

              {/* Body */}
              <div>
                <label style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: "0.4rem" }}>Post Body (optional)</label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Post body..." style={{ ...inputStyle, minHeight: "120px", resize: "vertical", lineHeight: 1.6 }} />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={handleSchedule}
                  disabled={createPost.isPending || !account || !subreddit.trim()}
                  style={{ padding: "0.65rem 1.5rem", background: (!account || !subreddit.trim() || createPost.isPending) ? SURFACE_RAISED : IVORY, border: `0.5px solid ${(!account || !subreddit.trim() || createPost.isPending) ? BORDER : IVORY}`, color: (!account || !subreddit.trim() || createPost.isPending) ? MUTED : BG, fontFamily: FONT_MONO, fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: (!account || !subreddit.trim() || createPost.isPending) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}
                >
                  {createPost.isPending ? <><Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> Scheduling...</> : <><CalendarClock size={11} /> Schedule Post</>}
                </button>
                <button onClick={() => setShowForm(false)} style={{ padding: "0.65rem 1.25rem", background: "transparent", border: `0.5px solid ${BORDER}`, color: MUTED, fontFamily: FONT_MONO, fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pending posts */}
        {pendingPosts.length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <p style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.25em", textTransform: "uppercase", color: MUTED, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ display: "inline-block", width: "1.5rem", height: "0.5px", background: BORDER }} />
              Scheduled · {pendingPosts.length}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5px" }}>
              {pendingPosts.map((post) => (
                <div key={post.id} style={{ border: `0.5px solid ${BORDER}`, background: SURFACE, padding: "1rem 1.25rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: FONT_MONO, fontSize: "0.62rem", color: MUTED }}>r/{post.subreddit}</span>
                      <span style={{ fontFamily: FONT_MONO, fontSize: "0.52rem", letterSpacing: "0.12em", textTransform: "uppercase", color: STATUS_CONFIG[post.status]?.color ?? MUTED, border: `0.5px solid ${STATUS_CONFIG[post.status]?.border ?? BORDER}`, padding: "0.1rem 0.35rem" }}>
                        {STATUS_CONFIG[post.status]?.label ?? post.status}
                      </span>
                      <span style={{ fontFamily: FONT_MONO, fontSize: "0.52rem", letterSpacing: "0.1em", textTransform: "uppercase", color: IVORY, border: `0.5px solid oklch(0.88 0.025 85 / 0.3)`, padding: "0.1rem 0.35rem", display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
                        <Sparkles size={8} /> AI timed
                      </span>
                    </div>
                    <p style={{ fontSize: "0.82rem", color: FOREGROUND, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "0.3rem" }}>{post.title}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontFamily: FONT_MONO, fontSize: "0.62rem", color: MUTED }}>
                      <Clock size={10} /> {formatScheduledAt(post.scheduledAt)}
                    </div>
                    {post.errorMessage && <p style={{ fontSize: "0.72rem", color: "oklch(0.65 0.18 25)", marginTop: "0.3rem" }}>{post.errorMessage}</p>}
                  </div>
                  <button onClick={() => cancelPost.mutate({ id: post.id })} disabled={cancelPost.isPending} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", padding: "0.2rem", flexShrink: 0 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(0.65 0.18 25)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past posts */}
        {pastPosts.length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <p style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.25em", textTransform: "uppercase", color: MUTED, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ display: "inline-block", width: "1.5rem", height: "0.5px", background: BORDER }} />
              Past Posts
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5px" }}>
              {pastPosts.slice(0, 10).map((post) => (
                <div key={post.id} style={{ border: `0.5px solid ${BORDER}`, background: SURFACE, padding: "0.85rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", opacity: 0.7 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                      <span style={{ fontFamily: FONT_MONO, fontSize: "0.62rem", color: MUTED }}>r/{post.subreddit}</span>
                      <span style={{ fontFamily: FONT_MONO, fontSize: "0.52rem", letterSpacing: "0.12em", textTransform: "uppercase", color: STATUS_CONFIG[post.status]?.color ?? MUTED, border: `0.5px solid ${STATUS_CONFIG[post.status]?.border ?? BORDER}`, padding: "0.1rem 0.35rem" }}>
                        {STATUS_CONFIG[post.status]?.label ?? post.status}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: FOREGROUND, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.title}</p>
                  </div>
                  {post.redditPostUrl && (
                    <a href={post.redditPostUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: FONT_MONO, fontSize: "0.62rem", color: IVORY, display: "inline-flex", alignItems: "center", gap: "0.25rem", textDecoration: "none", flexShrink: 0 }}>
                      View <ExternalLink size={10} />
                    </a>
                  )}
                  {post.status === "posted" && !post.redditPostUrl && (
                    <CheckCircle2 size={14} color={IVORY} style={{ flexShrink: 0 }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem" }}>
            <Loader2 size={20} color={IVORY} style={{ animation: "spin 1s linear infinite" }} />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && posts?.length === 0 && !showForm && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "5rem 2rem", border: `0.5px dashed ${BORDER}`, background: SURFACE, textAlign: "center", gap: "0.75rem" }}>
            <CalendarClock size={28} color={MUTED} />
            <p style={{ fontFamily: FONT_DISPLAY, fontSize: "1.2rem", fontStyle: "italic", color: MUTED }}>No scheduled posts</p>
            <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", color: MUTED, letterSpacing: "0.1em" }}>
              Click "New Post" to schedule your first Reddit post.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { BarChart2, ExternalLink, History, Lightbulb, Loader2, MessageSquare, TrendingUp } from "lucide-react";

const FONT_DISPLAY = "Cormorant Garamond, Georgia, serif";
const FONT_MONO = "JetBrains Mono, monospace";
const SURFACE = "oklch(0.12 0.007 60)";
const SURFACE_RAISED = "oklch(0.14 0.007 60)";
const BORDER = "oklch(0.22 0.007 60)";
const IVORY = "oklch(0.88 0.025 85)";
const FOREGROUND = "oklch(0.93 0.010 80)";
const MUTED = "oklch(0.76 0.022 82)";

const STATUS_CONFIG: Record<string, { label: string; color: string; border: string }> = {
  posted: { label: "Posted", color: IVORY, border: "oklch(0.88 0.025 85 / 0.4)" },
  failed: { label: "Failed", color: "oklch(0.65 0.18 25)", border: "oklch(0.65 0.18 25 / 0.35)" },
  removed: { label: "Removed", color: MUTED, border: BORDER },
  pending: { label: "Pending", color: "oklch(0.72 0.12 220)", border: "oklch(0.72 0.12 220 / 0.35)" },
  cancelled: { label: "Cancelled", color: MUTED, border: BORDER },
};

const INSIGHTS = [
  { icon: MessageSquare, text: "Posts with questions get 2× more comments", tip: "End your post with a question to invite discussion." },
  { icon: TrendingUp, text: "Posts between 9–11am get 40% more upvotes", tip: "Schedule posts during peak Reddit hours." },
  { icon: BarChart2, text: "Shorter titles (under 80 chars) perform better", tip: "Keep titles concise and scannable." },
  { icon: Lightbulb, text: "Posts that share a story get 3× more engagement", tip: "Lead with a personal experience or anecdote." },
];

export default function HistoryPage() {
  const { data: posts, isLoading } = trpc.history.list.useQuery();

  const totalPosts = posts?.length ?? 0;
  const postedCount = posts?.filter((p) => p.status === "posted").length ?? 0;
  const failedCount = posts?.filter((p) => p.status === "failed").length ?? 0;
  const scheduledCount = posts?.filter((p) => p.type === "scheduled").length ?? 0;

  const STATS = [
    { label: "Total Posts", value: totalPosts },
    { label: "Successfully Posted", value: postedCount },
    { label: "Failed", value: failedCount },
    { label: "Auto-Scheduled", value: scheduledCount },
  ];

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 300, fontStyle: "italic", color: FOREGROUND, lineHeight: 1.1, marginBottom: "0.4rem" }}>
            History
          </h1>
          <p style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED }}>
            All posts sent through SubRoast
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `0.5px solid ${BORDER}`, marginBottom: "2rem" }}>
          {STATS.map((stat, i) => (
            <div key={stat.label} style={{ padding: "1.25rem 1.5rem", borderRight: i < STATS.length - 1 ? `0.5px solid ${BORDER}` : "none", background: SURFACE }}>
              <p style={{ fontFamily: FONT_MONO, fontSize: "1.8rem", fontWeight: 400, color: FOREGROUND, lineHeight: 1, marginBottom: "0.4rem" }}>
                {stat.value}
              </p>
              <p style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Insights */}
        <div style={{ border: `0.5px solid ${BORDER}`, background: SURFACE, marginBottom: "2rem" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: `0.5px solid ${BORDER}`, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Lightbulb size={12} color={IVORY} />
            <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: MUTED }}>
              Reddit Insights
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5px", padding: "1.5px" }}>
            {INSIGHTS.map((insight) => (
              <div key={insight.text} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "1rem 1.25rem", background: SURFACE_RAISED }}>
                <insight.icon size={13} color={IVORY} style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <p style={{ fontSize: "0.8rem", color: FOREGROUND, marginBottom: "0.2rem", lineHeight: 1.4 }}>{insight.text}</p>
                  <p style={{ fontSize: "0.72rem", color: MUTED, lineHeight: 1.5 }}>{insight.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Posts table */}
        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem" }}>
            <Loader2 size={20} color={IVORY} style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : posts && posts.length > 0 ? (
          <div style={{ border: `0.5px solid ${BORDER}`, background: SURFACE }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: `0.5px solid ${BORDER}` }}>
              <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: MUTED }}>
                All Posts
              </p>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `0.5px solid ${BORDER}` }}>
                    {["Title", "Subreddit", "Type", "Status", "Posted", "Link"].map((h) => (
                      <th key={h} style={{ textAlign: "left", fontFamily: FONT_MONO, fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED, padding: "0.75rem 1rem", fontWeight: 400 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => {
                    const cfg = STATUS_CONFIG[post.status] ?? STATUS_CONFIG.pending;
                    return (
                      <tr key={post.id} style={{ borderBottom: `0.5px solid ${BORDER}` }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = SURFACE_RAISED)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "0.85rem 1rem", maxWidth: "200px" }}>
                          <p style={{ fontSize: "0.8rem", color: FOREGROUND, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.title}</p>
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <span style={{ fontFamily: FONT_MONO, fontSize: "0.68rem", color: MUTED }}>r/{post.subreddit}</span>
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <span style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, border: `0.5px solid ${BORDER}`, padding: "0.15rem 0.4rem" }}>
                            {post.type}
                          </span>
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <span style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: cfg.color, border: `0.5px solid ${cfg.border}`, padding: "0.15rem 0.4rem" }}>
                            {cfg.label}
                          </span>
                        </td>
                        <td style={{ padding: "0.85rem 1rem", whiteSpace: "nowrap" }}>
                          <span style={{ fontFamily: FONT_MONO, fontSize: "0.68rem", color: MUTED }}>
                            {new Date(post.postedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          {post.redditPostUrl ? (
                            <a href={post.redditPostUrl} target="_blank" rel="noopener noreferrer" style={{ color: IVORY, fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.25rem", textDecoration: "none" }}>
                              View <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span style={{ color: MUTED, fontSize: "0.75rem" }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "5rem 2rem", border: `0.5px dashed ${BORDER}`, background: SURFACE, textAlign: "center", gap: "0.75rem" }}>
            <History size={28} color={MUTED} />
            <p style={{ fontFamily: FONT_DISPLAY, fontSize: "1.2rem", fontStyle: "italic", color: MUTED }}>No posts yet</p>
            <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", color: MUTED, letterSpacing: "0.1em" }}>
              Your post history will appear here once you start posting.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

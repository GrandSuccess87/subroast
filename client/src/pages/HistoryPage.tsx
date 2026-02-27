import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  BarChart2,
  ExternalLink,
  History,
  Lightbulb,
  Loader2,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  posted: { label: "Posted", color: "bg-primary/15 text-primary border-primary/20" },
  failed: { label: "Failed", color: "bg-red-400/15 text-red-400 border-red-400/20" },
  removed: { label: "Removed", color: "bg-muted text-muted-foreground border-border" },
  pending: { label: "Pending", color: "bg-blue-400/15 text-blue-400 border-blue-400/20" },
  cancelled: { label: "Cancelled", color: "bg-muted text-muted-foreground border-border" },
};

const INSIGHTS = [
  {
    icon: MessageSquare,
    text: "Posts with questions get 2× more comments",
    tip: "End your post with a question to invite discussion.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: TrendingUp,
    text: "Posts between 9–11am get 40% more upvotes",
    tip: "Schedule posts during peak Reddit hours.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: BarChart2,
    text: "Shorter titles (under 80 chars) perform better",
    tip: "Keep titles concise and scannable.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    icon: Lightbulb,
    text: "Posts that share a story get 3× more engagement",
    tip: "Lead with a personal experience or anecdote.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
];

export default function HistoryPage() {
  const { data: posts, isLoading } = trpc.history.list.useQuery();

  const totalPosts = posts?.length ?? 0;
  const postedCount = posts?.filter((p) => p.status === "posted").length ?? 0;
  const failedCount = posts?.filter((p) => p.status === "failed").length ?? 0;
  const scheduledCount = posts?.filter((p) => p.type === "scheduled").length ?? 0;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <History className="w-4 h-4 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">History</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-10.5">All posts sent through SubRoast.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total posts", value: totalPosts, color: "text-foreground" },
            { label: "Successfully posted", value: postedCount, color: "text-primary" },
            { label: "Failed", value: failedCount, color: "text-red-400" },
            { label: "Auto-scheduled", value: scheduledCount, color: "text-blue-400" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="p-4">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Insights */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Reddit Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {INSIGHTS.map((insight) => (
                <div key={insight.text} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                  <div className={`w-7 h-7 rounded-md ${insight.bg} flex items-center justify-center shrink-0`}>
                    <insight.icon className={`w-3.5 h-3.5 ${insight.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{insight.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{insight.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Posts table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : posts && posts.length > 0 ? (
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">All Posts</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Title", "Subreddit", "Type", "Status", "Posted", "Link"].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-muted-foreground py-3 px-4 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => {
                      const cfg = STATUS_CONFIG[post.status] ?? STATUS_CONFIG.pending;
                      return (
                        <tr key={post.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-medium text-foreground truncate max-w-[200px]">{post.title}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-muted-foreground text-xs">r/{post.subreddit}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs px-1.5 py-0.5 rounded border bg-muted/40 text-muted-foreground border-border font-medium capitalize">{post.type}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-[11px] px-1.5 py-0.5 rounded border font-medium ${cfg.color}`}>{cfg.label}</span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-xs whitespace-nowrap">
                            {new Date(post.postedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="py-3 px-4">
                            {post.redditPostUrl ? (
                              <a href={post.redditPostUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs">
                                View <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border bg-card/50">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
              <History className="w-6 h-6 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No posts yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Your post history will appear here once you start posting.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

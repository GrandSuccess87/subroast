import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MessageSquare, Bug, Lightbulb, ChevronUp, CheckCircle2, Clock } from "lucide-react";

const TYPE_ICONS = {
  feature: <Lightbulb className="w-4 h-4 text-amber-400" />,
  bug: <Bug className="w-4 h-4 text-red-400" />,
  other: <MessageSquare className="w-4 h-4 text-muted-foreground" />,
};

const TYPE_LABELS = {
  feature: "Feature request",
  bug: "Bug report",
  other: "Other",
};

const STATUS_BADGE: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  open: { label: "Open", className: "bg-zinc-800 text-zinc-300 border-zinc-700", icon: null },
  planned: { label: "Planned", className: "bg-blue-950 text-blue-300 border-blue-800", icon: <Clock className="w-3 h-3 mr-1" /> },
  done: { label: "Done", className: "bg-green-950 text-green-300 border-green-800", icon: <CheckCircle2 className="w-3 h-3 mr-1" /> },
};

export default function FeedbackPage() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const { data: items = [], isLoading } = trpc.feedback.list.useQuery();

  const submit = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      toast.success("Feedback submitted — thank you!");
      setTitle("");
      setBody("");
      setType("feature");
      utils.feedback.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const upvote = trpc.feedback.upvote.useMutation({
    onMutate: async ({ id }) => {
      await utils.feedback.list.cancel();
      const prev = utils.feedback.list.getData();
      utils.feedback.list.setData(undefined, (old) =>
        old?.map((item) => item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item)
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) utils.feedback.list.setData(undefined, ctx.prev);
    },
    onSettled: () => utils.feedback.list.invalidate(),
  });

  const updateStatus = trpc.feedback.updateStatus.useMutation({
    onSuccess: () => utils.feedback.list.invalidate(),
    onError: (e) => toast.error(e.message),
  });

  const [type, setType] = useState<"feature" | "bug" | "other">("feature");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const isAdmin = user?.role === "admin";

  // Group by status for display
  const planned = items.filter((i) => i.status === "planned");
  const open = items.filter((i) => i.status === "open");
  const done = items.filter((i) => i.status === "done");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Feedback Board</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Share feature requests, report bugs, or suggest improvements. Upvote what matters most to you.
        </p>
      </div>

      {/* Submit form */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Submit feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <Label className="text-xs text-muted-foreground mb-1.5 block">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger className="bg-background border-border text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature">Feature request</SelectItem>
                  <SelectItem value="bug">Bug report</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs text-muted-foreground mb-1.5 block">Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary..."
                className="bg-background border-border text-sm"
                maxLength={200}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Details (optional)</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="More context, steps to reproduce, or use case..."
              className="bg-background border-border text-sm resize-none"
              rows={3}
              maxLength={2000}
            />
          </div>
          <Button
            onClick={() => submit.mutate({ type, title, body })}
            disabled={!title.trim() || submit.isPending}
            className="w-full sm:w-auto bg-primary text-primary-foreground"
          >
            {submit.isPending ? "Submitting..." : "Submit"}
          </Button>
        </CardContent>
      </Card>

      {/* Board */}
      {isLoading ? (
        <div className="text-muted-foreground text-sm text-center py-8">Loading feedback...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No feedback yet — be the first to share an idea.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {[
            { label: "Planned", items: planned },
            { label: "Open", items: open },
            { label: "Done", items: done },
          ]
            .filter((g) => g.items.length > 0)
            .map((group) => (
              <div key={group.label}>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {group.label} · {group.items.length}
                </h2>
                <div className="space-y-2">
                  {group.items.map((item) => {
                    const sb = STATUS_BADGE[item.status];
                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border hover:border-border/80 transition-colors"
                      >
                        {/* Upvote */}
                        <button
                          onClick={() => upvote.mutate({ id: item.id })}
                          className="flex flex-col items-center gap-0.5 min-w-[36px] pt-0.5 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ChevronUp className="w-4 h-4" />
                          <span className="text-xs font-medium tabular-nums">{item.upvotes}</span>
                        </button>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 flex-wrap">
                            <span className="mt-0.5">{TYPE_ICONS[item.type]}</span>
                            <span className="font-medium text-sm text-foreground leading-snug">{item.title}</span>
                            <Badge variant="outline" className={`text-xs px-1.5 py-0 flex items-center ${sb.className}`}>
                              {sb.icon}{sb.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs px-1.5 py-0 text-muted-foreground border-zinc-700">
                              {TYPE_LABELS[item.type]}
                            </Badge>
                          </div>
                          {item.body && (
                            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-3">
                              {item.body}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">
                              {item.authorName ?? "Anonymous"} · {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                            {item.isOwn && (
                              <Badge variant="outline" className="text-xs px-1.5 py-0 text-muted-foreground border-zinc-700">
                                yours
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Admin status control */}
                        {isAdmin && (
                          <Select
                            value={item.status}
                            onValueChange={(v) =>
                              updateStatus.mutate({ id: item.id, status: v as "open" | "planned" | "done" })
                            }
                          >
                            <SelectTrigger className="w-24 h-7 text-xs bg-background border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="planned">Planned</SelectItem>
                              <SelectItem value="done">Done</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

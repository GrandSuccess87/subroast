import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MessageSquare, Bug, Lightbulb, ChevronUp, CheckCircle2, Clock, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const FONT_DISPLAY = "Cormorant Garamond, Georgia, serif";
const FONT_MONO = "JetBrains Mono, monospace";
const SURFACE = "oklch(0.12 0.007 60)";
const SURFACE_RAISED = "oklch(0.14 0.007 60)";
const BORDER = "oklch(0.22 0.007 60)";
const IVORY = "oklch(0.88 0.025 85)";
const FOREGROUND = "oklch(0.93 0.010 80)";
const MUTED = "oklch(0.52 0.006 80)";
const BG = "oklch(0.09 0.008 60)";

const TYPE_ICONS = {
  feature: <Lightbulb size={13} color="oklch(0.78 0.14 65)" />,
  bug: <Bug size={13} color="oklch(0.65 0.18 25)" />,
  other: <MessageSquare size={13} color={MUTED} />,
};

const TYPE_LABELS = { feature: "Feature request", bug: "Bug report", other: "Other" };

const STATUS_CONFIG: Record<string, { label: string; color: string; border: string; icon?: React.ReactNode }> = {
  open: { label: "Open", color: MUTED, border: BORDER },
  planned: { label: "Planned", color: "oklch(0.72 0.12 220)", border: "oklch(0.72 0.12 220 / 0.35)", icon: <Clock size={9} /> },
  done: { label: "Done", color: IVORY, border: "oklch(0.88 0.025 85 / 0.4)", icon: <CheckCircle2 size={9} /> },
};

export default function FeedbackPage() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: items = [], isLoading } = trpc.feedback.list.useQuery();

  const submit = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      toast.success("Feedback submitted — thank you!");
      setTitle(""); setBody(""); setType("feature");
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
    onError: (_e, _v, ctx) => { if (ctx?.prev) utils.feedback.list.setData(undefined, ctx.prev); },
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

  const planned = items.filter((i) => i.status === "planned");
  const open = items.filter((i) => i.status === "open");
  const done = items.filter((i) => i.status === "done");

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

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

      {/* Back navigation */}
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED, textDecoration: "none", marginBottom: "2rem", transition: "color 0.2s" }}
        onMouseEnter={(e) => ((e.target as HTMLElement).style.color = IVORY)}
        onMouseLeave={(e) => ((e.target as HTMLElement).style.color = MUTED)}
      >
        <ArrowLeft size={11} />
        Back to Home
      </Link>

      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 300, fontStyle: "italic", color: FOREGROUND, lineHeight: 1.1, marginBottom: "0.4rem" }}>
          Feedback Board
        </h1>
        <p style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED }}>
          Share requests, report bugs, upvote what matters
        </p>
      </div>

      {/* Submit form */}
      <div style={{ border: `0.5px solid ${BORDER}`, background: SURFACE, marginBottom: "2rem" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: `0.5px solid ${BORDER}` }}>
          <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: MUTED }}>
            Submit Feedback
          </p>
        </div>
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
            <div>
              <label style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: "0.4rem" }}>Type</label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger style={{ background: SURFACE_RAISED, border: `0.5px solid ${BORDER}`, color: FOREGROUND, fontSize: "0.8rem", borderRadius: 0 }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature">Feature request</SelectItem>
                  <SelectItem value="bug">Bug report</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: "0.4rem" }}>Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary..."
                maxLength={200}
                style={inputStyle}
              />
            </div>
          </div>
          <div>
            <label style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: "0.4rem" }}>Details (optional)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="More context, steps to reproduce, or use case..."
              maxLength={2000}
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
            />
          </div>
          <div>
            <button
              onClick={() => submit.mutate({ type, title, body })}
              disabled={!title.trim() || submit.isPending}
              style={{
                padding: "0.65rem 1.5rem",
                background: title.trim() && !submit.isPending ? IVORY : SURFACE_RAISED,
                border: `0.5px solid ${title.trim() && !submit.isPending ? IVORY : BORDER}`,
                color: title.trim() && !submit.isPending ? BG : MUTED,
                fontFamily: FONT_MONO,
                fontSize: "0.62rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: title.trim() && !submit.isPending ? "pointer" : "not-allowed",
              }}
            >
              {submit.isPending ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>

      {/* Board */}
      {isLoading ? (
        <p style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", color: MUTED, textAlign: "center", padding: "3rem", letterSpacing: "0.1em" }}>
          Loading feedback...
        </p>
      ) : items.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 2rem", border: `0.5px dashed ${BORDER}`, background: SURFACE, textAlign: "center", gap: "0.75rem" }}>
          <MessageSquare size={24} color={MUTED} />
          <p style={{ fontFamily: FONT_DISPLAY, fontSize: "1.1rem", fontStyle: "italic", color: MUTED }}>No feedback yet</p>
          <p style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", color: MUTED, letterSpacing: "0.1em" }}>Be the first to share an idea.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {[
            { label: "Planned", items: planned },
            { label: "Open", items: open },
            { label: "Done", items: done },
          ]
            .filter((g) => g.items.length > 0)
            .map((group) => (
              <div key={group.label}>
                <p style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.25em", textTransform: "uppercase", color: MUTED, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ display: "inline-block", width: "1.5rem", height: "0.5px", background: BORDER }} />
                  {group.label} · {group.items.length}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5px" }}>
                  {group.items.map((item) => {
                    const sb = STATUS_CONFIG[item.status];
                    return (
                      <div
                        key={item.id}
                        style={{ display: "flex", alignItems: "flex-start", gap: "0", border: `0.5px solid ${BORDER}`, background: SURFACE }}
                      >
                        {/* Upvote */}
                        <button
                          onClick={() => upvote.mutate({ id: item.id })}
                          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", padding: "1rem 0.75rem", borderRight: `0.5px solid ${BORDER}`, background: "transparent", color: MUTED, cursor: "pointer", minWidth: "48px", transition: "color 0.15s", outline: "none" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = IVORY)}
                          onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
                        >
                          <ChevronUp size={14} />
                          <span style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", fontWeight: 400 }}>{item.upvotes}</span>
                        </button>

                        {/* Content */}
                        <div style={{ flex: 1, padding: "0.85rem 1rem" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.3rem" }}>
                            {TYPE_ICONS[item.type]}
                            <span style={{ fontSize: "0.82rem", color: FOREGROUND, lineHeight: 1.4 }}>{item.title}</span>
                            <span style={{ fontFamily: FONT_MONO, fontSize: "0.52rem", letterSpacing: "0.12em", textTransform: "uppercase", color: sb.color, border: `0.5px solid ${sb.border}`, padding: "0.1rem 0.35rem", display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
                              {sb.icon}{sb.label}
                            </span>
                            <span style={{ fontFamily: FONT_MONO, fontSize: "0.52rem", letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, border: `0.5px solid ${BORDER}`, padding: "0.1rem 0.35rem" }}>
                              {TYPE_LABELS[item.type]}
                            </span>
                          </div>
                          {item.body && (
                            <p style={{ fontSize: "0.75rem", color: MUTED, lineHeight: 1.6, marginBottom: "0.3rem" }}>{item.body}</p>
                          )}
                          <p style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", color: MUTED, letterSpacing: "0.05em" }}>
                            {item.authorName ?? "Anonymous"} · {new Date(item.createdAt).toLocaleDateString()}
                            {item.isOwn && <span style={{ marginLeft: "0.5rem", border: `0.5px solid ${BORDER}`, padding: "0.05rem 0.3rem" }}>yours</span>}
                          </p>
                        </div>

                        {/* Admin status control */}
                        {isAdmin && (
                          <div style={{ padding: "0.75rem", borderLeft: `0.5px solid ${BORDER}` }}>
                            <Select
                              value={item.status}
                              onValueChange={(v) => updateStatus.mutate({ id: item.id, status: v as "open" | "planned" | "done" })}
                            >
                              <SelectTrigger style={{ width: "90px", height: "28px", background: SURFACE_RAISED, border: `0.5px solid ${BORDER}`, color: MUTED, fontSize: "0.68rem", borderRadius: 0 }}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="planned">Planned</SelectItem>
                                <SelectItem value="done">Done</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
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

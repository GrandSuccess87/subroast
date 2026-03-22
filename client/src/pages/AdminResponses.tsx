import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Download, Search, Users, TrendingUp, DollarSign } from "lucide-react";

// ─── WTP helpers ──────────────────────────────────────────────────────────────

const WTP_LABELS: Record<string, string> = {
  "60_plus":      "$60+/mo",
  "need_results": "Pay if it works",
  "40_59":        "$40–$59/mo",
  "20_39":        "$20–$39/mo",
  "under_20":     "<$20/mo",
  "yes":          "Yes",
  "maybe":        "Maybe",
  "no":           "No",
};

const WTP_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "60_plus":      "default",
  "need_results": "default",
  "40_59":        "secondary",
  "20_39":        "secondary",
  "under_20":     "outline",
  "yes":          "default",
  "maybe":        "secondary",
  "no":           "outline",
};

const WTP_COLOR: Record<string, string> = {
  "60_plus":      "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "need_results": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "40_59":        "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "20_39":        "bg-slate-500/20 text-slate-300 border-slate-500/30",
  "under_20":     "bg-slate-700/20 text-slate-400 border-slate-600/30",
};

const TOOL_LABELS: Record<string, string> = {
  "manual_outreach": "Manual outreach",
  "chatgpt":         "ChatGPT",
  "gummysearch":     "Gummysearch",
  "other":           "Other",
};

const PAIN_LABELS: Record<string, string> = {
  "too_much_time":       "Too much time",
  "low_quality_leads":   "Low quality leads",
  "no_system":           "No system",
  "hard_to_scale":       "Hard to scale",
  "dont_know_subreddits":"Don't know subreddits",
  "other":               "Other",
};

function WtpBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-slate-500 text-xs">—</span>;
  const label = WTP_LABELS[value] ?? value;
  const color = WTP_COLOR[value] ?? "bg-slate-700/20 text-slate-400 border-slate-600/30";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {label}
    </span>
  );
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCsv(rows: ReturnType<typeof useRows>) {
  const headers = [
    "Name", "Email", "WTP Tier", "Current Tool", "Pain Points",
    "Success Definition", "Notes", "Completed At",
  ];
  const lines = rows.map((r) => [
    r.name ?? "",
    r.email ?? "",
    WTP_LABELS[r.willingnessToPay ?? ""] ?? r.willingnessToPay ?? "",
    TOOL_LABELS[r.currentTool ?? ""] ?? r.currentTool ?? "",
    (r.painPoints ?? []).map((p) => PAIN_LABELS[p] ?? p).join("; "),
    r.successDefinition ?? "",
    r.additionalNotes ?? "",
    r.onboardingCompletedAt ? new Date(r.onboardingCompletedAt).toISOString() : "",
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));

  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `subroast-responses-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Custom hook for filtered rows ───────────────────────────────────────────

function useRows() {
  return [] as {
    id: number;
    name: string | null;
    email: string | null;
    currentTool: string | null;
    currentToolOther: string | null;
    painPoints: string[];
    painPointsOther: string | null;
    successDefinition: string | null;
    willingnessToPay: string | null;
    additionalNotes: string | null;
    onboardingCompletedAt: number | null;
    createdAt: Date | null;
  }[];
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card className="bg-[oklch(0.13_0.008_240)] border-white/10">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Icon className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-xl font-semibold text-white">{value}</p>
            {sub && <p className="text-xs text-slate-500">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminResponses() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");

  // Move all navigate() calls into useEffect to avoid setState-in-render
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/");
    } else if (user.role !== "admin") {
      navigate("/dashboard");
    }
  }, [authLoading, user, navigate]);

  const { data: responses, isLoading } = trpc.onboarding.getResponses.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
    retry: false,
  });

  // Show loading while auth resolves or while redirecting
  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[oklch(0.09_0.005_240)] flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading…</div>
      </div>
    );
  }

  const rows = responses ?? [];

  // Stats
  const highIntent = rows.filter((r) => r.willingnessToPay === "60_plus" || r.willingnessToPay === "40_59").length;
  const payIfWorks = rows.filter((r) => r.willingnessToPay === "need_results").length;
  const wtpCounts = rows.reduce<Record<string, number>>((acc, r) => {
    const k = r.willingnessToPay ?? "unknown";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  const topWtp = Object.entries(wtpCounts).sort((a, b) => b[1] - a[1])[0];

  // Filter
  const q = search.toLowerCase();
  const filtered = rows.filter((r) =>
    !q ||
    (r.name ?? "").toLowerCase().includes(q) ||
    (r.email ?? "").toLowerCase().includes(q) ||
    (r.successDefinition ?? "").toLowerCase().includes(q) ||
    (r.additionalNotes ?? "").toLowerCase().includes(q)
  );

  return (
    <div className="min-h-screen bg-[oklch(0.09_0.005_240)] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="text-slate-400 hover:text-white -ml-2"
          >
            ← Dashboard
          </Button>
          <span className="text-slate-600">|</span>
          <h1 className="text-sm font-semibold text-white tracking-wide uppercase">
            Onboarding Responses
          </h1>
          <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">
            Admin
          </Badge>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => exportCsv(rows)}
          disabled={rows.length === 0}
          className="gap-2 border-white/20 text-slate-300 hover:text-white"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total responses" value={rows.length} />
          <StatCard
            icon={TrendingUp}
            label="High intent ($40+)"
            value={highIntent}
            sub={rows.length ? `${Math.round((highIntent / rows.length) * 100)}% of total` : undefined}
          />
          <StatCard
            icon={DollarSign}
            label="Pay if it works"
            value={payIfWorks}
            sub="Needs proof first"
          />
          <StatCard
            icon={TrendingUp}
            label="Top WTP tier"
            value={topWtp ? (WTP_LABELS[topWtp[0]] ?? topWtp[0]) : "—"}
            sub={topWtp ? `${topWtp[1]} responses` : undefined}
          />
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search by name, email, or notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50"
          />
        </div>

        {/* Table */}
        <Card className="bg-[oklch(0.13_0.008_240)] border-white/10 overflow-hidden">
          <CardHeader className="pb-3 border-b border-white/10">
            <CardTitle className="text-sm font-medium text-slate-300">
              {isLoading ? "Loading…" : `${filtered.length} response${filtered.length !== 1 ? "s" : ""}`}
              {search && ` matching "${search}"`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-16 text-center text-slate-500 text-sm">Loading responses…</div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-sm">
                {rows.length === 0 ? "No completed onboarding responses yet." : "No results match your search."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-slate-400 text-xs font-medium">User</TableHead>
                      <TableHead className="text-slate-400 text-xs font-medium">WTP Tier</TableHead>
                      <TableHead className="text-slate-400 text-xs font-medium">Current Tool</TableHead>
                      <TableHead className="text-slate-400 text-xs font-medium">Pain Points</TableHead>
                      <TableHead className="text-slate-400 text-xs font-medium">Success Definition</TableHead>
                      <TableHead className="text-slate-400 text-xs font-medium">Notes</TableHead>
                      <TableHead className="text-slate-400 text-xs font-medium">Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r) => (
                      <TableRow key={r.id} className="border-white/5 hover:bg-white/[0.03]">
                        {/* User */}
                        <TableCell className="py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm text-white font-medium">{r.name ?? "—"}</span>
                            <span className="text-xs text-slate-500">{r.email ?? "—"}</span>
                          </div>
                        </TableCell>

                        {/* WTP */}
                        <TableCell className="py-3">
                          <WtpBadge value={r.willingnessToPay} />
                        </TableCell>

                        {/* Current tool */}
                        <TableCell className="py-3 text-sm text-slate-300">
                          {r.currentTool === "other"
                            ? r.currentToolOther || "Other"
                            : TOOL_LABELS[r.currentTool ?? ""] ?? r.currentTool ?? "—"}
                        </TableCell>

                        {/* Pain points */}
                        <TableCell className="py-3">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {(r.painPoints ?? []).map((p) => (
                              <span
                                key={p}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-slate-400 border border-white/10"
                              >
                                {PAIN_LABELS[p] ?? p}
                              </span>
                            ))}
                            {r.painPointsOther && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-slate-400 border border-white/10">
                                {r.painPointsOther}
                              </span>
                            )}
                            {(r.painPoints ?? []).length === 0 && !r.painPointsOther && (
                              <span className="text-slate-500 text-xs">—</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Success definition */}
                        <TableCell className="py-3 max-w-[220px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-xs text-slate-300 line-clamp-2 cursor-default">
                                {r.successDefinition || "—"}
                              </p>
                            </TooltipTrigger>
                            {r.successDefinition && (
                              <TooltipContent className="max-w-xs text-xs bg-slate-800 border-white/10 text-slate-200">
                                {r.successDefinition}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TableCell>

                        {/* Notes */}
                        <TableCell className="py-3 max-w-[180px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-xs text-slate-400 line-clamp-2 cursor-default">
                                {r.additionalNotes || "—"}
                              </p>
                            </TooltipTrigger>
                            {r.additionalNotes && (
                              <TooltipContent className="max-w-xs text-xs bg-slate-800 border-white/10 text-slate-200">
                                {r.additionalNotes}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TableCell>

                        {/* Completed at */}
                        <TableCell className="py-3 text-xs text-slate-500 whitespace-nowrap">
                          {r.onboardingCompletedAt
                            ? new Date(r.onboardingCompletedAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

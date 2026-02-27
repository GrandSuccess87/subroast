import { trpc } from "@/lib/trpc";
import { CheckCircle2, Circle, ChevronRight, X, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

// ─── OnboardingChecklist ──────────────────────────────────────────────────────
//
// Dismissible card shown on the Dashboard for new users. Tracks real
// completion state for four activation steps. Auto-hides once all steps are
// done or the user explicitly dismisses it.

export default function OnboardingChecklist() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.onboarding.getStatus.useQuery();

  const dismiss = trpc.onboarding.dismiss.useMutation({
    onSuccess: () => {
      utils.onboarding.getStatus.invalidate();
      toast.success("Checklist dismissed — you can always revisit Settings if you need help.");
    },
  });

  // Don't render while loading, if dismissed, or if all steps are complete
  if (isLoading || !data || data.dismissed || data.allComplete) return null;

  const progressPct = Math.round((data.completedCount / data.totalCount) * 100);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Get started with SubSignal</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {data.completedCount} of {data.totalCount} steps complete
            </p>
          </div>
        </div>
        <button
          onClick={() => dismiss.mutate()}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -mt-0.5 -mr-1"
          title="Dismiss checklist"
          disabled={dismiss.isPending}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-4">
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="divide-y divide-border border-t border-border">
        {data.steps.map((step) => (
          <button
            key={step.id}
            onClick={() => !step.completed && navigate(step.href)}
            disabled={step.completed}
            className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors ${
              step.completed
                ? "opacity-60 cursor-default"
                : "hover:bg-muted/40 cursor-pointer"
            }`}
          >
            {/* Icon */}
            <div className="shrink-0">
              {step.completed ? (
                <CheckCircle2 className="w-5 h-5 text-primary" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground/50" />
              )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${
                  step.completed
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
                }`}
              >
                {step.label}
              </p>
              {!step.completed && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {step.description}
                </p>
              )}
            </div>

            {/* Arrow (only for incomplete steps) */}
            {!step.completed && (
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

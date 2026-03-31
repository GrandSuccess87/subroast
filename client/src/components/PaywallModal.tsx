import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Zap, Lock, ArrowRight, Flame } from "lucide-react";

export type PaywallVariant = "sync_limit" | "campaign_limit";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  variant: PaywallVariant;
  /** Optional: number of high-intent leads found so far (boosts conversion) */
  leadsFound?: number;
  /** Optional: campaign name for context */
  campaignName?: string;
}

export function PaywallModal({ open, onClose, variant, leadsFound, campaignName }: PaywallModalProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { data: spots } = trpc.subscription.getFounderSpots.useQuery(undefined, {
    staleTime: 30_000,
  });

  const checkout = trpc.subscription.createCheckoutSession.useMutation({
    onSuccess: ({ url }) => {
      if (url) {
        toast.info("Redirecting to checkout…");
        window.open(url, "_blank");
      }
      setIsRedirecting(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to start checkout. Please try again.");
      setIsRedirecting(false);
    },
  });

  function handleUpgrade() {
    setIsRedirecting(true);
    checkout.mutate({ plan: "founder", origin: window.location.origin });
  }

  const priceLabel = spots?.priceLabel ?? "$25/month";
  const spotsLabel = spots?.spotsLabel ?? "";

  const isSyncLimit = variant === "sync_limit";

  const headline = isSyncLimit
    ? "You've used your 3 free syncs"
    : "You've reached your free campaign limit";

  const subtext = isSyncLimit
    ? "In just a few minutes, you've already found high-intent leads and identified real opportunities. Most people miss these completely."
    : "You've created your free campaign. Upgrade to unlock unlimited campaigns and keep finding opportunities.";

  const leadsLine =
    leadsFound != null && leadsFound > 0
      ? `You found ${leadsFound} high-intent lead${leadsFound === 1 ? "" : "s"} already.`
      : null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border border-zinc-800 text-white">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <Lock className="h-5 w-5 text-orange-400" />
            </div>
            <Badge variant="outline" className="text-orange-400 border-orange-500/30 bg-orange-500/10 text-xs">
              Founder Access
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold text-white leading-tight">
            {headline}
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm leading-relaxed">
            {subtext}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {leadsLine && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
              <Flame className="h-4 w-4 text-orange-400 shrink-0" />
              <p className="text-sm text-orange-300 font-medium">{leadsLine}</p>
            </div>
          )}

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">Founder Plan</span>
              <span className="text-orange-400 font-bold">{priceLabel}</span>
            </div>
            <ul className="space-y-1.5 text-sm text-zinc-300">
              {[
                "Unlimited outreach campaigns",
                "Unlimited lead syncs",
                "Buyer intent detection",
                "AI Draft & Roast + replies",
                "Lock in early pricing",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {spotsLabel && (
            <p className="text-center text-xs text-zinc-500">{spotsLabel}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <Button
            onClick={handleUpgrade}
            disabled={isRedirecting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-11 gap-2"
          >
            {isRedirecting ? "Redirecting…" : (
              <>
                Get Founder Access — {priceLabel}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full text-zinc-500 hover:text-zinc-300 text-sm"
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

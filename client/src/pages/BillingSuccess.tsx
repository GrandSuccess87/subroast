import { useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function BillingSuccess() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  useEffect(() => {
    // Invalidate subscription status so dashboard reflects new plan
    utils.subscription.getStatus.invalidate();
  }, [utils]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-3">You're all set!</h1>
        <p className="text-muted-foreground mb-2">
          Your 7-day free trial has started. You won't be charged until Day 7.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          We'll send you a reminder on Day 6 so you have time to cancel if needed.
        </p>

        <div className="bg-card border border-border/40 rounded-xl p-6 mb-8 text-left space-y-3">
          <p className="text-sm font-medium text-foreground">What to do next:</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="text-green-400 font-bold mt-0.5">1.</span>
              <span>Connect your Reddit account in Settings</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 font-bold mt-0.5">2.</span>
              <span>Create your first outreach campaign in DM Campaigns</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 font-bold mt-0.5">3.</span>
              <span>Hit "Sync Leads" to discover Reddit posts matching your keywords</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 font-bold mt-0.5">4.</span>
              <span>Generate AI-personalized DMs and start outreach</span>
            </div>
          </div>
        </div>

        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

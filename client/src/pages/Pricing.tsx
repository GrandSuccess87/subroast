import { useState } from "react";
import { useLocation } from "wouter";
import { Check, Zap, TrendingUp, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const PLANS = [
  {
    key: "starter" as const,
    name: "Starter",
    price: 19,
    description: "Perfect for indie founders testing Reddit outreach",
    icon: Zap,
    color: "text-green-400",
    borderColor: "border-green-500/30",
    bgColor: "bg-green-500/5",
    features: [
      "1 outreach campaign",
      "5 posts per day",
      "25 DMs per day",
      "AI Draft & Roast with virality score",
      "AI auto-scheduling (3–7 pm EST)",
      "Lead discovery via Reddit search",
      "Lead sync: 2x daily (8am & 8pm EST)",
      "AI-generated personalized DMs",
      "Match scoring (Strong / Partial / Lowest)",
      "Email alerts for new leads",
    ],
    cta: "Start 7-Day Free Trial",
    popular: false,
  },
  {
    key: "growth" as const,
    name: "Growth",
    price: 49,
    description: "For founders ready to scale Reddit outreach",
    icon: TrendingUp,
    color: "text-purple-400",
    borderColor: "border-purple-500/40",
    bgColor: "bg-purple-500/5",
    features: [
      "Unlimited outreach campaigns",
      "5 posts per day",
      "25 DMs per day",
      "Everything in Starter",
      "Lead sync: every 4 hours (6x daily)",
      "DM template library (coming soon)",
      "Advanced analytics (coming soon)",
    ],
    cta: "Start 7-Day Free Trial",
    popular: true,
  },
];

export default function Pricing() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const createCheckout = trpc.subscription.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
        toast.info("Redirecting to secure checkout...");
      }
      setLoadingPlan(null);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to start checkout");
      setLoadingPlan(null);
    },
  });

  const handleSelectPlan = (planKey: "starter" | "growth") => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    setLoadingPlan(planKey);
    createCheckout.mutate({ plan: planKey, origin: window.location.origin });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/40 px-6 py-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <span className="text-sm text-muted-foreground">SubSignal Pricing</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Start with a 7-day free trial. No credit card required upfront.
            Cancel anytime — no long-term commitment.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 text-sm text-green-400">
            <Check className="w-4 h-4" />
            7-day free trial on all plans · Cancel anytime
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isLoading = loadingPlan === plan.key;

            return (
              <div
                key={plan.key}
                className={`relative rounded-2xl border ${plan.borderColor} ${plan.bgColor} p-8 flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white border-0 px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-background border border-border/40 mb-4`}>
                    <Icon className={`w-5 h-5 ${plan.color}`} />
                  </div>
                  <h2 className="text-2xl font-bold">{plan.name}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
                {plan.key === "growth" && (
                  <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full px-2.5 py-1">
                    <TrendingUp className="w-3 h-3" />
                    3× faster lead discovery
                  </div>
                )}
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    After 7-day free trial
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.color}`} />
                      <span className={feature.includes("coming soon") ? "text-muted-foreground" : ""}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className={`w-full ${
                    plan.key === "growth"
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                  onClick={() => handleSelectPlan(plan.key)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Opening checkout...
                    </>
                  ) : (
                    plan.cta
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* FAQ / Trust signals */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-center mb-8">Common questions</h3>
          <div className="space-y-6">
            {[
              {
                q: "Do I need a credit card for the free trial?",
                a: "Yes — Stripe requires a card to start the trial, but you won't be charged until Day 7. You'll receive a reminder on Day 6 so you have time to cancel.",
              },
              {
                q: "What happens after the trial ends?",
                a: "You'll be automatically charged for the plan you selected. You can cancel anytime from Settings → Manage Billing before the trial ends.",
              },
              {
                q: "Can I switch plans?",
                a: "Yes. You can upgrade from Starter to Growth at any time from Settings → Manage Billing. Stripe prorates the difference.",
              },
              {
                q: "What is the campaign limit on Starter?",
                a: "Starter includes 1 active outreach campaign. Upgrade to Growth for unlimited campaigns.",
              },
              {
                q: "Is this month-to-month?",
                a: "Yes — all plans are billed monthly with no long-term contracts. Cancel anytime.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-border/30 pb-6">
                <p className="font-medium mb-2">{q}</p>
                <p className="text-muted-foreground text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Test card notice */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground">
            Testing? Use card <span className="font-mono bg-muted px-1.5 py-0.5 rounded">4242 4242 4242 4242</span> with any future expiry and any CVC.
          </p>
        </div>
      </div>
    </div>
  );
}

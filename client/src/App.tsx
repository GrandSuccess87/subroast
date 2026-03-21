import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { trackEverFeaturedVisitIfApplicable } from "@/lib/analytics";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import DraftRoast from "./pages/DraftRoast";
import Schedule from "./pages/Schedule";
import DmCampaigns from "./pages/DmCampaigns";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import Pricing from "./pages/Pricing";
import BillingSuccess from "./pages/BillingSuccess";
import FeedbackPage from "./pages/Feedback";
import Waitlist from "./pages/Waitlist";
import Onboarding from "./pages/Onboarding";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/roast" component={DraftRoast} />
      <Route path="/dashboard/schedule" component={Schedule} />
      <Route path="/dashboard/campaigns" component={DmCampaigns} />
      <Route path="/dashboard/history" component={HistoryPage} />
      <Route path="/dashboard/settings" component={SettingsPage} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/billing/success" component={BillingSuccess} />
      <Route path="/dashboard/feedback" component={FeedbackPage} />
      <Route path="/waitlist" component={Waitlist} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Fire once on initial page load — detects UTM source and tracks EverFeatured visits
    trackEverFeaturedVisitIfApplicable();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

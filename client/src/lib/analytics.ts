/**
 * Lightweight Umami analytics wrapper.
 * Umami is loaded via the script tag in index.html and exposes window.umami.
 * We wrap it here so callers get type safety and a no-op fallback when Umami
 * hasn't loaded yet (e.g. ad-blockers, SSR, tests).
 */

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, data?: Record<string, string | number | boolean>) => void;
    };
  }
}

/**
 * Track a custom event with optional properties.
 * Silently no-ops if Umami is not available.
 */
export function track(
  eventName: string,
  data?: Record<string, string | number | boolean>
): void {
  try {
    window.umami?.track(eventName, data);
  } catch {
    // Never throw — analytics must never break the app
  }
}

// ─── Typed event helpers ───────────────────────────────────────────────────

/** Homepage CTA clicks */
export const trackHeroCta = () => track("cta_click", { location: "hero" });
export const trackMidpageCta = () => track("cta_click", { location: "midpage" });
export const trackFooterCta = () => track("cta_click", { location: "footer" });
export const trackNavCta = () => track("cta_click", { location: "nav" });
export const trackWhatsComingCta = () => track("cta_click", { location: "whats_coming" });

/** Onboarding funnel */
export const trackOnboardingStarted = () => track("onboarding_started");
export const trackOnboardingStep = (step: number) =>
  track("onboarding_step", { step });
export const trackOnboardingCompleted = (wtpTier: string) =>
  track("onboarding_completed", { wtp_tier: wtpTier });
export const trackWtpSelected = (tier: string) =>
  track("wtp_selected", { tier });

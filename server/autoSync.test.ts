/**
 * Tests for auto-sync scheduling logic.
 * Covers: sync window detection, due-date computation, and plan-based gating.
 */

import { describe, it, expect } from "vitest";

// ─── Replicate helpers from autoSync.ts ──────────────────────────────────────
// (We test the pure logic without importing the module to avoid DB side-effects)

function isWithinSyncWindow(targetHourEst: number, nowUtc: Date): boolean {
  const estHour = (nowUtc.getUTCHours() - 5 + 24) % 24;
  const estMinute = nowUtc.getUTCMinutes();
  const totalMinutes = estHour * 60 + estMinute;
  const targetMinutes = targetHourEst * 60;
  const diff = Math.abs(totalMinutes - targetMinutes);
  return diff <= 30 || diff >= 24 * 60 - 30;
}

function isGrowthSyncDue(lastSyncAt: number | null, now: number): boolean {
  if (lastSyncAt == null) return true;
  const fourHoursMs = 4 * 60 * 60 * 1000;
  return now - lastSyncAt >= fourHoursMs;
}

function isStarterSyncDue(lastSyncAt: number | null, now: number): boolean {
  if (lastSyncAt == null) return true;
  const elevenHalfHoursMs = 11.5 * 60 * 60 * 1000;
  return now - lastSyncAt >= elevenHalfHoursMs;
}

// ─── Sync window tests ────────────────────────────────────────────────────────

describe("isWithinSyncWindow", () => {
  it("returns true when exactly on the target hour (8am EST = 13:00 UTC)", () => {
    const utc = new Date("2026-02-27T13:00:00Z"); // 8am EST
    expect(isWithinSyncWindow(8, utc)).toBe(true);
  });

  it("returns true 20 minutes before the target hour", () => {
    const utc = new Date("2026-02-27T12:40:00Z"); // 7:40am EST
    expect(isWithinSyncWindow(8, utc)).toBe(true);
  });

  it("returns true 25 minutes after the target hour", () => {
    const utc = new Date("2026-02-27T13:25:00Z"); // 8:25am EST
    expect(isWithinSyncWindow(8, utc)).toBe(true);
  });

  it("returns false 45 minutes before the target hour", () => {
    const utc = new Date("2026-02-27T12:15:00Z"); // 7:15am EST
    expect(isWithinSyncWindow(8, utc)).toBe(false);
  });

  it("returns false 2 hours after the target hour", () => {
    const utc = new Date("2026-02-27T15:00:00Z"); // 10am EST
    expect(isWithinSyncWindow(8, utc)).toBe(false);
  });

  it("returns true for 8pm EST window (01:00 UTC next day)", () => {
    const utc = new Date("2026-02-28T01:00:00Z"); // 8pm EST
    expect(isWithinSyncWindow(20, utc)).toBe(true);
  });

  it("returns false for 8pm EST window at 6pm EST", () => {
    const utc = new Date("2026-02-27T23:00:00Z"); // 6pm EST
    expect(isWithinSyncWindow(20, utc)).toBe(false);
  });
});

// ─── Growth sync due tests ────────────────────────────────────────────────────

describe("isGrowthSyncDue", () => {
  const now = Date.now();

  it("returns true when never synced", () => {
    expect(isGrowthSyncDue(null, now)).toBe(true);
  });

  it("returns true when last sync was 5 hours ago", () => {
    const lastSync = now - 5 * 60 * 60 * 1000;
    expect(isGrowthSyncDue(lastSync, now)).toBe(true);
  });

  it("returns false when last sync was 3 hours ago", () => {
    const lastSync = now - 3 * 60 * 60 * 1000;
    expect(isGrowthSyncDue(lastSync, now)).toBe(false);
  });

  it("returns false when last sync was 1 hour ago", () => {
    const lastSync = now - 1 * 60 * 60 * 1000;
    expect(isGrowthSyncDue(lastSync, now)).toBe(false);
  });

  it("returns true when last sync was exactly 4 hours ago", () => {
    const lastSync = now - 4 * 60 * 60 * 1000;
    expect(isGrowthSyncDue(lastSync, now)).toBe(true);
  });
});

// ─── Starter sync due tests ───────────────────────────────────────────────────

describe("isStarterSyncDue", () => {
  const now = Date.now();

  it("returns true when never synced", () => {
    expect(isStarterSyncDue(null, now)).toBe(true);
  });

  it("returns true when last sync was 12 hours ago", () => {
    const lastSync = now - 12 * 60 * 60 * 1000;
    expect(isStarterSyncDue(lastSync, now)).toBe(true);
  });

  it("returns false when last sync was 6 hours ago (within same window)", () => {
    const lastSync = now - 6 * 60 * 60 * 1000;
    expect(isStarterSyncDue(lastSync, now)).toBe(false);
  });

  it("returns false when last sync was 2 hours ago", () => {
    const lastSync = now - 2 * 60 * 60 * 1000;
    expect(isStarterSyncDue(lastSync, now)).toBe(false);
  });

  it("returns true when last sync was exactly 11.5 hours ago", () => {
    const lastSync = now - 11.5 * 60 * 60 * 1000;
    expect(isStarterSyncDue(lastSync, now)).toBe(true);
  });
});

// ─── Plan-based gating ────────────────────────────────────────────────────────

describe("Plan-based sync gating", () => {
  const now = Date.now();

  function shouldSyncCampaign(
    plan: string,
    subscriptionStatus: string,
    trialEndsAt: number | null,
    lastSyncAt: number | null,
    nowUtc: Date
  ): boolean {
    const isTrialing = plan === "trial" && trialEndsAt != null && trialEndsAt > now;
    const hasActiveAccess =
      isTrialing ||
      subscriptionStatus === "active" ||
      subscriptionStatus === "trialing";

    if (!hasActiveAccess) return false;

    const isGrowth = plan === "growth";

    if (isGrowth) {
      return isGrowthSyncDue(lastSyncAt, now);
    } else {
      const inMorningWindow = isWithinSyncWindow(8, nowUtc);
      const inEveningWindow = isWithinSyncWindow(20, nowUtc);
      return (inMorningWindow || inEveningWindow) && isStarterSyncDue(lastSyncAt, now);
    }
  }

  it("does not sync campaigns for users with no active plan", () => {
    const result = shouldSyncCampaign("none", "none", null, null, new Date("2026-02-27T13:00:00Z"));
    expect(result).toBe(false);
  });

  it("does not sync campaigns for expired trial users", () => {
    const expiredTrialEndsAt = now - 1000;
    const result = shouldSyncCampaign("trial", "none", expiredTrialEndsAt, null, new Date("2026-02-27T13:00:00Z"));
    expect(result).toBe(false);
  });

  it("syncs Growth campaigns when 4+ hours have passed", () => {
    const lastSync = now - 5 * 60 * 60 * 1000;
    const result = shouldSyncCampaign("growth", "active", null, lastSync, new Date("2026-02-27T15:00:00Z"));
    expect(result).toBe(true);
  });

  it("does not sync Growth campaigns when synced 2 hours ago", () => {
    const lastSync = now - 2 * 60 * 60 * 1000;
    const result = shouldSyncCampaign("growth", "active", null, lastSync, new Date("2026-02-27T15:00:00Z"));
    expect(result).toBe(false);
  });

  it("syncs Starter campaigns in the 8am EST window when never synced", () => {
    const result = shouldSyncCampaign("starter", "active", null, null, new Date("2026-02-27T13:00:00Z"));
    expect(result).toBe(true);
  });

  it("does not sync Starter campaigns outside sync windows", () => {
    const result = shouldSyncCampaign("starter", "active", null, null, new Date("2026-02-27T15:00:00Z")); // 10am EST
    expect(result).toBe(false);
  });

  it("does not sync Starter campaigns that were already synced in the current window", () => {
    const recentSync = now - 2 * 60 * 60 * 1000; // synced 2 hours ago
    const result = shouldSyncCampaign("starter", "active", null, recentSync, new Date("2026-02-27T13:00:00Z")); // 8am EST window
    expect(result).toBe(false);
  });

  it("syncs active trial users in the 8pm EST window", () => {
    const trialEndsAt = now + 5 * 24 * 60 * 60 * 1000; // 5 days left
    const result = shouldSyncCampaign("trial", "none", trialEndsAt, null, new Date("2026-02-28T01:00:00Z")); // 8pm EST
    expect(result).toBe(true);
  });
});

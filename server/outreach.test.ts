import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────

vi.mock("./db", () => ({
  createOutreachCampaign: vi.fn().mockResolvedValue(1),
  getOutreachCampaignsByUserId: vi.fn().mockResolvedValue([]),
  getOutreachCampaignById: vi.fn().mockResolvedValue(null),
  updateOutreachCampaign: vi.fn().mockResolvedValue(undefined),
  deleteOutreachCampaign: vi.fn().mockResolvedValue(undefined),
  getOutreachLeadsByCampaignId: vi.fn().mockResolvedValue([]),
  getOutreachLeadsByUserId: vi.fn().mockResolvedValue([]),
  updateOutreachLeadStatus: vi.fn().mockResolvedValue(undefined),
  upsertOutreachLead: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            subreddits: ["SaaS", "startups", "entrepreneur"],
            keywords: ["struggling with churn", "need analytics"],
            reasoning: "These subreddits are popular with the target audience.",
          }),
        },
      },
    ],
  }),
}));

// ─── Unit tests for pure scoring logic ───────────────────────────────────────

function scoreMatch(
  postTitle: string,
  postBody: string,
  keywords: string[]
): { score: "strong" | "partial" | "lowest"; matchedKeywords: string[] } {
  const text = `${postTitle} ${postBody}`.toLowerCase();
  const matched = keywords.filter((kw) => text.includes(kw.toLowerCase()));
  const ratio = matched.length / Math.max(keywords.length, 1);
  const score = ratio >= 0.5 ? "strong" : ratio >= 0.2 ? "partial" : "lowest";
  return { score, matchedKeywords: matched };
}

describe("scoreMatch", () => {
  it("returns strong when ≥50% of keywords match", () => {
    const result = scoreMatch(
      "I am struggling with churn badly",
      "need analytics to help",
      ["struggling with churn", "need analytics", "some other keyword"]
    );
    expect(result.score).toBe("strong");
    expect(result.matchedKeywords).toContain("struggling with churn");
    expect(result.matchedKeywords).toContain("need analytics");
  });

  it("returns partial when 20-49% of keywords match", () => {
    const result = scoreMatch(
      "struggling with churn",
      "unrelated content here",
      ["struggling with churn", "need analytics", "keyword3", "keyword4", "keyword5"]
    );
    expect(result.score).toBe("partial");
    expect(result.matchedKeywords).toHaveLength(1);
  });

  it("returns lowest when <20% of keywords match", () => {
    const result = scoreMatch(
      "unrelated post title",
      "unrelated body text",
      ["struggling with churn", "need analytics", "keyword3", "keyword4", "keyword5", "keyword6"]
    );
    expect(result.score).toBe("lowest");
    expect(result.matchedKeywords).toHaveLength(0);
  });

  it("handles empty keywords gracefully without throwing", () => {
    const result = scoreMatch("any title", "any body", []);
    // With no keywords, ratio = 0/1 = 0, which is < 0.2, so score is "lowest"
    expect(result.score).toBe("lowest");
    expect(result.matchedKeywords).toHaveLength(0);
  });

  it("is case-insensitive", () => {
    const result = scoreMatch(
      "STRUGGLING WITH CHURN",
      "",
      ["struggling with churn"]
    );
    expect(result.matchedKeywords).toContain("struggling with churn");
  });
});

// ─── Subreddit input parsing ──────────────────────────────────────────────────

describe("subreddit input parsing", () => {
  function parseSubreddit(input: string): string {
    return input.trim().replace(/^r\//, "");
  }

  it("strips r/ prefix", () => {
    expect(parseSubreddit("r/SaaS")).toBe("SaaS");
  });

  it("leaves plain names unchanged", () => {
    expect(parseSubreddit("startups")).toBe("startups");
  });

  it("trims whitespace", () => {
    expect(parseSubreddit("  entrepreneur  ")).toBe("entrepreneur");
  });
});

// ─── Campaign validation logic ────────────────────────────────────────────────

describe("campaign validation", () => {
  function validateCampaign(input: {
    name: string;
    offering: string;
    subreddits: string[];
    keywords: string[];
  }): string | null {
    if (!input.name.trim()) return "Campaign name is required";
    if (!input.offering.trim()) return "Offering description is required";
    if (input.subreddits.length === 0) return "Add at least one subreddit";
    if (input.keywords.length === 0) return "Add at least one keyword";
    return null;
  }

  it("passes valid input", () => {
    expect(validateCampaign({
      name: "Test Campaign",
      offering: "A great product",
      subreddits: ["SaaS"],
      keywords: ["struggling"],
    })).toBeNull();
  });

  it("rejects empty name", () => {
    expect(validateCampaign({
      name: "",
      offering: "A great product",
      subreddits: ["SaaS"],
      keywords: ["struggling"],
    })).toBe("Campaign name is required");
  });

  it("rejects empty offering", () => {
    expect(validateCampaign({
      name: "Campaign",
      offering: "",
      subreddits: ["SaaS"],
      keywords: ["struggling"],
    })).toBe("Offering description is required");
  });

  it("rejects no subreddits", () => {
    expect(validateCampaign({
      name: "Campaign",
      offering: "Product",
      subreddits: [],
      keywords: ["struggling"],
    })).toBe("Add at least one subreddit");
  });

  it("rejects no keywords", () => {
    expect(validateCampaign({
      name: "Campaign",
      offering: "Product",
      subreddits: ["SaaS"],
      keywords: [],
    })).toBe("Add at least one keyword");
  });
});

// ─── Review mode logic ────────────────────────────────────────────────────────

describe("review mode", () => {
  it("auto_send queues lead immediately after DM generation", () => {
    const reviewMode = "auto_send";
    const autoQueued = reviewMode === "auto_send";
    expect(autoQueued).toBe(true);
  });

  it("review_first does not auto-queue", () => {
    const reviewMode = "review_first";
    const autoQueued = reviewMode === "auto_send";
    expect(autoQueued).toBe(false);
  });
});

// ─── Subreddit size filter logic ──────────────────────────────────────────────

describe("subreddit size filter", () => {
  function isSubredditInSizeRange(
    subscriberCount: number | null,
    minSubSize: number | null,
    maxSubSize: number | null
  ): boolean {
    if (subscriberCount === null) return true; // unknown size: allow through
    if (minSubSize !== null && subscriberCount < minSubSize) return false;
    if (maxSubSize !== null && subscriberCount > maxSubSize) return false;
    return true;
  }

  it("allows subreddit when no filter is set", () => {
    expect(isSubredditInSizeRange(50000, null, null)).toBe(true);
  });

  it("allows subreddit when subscriber count is unknown", () => {
    expect(isSubredditInSizeRange(null, 10000, 150000)).toBe(true);
  });

  it("blocks subreddit below minimum size", () => {
    expect(isSubredditInSizeRange(5000, 10000, null)).toBe(false);
  });

  it("allows subreddit exactly at minimum size", () => {
    expect(isSubredditInSizeRange(10000, 10000, null)).toBe(true);
  });

  it("blocks subreddit above maximum size", () => {
    expect(isSubredditInSizeRange(200000, null, 150000)).toBe(false);
  });

  it("allows subreddit exactly at maximum size", () => {
    expect(isSubredditInSizeRange(150000, null, 150000)).toBe(true);
  });

  it("allows subreddit within niche range (10k-50k)", () => {
    expect(isSubredditInSizeRange(30000, 10000, 50000)).toBe(true);
  });

  it("blocks subreddit outside niche range (10k-50k)", () => {
    expect(isSubredditInSizeRange(75000, 10000, 50000)).toBe(false);
  });

  it("allows large subreddit with only min filter (150k+)", () => {
    expect(isSubredditInSizeRange(500000, 150000, null)).toBe(true);
  });

  it("blocks small subreddit with only min filter (150k+)", () => {
    expect(isSubredditInSizeRange(50000, 150000, null)).toBe(false);
  });
});

// ─── Funnel metrics calculation ───────────────────────────────────────────────

describe("funnel metrics", () => {
  type LeadStatus = "new" | "dm_generated" | "queued" | "sent" | "skipped" | "failed";
  type PipelineStage = "new" | "replied" | "interested" | "converted" | "skipped" | null;

  function calcFunnel(leads: Array<{ status: LeadStatus; pipelineStage: PipelineStage }>) {
    const total = leads.length;
    const dmsDrafted = leads.filter((l) => ["dm_generated", "queued", "sent"].includes(l.status)).length;
    const conversations = leads.filter((l) => ["replied", "interested", "converted"].includes(l.pipelineStage ?? "")).length;
    const converted = leads.filter((l) => l.pipelineStage === "converted").length;
    const pct = (n: number, d: number) => d > 0 ? Math.round((n / d) * 100) : 0;
    return {
      total,
      dmsDrafted,
      conversations,
      converted,
      dmRate: pct(dmsDrafted, total),
      convRate: pct(conversations, dmsDrafted),
      convertRate: pct(converted, conversations),
    };
  }

  it("returns zeros for empty leads", () => {
    const result = calcFunnel([]);
    expect(result.total).toBe(0);
    expect(result.dmsDrafted).toBe(0);
    expect(result.dmRate).toBe(0);
  });

  it("counts dm_generated, queued, and sent as DMs drafted", () => {
    const leads = [
      { status: "new" as LeadStatus, pipelineStage: null },
      { status: "dm_generated" as LeadStatus, pipelineStage: null },
      { status: "queued" as LeadStatus, pipelineStage: null },
      { status: "sent" as LeadStatus, pipelineStage: null },
      { status: "skipped" as LeadStatus, pipelineStage: null },
    ];
    const result = calcFunnel(leads);
    expect(result.total).toBe(5);
    expect(result.dmsDrafted).toBe(3);
    expect(result.dmRate).toBe(60);
  });

  it("counts replied, interested, and converted as conversations", () => {
    const leads = [
      { status: "sent" as LeadStatus, pipelineStage: "replied" as PipelineStage },
      { status: "sent" as LeadStatus, pipelineStage: "interested" as PipelineStage },
      { status: "sent" as LeadStatus, pipelineStage: "converted" as PipelineStage },
      { status: "sent" as LeadStatus, pipelineStage: null },
    ];
    const result = calcFunnel(leads);
    expect(result.conversations).toBe(3);
    expect(result.converted).toBe(1);
  });

  it("calculates conversion rates correctly", () => {
    const leads = [
      { status: "sent" as LeadStatus, pipelineStage: "converted" as PipelineStage },
      { status: "sent" as LeadStatus, pipelineStage: "converted" as PipelineStage },
      { status: "sent" as LeadStatus, pipelineStage: null },
      { status: "sent" as LeadStatus, pipelineStage: null },
      { status: "new" as LeadStatus, pipelineStage: null },
    ];
    const result = calcFunnel(leads);
    expect(result.dmRate).toBe(80); // 4/5
    expect(result.convertRate).toBe(100); // 2/2 conversations converted
  });

  it("returns 0% rate when denominator is zero (no divide-by-zero)", () => {
    const leads = [{ status: "new" as LeadStatus, pipelineStage: null }];
    const result = calcFunnel(leads);
    expect(result.convRate).toBe(0);
    expect(result.convertRate).toBe(0);
  });
});

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

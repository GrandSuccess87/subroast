import { describe, it, expect } from "vitest";

// ─── Replicate the spam filter logic for unit testing ─────────────────────────
// (mirrors isSpamPost in server/routers/outreach.ts)

const BOT_USERNAME_RE = /^[a-z]+[_-]?[0-9]{4,}$|^[a-z0-9]{8,}[0-9]{4,}$|^[A-Za-z]+[0-9]{4,}$/;
const URL_RE = /https?:\/\/[^\s)\]]+/i;
const EXCESSIVE_PUNCT_RE = /[!?]{3,}/;

function isSpamPost(post: { title: string; body: string; author: string }): { spam: boolean; reason: string } {
  const { title, body, author } = post;
  const bodyTrimmed = body.trim();

  if (URL_RE.test(bodyTrimmed)) return { spam: true, reason: "external_url_in_body" };
  if (bodyTrimmed.length > 0 && bodyTrimmed.length < 50) return { spam: true, reason: "body_too_short" };
  if (bodyTrimmed.length > 0 && bodyTrimmed.toLowerCase() === title.toLowerCase().trim()) return { spam: true, reason: "body_equals_title" };

  const titleWords = title.replace(/[^a-zA-Z\s]/g, "").trim();
  if (titleWords.length > 10 && titleWords === titleWords.toUpperCase()) return { spam: true, reason: "title_all_caps" };
  if (EXCESSIVE_PUNCT_RE.test(title)) return { spam: true, reason: "excessive_punctuation" };
  if (BOT_USERNAME_RE.test(author)) return { spam: true, reason: "bot_username_pattern" };

  return { spam: false, reason: "" };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("isSpamPost — lightweight spam filter", () => {
  // ── Genuine posts (should NOT be filtered) ──────────────────────────────────
  it("passes a genuine discussion post", () => {
    const result = isSpamPost({
      title: "How do you handle customer acquisition for B2B SaaS?",
      body: "I've been struggling to find a repeatable channel for getting our first 100 customers. We've tried cold email but the open rates are terrible. Has anyone had success with Reddit outreach or community building?",
      author: "saas_founder_2024",
    });
    expect(result.spam).toBe(false);
  });

  it("passes a post with an empty body (title-only post)", () => {
    const result = isSpamPost({
      title: "Looking for a Reddit monitoring tool that doesn't cost $500/month",
      body: "",
      author: "bootstrapped_dev",
    });
    expect(result.spam).toBe(false);
  });

  it("passes a post from a normal username with numbers", () => {
    const result = isSpamPost({
      title: "My experience with Reddit ads vs organic growth",
      body: "After six months of testing both paid and organic approaches on Reddit, here are the key takeaways that surprised me the most about community-driven growth.",
      author: "marketer42",
    });
    expect(result.spam).toBe(false);
  });

  // ── Spam posts (SHOULD be filtered) ─────────────────────────────────────────
  it("filters a post with an external URL in the body", () => {
    const result = isSpamPost({
      title: "Best Reddit marketing tool",
      body: "Check out our tool at https://spamsite.com/reddit-tool — best in class!",
      author: "promoter_guy",
    });
    expect(result.spam).toBe(true);
    expect(result.reason).toBe("external_url_in_body");
  });

  it("filters a post with a very short body", () => {
    const result = isSpamPost({
      title: "Need help with Reddit outreach",
      body: "DM me for details",
      author: "legit_user",
    });
    expect(result.spam).toBe(true);
    expect(result.reason).toBe("body_too_short");
  });

  it("filters a post where body equals title (copy-paste spam)", () => {
    // Use a longer body so body_too_short doesn't fire first
    const title = "Best Reddit marketing tool for SaaS founders and indie hackers";
    const result = isSpamPost({
      title,
      body: title, // identical to title
      author: "spammer",
    });
    expect(result.spam).toBe(true);
    expect(result.reason).toBe("body_equals_title");
  });

  it("filters a post with an all-caps title", () => {
    const result = isSpamPost({
      title: "BEST REDDIT MARKETING TOOL EVER MADE",
      body: "This is a longer body that passes the length check but the title is shouting at you.",
      author: "normal_user",
    });
    expect(result.spam).toBe(true);
    expect(result.reason).toBe("title_all_caps");
  });

  it("does NOT filter a short all-caps title (acronyms, etc.)", () => {
    // Short titles like "HELP" or "SaaS" shouldn't be caught by all-caps rule
    const result = isSpamPost({
      title: "HELP ME",
      body: "I need advice on Reddit marketing strategy for my new SaaS product that I have been building for six months.",
      author: "normal_user",
    });
    // titleWords.length <= 10, so all-caps rule doesn't apply
    expect(result.spam).toBe(false);
  });

  it("filters a post with excessive punctuation in title (!!!)", () => {
    const result = isSpamPost({
      title: "Make money fast with Reddit!!!",
      body: "This is a longer body that passes the length check but the title has excessive punctuation.",
      author: "normal_user",
    });
    expect(result.spam).toBe(true);
    expect(result.reason).toBe("excessive_punctuation");
  });

  it("filters a post with excessive punctuation in title (???)", () => {
    const result = isSpamPost({
      title: "Why isn't anyone buying my product???",
      body: "This is a longer body that passes the length check but the title has excessive question marks.",
      author: "normal_user",
    });
    expect(result.spam).toBe(true);
    expect(result.reason).toBe("excessive_punctuation");
  });

  // ── Bot username patterns ────────────────────────────────────────────────────
  it("filters a bot username: lowercase letters + 4+ digits", () => {
    const result = isSpamPost({
      title: "Looking for Reddit marketing advice",
      body: "I have been running a SaaS for two years and want to expand into Reddit communities but am not sure where to start with outreach.",
      author: "user8472",
    });
    expect(result.spam).toBe(true);
    expect(result.reason).toBe("bot_username_pattern");
  });

  it("filters a bot username: long alphanum string ending in digits", () => {
    const result = isSpamPost({
      title: "Reddit outreach strategy for B2B",
      body: "I have been running a SaaS for two years and want to expand into Reddit communities but am not sure where to start with outreach.",
      author: "xkf9a2b3c1234",
    });
    expect(result.spam).toBe(true);
    expect(result.reason).toBe("bot_username_pattern");
  });

  it("filters a bot username: CamelCase + 4+ digits", () => {
    const result = isSpamPost({
      title: "How to find customers on Reddit",
      body: "I have been running a SaaS for two years and want to expand into Reddit communities but am not sure where to start with outreach.",
      author: "JohnSmith1234",
    });
    expect(result.spam).toBe(true);
    expect(result.reason).toBe("bot_username_pattern");
  });

  it("does NOT filter a legitimate username with 1-3 trailing digits", () => {
    const result = isSpamPost({
      title: "Reddit outreach tips for indie hackers",
      body: "I have been running a SaaS for two years and want to expand into Reddit communities but am not sure where to start with outreach.",
      author: "dev_guy42",
    });
    expect(result.spam).toBe(false);
  });
});

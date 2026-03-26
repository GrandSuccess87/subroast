/**
 * Tests for the Arctic Shift search module.
 *
 * These tests mock the global fetch to avoid real network calls.
 * They verify the response parsing, fallback behaviour, and error handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchArcticShiftPosts } from "./arcticShift";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeFetchMock(body: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("searchArcticShiftPosts", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("returns mapped posts on a successful response", async () => {
    const rawPost = {
      id: "abc123",
      permalink: "/r/SaaS/comments/abc123/test_post/",
      title: "Looking for a Reddit monitoring tool",
      selftext: "I need something to track mentions automatically.",
      author: "indie_founder",
      subreddit: "SaaS",
      created_utc: 1700000000,
    };

    globalThis.fetch = makeFetchMock({ data: [rawPost] });

    const results = await searchArcticShiftPosts("SaaS", "monitoring tool", 10);

    expect(results).toHaveLength(1);
    const post = results[0];
    expect(post.id).toBe("abc123");
    expect(post.title).toBe("Looking for a Reddit monitoring tool");
    expect(post.body).toBe("I need something to track mentions automatically.");
    expect(post.author).toBe("indie_founder");
    expect(post.subreddit).toBe("SaaS");
    expect(post.url).toContain("reddit.com");
    expect(post.url).toContain("abc123");
    // createdUtc should be in milliseconds
    expect(post.createdUtc).toBe(1700000000 * 1000);
  });

  it("returns empty array when data field is missing", async () => {
    globalThis.fetch = makeFetchMock({});

    const results = await searchArcticShiftPosts("SaaS", "keyword");
    expect(results).toEqual([]);
  });

  it("returns empty array when data is an empty array", async () => {
    globalThis.fetch = makeFetchMock({ data: [] });

    const results = await searchArcticShiftPosts("SaaS", "keyword");
    expect(results).toEqual([]);
  });

  it("returns empty array on non-OK HTTP status", async () => {
    globalThis.fetch = makeFetchMock({ error: "rate limited" }, 429);

    const results = await searchArcticShiftPosts("SaaS", "keyword");
    expect(results).toEqual([]);
  });

  it("returns empty array when fetch throws (network error)", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("network error"));

    const results = await searchArcticShiftPosts("SaaS", "keyword");
    expect(results).toEqual([]);
  });

  it("handles posts with string created_utc (API sometimes returns strings)", async () => {
    const rawPost = {
      id: "xyz789",
      permalink: "/r/entrepreneur/comments/xyz789/post/",
      title: "Need help with outreach",
      selftext: "How do I reach potential customers on Reddit?",
      author: "founder99",
      subreddit: "entrepreneur",
      created_utc: "1700000000",
    };

    globalThis.fetch = makeFetchMock({ data: [rawPost] });

    const results = await searchArcticShiftPosts("entrepreneur", "outreach");
    expect(results).toHaveLength(1);
    expect(results[0].createdUtc).toBe(1700000000 * 1000);
  });

  it("filters out posts without an id field", async () => {
    const posts = [
      { title: "No ID post", selftext: "body", author: "user1" },
      { id: "valid1", title: "Valid post", selftext: "body", author: "user2", subreddit: "SaaS", created_utc: 1700000000 },
    ];

    globalThis.fetch = makeFetchMock({ data: posts });

    const results = await searchArcticShiftPosts("SaaS", "keyword");
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("valid1");
  });

  it("constructs a fallback URL when permalink is missing", async () => {
    const rawPost = {
      id: "nopermalink",
      title: "Post without permalink",
      selftext: "body text",
      author: "user",
      subreddit: "SaaS",
      created_utc: 1700000000,
    };

    globalThis.fetch = makeFetchMock({ data: [rawPost] });

    const results = await searchArcticShiftPosts("SaaS", "keyword");
    expect(results).toHaveLength(1);
    expect(results[0].url).toContain("reddit.com");
    expect(results[0].url).toContain("nopermalink");
  });

  it("includes the subreddit and keyword in the request URL", async () => {
    const fetchMock = makeFetchMock({ data: [] });
    globalThis.fetch = fetchMock;

    await searchArcticShiftPosts("entrepreneur", "saas tool");

    const calledUrl = (fetchMock.mock.calls[0][0] as string);
    expect(calledUrl).toContain("subreddit=entrepreneur");
    expect(calledUrl).toContain("saas+tool");
  });

  it("respects the afterDays parameter", async () => {
    const fetchMock = makeFetchMock({ data: [] });
    globalThis.fetch = fetchMock;

    const beforeCall = new Date();
    await searchArcticShiftPosts("SaaS", "keyword", 10, 7);

    const calledUrl = (fetchMock.mock.calls[0][0] as string);
    const afterParam = new URL(calledUrl).searchParams.get("after");
    expect(afterParam).toBeTruthy();

    // Arctic Shift requires a Unix timestamp (seconds) — parse as integer and
    // convert to ms to compute the diff. Allow ±1 day tolerance.
    const afterTimestampMs = parseInt(afterParam!, 10) * 1000;
    const diffDays = (beforeCall.getTime() - afterTimestampMs) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThanOrEqual(6);
    expect(diffDays).toBeLessThanOrEqual(8);
  });
});

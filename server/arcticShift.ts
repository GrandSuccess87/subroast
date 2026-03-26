/**
 * Arctic Shift API client for Reddit post search.
 *
 * Arctic Shift (https://arctic-shift.photon-reddit.com) is a third-party
 * Reddit data mirror that is NOT subject to Reddit's IP-based rate limiting.
 * When the production server IP is blocked by Reddit's public API, this
 * module provides a reliable fallback for lead discovery.
 *
 * API docs: https://github.com/ArthurHeitmann/arctic_shift/tree/master/api
 *
 * Key endpoint: GET /api/posts/search
 *   - subreddit: filter by subreddit name
 *   - query: keyword search in title + selftext
 *   - after: ISO date string (posts after this date)
 *   - sort: "desc" for newest first
 *   - limit: 1–100 (or "auto" for up to 1000)
 *
 * No authentication required. No rate limit guarantees — use responsibly.
 */

const ARCTIC_SHIFT_BASE = "https://arctic-shift.photon-reddit.com";

export interface ArcticShiftPost {
  id: string;
  url: string;
  title: string;
  body: string;
  author: string;
  subreddit: string;
  createdUtc: number; // milliseconds
}

interface ArcticShiftRawPost {
  id: string;
  permalink?: string;
  title?: string;
  selftext?: string;
  author?: string;
  subreddit?: string;
  created_utc?: number | string;
}

/**
 * Search Reddit posts via the Arctic Shift mirror API.
 *
 * @param subreddit - subreddit name (without r/)
 * @param keyword   - keyword to search in title + body
 * @param limit     - max results (1–100)
 * @param afterDays - only return posts from the last N days (default: 30)
 */
export async function searchArcticShiftPosts(
  subreddit: string,
  keyword: string,
  limit = 10,
  afterDays = 30
): Promise<ArcticShiftPost[]> {
  try {
    const afterDate = new Date(Date.now() - afterDays * 24 * 60 * 60 * 1000);
    const afterStr = afterDate.toISOString().split("T")[0]; // YYYY-MM-DD

    const params = new URLSearchParams({
      subreddit,
      query: keyword,
      after: afterStr,
      sort: "desc",
      limit: String(Math.min(limit, 100)),
      fields: "id,permalink,title,selftext,author,subreddit,created_utc",
    });

    const url = `${ARCTIC_SHIFT_BASE}/api/posts/search?${params.toString()}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "SubRoast/1.0 lead-discovery-bot",
        Accept: "application/json",
      },
      // 15 second timeout — Arctic Shift can be slow under load
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      console.warn(`[ArcticShift] HTTP ${res.status} for r/${subreddit} + "${keyword}"`);
      return [];
    }

    const json = await res.json() as { data?: ArcticShiftRawPost[] };
    const posts = json.data ?? [];

    return posts
      .filter((p): p is ArcticShiftRawPost & { id: string } => Boolean(p.id))
      .map((p) => {
        const createdUtcRaw = p.created_utc;
        const createdSec = typeof createdUtcRaw === "string"
          ? parseFloat(createdUtcRaw)
          : (createdUtcRaw ?? 0);
        return {
          id: p.id,
          url: p.permalink
            ? `https://reddit.com${p.permalink}`
            : `https://reddit.com/r/${p.subreddit ?? subreddit}/comments/${p.id}/`,
          title: p.title ?? "",
          body: p.selftext ?? "",
          author: p.author ?? "[deleted]",
          subreddit: p.subreddit ?? subreddit,
          createdUtc: createdSec * 1000,
        };
      });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[ArcticShift] Search failed for r/${subreddit} + "${keyword}": ${msg}`);
    return [];
  }
}

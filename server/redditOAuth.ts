import type { Express, Request, Response } from "express";
import { nanoid } from "nanoid";
import { deactivateRedditAccount, getDb, upsertRedditAccount } from "./db";
import { sdk } from "./_core/sdk";
import {
  exchangeRedditCode,
  getRedditAuthUrl,
  getRedditMe,
} from "./reddit";
import { redditOAuthStates } from "../drizzle/schema";
import { eq, lt } from "drizzle-orm";

async function getSessionUser_safe(req: Request): Promise<{ id: number } | null> {
  try {
    return await sdk.authenticateRequest(req);
  } catch {
    return null;
  }
}

// Clean up expired states (older than 10 minutes) from DB
async function cleanExpiredStates() {
  const db = await getDb();
  if (!db) return;
  const cutoff = Date.now() - 10 * 60 * 1000;
  try {
    await db.delete(redditOAuthStates).where(lt(redditOAuthStates.createdAt, cutoff));
  } catch { /* non-critical */ }
}

export function registerRedditOAuthRoutes(app: Express) {
  // Step 1: Initiate Reddit OAuth
  app.get("/api/reddit/connect", async (req: Request, res: Response) => {
    const user = await getSessionUser_safe(req);
    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    const origin = (req.query.origin as string) || `${req.protocol}://${req.get("host")}`;
    const redirectUri = `${origin}/api/reddit/callback`;
    const state = nanoid(32);

    // Store state in DB so it survives across server instances
    await db.insert(redditOAuthStates).values({
      state,
      userId: user.id,
      redirectUri,
      createdAt: Date.now(),
    });

    // Clean up old states opportunistically
    cleanExpiredStates().catch(() => {});

    const authUrl = getRedditAuthUrl(state, redirectUri);
    res.redirect(authUrl);
  });

  // Step 2: Reddit OAuth callback
  app.get("/api/reddit/callback", async (req: Request, res: Response) => {
    const { code, state, error } = req.query as Record<string, string>;

    if (error) {
      res.redirect(`/dashboard/settings?reddit_error=${encodeURIComponent(error)}`);
      return;
    }

    const db = await getDb();
    if (!db) {
      res.redirect("/dashboard/settings?reddit_error=db_unavailable");
      return;
    }

    // Look up state from DB
    const [stateRow] = await db
      .select()
      .from(redditOAuthStates)
      .where(eq(redditOAuthStates.state, state))
      .limit(1);

    if (!stateRow) {
      res.redirect("/dashboard/settings?reddit_error=invalid_state");
      return;
    }

    // Delete state immediately (one-time use)
    await db.delete(redditOAuthStates).where(eq(redditOAuthStates.state, state));

    // Check state is not expired (10 min window)
    if (Date.now() - stateRow.createdAt > 10 * 60 * 1000) {
      res.redirect("/dashboard/settings?reddit_error=state_expired");
      return;
    }

    try {
      const tokens = await exchangeRedditCode(code, stateRow.redirectUri);
      const me = await getRedditMe(tokens.access_token);
      const expiresAt = Date.now() + tokens.expires_in * 1000;

      await upsertRedditAccount({
        userId: stateRow.userId,
        redditUsername: me.name,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: expiresAt,
        scopes: tokens.scope,
        isActive: true,
        failureCount: 0,
        isPaused: false,
      });

      // Redirect back to the origin that initiated the flow
      const frontendOrigin = new URL(stateRow.redirectUri).origin;
      res.redirect(`${frontendOrigin}/dashboard/settings?reddit_connected=1`);
    } catch (err) {
      console.error("[Reddit OAuth] Callback error:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      const frontendOrigin = stateRow?.redirectUri
        ? new URL(stateRow.redirectUri).origin
        : "";
      res.redirect(`${frontendOrigin}/dashboard/settings?reddit_error=${encodeURIComponent(msg)}`);
    }
  });

  // Step 3: Disconnect Reddit account
  app.post("/api/reddit/disconnect", async (req: Request, res: Response) => {
    const user = await getSessionUser_safe(req);
    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    await deactivateRedditAccount(user.id);
    res.json({ success: true });
  });
}

import type { Express, Request, Response } from "express";
import { nanoid } from "nanoid";
import { deactivateRedditAccount, upsertRedditAccount } from "./db";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";
import {
  exchangeRedditCode,
  getRedditAuthUrl,
  getRedditMe,
} from "./reddit";

// In-memory state store for CSRF protection (production: use Redis/DB)
const oauthStates = new Map<string, { userId: number; redirectUri: string; createdAt: number }>();

// Clean up expired states every 10 minutes
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  oauthStates.forEach((value, key) => {
    if (now - value.createdAt > 10 * 60 * 1000) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(k => oauthStates.delete(k));
}, 10 * 60 * 1000);

async function getSessionUser_safe(req: Request): Promise<{ id: number } | null> {
  try {
    return await sdk.authenticateRequest(req);
  } catch {
    return null;
  }
}

export function registerRedditOAuthRoutes(app: Express) {
  // Step 1: Initiate Reddit OAuth
  app.get("/api/reddit/connect", async (req: Request, res: Response) => {
    const user = await getSessionUser_safe(req);
    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const origin = (req.query.origin as string) || `${req.protocol}://${req.get("host")}`;
    const redirectUri = `${origin}/api/reddit/callback`;
    const state = nanoid(32);

    oauthStates.set(state, { userId: user.id, redirectUri, createdAt: Date.now() });

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

    const stateData = oauthStates.get(state);
    if (!stateData) {
      res.redirect("/dashboard/settings?reddit_error=invalid_state");
      return;
    }
    oauthStates.delete(state);

    try {
      const tokens = await exchangeRedditCode(code, stateData.redirectUri);
      const me = await getRedditMe(tokens.access_token);
      const expiresAt = Date.now() + tokens.expires_in * 1000;

      await upsertRedditAccount({
        userId: stateData.userId,
        redditUsername: me.name,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: expiresAt,
        scopes: tokens.scope,
        isActive: true,
        failureCount: 0,
        isPaused: false,
      });

      res.redirect("/dashboard/settings?reddit_connected=1");
    } catch (err) {
      console.error("[Reddit OAuth] Callback error:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      res.redirect(`/dashboard/settings?reddit_error=${encodeURIComponent(msg)}`);
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

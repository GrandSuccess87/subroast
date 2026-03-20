import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { sendSignupEmail } from "../signupEmail";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      // Parse origin and returnPath from state (JSON encoded by frontend)
      let redirectOrigin = `${req.protocol}://${req.get("host")}`;
      let returnPath = "/";
      try {
        const decoded = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
        if (decoded.origin) redirectOrigin = decoded.origin;
        if (decoded.returnPath) returnPath = decoded.returnPath;
      } catch {
        // Legacy state format (plain base64 of redirectUri) — fall back gracefully
        try {
          const legacyUri = Buffer.from(state, "base64").toString("utf-8");
          const parsed = new URL(legacyUri);
          redirectOrigin = parsed.origin;
        } catch { /* ignore */ }
      }

      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      // Check if this is a brand-new user before upserting
      const existingUser = await db.getUserByOpenId(userInfo.openId);
      const isNewUser = !existingUser;

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      // Fire signup notification email for first-time users (non-blocking)
      if (isNewUser) {
        sendSignupEmail({
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          openId: userInfo.openId,
        }).catch((err) => console.warn("[OAuth] Signup email failed:", err));
      }

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // New users always go to /onboarding; returning users go to returnPath or /dashboard
      let finalPath: string;
      if (isNewUser) {
        finalPath = "/onboarding";
      } else {
        // Check if returning user has completed onboarding
        const freshUser = await db.getUserByOpenId(userInfo.openId);
        const onboardingDone = !!(freshUser as Record<string, unknown>)?.onboardingCompletedAt;
        if (!onboardingDone) {
          finalPath = "/onboarding";
        } else {
          // Honour the returnPath from state (e.g. /dashboard) but only allow same-origin paths
          finalPath = returnPath.startsWith("/") ? returnPath : "/dashboard";
        }
      }

      res.redirect(302, `${redirectOrigin}${finalPath}`);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

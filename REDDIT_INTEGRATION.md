# Reddit Integration — Status & Re-enable Guide

## Current Status: **Disabled (manual copy-paste mode)**

As of v5.9, SubRoast operates in **manual copy-paste mode**. The Reddit API integration is fully built and tested but intentionally disabled while awaiting Reddit's API approval for commercial use. Users copy generated DMs, comments, and posts to their clipboard and paste them directly on Reddit.

---

## Why It's Disabled

Reddit requires manual approval for any commercial application that requests the `submit` or `privatemessages` OAuth scopes. A support ticket was submitted but has not been resolved. The policy page shown during app registration:

> https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy

This is an account-level gate — not a technical limitation. The integration code is complete and production-ready.

---

## What Was Built

The full Reddit OAuth + send pipeline is implemented across these files:

| File | Purpose |
|---|---|
| `server/redditOAuth.ts` | OAuth flow: `/api/reddit/connect`, `/api/reddit/callback`, `/api/reddit/disconnect` |
| `server/reddit.ts` | API helpers: `sendRedditDM`, `submitRedditPost`, `postComment`, `getRedditMe`, `exchangeRedditCode`, `getRedditAuthUrl` |
| `server/rateLimiter.ts` | Per-user rate limiting: 5 posts/day, 25 DMs/day, 5 DMs/hour |
| `server/jobProcessor.ts` | Background queue processor (60s interval) for rate-limited DMs |
| `server/routers/outreach.ts` | `generateDm`, `sendDm`, `sendComment` tRPC procedures |
| `server/routers.ts` | `schedule.postNow` — AI picks optimal viral time, posts or schedules |
| `drizzle/schema.ts` | `redditAccounts` table: stores encrypted tokens, scopes, pause state |
| `server/db.ts` | `upsertRedditAccount`, `getRedditAccountByUserId`, `deactivateRedditAccount` |

**OAuth scopes requested:** `submit privatemessages read identity`

**Token storage:** Access and refresh tokens are stored in the `redditAccounts` table. Refresh is handled automatically before each API call via `getValidAccessToken()` in `server/reddit.ts`.

---

## How to Re-enable (When Reddit Approves)

### Step 1 — Add credentials as secrets

```
REDDIT_CLIENT_ID=<from Reddit app settings>
REDDIT_CLIENT_SECRET=<from Reddit app settings>
```

Use `webdev_request_secrets` to add these. The redirect URI registered with Reddit must be:
```
https://subroast.com/api/reddit/callback
```

### Step 2 — Re-enable the Settings page Reddit connect UI

In `client/src/pages/SettingsPage.tsx`, find the `REDDIT_CONNECT_DISABLED` block and replace it with the original connect card. The full original UI is preserved in git history at commit `c16cfc34`.

### Step 3 — Re-enable the onboarding checklist step

In `server/routers/onboarding.ts`, the `reddit_connected` step currently returns `comingSoon: true`. Remove that flag and the step will resume tracking real connection state.

### Step 4 — Re-enable Send DM / Send Comment buttons

In `client/src/pages/DmCampaigns.tsx`:
- Replace the `Copy & Open` DM button with the `Send DM` button (calls `onSendDm`)
- Replace the `Copy & Open` comment button with the `Send Comment` button (calls `onSendComment`)
- Re-wire `onSendDm` and `onSendComment` props in `CampaignDetail`

### Step 5 — Re-enable Post at Optimal Time

In `client/src/pages/DraftRoast.tsx`, the "Post at Optimal Time" button currently shows a "coming soon" state. Remove the disabled flag — it calls `trpc.schedule.postNow` which is fully implemented.

### Step 6 — Re-enable rate limit display in Settings

In `client/src/pages/SettingsPage.tsx`, the Daily Limits card is currently hidden. Uncomment it to restore the posts/DMs usage bars.

---

## Alternative Approaches (If Approval Is Denied)

### Option A — Bring Your Own Credentials (BYOC)

Each user registers a **script-type** Reddit app on their own account (no redirect URI needed, no approval required) and pastes their client ID + secret into SubRoast Settings. SubRoast uses per-user credentials via the `password` grant type.

**Implementation effort:** ~1 day. Requires updating `SettingsPage.tsx` to add a credential form, updating `redditOAuth.ts` to support password grant, and adding a step-by-step in-app guide with screenshots.

**UX tradeoff:** Users must complete a one-time setup (~3 min). Suitable for technical alpha users; higher friction for cold traffic.

### Option B — Browser Extension

A Chrome extension that injects into Reddit's web UI and handles posting/DM sending on behalf of the user using their active browser session. No API keys, no OAuth approval, no user credentials stored.

**Implementation effort:** ~2–3 weeks. Requires a separate Chrome extension codebase, a messaging protocol between the extension and SubRoast, and Chrome Web Store submission.

**UX tradeoff:** One-click install from Chrome Web Store. Best long-term option if Reddit approval is permanently denied.

---

## Current Manual Flow (v5.9+)

1. User generates DM/comment/post via SubRoast as normal
2. **Copy & Open** button copies text to clipboard and opens the relevant Reddit URL in a new tab
3. User pastes and submits manually on Reddit
4. User clicks **Mark as Contacted** on the lead card to log the outreach
5. Lead status updates to `contacted` with a green indicator

This flow requires zero Reddit API credentials and works for all users immediately.

---

## Support Ticket Reference

- Submitted: ~March 2026
- Status: Awaiting response
- Policy URL: https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy
- When approved: follow the re-enable steps above, add `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` via `webdev_request_secrets`

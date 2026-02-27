# SubRoast

**SubRoast: Stop guessing on Reddit.**

SubRoast helps indie SaaS founders draft smarter Reddit posts and DMs, get AI feedback and roasts, then automatically post/send while respecting Reddit's rate limits.

---

## Features

- **AI Draft & Roast** — Paste your post or DM, get a structured review (clarity, subreddit fit, promo risk), a brutal roast, and an improved version
- **Smart Scheduling** — Pick a date/time, SubRoast auto-posts at the right moment (max 5/day, 30-min cooldown)
- **Rate-Limited DM Campaigns** — Upload a username list, send DMs at 5/hour with 2–10 min randomized delays (max 25/day)
- **Safety Guardrails** — Auto-pause after 3 failures, warnings at 80% daily limit
- **Post History & Insights** — Track all posts with status and Reddit engagement tips

---

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- MySQL/TiDB database

### Installation

```bash
git clone <repo>
cd subroast
pnpm install
```

### Environment Variables

Copy the example env file:

```bash
cp .env.example .env
```

Required variables:

```env
# Database
DATABASE_URL=mysql://user:password@host:3306/subroast

# Auth (Manus OAuth)
JWT_SECRET=your-jwt-secret
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-forge-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-key
BUILT_IN_FORGE_API_URL=https://api.manus.im

# Reddit OAuth2 (see below)
REDDIT_CLIENT_ID=your-reddit-client-id
REDDIT_CLIENT_SECRET=your-reddit-client-secret
REDDIT_REDIRECT_URI=http://localhost:3000/api/reddit/callback
```

### Run locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How to Add Your Reddit App Credentials

### Step 1: Create a Reddit App

1. Go to [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
2. Scroll to the bottom and click **"create another app..."**
3. Fill in:
   - **Name**: SubRoast (or any name)
   - **Type**: Select **"web app"**
   - **Description**: Optional
   - **About URL**: Your website URL (optional)
   - **Redirect URI**: `http://localhost:3000/api/reddit/callback` (for local dev)
     - For production: `https://your-domain.com/api/reddit/callback`
4. Click **"create app"**

### Step 2: Get Your Credentials

After creating the app, you'll see:
- **Client ID**: The string under the app name (looks like `abc123def456`)
- **Client Secret**: The "secret" field (click to reveal)

### Step 3: Add to .env

```env
REDDIT_CLIENT_ID=abc123def456
REDDIT_CLIENT_SECRET=your-secret-here
REDDIT_REDIRECT_URI=http://localhost:3000/api/reddit/callback
```

### Required Reddit Scopes

SubRoast requests these OAuth scopes:
- `identity` — Read your Reddit username
- `submit` — Post to subreddits
- `privatemessages` — Send direct messages
- `read` — Read posts to verify submission

### Production Deployment

For Vercel deployment:
1. Set all environment variables in Vercel dashboard
2. Update `REDDIT_REDIRECT_URI` to your production URL
3. Update the redirect URI in your Reddit app settings to match

---

## Rate Limits

SubRoast enforces these limits to keep your account safe:

| Action | Limit |
|--------|-------|
| Posts per day | 5 |
| Cooldown between posts | 30 minutes |
| DMs per day | 25 |
| DMs per hour | 5 |
| Delay between DMs | 2–10 minutes (randomized) |
| Auto-pause trigger | 3 consecutive failures |
| Warning threshold | 80% of daily limit |

---

## Tech Stack

- **Frontend**: React 19 + Tailwind CSS 4 + shadcn/ui
- **Backend**: Express + tRPC 11
- **Database**: MySQL/TiDB via Drizzle ORM
- **Auth**: Manus OAuth
- **AI**: Built-in LLM API (OpenAI-compatible)
- **Background Jobs**: In-process job processor (60s polling)

---

## Project Structure

```
client/src/
  pages/
    Home.tsx          ← Landing page
    Dashboard.tsx     ← Dashboard overview
    DraftRoast.tsx    ← AI analysis page
    Schedule.tsx      ← Post scheduling
    DmCampaigns.tsx   ← DM campaign manager
    HistoryPage.tsx   ← Post history + insights
    SettingsPage.tsx  ← Reddit connection + limits
server/
  routers.ts          ← All tRPC procedures
  reddit.ts           ← Reddit API client
  redditOAuth.ts      ← Reddit OAuth2 flow
  rateLimiter.ts      ← Rate limit enforcement
  jobProcessor.ts     ← Background job runner
  db.ts               ← Database query helpers
drizzle/
  schema.ts           ← Database schema
```

---

## License

MIT

# SubSignal TODO

## Database & Schema
- [x] Reddit accounts table (tokens, scopes, status)
- [x] Scheduled posts table
- [x] DM campaigns table
- [x] DM recipients table
- [x] Post history table
- [x] Rate limit tracking table

## Reddit OAuth2
- [x] Reddit OAuth2 connect flow (authorize URL)
- [x] Reddit OAuth2 callback handler
- [x] Token refresh logic
- [x] Reddit API client (post, DM, token refresh)
- [x] Disconnect Reddit account

## AI Draft & Roast
- [x] tRPC procedure: analyze post with structured JSON response
- [x] AI prompt returning review/roast/improved_draft
- [x] Draft & Roast UI page (textarea + subreddit input)
- [x] Display review scores (clarity, fit, promo_risk)
- [x] Display roast lines
- [x] Display improved draft with copy button

## Schedule & Auto-posting
- [x] tRPC procedure: create scheduled post
- [x] tRPC procedure: list scheduled posts
- [x] Background job runner (cron-based polling)
- [x] Rate limit enforcement (5/day, 30min between posts)
- [x] Auto-pause after 3+ failures
- [x] 80% daily limit warning
- [x] Schedule UI page (date/time picker + subreddit)

## DM Campaigns
- [x] tRPC procedure: create DM campaign
- [x] tRPC procedure: list campaigns
- [x] DM queue processor (5/hr, 25/day, 2-10min delays)
- [x] Campaign status tracking (active/paused/completed)
- [x] DM Campaigns UI page (username list + message)
- [x] Campaign progress display

## History
- [x] tRPC procedure: list post history
- [x] History table UI with status, subreddit, timestamp
- [x] Simple insights display

## Settings
- [x] tRPC procedure: get/update settings
- [x] Reddit connection status display
- [x] Daily limits display (Posts: 5, DMs: 25)
- [x] Reconnect Reddit option

## Landing Page
- [x] Headline: "SubSignal: Stop guessing on Reddit"
- [x] Target audience description
- [x] CTA button: "Connect Reddit"
- [x] Feature highlights section

## Dashboard
- [x] DashboardLayout with sidebar navigation
- [x] Draft & Roast nav item
- [x] Schedule nav item
- [x] DM Campaigns nav item
- [x] History nav item
- [x] Settings nav item
- [x] Dashboard overview/stats

## Tests
- [x] Reddit OAuth procedure tests
- [x] AI roast procedure tests
- [x] Rate limiting logic tests
- [x] DM campaign queue tests

## UI Redesign (v2)
- [x] Dark theme: near-black bg, green accent, off-white text
- [x] DashboardLayout: grouped sidebar nav with section labels (COMPOSE, OUTREACH, ANALYZE, ACCOUNT)
- [x] Sidebar: usage progress bar at bottom (like LeadVerse plan widget)
- [x] Landing page: dark hero section, green accent on CTA, feature list with icons
- [x] All pages: dark card backgrounds, subtle borders, green highlights on active states
- [x] HistoryPage: dark theme redesign
- [x] SettingsPage: dark theme redesign with progress bars for limits

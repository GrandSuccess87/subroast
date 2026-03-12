# SubRoast TODO

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
- [x] Headline: "SubRoast: Stop guessing on Reddit"
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

## Feature Additions (v3)
- [x] Virality score (1-100) added to AI roast structured JSON output with actionable tip
- [x] Draft & Roast UI: display virality score prominently with label and tip
- [x] Auto-scheduling: remove manual time picker, AI picks optimal time in 3-7pm EST window
- [x] Schedule page: show "Scheduled for today at X:XXpm EST" with optional override
- [x] DB schema: add campaigns v2 table (name, offering, website_url, subreddits, keywords, ai_prompt, review_mode, status)
- [x] DB schema: add leads table (campaign_id, reddit_post_url, author, post_title, post_body, match_score, dm_draft, status)
- [x] tRPC: createCampaign with AI subreddit+keyword recommendations
- [x] tRPC: recommendSubreddits - AI engine based on campaign description
- [x] tRPC: syncLeads - poll Reddit public search API for matching posts
- [x] tRPC: generateDM - AI writes personalized DM using campaign context + lead post
- [x] tRPC: sendDM / queueDM - rate-limited send with review toggle
- [x] DM Campaigns page: full redesign - campaign setup form with AI recommendations
- [x] DM Campaigns page: leads inbox with match score badges (Strong/Partial/Lowest)
- [x] DM Campaigns page: Generate DM button per lead, review modal, send/queue action
- [x] DM Campaigns page: review toggle (Auto-send vs Review before send) per campaign
- [x] Sidebar: add "Leads" nav item under OUTREACH section

## Payments & Subscriptions (v4)
- [x] Stripe integration setup (webdev_add_feature)
- [x] DB schema: subscriptions table (userId, stripeCustomerId, stripeSubscriptionId, plan, status, trialStartAt, trialEndsAt, currentPeriodEnd)
- [x] DB schema: add plan/trialEndsAt fields to users table
- [x] Stripe products/prices: Starter $19/mo, Growth $49/mo
- [x] tRPC: createCheckoutSession (with 7-day trial)
- [x] tRPC: createPortalSession (manage billing)
- [x] tRPC: getSubscriptionStatus
- [x] Stripe webhook handler (checkout.session.completed, customer.subscription.updated/deleted, invoice.payment_failed)
- [x] Campaign paywall: limit to 1 campaign on Starter/trial, unlimited on Growth
- [x] Pricing page with two-tier cards ($19 Starter / $49 Growth)
- [x] Trial banner in dashboard showing days remaining
- [x] Upgrade prompt modal when user hits campaign limit
- [x] Day 6 trial reminder email (background job)
- [x] New leads email notification (per campaign, on lead sync)
- [x] Tests for subscription gating logic

## Billing UX (v4.1)
- [x] Settings page: Manage Billing section showing current plan, trial status, and Stripe portal button

## Auto-sync & UX Polish (v4.2)
- [x] Settings page: remove "Setup your own Reddit app" card
- [x] Background job: auto-sync Starter campaigns twice daily (8am + 8pm EST), staggered with 500ms delay between campaigns
- [x] Background job: auto-sync Growth campaigns every 4 hours, staggered with 500ms delay between campaigns
- [x] Pricing page: add sync frequency as a plan differentiator (2x/day vs 6x/day)

## UX Polish & Pricing (v4.3)
- [x] Pricing page: restructure Growth features (Everything in Starter first, then Unlimited campaigns, then 6x sync), remove redundant posts/DMs lines
- [x] Pricing page: lower Growth price from $49 to $39/mo
- [x] Stripe products.ts: update Growth price to $39
- [x] Fix login flash: show loading skeleton while auth state resolves instead of flashing Sign In page

## Campaign Sync UX (v4.4)
- [x] DM Campaigns: show "Last synced X ago" and "Next sync in Y" per campaign card based on plan sync frequency

## Onboarding Checklist (v4.5)
- [x] tRPC: onboarding.getStatus procedure — checks Reddit connected, campaign created, first lead synced, first post drafted
- [x] DB: add onboardingDismissedAt field to users table so dismissal persists
- [x] Dashboard: dismissible OnboardingChecklist card showing step completion with progress bar
- [x] Checklist auto-hides once all steps complete or user dismisses

## Onboarding Copy (v4.5.1)
- [x] Onboarding step 4: rename to "Roast your first post & check your virality score", update description, remove word "draft"

## Landing Page Polish (v4.6)
- [x] Hero: simplify safety callout to one clean line instead of dense specs
- [x] Rate Limiting section: increase heading and body font sizes

## Landing Page Features (v4.7)
- [x] Add Virality Score as 6th feature card
- [x] Update DM Campaigns card to reflect AI-personalized outreach
- [x] Update Account Safety card to remove auto-pause language
- [x] Update Smart Scheduling card to remove "Pick a time,"

## Rebrand & Landing Redesign (v5.0)
- [ ] Rename SubRoast → SubRoast across all files (title, sidebar, emails, onboarding, pricing, copy)
- [ ] Landing page: asymmetric hero with product UI mockup on the right
- [ ] Landing page: add "How it works in 3 steps" section

## Lead Card Simplification & New Actions (v5.1)
- [x] LeadCard: remove pipeline stage selector buttons (New/Replied/Interested/Converted/Skip)
- [x] LeadCard: remove Sentiment score bar, keep only Fit + Urgency (2-column grid)
- [x] LeadCard: remove LeadHeatBadge (On Fire/Hot/Warm/Cold) — too noisy
- [x] LeadCard: hide MatchBadge for "lowest" score — only show Strong/Partial
- [x] LeadCard: hide IntentBadge for venting/unknown — only show Hiring/Buying/Seeking Advice
- [x] LeadCard: add clipboard copy icon next to "View DM draft" toggle
- [x] LeadCard: add "Draft Comment" button to generate public comment reply
- [x] LeadCard: add "Cancel Queue" button for queued leads (reverts to dm_generated)
- [x] DB schema: add commentDraft column to outreach_leads table
- [x] tRPC: cancelQueuedLead procedure — reverts queued lead to dm_generated
- [x] tRPC: generateComment procedure — AI writes public comment draft (no pitch)
- [x] Sign-in modal: already shows "Sign in to SubRoast" (confirmed no SubSignal references)
- [x] All 69 tests passing, TypeScript clean

## Schedule Post Removal & Homepage Copy (v5.2)
- [x] Sidebar: remove "Schedule Post" nav item from Compose section
- [x] Dashboard quick actions: remove "Schedule a Post" card
- [x] Dashboard stats grid: remove "Scheduled" stat card
- [x] Dashboard: remove trpc.schedule.list.useQuery and pendingPosts variable
- [x] Homepage hero subtext: remove "schedules it at the perfect time" language
- [x] Homepage features grid: remove "Smart Scheduling" feature card
- [x] Homepage How It Works: remove Step 02 "Schedule it automatically", renumber to 2 steps
- [x] Homepage How It Works: update subtitle from "Three steps" to "Two steps"
- [x] Homepage How It Works: change grid from 3-col to 2-col

## DM Prompt Overhaul (v5.3)
- [x] Rewrite generateDm system prompt: no product mentions, no pitching, conversation-first
- [x] Rewrite generateDm user prompt: reference specific post details, share insight, end with follow-up questions, 180 word limit
- [x] Campaign offering field now used as sender context only (not pitched in the DM)

## Immediate DM Send (v5.4)
- [x] generateDm now attempts immediate send after AI generation (no queue delay)
- [x] Rate limit check inline: if limit hit, falls back to queue automatically
- [x] No Reddit account connected: saves draft, returns reason "no_reddit_account"
- [x] Send failure: saves draft, surfaces error message to user
- [x] DmCampaigns.tsx toast updated: "DM sent!" / "queued" / "draft saved" based on result
- [x] TypeScript clean, 69 tests passing

## Onboarding Copy Fix + Send DM Button + Smart Post Scheduler (v5.5)
- [x] Fix onboarding checklist step 1 copy: "post scheduling" → "post drafting"
- [x] LeadCard: add "Send DM" button for leads with status dm_generated (fires immediate send)
- [x] Draft & Roast: add "Post Now at Optimal Time" button that uses AI to pick best viral window
- [x] Server: add postNow tRPC procedure — AI picks optimal time for subreddit, checks rate limits, fires post or schedules it
- [x] AI optimal timing: factor in subreddit peak hours, day of week, post type (question/story/resource)
- [x] Rate limit enforcement: respect 5 posts/day, 30min cooldown between posts
- [x] UI feedback: show "Posting now..." / "Scheduled for X:XXpm EST" / "Rate limited — try again in Xmin"

## Scheduled Posts Page + Progress Indicators (v5.6)
- [ ] Create ScheduledPosts.tsx page — list all scheduled posts with time, subreddit, title, status, cancel button
- [ ] Add "Scheduled Posts" nav item to DashboardLayout sidebar under COMPOSE section
- [ ] Register /scheduled route in App.tsx
- [ ] Add animated step progress bar to Roast & Score flow: "Analyzing post..." → "Scoring fit & urgency..." → "Done"
- [ ] Add animated step progress bar to Generate DM flow: "Reading post..." → "Crafting personalized DM..." → "Done"

## Sidebar Badge + Comment Flow (v5.7)
- [x] Add pending post count badge to Scheduled Posts sidebar nav item
- [x] Add animated progress indicator to Draft Comment flow
- [x] Change "Draft Comment" button to "Send Comment" once commentDraft exists
- [x] Add sendComment tRPC procedure to post comment to Reddit thread

## New Signup Email Notification (v5.8)
- [x] Send email to tessa.anderson@blackvectorhorizon.solutions on new user signup

## Reddit Connect Onboarding (v5.9)
- [ ] Ensure "Connect Reddit account" is a visible, tracked step in the onboarding checklist
- [ ] End-to-end test Reddit OAuth connection flow

## Manual Copy-Paste UX + Contacted Indicator (v5.9)
- [ ] Write REDDIT_INTEGRATION.md documentation
- [ ] Settings: hide Reddit connect, show coming soon badge, remove rate limits
- [ ] Onboarding: mark Reddit step as coming soon
- [ ] LeadCard: replace Send DM/Comment with Copy & Open, add Mark as Contacted
- [ ] Draft & Roast: add Ready to Post panel with AI subreddit + Copy & Open

## v5.11 Features
- [ ] Add Re-draft button for existing DM drafts in LeadCard
- [ ] Combine Analyze Lead + Draft DM into single "Analyze & Draft" button
- [ ] Add title field to Draft & Roast optimized post output
- [ ] Fix virality score update when switching to Improved tab
- [x] Increase text size on mobile across key pages

## v5.12 Auto-chain & Re-draft UX
- [x] Auto-chain: roastLead onSuccess triggers generateDm, generateDm onSuccess triggers generateComment
- [x] Style Re-draft as a proper visible button (not plain text link) in DM section
- [x] Add Re-draft button to comment section

## v5.13 UX Fixes
- [x] Hide Draft DM / Draft Comment action buttons while chain is processing
- [x] Show "Loading DM draft..." skeleton instead of View DM draft link during lag
- [x] Show "Loading comment draft..." skeleton instead of View comment draft link during lag
- [x] Fix Copy & Open + Re-draft overflow on mobile — stack vertically or shrink
- [x] Extend progress bar to 6 steps: Reading post → Scoring lead → Crafting DM → DM ready → Drafting comment → Done

## Feedback Board (v5.25)
- [x] DB schema: add feedback table (id, userId, type enum(feature/bug/other), title, body, status enum(open/planned/done), createdAt)
- [x] tRPC: submitFeedback procedure (protected, any plan)
- [x] tRPC: listFeedback procedure (public — all users can see the board)
- [x] tRPC: adminUpdateFeedback procedure (admin only — update status)
- [x] Feedback page: /feedback route with submit form + public board view
- [x] Sidebar: add Feedback nav item under ACCOUNT section
- [x] Register /feedback route in App.tsx

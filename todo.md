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

## Design System Refresh + Landing Page Redesign (v5.26)
- [x] Update CSS variables in index.css with refined OKLCH palette (deeper background, brighter accent, better contrast hierarchy)
- [x] Add Playfair Display (serif display) + JetBrains Mono (data/mono) Google Fonts to index.html
- [x] Apply font-display and font-mono CSS variables throughout design system
- [x] Rebuild Home.tsx landing page with scroll-driven hero, editorial sections, feature showcase, pricing CTA
- [x] Add scroll-linked scale animation for hero media (IBEX-style zoom on scroll)

## Design Identity & Brand System (v5.27)
- [x] Choose new accent color (away from green) — warm amber/gold or electric indigo or signal orange
- [x] Update all OKLCH color tokens in index.css: background, accent, primary, muted, borders
- [x] Update btn-primary-glow, ring, sidebar-primary, chart-1 to match new accent
- [x] Verify WCAG AA contrast for body text (muted-foreground on card bg)
- [x] Verify WCAG AAA contrast for headlines and accent on dark background
- [x] Apply new accent color consistently across dashboard (active sidebar item, progress bars, badges)
- [x] Update landing page CTAs, stat bar values, eyebrow labels to use new accent

## Landing Page — Demo Video Section (v5.27)
- [x] Add "See it in action" video section between the stat bar and "How it works"
- [x] Embed a Loom/YouTube walkthrough video (or placeholder with play button)
- [x] Style video container with editorial dark frame, ambient glow behind it
- [x] Add caption: "From blank draft to warm leads in under 60 seconds"
- [x] Make video section responsive (full-width on mobile, max-w-3xl centered on desktop)

## Landing Page — Social Proof Strip (v5.28)
- [ ] Add horizontal social proof strip between hero and stat bar
- [ ] Show founder quote / X testimonial from first paying user
- [ ] Add "Built by founders, for founders" tagline with avatar
- [ ] Style with subtle border, italic serif quote in Playfair Display

## Landing Page — OG Image (v5.28)
- [ ] Generate a 1200×630 dark editorial OG image with product mockup + headline
- [ ] Replace current logo-only og:image in index.html
- [ ] Update twitter:image meta tag to match

## Dashboard Typography (v5.28)
- [ ] Apply Playfair Display to dashboard "Hey [Name]" greeting heading
- [ ] Apply Playfair Display to section headings: "Quick actions", "Get started with SubRoast"
- [ ] Apply JetBrains Mono to stat numbers (80 leads, 36 DMs drafted, etc.)
- [ ] Apply JetBrains Mono to rate limit counters in sidebar Activity widget

## Scrutiny Layer — Anti-Spam (v5.29)
- [ ] Add spam-risk score to AI roast output (0-100, factors: self-promo density, link count, keyword stuffing)
- [ ] Show spam-risk badge on Draft & Roast page (green/amber/red)
- [ ] Add "Too salesy?" warning when spam-risk > 60
- [ ] Block DM send if DM draft contains direct product link or pricing mention

## Roast Report Visualizer (v5.30)
- [ ] Add radar/spider chart to Draft & Roast page showing all 5 scores (Clarity, Fit, Virality, Spam Risk, Urgency)
- [ ] Use JetBrains Mono for axis labels, accent color for filled area
- [ ] Add "Score history" mini-chart showing improvement across re-drafts

## Event Tracking for Churn Analytics (v5.31)
- [ ] Track campaign_created event (userId, plan, campaignName)
- [ ] Track lead_synced event (userId, campaignId, newLeadCount)
- [ ] Track dm_drafted event (userId, leadId, fitScore)
- [ ] Track dm_copied event (userId, leadId) — proxy for actual send
- [ ] Track post_roasted event (userId, viralityScore, clarityScore)
- [ ] Send events to Umami custom events API

## Ultra-Luxury Redesign — Rolls-Royce / Loro Piana (v5.28)
- [x] Load Cormorant Garamond (display italic) from Google Fonts in index.html
- [x] Update index.css: obsidian bg, champagne gold accent, warm off-white text, hairline borders
- [x] Remove all border-radius from cards (0px or max 2px)
- [x] Replace all drop shadows with subtle inner borders and surface noise texture
- [x] Rebuild Home.tsx: luxury hero with 80px+ italic Cormorant headline, 1px gold rule, vast negative space
- [x] Landing page: product mockup styled as a printed intelligence report (not a UI screenshot)
- [x] Landing page: video section with luxury dark frame, gold play button
- [x] Landing page: all section padding 120px+ vertical
- [x] Landing page: buttons minimal — outlined or text-only except single primary CTA
- [x] Apply luxury tokens to DashboardLayout sidebar (obsidian surface, gold active state, hairline borders)
- [x] Apply Cormorant Garamond to dashboard "Hey [Name]" greeting and section headings
- [x] Apply JetBrains Mono to all stat numbers in dashboard

## Visual Differentiation from PRSPERA (v5.29)
- [x] Shift accent from champagne gold to platinum/silver (oklch 0.75 0.04 220)
- [x] Warm background from pure obsidian to dark warm grey (oklch 0.09 0.008 60)
- [x] Update all accent references in index.css (primary, ring, sidebar-primary, chart-1, btn glow)
- [x] Update landing page: all gold accent references to platinum
- [x] Update dashboard: active state, progress bars, badges to platinum
- [x] Add thin horizontal rule ABOVE section eyebrows (not below headlines)
- [x] Increase letter-spacing on uppercase labels to 0.3em+
- [x] Generate new logo: replace green with platinum/silver tones
- [x] Upload new logo to CDN and update DashboardLayout + index.html favicon reference

## Luxury Design System — All Pages (v5.32)

- [x] Pricing.tsx — full luxury rebuild: Cormorant serif headings, ivory accent, hairline card borders, editorial plan cards, no border-radius
- [x] Dashboard.tsx — Cormorant "Hey [Name]" greeting, ivory stat values in JetBrains Mono, luxury card surfaces
- [x] DraftRoast.tsx — luxury form layout, Cormorant section headings, ivory score display, editorial roast output
- [x] DmCampaigns.tsx — luxury table/list layout, Cormorant headings, hairline row dividers, ivory badges
- [x] HistoryPage.tsx — editorial history list, Cormorant headings, hairline dividers, mono timestamps
- [x] Schedule.tsx — luxury form layout, Cormorant headings, ivory accent on active states
- [x] SettingsPage.tsx — luxury settings layout, Cormorant headings, hairline section dividers
- [x] Feedback.tsx — luxury feedback form, Cormorant headings, ivory accent on submit button
- [x] BillingSuccess.tsx — luxury success state, Cormorant heading, editorial confirmation layout
- [x] NotFound.tsx — luxury 404 page, Cormorant italic heading, editorial minimal layout

## SEO Fixes (v5.33)
- [x] Fix page title on / — must be 30–60 characters, set via document.title and <title> tag in index.html

## OG / Social Sharing Image (v5.34)
- [x] Generate 1200×630 OG image: dark editorial, Cormorant headline, ivory accent, debossed logo, product mockup
- [x] Upload OG image to CDN
- [x] Update og:image meta tag in index.html
- [x] Update twitter:image meta tag in index.html
- [x] Update og:type to "website" and add og:image:width/height tags

## UI Fixes & Enhancements (v5.35)
- [x] Fix login screen logo — replace old green flame logo with new debossed platinum logo mark
- [x] Fix Draft & Roast mobile layout — stack input panel and results panel vertically on mobile (flex-col on small screens)
- [x] Add back button to Feedback page — currently returns 404 when accessed from footer link
- [x] Add copyright to footer in Home.tsx — "© 2026 SubRoast. All rights reserved."
- [x] Add pulsating bullet animation for all "coming soon" feature indicators in dashboard and schedule pages
- [x] Build roast report spider/radar chart — 5-axis chart (Clarity, Fit, Virality, Spam Risk, Urgency) on Draft & Roast page

## Sidebar User Profile Footer (v5.36)
- [x] Add user avatar initials, name, email, and logout button pinned to the bottom of the sidebar

## Mobile Sidebar Footer Fix
- [x] Fix sidebar footer (name/email/logout) not visible on mobile — sheet not filling full height

## Spam Risk Scoring
- [x] Lead quality filter: AI spam risk score (0-100) badge on each lead — flag low-quality/bot posts so users skip them and focus on genuine leads
- [ ] Subreddit health monitor: flag when a subreddit is getting flooded with spam, affecting targeting quality
- [ ] DM campaign guard: warn before sending DM to a lead whose post history looks spammy

## Auto-Send Coming Soon + User Spam Reporting (v5.39)
- [x] DM Campaigns: mark AUTO-SEND option as "Coming soon" — disabled, pulsating badge, can't be selected
- [ ] User spam reporting: "Mark as spam" button on lead cards — stores user flag in DB
- [ ] AI training loop: user-flagged spam leads feed back into the scoreSpamRisk prompt as few-shot examples

## Homepage Social Proof Strip (v5.40)
- [x] Add social proof strip between hero and stats bar with quote from @zara_ferna94287
- [x] Style as italic Cormorant serif pull-quote, X handle in JetBrains Mono, hairline border

## Subreddit Health Monitor (v5.41)
- [ ] Show warning badge on campaigns where >30% of synced leads score above 50 spam risk
- [ ] Surface this on the campaign card and campaign detail header

## User Spam Reporting + AI Training Loop (v5.42)
- [ ] "Mark as spam" flag button on lead cards — stores user flag in DB
- [ ] User-flagged spam leads feed back into scoreSpamRisk prompt as few-shot training examples

## Homepage Social Proof Strip — Second Quote (v5.41)
- [x] Add @viberankdev quote to social proof strip, two quotes side-by-side on desktop, stacked on mobile

## Favicon Update (v5.42)
- [x] Update favicon to match the new SubRoast logo

## Backlog — Future Products
- [ ] Cross-domain visual inspiration capture app (working title: "Moodrift" or similar) — photo capture, AI palette/type/mood extraction, domain tagging (web/fashion/interior/branding/food), cross-domain blend generation, creator connections, waitlist landing page
- [ ] SubRoast design system packaged as a standalone white-label template product — CSS variables, component library, layout patterns, Figma kit

## SVG Architectural Illustration Demo (v5.43)
- [x] Replace demo video section with SVG architectural illustration combining flow diagram (Reddit post → AI analysis → DM campaign) and stylized dashboard preview (lead card, spam score badge, spider graph)

## SVG Illustration Draw-In Animation (v5.44)
- [x] Add staggered stroke-dashoffset draw-in animation to connector lines triggered on scroll into view

## Homepage Legibility Fixes (v5.45)
- [x] Move spider graph in SVG illustration to avoid overlapping lead card content
- [x] Improve social proof / early signal quote font style for better readability
- [x] Boost faint text legibility in Capabilities, Process, Account Safety, and "No credit card" sections

## Chrome Extension — Hybrid Send Architecture (v6.0)
- [ ] Spike: Chrome extension scaffold (Manifest V3, communicates with SubRoast web app)
- [ ] Extension: "Send DM" action — opens Reddit DM compose in user's browser session and pre-fills drafted message
- [ ] Extension: "Post to Subreddit" action — opens Reddit post composer and pre-fills AI-drafted post
- [ ] Extension: "Send Comment" action — pre-fills comment on a target Reddit thread
- [ ] Web app: Replace "Auto-Send (Coming Soon)" label with "Send via Extension" CTA
- [ ] Web app: Extension install prompt / onboarding step for new users
- [ ] Web app: Connection indicator showing whether extension is installed and active
- [ ] Research: Chrome Web Store review requirements for Reddit automation tools
- [ ] Decision: Pause Reddit Data API approval application in favour of extension path (revisit if Reddit policy changes)

## Extension Send Messaging (v6.1)
- [x] Replace "Auto-Send" toggle/label with "One-Click Send via Extension (Coming Soon)" across DM Campaigns page
- [x] Update campaign creation form: review mode selector messaging
- [x] Update any "Send DM" / "Send Comment" buttons to reflect extension-based send coming soon
- [x] Add brief tooltip/explainer: "Send directly from your browser — no API, no ban risk"
- [x] Landing page: update any automation language to reflect extension approach

## Reddit Scaling Insights — Backlog (v6.2+)

### Subreddit Size Filter (v6.2)
- [x] Campaign creation form: add optional subreddit size filter (min/max subscriber count)
- [x] DB schema: add minSubSize and maxSubSize fields to campaigns table
- [x] AI subreddit recommendation prompt: respect size filter when suggesting subreddits
- [x] Lead sync: filter out leads from subreddits outside the size range (if filter set)
- [x] UI hint: show "Sweet spot: 10k–150k members" as helper text on the filter field

### Funnel Metrics Dashboard (v6.3)
- [ ] DB schema: add repliesSent, conversationsStarted, leadsConverted fields to campaigns table (or derived from leads table statuses)
- [ ] Campaign detail view: add funnel stat row — Leads Found → DMs Drafted → Conversations → Converted
- [ ] Dashboard overview: show aggregate funnel across all campaigns
- [ ] Conversion rate calculation: show % at each funnel stage
- [ ] Benchmark tooltip: "Industry average: 10% engagement → 10% conversion = ~28 leads/month at 100 replies/day"

### Anti-Pattern / Footprint Risk (v6.4)
- [ ] Add Footprint Risk as a 6th axis on the Intelligence Radar (Draft & Roast spider chart)
- [ ] AI roast: detect if draft is too similar in length/tone to recent drafts (fingerprint risk)
- [ ] AI roast: flag if post always agrees, always uses same opener, or always same word count
- [ ] Roast feedback: suggest varying comment length, contradicting usual takes, changing posting rhythm
- [ ] Anti-fingerprint tips section in Draft & Roast results

### Multi-Account Management (v6.5 — future tier)
- [ ] DB schema: support multiple Reddit accounts per user
- [ ] Campaign assignment: assign campaigns to specific accounts
- [ ] Per-account rate limits: 25 replies/day, 2-3 posts/week
- [ ] Account warm-up mode: one account that never DMs, only builds karma in adjacent subs
- [ ] Account health dashboard: karma score, post history, ban risk per account

### Size Filter Badge on Campaign Detail (v6.2.1)
- [x] Show active subreddit size filter as a subtle badge at the top of the campaign detail screen (e.g. "Filtering: 10k–150k members") — only visible when a filter is set

### Funnel Metrics on Campaign Detail (v6.3)
- [x] Campaign detail: add "Leads → DMs Drafted → Conversations → Converted" funnel stat row derived from lead statuses
- [x] Show conversion rates between each stage (e.g. "12% → DM")
- [x] Add unit tests for funnel calculation logic

### Edit Size Filter on Existing Campaign (v6.4)
- [ ] Add "Edit filter" link next to the size filter badge on the campaign detail screen
- [ ] Inline edit UI: min/max inputs + presets, saves via updateCampaign mutation
- [ ] Update DB updateCampaign helper to accept minSubSize/maxSubSize fields

### Funnel Metrics Fixes (v6.3.1)
- [x] Fix: use campaign.leadsFound (not leads.length) for the Leads Found stage so it matches the campaign stats grid
- [x] Fix: change stage 2 from "DMs Drafted" to "DMs Sent" (status === "sent" only)
- [x] Update funnel unit tests to reflect the corrected logic

### Campaign Stats Grid (deferred — commented out in UI)
- [x] Remove Subreddits and Keywords counts from the stats grid (redundant/low value)
- [x] Remove Leads Found and DMs Sent from stats grid (duplicated by funnel row)
- [x] Designed replacement: Hot Leads, Avg Fit Score, Last Sync, Syncs Today/Limit
- [ ] DEFERRED: Stats grid is commented out in CampaignDetail — uncomment and re-evaluate when ready to add back

### Campaign UX — Keyword Input (v6.4)
- [ ] Confirm comma-separated keyword paste works in the keyword text field (user-reported need)
- [ ] Add helper text: "Paste keywords comma-separated or add one at a time"

### Campaign 3 — Product Research Engine / App Validation (v6.4)
- [ ] DM template for validation outreach: "Hey [name], saw your post about [pain point]. Researching this problem — can I ask 3 quick questions?"
- [ ] Follow-up question sequence: (1) What do you currently use? (2) What's most frustrating about it? (3) If I solved [specific pain] for $X/month would you buy it?
- [ ] Campaign mode: "Research" — AI summarizes complaint instead of drafting a sales DM
- [ ] Tag pain point category on each lead (workflow friction / missing tool / bad existing solution)
- [ ] Save exact complaint phrase from the post as a lead field
- [ ] Validation scorecard per campaign: 15+ complaints found / 10+ willing to pay / 5+ clicked payment
- [ ] Export complaints as CSV for offline analysis

### Pricing Page — Growth Plan Accuracy (v6.4)
- [x] Mark "DM Templates" as "Coming soon" on Growth plan
- [x] Mark "Advanced Insights" as "Coming soon" on Growth plan

### Backlog — Templates Feature (v6.5)
- [ ] DM template library: validation template, warm intro template, pain-point empathy template, follow-up template
- [ ] Template picker in campaign creation form (choose a starting template or write custom)
- [ ] Template variables: [name], [pain point], [subreddit], [post title], [product name]
- [ ] Save custom templates per user for reuse across campaigns
- [ ] Template performance tracking: response rate per template

### Backlog — Advanced Insights Feature (v6.5)
- [ ] Pain point frequency chart: most common complaint phrases across all campaigns
- [ ] Subreddit performance heatmap: which subs yield the highest fit scores
- [ ] Best time to sync: show which hours produce the most leads based on post activity
- [ ] Keyword effectiveness: which keywords surface the most hot leads
- [ ] Validation scorecard dashboard: aggregate view across all research campaigns
- [ ] Weekly digest email: top leads, funnel movement, and subreddit highlights

### Homepage Updates (v6.4)
- [x] Add "App Validation" as a use case on the homepage (alongside "Lead Generation")
- [x] Update hero or features section to mention the 48-hour validation framework
- [x] Add social proof angle: "Used by founders to validate ideas before building"

### Chrome Extension Planning Doc
- [x] Write CHROME_EXTENSION_PLAN.md with full build roadmap, phases, and technical decisions

### Keyword Validation Fix (v6.4.1)
- [x] Raise per-keyword character limit from 128 to 256 in the campaign router schema
- [ ] Add helper text in the campaign form: "Paste keywords comma-separated — each keyword must be under 256 characters"

### Homepage & Pricing Revisions (v6.5.1)
- [x] Remove unverified "$7K MRR" social proof stat from App Validation use case card
- [x] Rewrite App Validation card stat line to focus on feature value, not third-party claims
- [x] Gate App Validation campaigns behind Growth plan (server-side check + UI lock on Starter)
- [x] Add Chrome extension blurb to Growth plan on pricing page (coming soon, with "why" explanation)

### Homepage & Pricing Polish (v6.5.2)
- [x] Pricing: remove "AI auto-scheduling" from Growth plan features
- [x] Dashboard: update banner from "Reddit direct posting coming soon" to "One-click send via Chrome extension — coming soon"
- [x] Homepage use case #1: change "problem" to "product or service" in the headline
- [x] Homepage use case #1: replace "no spray-and-pray" with "no cold lists, no mass blasting"
- [x] Homepage: add Draft & Roast as a third use case card

### Rate Limit Indicators & Copy Polish (v6.6)
- [x] Homepage: trim App Validation body copy — remove the three-question list
- [x] Homepage: tighten Account Safety copy — replace "No Reddit API — no ban risk" with precise framing
- [x] Scheduled Posts: Posts Today X/5 indicator already built (confirmed existing)
- [x] Campaign detail: surface DMs Today counter (DMs today: X/Y + this hour: X/Y)
- [x] CHROME_EXTENSION_PLAN.md: update with precise technical framing (DOM-based, no API calls, residual risks)
- [x] CHROME_EXTENSION_PLAN.md: add Phase 2 requirement — extension must POST to SubRoast after each send to keep counters accurate

### Onboarding & Settings Extension Messaging (v6.6.1)
- [x] Onboarding checklist: update "Connect your Reddit account" step to reflect Chrome extension approach
- [x] Settings: "Reddit Connection" section already updated (confirmed v6.1)
- [x] Push all changes to GitHub (all checkpoints auto-synced to origin/main via Manus)

### Bug Fixes — Leads Count & Sync (v6.7)
- [x] Bug: leads count on campaign detail doesn't match dashboard and sidebar counts
- [x] Bug: manual "Sync Leads" returns 0 — root cause: same posts re-appear in Reddit search, already in DB, so newLeads=0 (correct behaviour, not a bug — sync still upserts them)
- [x] Fix: listCampaigns and getCampaign now return live lead count from leads table instead of stale leadsFound counter
- [x] GitHub: fixed — two remotes existed (origin=Manus S3, github=GitHub). Pushed all 62 missing commits to GrandSuccess87/subroast main.

### GitHub Auto-Push Hook (v6.7.1)
- [x] Add git post-commit hook to auto-push to github remote after every checkpoint

### Landing Page Visual Upgrade (v6.8)
- [x] Hero CTA: larger button, higher contrast, warm amber color
- [x] Hero background: add subtle SVG noise texture overlay for depth
- [x] Homepage cards: add warm amber/gold background tint on hover
- [x] Homepage cards: add 3D lift effect on hover (translateY + shadow scale)

### UI & Sync Fixes (v6.8.1)
- [x] Fix: trust line "Seven days complimentary..." hard to read on homepage — increase contrast
- [x] Fix: button hover background contrast on homepage and pricing page
- [x] Bug: App Validation campaign sync returns 0 leads — root cause: long keyword phrases (>4 words) return 0 results from Reddit search API. Fixed by truncating to first 4 words for the API call while keeping full phrase for local scoring. Also fixed daily sync counter to always increment (prevents unlimited spam syncing).

### Homepage Visual Polish (v6.9)
- [x] Trust line: raised to oklch(0.78 0.012 80) — clearly legible warm silver
- [x] Noise texture: hero SVG opacity 0.045 → 0.18 with soft-light blend; body noise 0.06 → 0.10 with smaller tile size
- [x] btn-luxury hover: stronger fill (0.18 opacity), full-opacity border, slight lift (translateY -1px)
- [x] btn-luxury-primary hover: deeper amber glow, stronger box-shadow spread (50% + 25%)
- [x] card-hover-lift: translateY -6px → -10px, amber tint oklch(0.18 0.025 65), amber platinum ring on hover
- [x] Use case cards: extracted to UseCaseCard component with amber top-border accent on hover, headline brightens, stat brightens
- [x] Feature rows: extracted hover state — number badge brightens to full platinum, title brightens to near-white, amber left-border accent appears

### UI Backlog — Polish Without Breaking Character (v6.9+)
- [ ] Hero: add a very faint radial amber glow behind the CTA button area (like a warm lamp on a dark desk)
- [ ] Nav: add a subtle backdrop-blur + border-bottom on scroll (currently fully transparent, hard to read over content)
- [ ] Social proof strip: raise quote text from oklch(0.93) — currently fine, but attribution line could go from 0.65 → 0.72
- [ ] Footer: "SubRoast" wordmark and copyright are nearly invisible (oklch 0.40 and 0.28) — raise to 0.45 and 0.38
- [ ] Pricing page: add the same noise texture to the hero section for consistency with homepage
- [ ] Pricing page: plan card borders on hover should glow amber (Growth) or platinum (Starter) — currently only button changes
- [ ] Use case cards: add a thin amber top-border accent line (1px) to each card for visual anchoring
- [ ] Feature rows: add a right-side amber dot or chevron that appears on hover to signal interactivity
- [ ] Process steps (I, II): raise the roman numeral from oklch(0.88 / 0.4) to oklch(0.88 / 0.65) — currently too faint
- [ ] Body copy color audit: several body paragraphs use oklch(0.48–0.50) which fails WCAG AA — raise to oklch(0.60) minimum
- [ ] CTA section: add the noise texture here too (currently flat dark background)
- [ ] Mobile: trust line wraps awkwardly at 375px — add a max-width or line-break hint

### Homepage Polish Batch 2 (v6.10)
- [x] Nav: transparent at top, backdrop-blur(20px) + hairline border on scroll with 0.4s ease transition
- [x] Hero: radial amber glow (oklch(0.78 0.14 65 / 0.10)) behind CTA buttons with zIndex layering
- [x] Footer: Pricing/Feedback raised from oklch(0.35) → oklch(0.62); SubRoast wordmark raised to oklch(0.58); copyright raised to oklch(0.42)
- [x] Homepage: replaced ArchitecturalIllustration with full two-column expanded ReportMockup (860px max-width) including Lead Signal Detected panel

### Fixes & Features (v6.11)
- [x] Hero: restored ArchitecturalIllustration SVG to the right column
- [x] DM Campaign detail: added Edit Campaign button with full EditCampaignModal (name, offering, subreddits, keywords, daily limit, review mode)
- [x] Bug: sync leads returning 0 — root cause: Reddit IP-level block (HTTP 403) on unauthenticated public API calls from cloud server. Fixed by adding app-only OAuth (client credentials flow) as automatic fallback. Confirmed: 117 leads returned on first successful sync.

### Spam Filter (v6.12)
- [x] Lightweight spam filter (no extra API calls) — applied at sync time before saving leads:
  - Filter: post body contains an external URL (http/https link) → likely ad/spam
  - Filter: post body under 50 characters → too thin to be a genuine discussion post
  - Filter: username matches bot patterns (random alphanum string, ends in 4+ digits, contains underscores+numbers)
  - Filter: post title is all-caps or contains excessive punctuation (!!!, ???)
  - Filter: post body is identical or near-identical to title (copy-paste spam)
  - Log filtered count per sync so user can see how many were dropped
  - Show "X spam filtered" count in sync result toast (e.g. "Found 12 new leads! · 8 spam filtered")
- [ ] Full author-profile spam filter (extra API call per author, higher accuracy):
  - Fetch /user/{username}/about for each lead author via OAuth API
  - Filter: account age < 30 days
  - Filter: comment karma < 10 (posts but never engages)
  - Filter: post karma > 10× comment karma (ad account pattern)
  - Filter: account has no comment history (pure poster)
  - Cache author profiles within a sync run to avoid duplicate calls for same author
  - Respect Reddit rate limits (max 60 author lookups per sync, queue remainder)

### Secondary Text Contrast (v6.13) — X user feedback 2026-03-17
- [x] Raise all secondary/muted text from oklch(0.52) to oklch(0.62) (~#9CA3AF equivalent) across homepage, pricing page, and dashboard — improves WCAG AA readability while preserving dark aesthetic

### Homepage Copy Reduction (v6.14)
- [x] Remove redundant "How It Works" section (duplicates Capabilities section)
- [x] Trim Safety section: remove prose paragraph, keep only the 6 bullet points
- [x] Shorten use case card bodies to 1 punchy sentence each (~15 words)
- [x] Remove walkthrough section paragraph (no video exists; report mockup speaks for itself)
- [x] Trim hero body paragraph to a tighter two-sentence version

### Dashboard & Homepage Cleanup (v6.15)
- [x] Remove "Connect your Reddit account" step from dashboard onboarding checklist (was marked comingSoon/disabled; now fully removed from the 3-step flow)
- [x] Comment out Capabilities section on homepage (redundant with Use Cases; preserved in JSX comment for easy restore)

### UX Fixes (v6.16)
- [x] Rename walkthrough section headline to "What a lead looks like" (eyebrow: "In practice")
- [x] Remove Reddit connect paragraph from homepage CTA area ("Connect your Reddit account and receive your first AI analysis in under two minutes" removed)
- [x] Logout button made more visible in sidebar: icon raised from /40 to /60 opacity; expanded state now shows icon + "SIGN OUT" label

### Homepage Demo Section (v6.17)
- [x] Remove "Two steps from draft to leads" Process section (was already removed in prior session)
- [x] Rename "What a lead looks like" section to "The intelligence report" (eyebrow: "AI Analysis")
- [x] Added LeadIntelligenceDemo section before the intelligence report: 3-phase looping animation (6-step AI chain → spam filter with red/green post badges → lead card reveal with scores + DM preview), pure CSS keyframes + useEffect timer, amber/dark aesthetic, left-copy + right-panel layout

### Homepage Restructure (v6.18)
- [x] Move LeadIntelligenceDemo to be the first section after the hero
- [x] Add 4th phase to LeadIntelligenceDemo: comment drafting with typewriter animation (28ms/char)
- [x] Remove StatBar section entirely
- [x] Move Social Proof (Early Signal) strip to just before Account Safety
- [x] Animate Account Safety bullets: staggered IntersectionObserver fade-in from left (220ms stagger, 0.5s ease)
- [x] Remove "Post smarter. Grow faster." headline and hairline rule from CTA section

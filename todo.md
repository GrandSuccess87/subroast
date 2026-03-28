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

### Primary Text Contrast (v6.19) — X user feedback
- [ ] Raise primary/foreground text from near-pure-white to a warm off-white (~#E4E4E7 / oklch(0.91 0.004 60)) — more readable against black, distinct from secondary text at oklch(0.62)

### Nav, Hero & Pricing Cleanup (v6.19)
- [x] Remove ArchitecturalIllustration SVG from hero right column (commented out for easy restore)
- [x] Update top nav links: removed Walkthrough and Capabilities, kept Pricing, added How It Works (#lead-intelligence) and Account Safety (#safety)
- [x] Comment out "Recommended" badge on Growth plan in Pricing page
- [x] Center the "Begin Free Trial" button text (added textAlign + justifyContent center)
- [x] Feedback page already existed at /dashboard/feedback — confirmed fully built with submit form, upvote board, and admin controls. No rebuild needed. Also updated secondary CTA from "View walkthrough" to "See how it works" pointing to #lead-intelligence.

### Hero Layout (v6.20)
- [x] Add centered max-width constraint to hero: collapsed grid to single centered column (max-w-[42rem]), gold rule and body centered, CTA row centered with justify-center, amber glow recentered to 50% 50%

### Hero Eyebrow Animation (v6.21)
- [x] Hero eyebrow "AI Intelligence for Reddit" fades in 200ms before the headline on first load (premium entrance effect)

### Hero Two-Column Layout (v6.22)
- [x] Rebuild hero as lg:grid-cols-2 layout: left = editorial copy (eyebrow, headline, body, CTAs, trust line), right = Lead Intelligence section (eyebrow, headline, description, animated demo)
- [x] HeroDemoPanel extracted as shared component — used in hero right column AND in the standalone Lead Intelligence section below (kept both for scroll depth)
- [x] Hero entrance animations preserved — eyebrow first, headline 200ms, body/rule 380ms, CTA+right-column 500ms

### Remove Duplicate Lead Intelligence Section (v6.23)
- [x] Remove standalone LeadIntelligenceDemo call from the Home page render (now lives in hero right column)

### Pricing on Landing Page + Feedback Link Fix (v6.24)
- [x] Add pricing section to the public landing page (pull plans/copy from Pricing.tsx, place before footer)
- [x] Fix broken "Feedback" footer link — corrected to /dashboard/feedback

### CTA Section Conversion Copy (v6.25)
- [x] Add high-converting headline + supporting copy between "Ready to begin" eyebrow and the CTA button in CtaSection

### Nav Pricing Anchor Link (v6.26)
- [x] Change nav "Pricing" link from /pricing to /#pricing with smooth scroll behaviour

### FAQ Accordion + Active Nav Highlight (v6.27)
- [x] Add FAQ accordion (3-4 Q&As) below pricing cards in HomePricingSection
- [x] Add IntersectionObserver active nav link highlighting on scroll

### Leads Auto-Refresh + Backfill (v6.28)
- [x] Add refetchInterval (60s) to getLeads query in CampaignDetail so new leads appear automatically
- [x] Push changes to GitHub
- [x] Force backfill sync for Campaign 30001 (App Validation Complaint Mining) — synced 2026-03-19 08:41, 104 unique leads (no new posts found since 3/17 for this campaign's keywords)

### Leads Not Refreshing After 3/17 (v6.29)
- [ ] Diagnose why syncs run but produce 0 new leads since 3/17 across all campaigns
- [ ] Fix root cause and verify new leads are being written

### Mobile Hero Demo Panel Width Fix (v6.29)
- [x] Fix HeroDemoPanel animation width-shift on mobile — container now has width:100%/overflow:hidden, phase 3 context bar uses minWidth:0 + flex truncation so no phase can expand the panel width

### Mobile Hero Demo Panel Overflow Fix (v6.30)
- [x] Fix HeroDemoPanel overflowing its grid column on mobile — hero grid, right column wrapper, demo panel wrapper all get minWidth:0/overflow:hidden; comment box gets overflowWrap:break-word

### See How It Works CTA + Nav Highlight (v6.31)
- [x] Wire "See how it works" button to scroll to the Lead Intelligence section (smooth scroll with scrollIntoView)
- [x] Add Lead Intelligence section to IntersectionObserver so its nav item highlights when in view (rootMargin widened to -20% 0px -60% 0px)

### See How It Works Scroll Fix (v6.32)
- [x] Fix "See how it works" button — switched from scrollIntoView to window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'smooth' }) for reliable window-level scroll

### Waitlist Page + Demo Height Fix (v6.34)
- [x] Add waitlist_signups table to DB schema (email, name, source enum, createdAt)
- [x] Add joinWaitlist tRPC procedure with owner notification
- [x] Build /waitlist page — mirrors homepage, no pricing, no free trial CTAs, email capture form with animated confirmation
- [x] Add source tracking: header/footer on /waitlist, home_header/home_footer on /
- [x] Fix HeroDemoPanel vertical height shifting — container has fixed height:420px + overflow:hidden (already in place from v6.30)
- [x] Register /waitlist route in App.tsx
- [x] Write vitest tests for waitlist.join procedure (6 tests, all passing)

### Waitlist Page Polish (v6.35)
- [x] Remove nav header email form — replaced with "Join waitlist" anchor link
- [x] Remove footer email form — footer now just shows wordmark + copyright
- [x] Fix "See how it works" scroll — uses ref + window.scrollTo({ behavior: smooth }) to scroll to Lead Intelligence panel
- [x] Fix content clipping — added overflowX:hidden to root, minWidth:0 to all grid children, overflow:hidden on all panels
- [x] Form fields stacked vertically (name → email → CTA button), all full-width, name + email both required
- [x] Center "AI Intelligence for Reddit" eyebrow on both /waitlist and homepage hero
- [x] Add social proof (Early Signal) section after Use Cases — two X quotes centered
- [x] Add "What makes us different" section with 6 differentiator cards in 3-col grid

### Post-Differentiators CTA (v6.36)
- [x] Add "Join the waitlist" CTA button strip immediately after the What Makes Us Different section on /waitlist

### Waitlist Counter + Homepage Form (v6.37)
- [x] Add waitlist.count public tRPC procedure returning total signup count
- [x] Center "AI Intelligence for Reddit" eyebrow on /waitlist (confirmed centered with textAlign:center)
- [x] Add live waitlist counter above the hero form on /waitlist (amber pill, auto-refreshes every 30s)
- [x] Add compact waitlist form (name + email + CTA) to homepage footer (two-col layout with copy on left, form on right)

### Section Swap (v6.38)
- [x] Swap "What makes us different" and "How it works" section order on /waitlist

### Eyebrow centering + homepage nav (v6.41)
- [x] Fix "AI Intelligence for Reddit" eyebrow truly centered on /waitlist (wrapped in textAlign:center div since .eyebrow is inline-block)
- [x] Add subtle "Join Waitlist" secondary link to homepage nav (muted border button, sits left of Begin CTA)

### Waitlist Gate Modal + Nav Button Fix (v6.46)
- [ ] Fix Join Waitlist nav button on /waitlist — debug why it never becomes visible
- [ ] Build WaitlistGateModal: email form → animated "approved" state → "Start your 7-day trial" CTA
- [ ] Replace all homepage primary CTAs (hero, pricing, footer) with WaitlistGateModal trigger
- [ ] Keep 7-day trial link inside the modal approved state only (not exposed directly)

### Waitlist Gate Modal + Nav Button Fix (v6.46)
- [x] Fix Join Waitlist nav button on /waitlist — switched to IntersectionObserver on sentinel div; fixed CSS animation fill-mode conflict by using wrapper div for opacity
- [x] Add home_modal source to waitlist_signups enum (DB + schema + router + tests)
- [x] Build WaitlistGateModal component: name+email form → submitting state → approved state with confetti + "Begin free trial" CTA
- [x] Replace homepage hero primary CTA with WaitlistGateModal trigger ("Join the waitlist")
- [x] Replace homepage CtaSection primary CTA with WaitlistGateModal trigger ("Join the waitlist")
- [x] Pricing section kept visible (users can still see plans, but trial entry is gated through modal)
- [x] All 104 tests passing

### Homepage + Modal Fixes (v6.47)
- [x] Remove "Join Waitlist" button from homepage nav top bar
- [x] Update pricing plan CTA buttons to "Start Free Trial (Early Access)"
- [x] Fix WaitlistGateModal content overflow/padding — reduced side padding to 1.25rem, added boxSizing:border-box on both wrapper and panel

### Pricing + Nav CTA (v6.48)
- [x] Mark "One-click send via Chrome extension", "DM template library", "Advanced analytics" as Coming Soon in pricing feature lists (dimmed text + amber "Soon" badge)
- [x] Rename homepage nav "Begin" button to "Login" (still links to getLoginUrl())

### What's Coming Section (v6.49)
- [x] Add "What's Coming" section to homepage teasing Chrome extension, DM template library, Advanced analytics (3 cards with Q2/Q3 2026 ETAs + Join waitlist CTA link)

### Favorites + Modal CTA + Padding Fixes (v6.50)
- [x] Add isFavorited column to leads table in schema + migration (ALTER TABLE)
- [x] Add outreach.toggleFavorite tRPC procedure (optimistic update)
- [x] Add heart button to lead cards in the UI (filled/unfilled, amber when favorited)
- [x] Fix roadmap "Join the waitlist" CTA to open WaitlistGateModal instead of redirecting to /waitlist
- [x] Push project to GitHub (commit a3f074c)
- [x] Fix homepage right-side padding overflow (overflowX:hidden on outermost div)
- [x] Fix dashboard campaign count cutoff — stats row now flexWrap:wrap, main content area has overflowX:hidden

### UX Clarity Pass — v6.51 (UX Specialist Feedback)
- [x] Rewrite hero headline: pain-point-first ("Tired of spending hours hunting for your next lead in a Reddit thread?")
- [x] Rewrite hero sub-headline: single sentence anchoring the product + audience
- [x] Trim hero body paragraph to one sentence (remove multi-idea list)
- [x] Add compact 3-step "How it works" strip directly below the hero (Find → Score → Outreach)
- [x] Trim VideoSection (AI Analysis) intro copy to one sentence
- [x] Trim right-side hero panel sub-copy to one sentence
- [x] Update Use Cases section headline to one clear idea

### Soft-Paywall / Early-Access CTA Strategy
- [x] Hero CTA: "Join the waitlist" → "Get Early Access"
- [x] Hero trust line: update to "Start your free trial instantly • No credit card required"
- [x] Mid-page CTA strip: "Join the waitlist" → "Get Early Access"
- [x] Mid-page trust line: "No credit card required · Cancel at any time" → "Free during beta • No credit card required"
- [x] Pricing CTA: "Start Free Trial (Early Access)" → "Start Free Access"
- [x] Pricing trust line: "Seven days complimentary · No card required · Cancel at any time" → "Free during beta • No credit card required"
- [x] Update FAQ: remove card/Stripe/7-day trial references, replace with beta messaging
- [x] Update Pricing.tsx FAQ to match
- [x] Dashboard: replace trial-expiry banner with early-access banner
- [x] Dashboard: "Upgrade for unlimited campaigns" → soft beta limit message
- [x] DashboardLayout: replace trial countdown with early-access banner
- [x] Add persistent in-product early access banner to DashboardLayout

### Onboarding Qualification Flow (v6.6x)
- [x] Extend users table with onboarding fields (current_tool, pain_points, success_definition, willingness_to_pay, additional_notes, onboarding_completed_at)
- [x] Apply DB migration via webdev_execute_sql
- [x] Add tRPC procedures: onboarding.saveStep, onboarding.complete, onboarding.getStatus
- [x] Build /onboarding page — 5 steps with progress indicator
- [x] Step 1: Name + email (prefilled from auth)
- [x] Step 2: Current tool (single select + optional other text)
- [x] Step 3: Pain points (multi-select + optional other text)
- [x] Step 4: Success definition (short text, required)
- [x] Step 5: Willingness to pay (Yes / Maybe / No) + optional notes
- [x] Gate dashboard: redirect to /onboarding if onboarding_completed_at is null
- [x] Resume onboarding on re-login if incomplete (save step progress)
- [x] After completion → redirect to dashboard with early access banner

### UX Fixes v6.61
- [x] Fix onboarding logo not rendering (use CDN URL instead of /favicon.ico)
- [x] Update all homepage CTAs to redirect to /onboarding instead of login/waitlist
- [x] Remove "Join the waitlist →" CTA from homepage
- [x] Increase "How it works" section heading/label font size by ~8px
- [x] Increase "Early signal" section heading/label font size by ~8px

### Auth Flow Fix v6.62
- [x] Update getLoginUrl to accept a returnPath parameter
- [x] Homepage CTAs call getLoginUrl("/onboarding") so OAuth redirects back to /onboarding after signup
- [x] OAuth callback: new users (onboardingCompletedAt null) → /onboarding; returning users → /dashboard or returnPath

### Validation Mode v6.63
- [x] Hide HomePricingSection on homepage, replace with "Free during beta" badge block
- [x] Hide /pricing nav link from header and sidebar
- [x] Update Pricing page to show beta message instead of plan cards

### Copy Pass v6.64
- [x] Hide "Get Early Access →" CTA in What's Coming section
- [x] Update hero headline to "Find high-intent Reddit posts and turn them into customers."
- [x] Update hero sub-headline to "We scan Reddit for buying signals, filter out noise, and draft replies and outreach so you can turn interest into customers faster."

### WTP + Hero Fix v6.65
- [x] Update onboarding WTP question framing and tiered price anchors
- [x] Fix hero "See how it works" button clipping above the fold

### Funnel Tracking v6.72
- [x] Create shared analytics utility client/src/lib/analytics.ts with track() wrapper
- [x] Add CTA click events: hero_cta_click, midpage_cta_click, footer_cta_click, nav_cta_click
- [x] Add onboarding funnel events: onboarding_started, onboarding_step_2..5, onboarding_completed
- [x] Add WTP selection event with price tier as property

### Admin Responses View v6.76
- [x] Add onboarding.getResponses adminProcedure — fetches all completed onboarding rows sorted by WTP priority (60_plus → need_results → 40_59 → 20_39 → under_20)
- [x] Build /admin/responses page — stat cards (total, high-intent, pay-if-works, top WTP), search filter, full table with WTP badges, pain point chips, truncated text with tooltips
- [x] Export CSV button — downloads all responses as subroast-responses-YYYY-MM-DD.csv
- [x] Register /admin/responses route in App.tsx
- [x] Vitest tests: FORBIDDEN for non-admin, array return for admin (2 tests passing)

### Homepage Copy & Admin Fixes v6.77
- [x] Remove "Pricing unlocks after Reddit API approval." line from beta CTA section
- [x] Update "six-step AI chain runs continuously" copy to accurate "each time you log in, fresh leads are waiting" framing
- [x] Update How It Works step 03 body copy to "Generate a personalised DM draft in seconds. Review, copy, and send it yourself — no automation required."
- [x] Update Lead Intelligence section description to accurate framing (no "before you open the app" claim)
- [x] Admin route: non-admin users silently redirected to /dashboard (no error page shown)
- [x] Promote owner account (id=1) to admin role in DB

### Lead Signal Intelligence (Backlog)
- [ ] Campaign intelligence report: show "X warm leads in r/SaaS" summary card on dashboard
- [ ] Surface posts mentioning target keywords in last 48 hours with match count
- [ ] "Outreach drafts ready" indicator per campaign when unactioned leads exist
- [ ] Lead Signal section on homepage accurately reflects this future feature (keep as aspirational)

### Subreddit Sync Limit Fix v6.78
- [x] Fix syncLeads (manual): Growth users now process all subreddits (was hard-capped at first 5); Starter/trial still capped at 5
- [x] Fix autoSync (background): Pass userPlan to syncCampaign and apply same plan-based limit
- [x] Root cause: r/forhire was position 10 in campaign subreddit list, silently skipped every run

### Campaign Editor Bugs v6.79
- [x] Bug: Keywords added via edit campaign modal are not saving/persisting
- [x] Bug: No drag-to-reorder for keywords (and subreddits) in campaign editor

### Auto-Sync Spam Filter & Lead Scoping Fix v6.80
- [x] Bug: autoSync.ts background job had no spam filter — was saving spammy posts
- [x] Fix: Added full spam filter to autoSync.ts mirroring the one in outreach.ts
- [x] Fix: Spam filter is now subreddit-aware — job board subreddits (forhire, freelance_forhire, etc.) skip the external URL rule since portfolio/contact links are normal there
- [x] Fix: Manual sync in outreach.ts also updated to pass subreddit to isSpamPost
- [x] Fix: Sync toast now shows "Inbox up to date — no new leads found. X leads already in your inbox." when 0 new leads
- [x] Fix: Reset campaign 90001 (For Hire) lastSyncAt/dailySyncsUsed so next manual sync treats posts as fresh

### Backlog v6.81
- [ ] Feature: Daily 8am digest email — scheduled Resend email summarising new leads across all campaigns each morning
- [ ] Feature: Lead Signal intelligence report — "3 warm leads in r/SaaS" card showing posts mentioning target keywords in last 48h, with outreach drafts ready
- [ ] UX: Clean up spammy leads in existing campaigns — review inbox and add bulk "Skip" action for obvious spam posts

### Auto-Sync Race Condition Fix v6.83
- [x] Bug: Auto-sync runs immediately on new campaigns, consuming the fresh lead pool before user's first manual sync
- [x] Fix: autoSync.ts should skip campaigns created in the last 10 minutes
- [x] Fix: Manual syncLeads should ignore lastSyncAt when campaign has 0 leads (always treat as fresh)
- [x] Reset Healthcare Outreach campaign so user can get leads on next manual sync

### PWA Setup v6.84
- [x] Create web app manifest (manifest.json) with app name, icons, theme color, display: standalone
- [x] Generate PWA app icons (192x192, 512x512)
- [x] Create service worker for offline shell and caching
- [x] Register service worker in the app
- [x] Add install prompt UI for "Add to Home Screen"
- [x] Link manifest in index.html with meta tags for mobile

## Discord CTA (v6.85)
- [x] Add "Join Discord" CTA button to sidebar linking to https://discord.gg/RD8ZCtt7Y

## Discord Post-Onboarding Invite (v6.86)
- [x] Add Discord community invite card as final step after onboarding completion (step 5 → Discord → dashboard)
- [x] Card shows "You're in — join the community" messaging with Discord CTA and "Go to dashboard" skip option
- [x] Remove Discord CTA from homepage (keep only in sidebar + post-onboarding)

## Bug: Leads capped at 100 (v6.87)
- [x] Remove hard .limit(100) from getOutreachLeadsByCampaignId — all leads should be visible
- [x] Remove hard .limit(200) from getOutreachLeadsByUserId (dashboard total also capped)
- [x] Add cursor-based pagination to getLeads procedure so large campaigns load efficiently
- [x] Fix leadsFound counter on listCampaigns to use real DB count not stale column

## UX Improvements (backlog)
- [ ] Add virtual scrolling or "load 50 more" pagination to campaign detail lead list (performance for 400+ leads)
- [ ] Bulk "Skip all lowest-match" action in campaign detail to quickly surface strong/partial leads
- [ ] Lead age indicator — show days since discovered so user can prioritise fresher posts

## Intent Label Rename — Buyer-Intent Language (v6.88)
- [x] Rename intentType display labels in DmCampaigns.tsx: buying→🔥 Purchase-Ready, seeking_advice→🎯 Actively Looking, venting→⚠️ Problem-Aware, unknown→👀 Needs Review, hiring→🚫 Not a Lead
- [x] Update badge colors to match new intent tiers
- [x] Update any filter dropdowns or tooltips referencing old labels

## Intent Tier UX (v6.89)
- [ ] Filter bar above lead list — one-click filter by intent tier (🔥 Purchase-Ready, 🎯 Actively Looking, ⚠️ Problem-Aware, 👀 Unclassified Opportunities, 🚫 Not a Lead)
- [ ] Bulk "Skip all 🚫 Not a Lead" button — instantly dismiss all hiring posts from the inbox
- [x] Rename unknown intent badge to "👀 Unclassified Opportunities — hidden potential"

## Intent Filter Bar (v6.90)
- [x] Add intent tier filter bar above lead list in campaign detail — one-click filter with counts per tier
- [x] "All" pill selected by default, clicking a tier filters the list instantly (client-side, no refetch)
- [x] Show count badge on each filter pill (e.g. "🔥 Purchase-Ready (3)")
- [x] Active filter pill highlighted in amber

## Sort by Intent Tier (v6.91)
- [x] Add sort toggle to campaign detail lead list: Intent Tier ↑ / Newest / Match Score
- [x] Purchase-Ready floats to top when sorted by intent tier
- [x] Sort is client-side, no refetch needed

## Pain Point Extraction — Core Differentiator (v6.92)
- [x] Add painPoint field to outreach_leads schema (1-sentence extracted pain point)
- [x] During auto-sync AI scoring, extract 1-sentence pain point per lead: e.g. "Struggling to find warm leads without getting banned"
- [x] Show pain point on lead cards (below post title)
- [x] Show pain point in expandable lead detail / hover

## Pain Point Frequency Aggregation (roadmap)
- [ ] After extraction works: aggregate pain points per campaign into clusters
- [ ] Show "Top Problems This Week" panel on campaign detail page
- [ ] Display top pain point clusters with counts (e.g. "Ban risk concerns (23)", "Low reply rates (18)")
- [ ] This turns SubRoast into an insight + strategy tool, not just a lead finder

## Fix 839 Unclassified Leads — Intent Classification Improvement (roadmap)
- [ ] Tighten AI scoring prompt to force a classification on every post (reduce unknown to near 0)
- [ ] Add heuristic rules: question posts → seeking_advice, "looking for / need" → buying, "recommend / best tool" → buying, venting language → venting
- [ ] Target: 50%+ reduction in unknown/unclassified leads from existing pool
- [ ] Re-classify existing unknown leads in bulk via a background job

## Campaign Edit Fix (v6.93)
- [x] Update Founders Outreach campaign keywords to intent-signal phrases
- [x] Add aiPromptInstructions to Founders Outreach campaign
- [x] Verify campaign edit form loads aiPromptInstructions on open
- [x] Verify campaign edit form saves aiPromptInstructions on submit

## UI/UX Tweaks (v6.94)
- [x] Move pain point display to below lead name and above Analyze Lead button on lead cards
- [x] Fix campaign status badge overlapping with Sync Leads button in campaign detail header

## UI Tweak (v6.95)
- [x] Make Analyze & Draft / Analyze Lead button full width on lead cards

## UI Tweak (v6.96)
- [x] Reorder secondary action buttons: Spam Check | Mark Contacted | Skip in one row
- [x] Add hairline border to Spam Check and Skip buttons

## UI Tweak (v6.97)
- [x] Move intent badge to sit directly above the subreddit/author line on lead cards

## UI Tweak (v6.98)
- [x] Move intent badge above r/subreddit name (top of card, before the subreddit row)

## UI Tweak (v6.99)
- [x] Remove redundant Active status badge from campaign detail header (Pause button implies active)
- [x] Move Paused/Completed status badge to appear after the Pause button
- [x] Put last sync timestamp on the same line as "Last Synced" label

## Pain Point Frequency Panel (v7.00)
- [x] Add getPainPointClusters tRPC procedure — groups pain points from last 7 days into clusters with counts
- [x] AI clusters similar pain points into named themes (e.g. "Ban risk concerns", "Low reply rates")
- [x] Show "Top Problems This Week" panel in campaign detail screen above the Leads Inbox
- [x] Each cluster shows theme name, count badge, and example pain point snippet
- [x] Panel collapses/expands and shows a loading skeleton while AI clusters

## Landing Page Messaging Update (v7.01)
- [x] Update hero headline and subheadline to lead with competitive edges (pain point extraction + buyer intent)
- [x] Update How It Works strip: Extract → Classify → Outreach (replaces Find → Score → Outreach)
- [x] Update stat bar: 5 Buyer intent tiers, AI Pain point extraction, 25 DMs/day, 7-day trial
- [x] Update Use Cases: Lead Generation → Market Intelligence (pain point frequency), App Validation → Market Intelligence
- [x] Add new PainPointFrequencySection with cluster bar chart mockup between VideoSection and Use Cases
- [x] Update LeadIntelligenceDemo section copy + add intent tier legend (🔥/🎯/⚠️)
- [x] Update animated demo Phase 2 lead card: show intent badge, pain point block, and updated DM preview
- [x] Update animated demo chain steps: added Extract pain points + Classify buyer intent steps
- [x] Update Intelligence Report mockup: Lead Signal Detected → Lead Intelligence with intent-classified cards
- [x] Update pricing plan features: added AI pain point extraction, 5-tier buyer intent, Pain Point Frequency panel
- [x] Update CTA section body copy to reference pain point extraction and intent classification

## Mobile UX & Lead Sync Fix (v7.02)
- [x] shadcn Button: add active:scale-[0.97] active:opacity-85 press states + [touch-action:manipulation]
- [x] shadcn Button: add min-h-[44px] on mobile for all size variants
- [x] shadcn Input: add min-h-[44px] on mobile + [touch-action:manipulation]
- [x] shadcn Textarea: update min-h to 44px + [touch-action:manipulation]
- [x] DmCampaigns inputStyle: border 0.5px → 1px, fontSize 16px, minHeight 44px
- [x] Onboarding inputStyle: border 0.5px → 1px, fontSize 16px, minHeight 44px
- [x] Schedule inputStyle: border 0.5px → 1px, fontSize 16px, minHeight 44px
- [x] Confirmed btn-luxury and btn-luxury-primary already have active states + 1px borders
- [x] Confirmed global @media (max-width: 639px) enforces 44px + font-size: 16px !important
- [ ] Lead sync: Reddit IP block on production — fix by connecting Reddit account in Settings → Reddit Account

## Onboarding Form Visual Weight (v7.03 — mattyjacks "fragile dollhouse" feedback)
- [x] Labels: font-size 0.6rem → 0.7rem, font-weight 400 → 600, color MUTED → IVORY_DIM
- [x] Body text: 0.875rem → 1rem, line-height 1.7 → 1.75
- [x] Section gaps: option gap 0.5rem → 0.625rem, form group gap 1rem → 1.25rem
- [x] Selection buttons: extracted to SelectionButton component, padding 0.75rem → 0.875rem, border 0.5px → 1.5px, font-size 0.875rem → 0.9rem, minHeight 52px, checkbox/radio indicator 14px → 16px with 2px border
- [x] Multi-select (Step 3): checkbox indicator now shows checkmark SVG when selected
- [x] CTA buttons: padding 0.85rem → 1rem, font-size 0.68rem → 0.72rem, font-weight → 700, border 0.5px → 1.5px, minHeight 52px
- [x] Back button: added 1.5px solid border, font-weight 500, minHeight 52px — reads as real button not plain text
- [x] Card: border 0.5px → 1.5px, padding increased, maxWidth 480px → 520px, borderRadius 0 → 3px
- [x] Progress bar: height 2px → 3px
- [x] Discord card/buttons: border 0.5px → 1.5px, skip button now has visible border
- [x] All interactive elements: touchAction manipulation + WebkitTapHighlightColor transparent

## Test User Guard (v7.04)
- [x] Add TEST_USER_EMAILS constant in webhook.ts and subscription.ts
- [x] Guard webhook checkout.session.completed: skip if customer_email is test user
- [x] Guard webhook customer.subscription.created/updated: skip if user email is test user
- [x] Guard webhook customer.subscription.deleted: skip if user email is test user
- [x] Guard webhook invoice.payment_failed: skip if user email is test user
- [x] Guard createCheckoutSession: throw FORBIDDEN for test users
- [x] Guard getStatus: always return Growth/hasActiveAccess=true for test users regardless of DB state

## Hero CTA Above-Fold Fix (v7.05)
- [x] Reduce hero section paddingTop: clamp(2rem,5vw,4rem) → clamp(1rem,2.5vw,2rem)
- [x] Reduce hero section paddingBottom: clamp(2rem,5vw,4rem) → clamp(1rem,2.5vw,2rem)
- [x] Reduce grid py-4 lg:py-8 → py-0 lg:py-2
- [x] Eyebrow mb-8 → mb-4 (saves ~1rem)
- [x] Headline mb-6 → mb-4 (saves ~0.5rem)
- [x] Gold rule marginBottom: 2rem → 1rem (saves 1rem)
- [x] Body paragraph marginBottom: 3rem → 1.5rem (saves 1.5rem)
- [x] CTA row mb-10 → mb-4 (saves ~1.5rem)
- [x] Total vertical savings: ~7rem — CTAs now visible above fold on 900px+ screens

## Pain Point Clusters Feature Copy (v7.06)
- [x] Added to todo — copy to be applied to Pain Point Frequency section in next landing page pass

## Use Cases Text Color Fix (v7.06)
- [x] UseCaseCard body text color: oklch(0.60 0.006 80) → oklch(0.92 0.006 80) (matches rate limiting section)

## Reddit Account Connection in Settings (v7.06)
- [x] Investigated: Settings page had a "Coming Soon" placeholder instead of the real connect flow
- [x] Rewrote Reddit Connection section in SettingsPage.tsx with full connect/disconnect UI
- [x] Shows connected account (u/username), Active/Paused status, Disconnect button
- [x] Shows Connect Reddit Account CTA when no account linked (uses trpc.reddit.getConnectUrl)
- [x] Success toast on redirect back from Reddit OAuth (reddit_connected=1 query param)
- [x] Available to all users (per-user tokens used for DM drafting + lead sync fallback)

## Reddit OAuth Callback Fix (v7.07)
- [x] Root cause: oauthStates was an in-memory Map — dev sandbox and production server don't share memory, so state lookups always failed on production, causing redirect to /dashboard/settings?reddit_error=invalid_state which returned {} JSON
- [x] Fix: migrated state storage to DB (new reddit_oauth_states table, varchar PK, 10-min TTL with opportunistic cleanup)
- [x] Fix: callback now redirects to frontendOrigin extracted from stored redirectUri, not a relative path
- [x] Fix: getDb() pattern used throughout (matches rest of server codebase)
- [ ] Reddit app name showing blank on consent screen — requires updating app name in Reddit dashboard at reddit.com/prefs/apps to "SubRoast"

## Reddit OAuth Callback Fix Round 2 (v7.08)
- [ ] Investigate why callback still returns {} after DB-backed state fix
- [ ] Fix routing/redirect issue causing black screen

## Reddit Search via Arctic Shift (v7.08)
- [x] Replace blocked Reddit public API calls in autoSync.ts with Arctic Shift /api/posts/search
- [x] Replace blocked Reddit public API calls in outreach.ts with Arctic Shift /api/posts/search
- [x] Add Arctic Shift search function to a shared module (server/arcticShift.ts)
- [x] Arctic Shift is primary; Reddit OAuth API is secondary fallback
- [ ] Test sync returns leads on production (requires deployment)

## Landing Page Layout Fixes (v7.09)
- [x] Move PainPointFrequencySection to immediately after the hero section (before VideoSection/How It Works)
- [x] Ensure "See how it works" CTA is fully above the fold (hero maxHeight capped at 100svh - 3.5rem, padding reduced)
- [x] Fix pain point description text color to oklch(0.92 0.006 80) — matches hero body text

## Campaign Keyword Optimisation
- [x] Update Founders Outreach keywords to short conversational phrases
- [x] Split App Validation Complaint Mining into individual short keywords
- [x] Update SubRoast ICP Pain-Point Outreach keywords to natural Reddit language
- [x] Update For Hire campaign subreddits to include broader communities
- [x] Update Healthcare Outreach keywords to conversational Reddit language
- [x] Verify syncs return leads after keyword update (8/10 keywords tested, 2 failing replaced with confirmed alternatives)

## Lead Sync Date Fixes
- [ ] Change afterDays from 30 to 7 in autoSync.ts
- [ ] Change afterDays from 30 to 7 in outreach.ts syncLeads
- [ ] Add postCreatedAt column (bigint) to outreach_leads schema
- [ ] Save post.createdUtc into postCreatedAt on lead insert in both autoSync.ts and outreach.ts
- [ ] Display postCreatedAt (Reddit post date) instead of discoveredAt in lead card UI

## Auto-Sync Fix
- [x] Add owner bypass in autoSync.ts so owner's campaigns always sync regardless of subscription status (uses ENV.ownerOpenId)
- [x] Restore owner account subscriptionStatus to active in DB (plan: growth)
- [x] Remove Reddit public API fallback from autoSync.ts — was causing 403 noise, Arctic Shift is sufficient

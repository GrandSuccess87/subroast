# SubRoast — Day 6 Recap (X Post)

---

## Option A — Thread (recommended for engagement)

**Tweet 1 (hook)**
```
Day 6 of building SubRoast in public 🧵

Got my first signup from X yesterday — just by joining conversations, no ads, no cold pitching.

Here's what shipped this week 👇
```

**Tweet 2 (first user)**
```
The first signup came from just showing up in conversations on X

No landing page ads. No cold DMs. Just being genuinely helpful where my ICP already hangs out.

1 user in 5 days of building. Small number. Huge signal.
```

**Tweet 3 (lead sync fixed)**
```
🔍 Fixed the lead sync bug that was silently returning "0 new leads" every run

Root cause: missing UNIQUE constraint on (campaign, post) — every sync was inserting duplicate rows instead of deduplicating.

Also: sync counter now only increments when new leads are actually found.

Starter: 2x/day · Growth: 6x/day
```

**Tweet 4 (progress bar UX)**
```
⚡ The AI chain now shows you exactly what's happening in real time

6-step progress bar: Reading → Scoring → Crafting DM → DM ready → Comment → Done

DM draft appears the moment "DM ready" hits — no waiting for the full chain to finish

Comment draft appears at Done
```

**Tweet 5 (Stripe + payments)**
```
💳 Stripe is fully wired:

→ 7-day free trial (fixed from showing 6 days — switched to trial_period_days instead of absolute timestamp)
→ Webhook handles subscription.created + subscription.updated
→ Plan state updates immediately after checkout
→ Stale customer IDs auto-cleared when switching test ↔ live keys
```

**Tweet 6 (dashboard + pricing)**
```
📊 Dashboard now has 4 pillars: Leads · DMs drafted · Posts · Campaigns

Sidebar Activity shows daily sync usage with an amber bar when you hit the limit

Pricing cleaned up — removed misleading "5 posts/day, 25 DMs/day" rate limits from Starter. Honest pricing > impressive-looking feature lists.
```

**Tweet 7 (feedback board)**
```
🗳️ Just added an in-app feedback board

Alpha users can now submit feature requests, bug reports, and ideas directly from the app

Building in public means building with the people who use it — not just for them
```

**Tweet 8 (CTA)**
```
SubRoast finds Reddit posts from people who need what you sell, scores them, and drafts a personalized DM — all in one click

7-day free trial, no commitment

If you're an indie founder doing Reddit outreach manually, I'd love your feedback

→ subroast.com
```

---

## Option B — Single post (punchy update)

```
Day 6 of building SubRoast 🔧

Got my first X signup yesterday — just from joining conversations. No ads.

What shipped this week:
✅ Lead sync deduplication fixed (was silently returning 0 new leads)
✅ 6-step AI chain progress bar — DM draft appears at step 4
✅ Stripe trial correctly shows 7 days free
✅ Dashboard 4-pillar layout + daily sync counter
✅ Honest pricing — removed fake rate limits from Starter
✅ In-app feedback board for alpha users

Still building. Still shipping.

→ subroast.com
```

---

## Option C — Founder story angle

```
Honest Day 6 update on SubRoast:

Got my first signup from X yesterday. Just from joining conversations — no pitch, no ad.

That one user matters more to me than any vanity metric right now.

This week I fixed a bug where "Sync Leads" was silently returning "0 new leads" on every run. The deduplication logic was broken — inserting duplicate rows instead of updating existing ones. Fixed it with a UNIQUE constraint. Obvious in hindsight.

Also cleaned up the pricing page. Removed "5 posts/day, 25 DMs/day" from Starter — those were rate-limit placeholders from a feature that doesn't exist yet. Honest pricing matters more than impressive-looking feature lists.

Added an in-app feedback board today. If you're an indie founder doing Reddit outreach, I want to hear what's broken.

→ subroast.com
```

# SubRoast Update — X Post Recap

---

## Option A — Thread (recommended for engagement)

**Tweet 1 (hook)**
```
Shipped a big batch of SubRoast updates this week 🧵

Here's what's new 👇
```

**Tweet 2 (lead discovery)**
```
🔍 Lead sync is now actually reliable

Fixed a deduplication bug that was causing every sync to insert duplicate rows instead of updating existing ones.

Added a UNIQUE constraint on (campaign, post) — syncs now correctly report only *new* leads found.

Starter: 2x/day · Growth: 6x/day
```

**Tweet 3 (progress bar UX)**
```
⚡ The AI analysis chain now shows you exactly what's happening

6-step progress bar: Reading → Scoring → Crafting DM → DM ready → Comment → Done

DM draft appears the moment "DM ready" hits — no waiting for the full chain to finish
```

**Tweet 4 (upgrade flow)**
```
💳 Stripe checkout now shows "7 days free" correctly

Switched from an absolute timestamp (which Stripe rounds down to 6 days) to trial_period_days: 7

Also fixed the webhook to handle customer.subscription.created — plan state now updates immediately after checkout
```

**Tweet 5 (dashboard)**
```
📊 Dashboard now has 4 pillars:
→ Leads found
→ DMs drafted
→ Posts published
→ Campaigns (with upgrade nudge for Starter users)

Sidebar Activity panel shows Leads found + Syncs today (X/2) with a progress bar that turns amber when you hit the limit
```

**Tweet 6 (pricing cleanup)**
```
🧹 Cleaned up pricing:

Starter no longer lists "5 posts/day" or "25 DMs/day" — those were rate-limit placeholders that didn't reflect the actual product

AI auto-scheduling moved to Growth (coming soon) — it belongs there

Starter is now honest: 1 campaign, 2x daily lead sync, AI DM drafts
```

**Tweet 7 (CTA)**
```
SubRoast finds Reddit posts from people who need what you sell, scores them, and drafts a personalized DM — all in one click

7-day free trial, no commitment

→ subroast.com
```

---

## Option B — Single post (for quick update)

```
SubRoast update drop 🔧

✅ Fixed lead sync deduplication — no more phantom "0 new leads"
✅ 6-step AI chain progress bar (DM draft appears at step 4, not the end)
✅ Stripe trial now correctly shows 7 days free
✅ Dashboard 4th pillar: Campaigns counter
✅ Sidebar shows daily sync usage (2x Starter / 6x Growth)
✅ Pricing cleaned up — no more misleading post/DM rate limits on Starter

Still building. Still shipping.

→ subroast.com
```

---

## Option C — Founder story angle

```
Honest update on SubRoast:

Found a bug where "Sync Leads" was inserting duplicate rows on every run instead of deduplicating — so the "0 new leads" message was technically correct but for the wrong reason.

Fixed it. Added a UNIQUE constraint. Syncs now work properly.

Also cleaned up the pricing page — removed "5 posts/day, 25 DMs/day" from Starter because those were rate-limit placeholders from a feature that doesn't exist yet. Honest pricing matters more than impressive-looking feature lists.

Still early. Still shipping daily.

→ subroast.com
```

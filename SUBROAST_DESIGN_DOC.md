# SubRoast — Design & Product Document

*Last updated: March 2026*

---

## 1. Product Overview

SubRoast is an AI-powered Reddit growth tool built specifically for indie SaaS founders. It monitors target subreddits, identifies high-intent leads, scores them for relevance and urgency, and drafts personalised outreach messages — all before the founder opens the app. The product also includes a Draft & Roast feature that scores any Reddit post draft for clarity, subreddit fit, and virality, then rewrites it for maximum engagement.

**Core promise:** Your next customer is already on Reddit describing their problem. SubRoast finds them, scores them, and hands you a ready-to-send message.

---

## 2. Target Audience

**Primary:** Indie SaaS founders at the zero-to-one stage — building in public, validating ideas, looking for their first 10–100 paying customers.

**Secondary:** Solo consultants and micro-agencies who use Reddit as a distribution channel.

**Positioning statement:** SubRoast is not a mass-DM blasting tool. It is a precision outreach assistant that respects Reddit culture and surfaces only the leads worth a founder's time.

---

## 3. Brand Identity

| Attribute | Value |
|---|---|
| **Tone** | Direct, intelligent, founder-to-founder |
| **Visual style** | Dark editorial — near-black background, warm amber/gold accent, serif display type |
| **Typography** | Playfair Display (headlines), Inter (body), JetBrains Mono (data/labels) |
| **Primary accent** | Warm amber — `oklch(0.88 0.025 85)` |
| **Background** | Near-black — `oklch(0.09 0.008 60)` |
| **Body text** | Off-white — `oklch(0.93 0.010 80)` |
| **Muted text** | Warm grey — `oklch(0.55 0.006 80)` |

The visual language is intentionally editorial and restrained — it signals precision and intelligence rather than growth-hacking noise.

---

## 4. Homepage Section Sequence

The homepage is structured as a **guided sales conversation**, not a feature catalogue. Each section carries exactly one idea and hands off to the next with clear forward momentum.

### Sequence (in order)

| # | Section | One-line purpose |
|---|---|---|
| 1 | **Hero** | Name the pain, name the audience, name the solution — in that order |
| 2 | **3-Step Strip** | Immediately answer "but how does it work?" before the visitor has to ask |
| 3 | **Intelligence Report Demo** | Show the product in action — proof before features |
| 4 | **Use Cases** | Confirm the three jobs the product does (Lead Gen, Draft & Roast, Validation) |
| 5 | **Social Proof Strip** | Real signal from early users to reduce scepticism |
| 6 | **Account Safety** | Pre-empt the "will I get banned?" objection before pricing |
| 7 | **CTA Strip** | Soft conversion moment before the ask |
| 8 | **What's Coming** | Roadmap transparency — builds trust and urgency |
| 9 | **Pricing** | The ask — only after full understanding has been built |
| 10 | **Footer** | Escape routes and legal |

This sequence mirrors a well-structured sales conversation: **pain → solution → proof → how it works → who it's for → trust signals → objection handling → ask**.

---

## 5. Hero Copy System

### Copy hierarchy

```
EYEBROW     →  "For Indie Founders"
                (Sets audience context before anything else)

HEADLINE    →  "Tired of spending hours
                hunting for leads on Reddit?"
                (Opens at the pain point — visceral, specific, relatable)

BODY        →  "SubRoast monitors Reddit for people describing your exact
                problem, scores their intent, and drafts a personalised
                outreach message — before you even open the app."
                (One sentence. Names the product, the mechanism, the outcome.)

PRIMARY CTA →  "Join the waitlist"
SECONDARY   →  "See how it works"
TRUST LINE  →  "Seven days complimentary · No card required · Cancel at any time"
```

### Design principles applied

- **Pain-point-first:** The headline does not describe the product — it describes the founder's frustration. The product is introduced in the body copy.
- **One idea per element:** Eyebrow = audience. Headline = pain. Body = solution. No element carries more than one idea.
- **Forward pull:** The secondary CTA ("See how it works") anchors to the 3-step strip directly below, creating a natural reading path.

---

## 6. The 3-Step Strip

Positioned immediately below the hero fold, this strip answers the implicit question every visitor has after reading the headline: *"OK, but how?"*

| Step | Title | Copy |
|---|---|---|
| 01 | **Find** | SubRoast scans your target subreddits and surfaces posts from people describing the exact problem you solve. |
| 02 | **Score** | Each lead is scored for intent, urgency, and subreddit fit — so you only see the ones worth your time. |
| 03 | **Outreach** | A personalised DM draft is ready before you open the app. Review, copy, and send in seconds. |

**Design rationale:** Three steps is the cognitive limit for immediate comprehension. More steps would require the visitor to work. The strip uses a bordered grid (consistent with the editorial design system) and numbered labels in the amber accent colour to create visual rhythm without decoration.

---

## 7. UX Clarity Principles (Applied March 2026)

These principles were applied following feedback from a UI/UX specialist and represent the current design standard for all future copy and section work.

1. **Make the value obvious in the first three seconds.** The hero headline must name the pain or the audience — never lead with a motivational tagline.
2. **One idea per section.** Every section (hero, demo, use cases, safety, pricing) carries exactly one idea. Intro copy is trimmed to one sentence.
3. **Guide attention intentionally.** The section sequence is a deliberate narrative arc, not a feature list. Each section creates a question that the next section answers.
4. **Show before you tell.** The Intelligence Report demo (showing a real post analysis with scores, assessment, and rewrite) appears before the use case descriptions — proof precedes claims.
5. **Handle objections before the ask.** The Account Safety section appears before Pricing so the "will I get banned?" concern is resolved before the visitor sees a price.

---

## 8. Soft Launch Strategy — Waitlist as Velvet Rope

SubRoast uses a **velvet rope conversion flow** rather than a standard open signup. This creates perceived exclusivity and urgency during the soft launch phase.

### Flow

```
Homepage CTA ("Join the waitlist")
    ↓
WaitlistGateModal opens (name + email form)
    ↓
Instant approval: "You're approved 🎉" + confetti animation
    ↓
"Begin free trial" CTA → redirects to OAuth signup
```

### Why this works

- **Perceived exclusivity:** Visitors feel they are being granted access, not just signing up.
- **Commitment escalation:** Filling in the form creates micro-commitment before the OAuth step.
- **Live social proof:** A counter showing "X founders already joined" updates every 30 seconds and reinforces momentum.
- **Source tracking:** Every signup is tagged with its origin (hero modal, waitlist page header, waitlist page footer, homepage footer) so conversion by placement can be measured.

---

## 9. Answering the Hard Questions

*These answers are crafted for public-facing contexts — product launch features, X threads, founder communities — where the audience includes both potential users and potential competitors. They are designed to be compelling and credible without exposing implementation details.*

---

### Q: How do you ensure the leads are high-intent and not just random Reddit posts?

**The short answer:** A multi-signal scoring model, not keyword matching.

Most Reddit scraping tools work on keyword search — they return every post that contains a word like "CRM" or "lead generation" and call it a lead. SubRoast takes a fundamentally different approach.

Every post that enters the pipeline is evaluated across three independent dimensions before it ever reaches a user's inbox:

**Intent signals** look at what the author is actually trying to do. Are they describing a problem they are actively trying to solve? Are they asking for recommendations? Are they expressing frustration with an existing solution? Posts that are venting, sharing news, or asking theoretical questions are filtered out — only posts where the author is in an active buying or seeking mode pass through.

**Urgency signals** assess how time-sensitive the need is. A post from six months ago describing a problem they eventually solved is worthless. A post from 48 hours ago where the author is still asking follow-up questions in the comments is high-value. Recency, comment activity, and the author's response pattern all factor in.

**Subreddit fit** ensures the context matches the product. The same post in r/entrepreneur and r/SaaS carries different signal weight depending on what the product does. SubRoast calibrates scoring thresholds per subreddit based on the typical audience and post quality of each community.

The result is that users see a curated shortlist — not a firehose. The design philosophy is that a founder should be able to act on every lead they see, not wade through noise to find the two worth pursuing.

---

### Q: How do you prevent users from getting banned on Reddit?

**The short answer:** Rate limits, human review, and a philosophy of adding value first.

Reddit bans happen for two reasons: volume and quality. Accounts that send too many messages too quickly get flagged by Reddit's automated systems. Accounts that send generic, promotional, or off-topic messages get reported by users. SubRoast addresses both.

**On volume:** The platform enforces hard daily limits — 25 DMs per day, with randomised delays between sends (not a uniform interval, which looks robotic). These limits are not configurable by the user. They are baked into the architecture because protecting the user's Reddit account is more important than maximising their daily output. The limits are set conservatively below Reddit's documented thresholds to maintain a safe buffer.

**On quality:** Every DM draft generated by SubRoast is written to start a conversation, not pitch a product. The AI is explicitly instructed not to mention the user's product in the first message. The draft references something specific from the lead's post — a detail, a question they asked, a frustration they expressed — so the message reads as a genuine response, not a template blast. Users review every draft before it sends.

**The underlying philosophy:** Reddit's culture rewards people who contribute before they ask. SubRoast is built around that principle. The goal is not to extract value from Reddit — it is to help founders show up as genuinely helpful people who happen to have a relevant product. That approach is both more ethical and, practically, far more effective at generating responses.

The Account Safety section on the SubRoast homepage exists precisely because this question matters. Founders who care about their Reddit reputation — which is an asset they have often spent years building — need to know that the tool they are using respects that.

---

## 10. Roadmap Transparency

SubRoast communicates its roadmap publicly on the homepage under a "What's Coming" section. This serves two purposes: it builds trust by showing the product is actively developed, and it creates urgency by giving early adopters a reason to join now rather than wait.

| Feature | ETA | Status |
|---|---|---|
| Chrome extension (one-click send) | Q2 2026 | Coming Soon |
| DM template library | Q2 2026 | Coming Soon |
| Advanced analytics dashboard | Q3 2026 | Coming Soon |

---

## 11. Key Design Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| v5.26 | Dark editorial design system with amber accent | Differentiates from green/blue SaaS defaults; signals precision over growth-hacking |
| v6.40 | Collapsed /waitlist hero to single centered column | Two-column layout was fighting itself; single column creates cleaner reading path |
| v6.46 | Velvet rope modal instead of direct signup CTA | Creates perceived exclusivity and commitment escalation before OAuth step |
| v6.48 | Pricing CTAs renamed "Start Free Trial (Early Access)" | Reduces friction by leading with trial, not price; "Early Access" reinforces exclusivity |
| v6.51 | Hero headline rewritten pain-point-first | UX specialist feedback: motivational taglines require cognitive work; pain-point headlines create instant recognition |
| v6.51 | 3-step strip added directly below hero | Answers "how does it work?" before visitor has to scroll to find out |
| v6.51 | All section intro copy trimmed to one sentence | Each section now carries one idea; eliminates information overload |
| v6.52 | Hero eyebrow changed to "For Indie Founders" | Sets audience context before headline lands; self-selects the right visitor immediately |

---

*Document maintained by the SubRoast product team. For questions, contact via the in-app Feedback board.*

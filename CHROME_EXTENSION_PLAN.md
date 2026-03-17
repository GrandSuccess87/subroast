# SubRoast Chrome Extension — Build Plan

**Version:** 1.0 Draft  
**Last updated:** March 2026  
**Status:** Pre-development — planning phase

---

## Why a Chrome Extension?

Reddit's public API is rate-limited, increasingly restricted, and a direct line to account bans when used for automated sending. The Chrome extension approach removes the highest-confidence signal Reddit uses to identify bots: API token presence and programmatic HTTP call patterns.

The extension operates entirely within the browser DOM. It does not make API calls to Reddit. Instead, it navigates to the correct Reddit page, finds the compose window, fills in the pre-drafted text, and waits for the user to click Send. The send action itself is a native browser form submission — Reddit sees a logged-in session cookie, a human-initiated form submit event, and normal browser headers. No OAuth token, no `Authorization` header, no call to `api.reddit.com`.

**Residual risk (small but real):** Reddit's pattern recognition can still detect velocity signals (many sends in a short window) and content similarity across accounts. SubRoast mitigates both: daily send limits are enforced server-side regardless of the extension, and AI-personalised drafts reduce content fingerprinting. The extension does not bypass SubRoast's own rate limits — it is purely the delivery mechanism.

The extension's job is narrow and deliberate: **receive a pre-drafted message from SubRoast, navigate to the correct Reddit thread or DM compose window, pre-fill the message, and let the user send with one click.** SubRoast remains the intelligence layer; the extension is purely the delivery mechanism.

---

## Architecture Overview

```
SubRoast Web App (subroast.com)
  │
  │  postMessage / extension messaging API
  ▼
Chrome Extension (content script on reddit.com)
  │
  │  DOM manipulation — fills compose window
  ▼
Reddit.com (user's own session)
  │
  │  User clicks Send
  ▼
Message delivered — no API, no automation flag
```

The extension never touches SubRoast's backend directly. It only listens for messages from the SubRoast web app and acts on Reddit's DOM. This keeps the architecture clean and the extension's permissions minimal.

---

## Phases

### Phase 1 — Foundation (Weeks 1–2)

The goal of this phase is a working extension that can open a Reddit DM compose window and pre-fill a message body. No SubRoast integration yet — just proving the DOM manipulation works reliably.

**Deliverables:**
- Chrome extension scaffold: `manifest.json` (Manifest V3), background service worker, content script for `reddit.com/*`
- Content script that detects when the user is on a Reddit profile page and injects a "Send DM" button
- On button click: opens Reddit's DM compose modal and pre-fills a hardcoded test message
- Extension loads in developer mode, no Chrome Web Store submission yet

**Technical decisions:**
- Manifest V3 is required for Chrome Web Store submission; use `chrome.scripting` and `chrome.tabs` APIs
- Content scripts run in the page context; use `MutationObserver` to handle Reddit's React-rendered DOM
- No background fetch calls — keep the extension stateless in Phase 1

---

### Phase 2 — SubRoast Integration (Weeks 3–4)

Connect the extension to the SubRoast web app so that clicking "Send via Extension" on a lead card in SubRoast triggers the extension to open the correct Reddit profile and pre-fill the drafted DM.

**Deliverables:**
- SubRoast web app sends a message to the extension via `chrome.runtime.sendMessage` (requires the extension ID to be known) or via a shared `localStorage` / `BroadcastChannel` relay
- Extension background worker receives the payload: `{ redditUsername, messageBody, campaignId, leadId }`
- Extension opens a new tab to `https://www.reddit.com/user/{username}`, waits for page load, then triggers the DM compose flow
- SubRoast lead card updates status to `"sent"` after the user confirms send (via a callback message from the extension)
- **Extension must POST to SubRoast after each send** to increment `dmsCount` in `rateLimitTracking` — this keeps the "DMs Today" counter on the campaign detail accurate. Use the existing `trpc.outreach.recordSend` endpoint (to be created in Phase 2). SubRoast remains the record of truth for all rate limit counters regardless of how the send was initiated.
- Extension popup UI: shows the last 5 pending sends, connection status to SubRoast

**Technical decisions:**
- Use `chrome.runtime.id` on the extension side and expose it via the extension's `externally_connectable` manifest field so SubRoast can message it directly
- SubRoast stores the user's installed extension ID in `localStorage` after a one-time pairing flow
- The pairing flow: user clicks "Connect Extension" in SubRoast Settings → extension popup opens → user clicks "Pair with SubRoast" → IDs are exchanged

---

### Phase 3 — Comment Reply Support (Week 5)

Extend the extension to handle public comment replies in addition to DMs. The flow is the same — SubRoast drafts the reply, the extension navigates to the thread and pre-fills the reply box.

**Deliverables:**
- Extension handles a second payload type: `{ threadUrl, commentBody, parentCommentId? }`
- Navigates to the thread URL, scrolls to the correct comment (if replying to a specific comment), and pre-fills the reply textarea
- SubRoast "Send Comment via Extension" button on lead cards that have a `commentDraft` field

---

### Phase 4 — Anti-Pattern Safeguards (Week 6)

Implement the pattern-avoidance techniques from the Reddit scaling post: vary message timing, randomise small details in the send flow, and surface a daily send limit warning.

**Deliverables:**
- Extension enforces a configurable daily send limit (default: 25 per Reddit account) with a visible counter in the popup
- Random delay (2–8 seconds) between the extension receiving a send command and executing DOM actions — mimics human reaction time
- Send queue: if multiple sends are triggered rapidly, the extension queues them with randomised delays rather than firing simultaneously
- Warning UI if the user attempts to send more than 25 messages in a rolling 24-hour window

---

### Phase 5 — Chrome Web Store Submission (Week 7–8)

Prepare the extension for public distribution.

**Deliverables:**
- Privacy policy page on subroast.com covering extension data handling (no data leaves the browser except the pairing ID)
- Chrome Web Store listing: screenshots, description, category (`Productivity`)
- Extension passes Chrome's automated review (Manifest V3, minimal permissions: `tabs`, `scripting`, `storage`, `https://www.reddit.com/*`)
- SubRoast Settings page updated with a "Install Extension" button linking to the Web Store listing
- Onboarding checklist step updated from "Coming soon" to "Install extension"

---

## Permissions Strategy

Requesting the minimum viable permissions is critical for Web Store approval and user trust.

| Permission | Reason | Required? |
|---|---|---|
| `tabs` | Open new Reddit tabs and detect when a tab has loaded | Yes |
| `scripting` | Inject content scripts into reddit.com pages | Yes |
| `storage` | Store pairing ID and send history locally | Yes |
| `https://www.reddit.com/*` | Content script host permission | Yes |
| `https://subroast.com/*` | Receive messages from SubRoast web app | Yes |
| `background` | Service worker for message queue | Yes |
| `identity` | Not needed — user is already logged into Reddit | No |
| `cookies` | Not needed — content script runs in page context | No |

---

## Data Flow & Privacy

The extension does **not** transmit any data to SubRoast's servers. The flow is:

1. SubRoast web app (running in the user's browser) sends a message payload to the extension via `chrome.runtime.sendMessage`
2. The extension acts on Reddit's DOM using the payload
3. After the user clicks Send on Reddit, the extension sends a confirmation back to the SubRoast web app
4. The SubRoast web app updates the lead status via its normal tRPC mutation

No message content, Reddit credentials, or user data ever leaves the user's browser through the extension. The only persistent data stored by the extension is the pairing ID and a local send count for the daily limit feature.

---

## SubRoast App Changes Required

The following changes to the SubRoast web app are needed to support the extension:

| Area | Change |
|---|---|
| Settings page | Add "Connect Extension" pairing flow with install link |
| Lead card | Add "Send via Extension" button (replaces current "Copy & Open") |
| Campaign creation | Add "Extension send" as a review mode option (alongside "Review First") |
| Onboarding checklist | Update "Connect Reddit account" step to "Install Chrome extension" |
| Lead status | Add `"queued_for_extension"` status for leads awaiting send |
| Dashboard banner | Remove "Reddit direct posting coming soon" — replace with extension install CTA once live |

---

## Open Questions

These decisions should be made before Phase 2 begins:

1. **Pairing mechanism** — `chrome.runtime.sendMessage` requires knowing the extension ID at install time. The cleanest approach is to have the extension write its ID to `localStorage` on `subroast.com` when the user visits the site with the extension installed. SubRoast reads this on page load and shows "Extension connected" in Settings. Is this acceptable UX?

2. **Multi-account support** — the extension operates in the user's active Reddit session. If a user wants to send from multiple Reddit accounts (as described in the scaling post), they would need to switch Reddit accounts manually between sends. Should the extension surface a "Switch account" reminder before each send batch?

3. **Firefox support** — Manifest V3 is Chrome-only in its current form. Firefox uses a slightly different API surface. Should Firefox be a Phase 5 or Phase 6 target?

4. **Mobile** — Chrome extensions do not run on mobile browsers. The current "Copy & Open" flow remains the mobile path indefinitely unless a separate mobile approach is scoped.

---

## Success Metrics

| Metric | Target |
|---|---|
| Extension install rate among active SubRoast users | ≥ 40% within 30 days of Web Store launch |
| "Send via Extension" usage vs "Copy & Open" | Extension preferred by ≥ 60% of users within 60 days |
| Daily send limit warnings triggered | < 5% of send sessions (indicates users are staying safe) |
| Reddit account bans reported by extension users | 0 in first 90 days |
| Chrome Web Store rating | ≥ 4.5 stars |

---

## Timeline Summary

| Phase | Focus | Duration |
|---|---|---|
| 1 | Extension scaffold + DOM manipulation proof of concept | Weeks 1–2 |
| 2 | SubRoast integration + pairing flow | Weeks 3–4 |
| 3 | Comment reply support | Week 5 |
| 4 | Anti-pattern safeguards + send queue | Week 6 |
| 5 | Web Store submission + SubRoast app updates | Weeks 7–8 |

**Total estimated build time:** 8 weeks for a solo developer familiar with Chrome extension development, or 5–6 weeks with a dedicated frontend engineer.

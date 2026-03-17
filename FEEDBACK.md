# SubRoast — Social Feedback Log

A running record of comments, DMs, and feedback received across social platforms. Use this to track patterns, prioritise improvements, and close the loop with users.

---

## Format

Each entry follows this structure:

```
### [Platform] — [Date] — [Status]
**Source:** @handle or "Anonymous"
**Context:** Where the comment appeared (post URL, DM, reply thread, etc.)

> Verbatim quote or summary of feedback

**Action taken:** What was done (or why it was deferred)
**Linked backlog item:** todo.md section/item if applicable
```

Status options: `Open` · `In Progress` · `Implemented` · `Deferred` · `Won't Fix`

---

## Entries

### X (Twitter) — 2026-03-17 — Implemented
**Source:** Anonymous (X reply)
**Context:** Reply to Day 10 build-in-public post

> "Looks like a solid tool. One thing I noticed though, the secondary text is a bit hard to read because the contrast is quite low. Using colors like #A1A1AA or #9CA3AF for the secondary text could improve readability while still keeping the dark aesthetic."

**Action taken:** Audited all secondary/muted text across homepage, pricing page, and dashboard. Converted MUTED color tokens from `oklch(0.52)` range to `oklch(0.62)` (equivalent to ~#9CA3AF on a dark background), matching the suggested values. Applied globally via CSS variable and per-component token updates.
**Linked backlog item:** Homepage Polish Batch 2 — secondary text contrast

---

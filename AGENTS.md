# AGENTS.md — Inbox Autopsy

**Project:** Inbox Autopsy — cold outreach email auditor  
**Methodology:** Spec-Driven Development (SDD)  
**Spec source:** `SPEC.md` (v1.1) — treat as single source of truth

---

## Persistent Instructions for AI Agents

1. **SPEC.md is the source of truth** — all product requirements, scope, and acceptance criteria live there. Do not deviate without explicit approval.

2. **Stack:** React 18 + Vite, JavaScript (ESM), Tailwind CSS via official Vite integration (PostCSS). Keep dependencies minimal.

3. **Architecture:** Simple, flat, beginner-friendly. No external state library, no backend, no auth. `localStorage` only for persistence.

4. **Workflow:** Implement **one small, testable feature at a time**. Each slice should be verifiable against the manual checklist in SPEC.md §7.

5. **Before coding:** Briefly explain the intended changes and which spec section/acceptance criterion they address.

6. **After coding:** Run appropriate checks (dev server, build, manual test steps) and report **actual results** — not assumptions.

7. **Never claim success without verification.** If a feature or test hasn't been run, say so.

8. **No invented facts or predictive claims.** The tool applies heuristic rules to user-provided text only. Never claim to predict reply rates or invent prospect data.

9. **Stay on scope.** Avoid unrelated features, unnecessary rewrites, or "nice-to-haves" not in SPEC.md.

10. **Approval required** for: destructive actions (deleting files, resetting git), introducing a backend, adding paid services, or any change outside SPEC.md v1 scope.

11. **Secrets:** Never expose or commit API keys, tokens, or credentials. This project uses none.

12. **Quality bars:** Prioritize accessibility (semantic HTML, focus states, contrast), responsive design (mobile-first, 375/768/1440px), and clear error handling (toasts, disabled states, empty states).

13. **Explain decisions** in beginner-friendly language. Keep commentary concise — teach the *why*, not the obvious *what*.

---

## Quick Reference: Spec Sections

| Section | Purpose |
|---------|---------|
| SPEC.md §1–2 | Problem, users, 7 core features |
| SPEC.md §3 | 6 user stories + acceptance criteria |
| SPEC.md §4 | Exact tech stack & deps |
| SPEC.md §5 | Hard exclusions (v1) |
| SPEC.md §6 | UI/UX standards |
| SPEC.md §7 | Manual (mandatory) + automated (optional) test checklist |

---

## Typical Agent Cycle

```
1. Read SPEC.md → identify next unbuilt feature
2. Propose small implementation plan (1–3 components / functions)
3. Get approval → implement
4. Verify against SPEC.md §7 manual checklist items
5. Report: "✅ Verified: [checklist item]" or "❌ Failed: [details]"
6. Repeat until all §7 manual items pass
```

---

**Reminder:** This file guides agent behavior. It does not replace SPEC.md. When in doubt, re-read SPEC.md.
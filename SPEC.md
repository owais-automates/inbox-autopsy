# Inbox Autopsy — Specification v1.1

## 1. Problem & Target Users
- **Problem:** Cold outreach emails often get ignored because they're vague, self-centered, or lack credibility. Senders have no quick, private way to diagnose and fix them.
- **Target users:** Founders, sales reps, recruiters, freelancers — anyone sending cold emails who wants a free, instant, offline-first audit tool.

## 2. Core Features (v1 Scope)
1. **Paste & Analyze** — Textarea input; click "Analyze" to run deterministic rules.
2. **Four Explainable Scores** (0–100 each) with clear explanations:
   - **Clarity** — Readability (Flesch-Kincaid), avg sentence length ≤ 20 words, passive voice count, jargon/buzzword density.
   - **Relevance** — "You/your" vs "I/we/my" ratio ≥ 2:1, presence of prospect-specific tokens (name, company, role), absence of generic templates.
   - **Credibility** — Concrete numbers/metrics, social proof (client names, logos, results), no spam triggers (ALL CAPS, excessive !, "guarantee", "free").
   - **Actionability** — Single clear CTA (question or low-friction link), no multiple competing asks, next step takes ≤ 30 seconds.
3. **Specific Improvement Suggestions** — Per-score bullet list quoting the problematic phrase and stating the fix.
4. **Rule-Based Rewrite** — One-click "Rewrite" generates a corrected version applying the top 3–5 fixes. Display **original and rewrite side-by-side** (desktop) or stacked (mobile) in clearly separated panels. Character-level diff highlighting is **optional**.
5. **Copy to Clipboard** — Buttons for original, analysis summary, and rewrite. Toast confirmation.
6. **Sample Emails** — 3 built-in examples (poor, mediocre, strong) loadable with one click; auto-analyzes on load.
7. **Recent History** — Last 5 analyses saved to `localStorage`, displayed in a sidebar/list with timestamp, scores, and first 60 chars. Persists after hard refresh.

## 3. User Stories & Acceptance Criteria

| ID | User Story | Acceptance Criteria |
|----|------------|---------------------|
| US1 | As a user, I paste an email and get four scores with explanations. | Scores render instantly for normal-length emails (< 300 words); each score shows a 1-line explanation on hover/click. |
| US2 | I see specific suggestions tied to my text. | Each suggestion quotes the exact problematic substring and states a concrete fix. |
| US3 | I can generate a rule-based rewrite and compare side-by-side. | Rewrite replaces flagged phrases, preserves intent, shown in adjacent panel (desktop) or stacked (mobile). |
| US4 | I can copy any output with one click. | Toast confirms "Copied!"; clipboard contains plain text. |
| US5 | I can load a sample email to try the tool. | Clicking a sample populates textarea and triggers analysis automatically. |
| US6 | My last 5 analyses persist across reloads. | History survives browser close; shows date, 4 scores, preview text. |

## 4. Technical Stack
- **Framework:** React 18 + Vite
- **Language:** JavaScript (ESM)
- **Styling:** Tailwind CSS via **official Vite integration** (PostCSS)
- **State:** React `useState` / `useReducer` — no external state library
- **Persistence:** `localStorage` only
- **Build/Deploy:** `npm run build` → static `dist/` folder (deploy anywhere)
- **Dependencies:** Minimal — only `react`, `react-dom`, `tailwindcss`, `postcss`, `autoprefixer`, `vite`, plus optional `vitest`/`@testing-library/react` if time permits

## 5. Explicitly Excluded (v1)
- Backend / database / authentication
- Paid or mandatory external AI APIs (OpenAI, etc.)
- User accounts, cloud sync, team features
- Email sending or deliverability testing
- Rich-text editor (plain textarea only)
- Automated A/B testing or analytics
- **Any claim to predict actual reply rates or invent prospect facts** — the tool only applies heuristic rules to the provided text.

## 6. UI/UX Requirements
- **Polished, responsive interface** with strong visual hierarchy
- **Thoughtful empty states** (e.g., "Paste a cold email to begin")
- **Clear feedback** (toasts, loading spinners, disabled states)
- **Consistent spacing** (Tailwind spacing scale)
- **Avoid generic AI-generated dashboard styling** — distinctive, clean, trustworthy look
- **Mobile-first**: works at 375px, 768px, 1440px

## 7. Testing Checklist

### Manual (mandatory — run before release)
- [ ] Paste 300-word email → scores render instantly, no UI freeze
- [ ] All 4 scores show explanations on hover/click
- [ ] Suggestions quote exact substrings from input
- [ ] Rewrite button produces non-identical output; side-by-side layout works
- [ ] Copy buttons work on all three panels (original, analysis, rewrite)
- [ ] Sample emails load and analyze correctly
- [ ] History shows ≤ 5 items, persists after hard refresh
- [ ] Responsive layout at 375px / 768px / 1440px
- [ ] No console errors on mount/interaction
- [ ] `npm run build` succeeds with no warnings

### Automated (optional — only if time permits)
- [ ] `analyzeEmail()` returns 4 scores + suggestions for known fixtures
- [ ] `rewriteEmail()` output contains expected fixes
- [ ] `localStorage` history round-trips correctly
# Inbox Autopsy

A free, offline-first cold outreach email auditor. Paste an email → get four explainable quality scores, specific improvement suggestions, and a rule-based rewrite. No backend, no tracking, no external AI APIs.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css&logoColor=white)

---

## The Problem

Cold outreach emails often get ignored because they're vague, self-centered, or lack credibility. Senders have no quick, private way to diagnose and fix them before hitting send.

**Inbox Autopsy** gives you an instant, deterministic audit:

- **Clarity** — Readability (Flesch-Kincaid), sentence length, passive voice, jargon density
- **Relevance** — "You/your" vs "I/we/my" ratio, prospect-specific details, template detection
- **Credibility** — Concrete metrics, social proof signals, spam trigger warnings
- **Actionability** — Clear single CTA, low-friction next steps, competing ask detection

Each score (0–100) comes with a plain-English explanation and specific, quoted suggestions tied to your text.

---

## Features

| Feature | Description |
|---------|-------------|
| **Paste & Analyze** | Textarea input with live character/word count; click Analyze for instant results |
| **Four Explainable Scores** | Clarity, Relevance, Credibility, Actionability — each with progress bar and explanation |
| **Specific Suggestions** | Per-category bullet list quoting the exact problematic phrase and stating the fix |
| **Rule-Based Rewrite** | One-click rewrite applying the top fixes; preserves intent, names, numbers, URLs |
| **Copy Rewrite** | Copies rewritten email to clipboard with toast confirmation (Clipboard API + fallback) |
| **Sample Emails** | Three built-in examples (Weak, Average, Strong) using fictional details only |
| **Recent History** | Last 5 analyses saved to `localStorage` with timestamp, scores, and preview; click to restore |
| **Privacy-First** | No backend, no tracking, no external AI — everything runs in your browser |

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 + Vite 8 |
| Language | JavaScript (ESM) |
| Styling | Tailwind CSS 4 (official Vite plugin) |
| State | React `useState` / `useCallback` — no external state library |
| Persistence | `localStorage` only |
| Linting | Oxlint |
| Build Output | Static `dist/` folder (deploy anywhere) |

**Dependencies:** `react`, `react-dom`  
**Dev Dependencies:** `vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`, `@tailwindcss/postcss`, `autoprefixer`, `postcss`, `oxlint`, `@types/react`, `@types/react-dom`

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm (bundled with Node.js)

### Installation & Development

```bash
# 1. Clone the repository
git clone <repository-url>
cd inbox-autopsy

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open the local URL shown in the terminal (typically http://localhost:5173)
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run Oxlint on source files |

---

## Project Structure

```
inbox-autopsy/
├── index.html              # Entry HTML
├── package.json            # Project config & scripts
├── postcss.config.js       # PostCSS config (autoprefixer)
├── vite.config.js          # Vite config with Tailwind plugin
├── src/
│   ├── main.jsx            # React bootstrap
│   ├── index.css           # Tailwind imports & base styles
│   ├── App.jsx             # Main app component (UI + state)
│   └── utils/
│       ├── analyzeEmail.js # Scoring engine (Clarity, Relevance, Credibility, Actionability)
│       ├── rewriteEmail.js # Rule-based rewrite generator
│       ├── samples.js      # 3 built-in sample emails
│       └── history.js      # localStorage persistence (max 5 entries)
└── dist/                   # Production build output (generated)
```

---

## How It Works

### Analysis Engine (`analyzeEmail.js`)
Deterministic heuristic rules score each dimension 0–100:

- **Clarity**: Flesch-Kincaid grade level, avg sentence length (≤20 words), passive voice count, jargon/buzzword hits
- **Relevance**: "You/your" vs "I/we/my" ratio (target ≥ 2:1), prospect-specific tokens (name, company, role), generic template phrase detection
- **Credibility**: Numbers/metrics, social proof keywords, spam triggers (ALL CAPS, excessive `!`, "guarantee", "free", etc.)
- **Actionability**: CTA signals (questions, links, action words), single vs multiple CTAs, low-friction indicators (specific time proposals, calendar links)

### Rewrite Engine (`rewriteEmail.js`)
Applies safe, explainable transformations (top 5 prioritized fixes):
- Removes spam trigger words
- Converts ALL CAPS to title case (preserves common acronyms)
- Replaces jargon with plain alternatives
- Fixes simple passive voice constructions
- Normalizes punctuation/spacing

**Never** invents prospect facts, metrics, testimonials, or personalization.

### History (`history.js`)
- Saves up to 5 most recent successful analyses
- Deduplicates consecutive identical emails
- Stores: email text, scores, meta (word/sentence count), preview (first 60 chars), ISO timestamp
- Gracefully handles missing/unavailable `localStorage`

---

## Limitations (Honest)

- **Rule-based only** — Analysis and rewriting use deterministic heuristics, not machine learning or LLMs
- **No predictive claims** — Scores are heuristic guidance, **not** predictions of actual reply rates
- **Local history** — Stored in the current browser's `localStorage`; clearing browser data removes it
- **No backend** — No accounts, cloud sync, team features, or email sending
- **Plain text input** — No rich-text editor; works with the full email text you paste
- **English heuristics** — Scoring rules optimized for English cold outreach

---

## Learning Project

This project was built as a learning exercise in **Spec-Driven Development** and **AI-assisted coding**. It demonstrates:

- Writing a specification first (`SPEC.md`) and building to it
- Incremental feature slices with manual verification checklists
- Clean separation of pure logic (utils) from React components
- Minimal dependency philosophy
- Accessible, responsive UI with Tailwind CSS

---

## License

MIT — free to use, modify, and distribute.
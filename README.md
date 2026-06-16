<div align="center">

# 🧌 PageGoblin Chrome Extension

### The tiny goblin that judges your website — right from your browser.

**Click the goblin. Get an instant score. Cry a little. Then fix it.**

[![Web App](https://img.shields.io/badge/🌐_Web_App-pagegoblin.org-4ade80?style=for-the-badge)](https://pagegoblin.org)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![WXT](https://img.shields.io/badge/Built_with-WXT-purple?style=for-the-badge)](https://wxt.dev)
[![Manifest](https://img.shields.io/badge/Manifest-V3-orange?style=for-the-badge)](https://developer.chrome.com/docs/extensions/mv3/intro/)

</div>

---

## 🎯 What is this?

A Chrome extension that gives any webpage an instant **Goblin Score** and brutally honest (but useful) conversion teardown. No sign-up required for the quick roast. The goblin lives in your browser and has opinions.

> *"Pretty page. Weak pitch. Classic crime."*

### ✨ Features

- ⚡ **Instant Local Score** — No server needed. The goblin reads the page and grades it in milliseconds
- 🧠 **Same Engine as Web App** — Identical scoring logic, so extension and web app roasts are consistent
- 📋 **Goblin Complaints** — The biggest issues, ranked by severity, in goblin voice
- 🔧 **Useful Fixes** — Real, actionable recommendations (not just jokes)
- 🚀 **Open Full Roast** — Send signals to pagegoblin.org for a shareable full report
- ⚠️ **Private Page Warnings** — Localhost, dashboards, and login pages trigger a warning before any data leaves
- 📋 **Copy Summary** — Copy the goblin's full roast to clipboard
- 🎨 **Premium UI** — Animated transitions, goblin mascot, premium-funny (not cheap-funny)

---

## 🔒 Privacy First — Non-Negotiable

This extension is designed with **maximum privacy** from the ground up:

| Principle | Implementation |
|-----------|---------------|
| **No auto-scanning** | The goblin only wakes up when YOU click "Roast This Page" |
| **No background monitoring** | Zero activity until you explicitly act |
| **No persistent access** | `activeTab` only — access is temporary per click |
| **No full HTML sent** | Only extracted signals (title, headings, CTA text, trust indicators) |
| **No remote code** | All logic is bundled — nothing is fetched from a server |
| **Private page warnings** | Localhost, dashboards, admin pages → warning before any data leaves |
| **No tracking** | No analytics, no browsing history, no telemetry |

### Permissions Explained

| Permission | Why it's needed |
|------------|----------------|
| `activeTab` | Read the current page's content when you click the roast button |
| `scripting` | Inject the extraction function into the active tab (on user action only) |
| `storage` | Save your recent roasts and preferences locally |

**That's it. No `tabs`, no `history`, no `<all_urls>`, no `cookies`.**

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [WXT](https://wxt.dev) — modern browser extension framework |
| **UI** | [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) via `@tailwindcss/vite` |
| **Animations** | [Motion](https://motion.dev) (framer-motion) |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Manifest** | Chrome MV3 |
| **Package Manager** | [Bun](https://bun.sh) |

---

## 🚀 Development

### Prerequisites

- [Bun](https://bun.sh) (`curl -fsSL https://bun.sh/install | bash`)
- Chrome/Chromium browser

### Setup

```bash
# Clone
git clone https://github.com/sayuru-akash/pagegoblin-chrome-ext.git
cd pagegoblin-chrome-ext

# Install dependencies
bun install

# Run in dev mode (opens Chrome with extension loaded)
bun run dev
```

### Load in Chrome manually

```bash
# Build for production
bun run build

# The extension is in .output/chrome-mv3/
```

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `.output/chrome-mv3/` directory
5. The goblin icon should appear in your toolbar 🧌

### Package for Chrome Web Store

```bash
bun run zip
# Upload .output/chrome-mv3.zip to the Chrome Web Store
```

---

## 📁 Project Structure

```
src/
├── entrypoints/
│   ├── popup/                 # 🖼️ Popup UI
│   │   ├── index.html         #    HTML shell
│   │   ├── main.tsx           #    React mount
│   │   └── App.tsx            #    Main popup (idle → loading → results → error)
│   └── background.ts          # ⚙️ Service worker (EXTRACT_SIGNALS handler)
├── lib/
│   ├── analysis/              # 🧠 Scoring engine (ported from web app)
│   │   ├── scoring.ts         #    Category scores + goblin score
│   │   ├── signals.ts         #    URL normalization + private page detection
│   │   ├── roast-copy.ts      #    Verdicts, biggest crime, summary builder
│   │   └── types.ts           #    TypeScript interfaces
│   ├── extract.ts             # 🔍 Self-contained DOM extraction (for executeScript)
│   ├── messaging.ts           # 📨 Type-safe message types
│   └── storage.ts             # 💾 Recent roasts + preferences
├── components/
│   ├── ScoreOrb.tsx           # 📊 Animated circular score gauge
│   ├── VerdictLine.tsx        # 💬 Goblin verdict one-liner
│   ├── ComplaintItem.tsx      # ⚠️ Complaint card with severity badge
│   ├── QuickFixList.tsx       # 🔧 Expandable useful fixes
│   └── LoadingState.tsx       # ⏳ Animated goblin loading
├── assets/
│   ├── styles.css             # 🎨 Tailwind v4 + custom goblin theme
│   └── goblin.svg             # 🧌 Goblin mascot SVG
└── icons/                     # 🖼️ Generated extension icons (16/32/48/128px)
```

---

## 🧠 How the Scoring Works

The extension uses the **exact same deterministic engine** as the web app, ported 1:1. This means:

- 🔢 **Identical scores** — Same page → same score on extension and web app
- ⚡ **Instant** — No network call needed, computed locally in the popup
- 🎯 **Objective** — Score is based on page signals, not AI opinions

### Goblin Score Formula

```
goblinScore = 100 - weighted_average(
  trustTax × 0.20 +
  ctaCorpse × 0.25 +
  fluffDamage × 0.15 +
  buyerConfusion × 0.25 +
  conversionFriction × 0.15
)
```

Higher category scores = worse page. The goblin score inverts that: higher = better page.

---

## 🔄 Data Flow

```
User clicks extension icon → Popup opens
User clicks "Roast This Page"
  → Popup sends { type: "EXTRACT_SIGNALS" } to background
  → Background calls browser.scripting.executeScript({ func: extractPageSignals })
  → Extraction reads DOM: title, H1/H2, CTAs, hero text, trust indicators, counts
  → Background returns PageSignals to popup
  → Popup runs local deterministic analysis (instant)
  → Popup shows: Score Orb, Biggest Crime, Top 3 Complaints, Verdict

User clicks "Open Full Roast on pagegoblin.org"
  → Popup checks for private page risk
  → If private: ⚠️ warning with Cancel/Proceed
  → If safe: POST { signals } to https://pagegoblin.org/api/roasts
  → Opens report page in new tab
```

### What Gets Extracted

| Signal | What it reads |
|--------|--------------|
| `url` | `location.href` |
| `title` | `document.title` |
| `metaDescription` | `<meta name="description">` |
| `h1` / `h2` | Heading text content |
| `ctaTexts` | Action-oriented button/link text |
| `heroText` | First H1 or hero section text |
| `bodyTextSample` | `document.body.innerText` (truncated) |
| `trustIndicators` | Elements matching testimonial/review/case study patterns |
| `socialProofText` | Elements matching "trusted by" / "featured in" patterns |
| `linkCount` / `buttonCount` / `formCount` / `imageCount` | DOM element counts |
| `hasPricing` / `hasContact` / `hasTestimonials` etc. | Boolean feature flags |

**What does NOT get extracted:** forms, passwords, hidden inputs, auth tokens, cookies, local storage, personal data.

---

## 📊 Popup States

| State | What shows |
|-------|-----------|
| **Idle** 🧌 | Goblin mascot, tagline, "Roast This Page" button |
| **Loading** ⏳ | Animated goblin, "Gutting your page..." text |
| **Results** 📊 | Score orb, verdict, biggest crime, top 3 complaints, action buttons |
| **Error** 😵 | Goblin confused face, error message, retry button |

---

## 🛠️ Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Dev mode with hot reload (opens Chrome automatically) |
| `bun run build` | Production build → `.output/chrome-mv3/` |
| `bun run zip` | Package for Chrome Web Store → `.output/chrome-mv3.zip` |
| `bun run type-check` | TypeScript strict check |

---

## 🔗 Related

- **Web App**: [pagegoblin.org](https://pagegoblin.org) — full reports, sharing, history, AI mode
- **Web App Repo**: [sayuru-akash/pagegoblin](https://github.com/sayuru-akash/pagegoblin)
- **SPEC.md**: [Full product specification](SPEC.md)

---

## 📜 License

MIT © [Sayuru](https://github.com/sayuru-akash)

---

<div align="center">

**🧌 Built with obsessive attention to goblin detail.**

[Report a bug](https://github.com/sayuru-akash/pagegoblin-chrome-ext/issues) · [Request a feature](https://github.com/sayuru-akash/pagegoblin-chrome-ext/issues) · [Buy the goblin a snack](https://pagegoblin.org)

</div>

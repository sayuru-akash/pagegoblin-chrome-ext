# PageGoblin Chrome Extension

> The tiny goblin that judges your website — right from your browser.

A Chrome extension that gives any webpage an instant **Goblin Score** and brutally honest (but useful) conversion teardown. No sign-up required for the quick roast.

## What it does

1. **Click the goblin** on any page
2. **Get an instant score** — the goblin reads the page and grades trust, clarity, CTAs, copy, and conversion friction
3. **See the crimes** — the biggest issues, ranked by severity, in goblin voice
4. **Open the full roast** — send the page signals to [pagegoblin.org](https://pagegoblin.org) for a shareable full report with actionable fixes

## Privacy first

- **Minimal permissions**: `activeTab`, `scripting`, `storage` only
- **No auto-scanning** — the goblin only wakes up when you click
- **No background monitoring** — zero activity until you act
- **No full page HTML sent** — only extracted signals (title, headings, CTA text, trust indicators)
- **Private page warnings** — localhost, dashboards, and login pages trigger a warning before any data leaves your browser

## Tech stack

- **WXT** — browser extension framework
- **React 19** + **TypeScript** — popup UI
- **Tailwind CSS v4** — styling
- **Manifest V3** — Chrome only for V1
- **Local deterministic engine** — instant scoring with no server needed

## Development

```bash
# Install dependencies
bun install

# Run in dev mode (opens Chrome with extension loaded)
bun run dev

# Build for production
bun run build

# Package for Chrome Web Store
bun run zip
```

The production build outputs to `.output/chrome-mv3/`.

## Architecture

```
src/
├── entrypoints/
│   ├── popup/          # React popup UI (idle → loading → results → error)
│   └── background.ts   # Service worker (on-demand signal extraction)
├── lib/
│   ├── analysis/       # Deterministic scoring engine (ported from web app)
│   ├── extract.ts      # Self-contained DOM signal extraction
│   ├── messaging.ts    # Type-safe message types
│   └── storage.ts      # Recent roasts + preferences
└── components/         # ScoreOrb, VerdictLine, ComplaintItem, etc.
```

## How the scoring works

The goblin checks five categories (0–100 each, lower = worse):

| Category | What it measures |
|----------|-----------------|
| **Trust Tax** | Testimonials, case studies, client logos, security badges, contact info |
| **CTA Corpse** | CTA presence, specificity, competing actions |
| **Fluff Damage** | Buzzword density, vague copy, substance vs filler |
| **Buyer Confusion** | H1 clarity, offer specificity, who/what/outcome |
| **Conversion Friction** | Next-step clarity, trust near CTA, friction points |

The **Goblin Score** (0–100) is a weighted average — clarity and CTA strength matter most.

## Related

- **Web app**: [pagegoblin.org](https://pagegoblin.org) — full reports, sharing, history
- **Web app repo**: [sayuru-akash/pagegoblin](https://github.com/sayuru-akash/pagegoblin)

## License

MIT © [Sayuru](https://github.com/sayuru-akash)

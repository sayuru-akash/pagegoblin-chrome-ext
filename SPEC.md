# SPEC.md — PageGoblin by Sayu

## Product identity

**Product name:** PageGoblin by Sayu  
**Publisher:** Sayu personal publisher account  
**Product type:** Chrome extension + full web app  
**Web app domain:** `pagegoblin.org`  
**Store title:** PageGoblin by Sayu: Website Roast & Conversion Teardown  
**Short description:** A tiny goblin judges your webpage and shows what is killing trust, clarity, CTAs, copy, and conversion confidence.  
**Tagline:** The tiny goblin that judges your website.

PageGoblin is the funny, memorable, founder-led website roast product. It should feel like a playful browser creature that brutally but usefully reviews a webpage. It must be fun without becoming childish, offensive, unsafe, or useless.

This is not a normal audit tool. It is a conversion and trust teardown wrapped in goblin humour.

---

## Final product decision

PageGoblin must have:

1. A Chrome extension that captures the active page and gives an instant Goblin Score.
2. A full web app at `pagegoblin.org` where users can generate, view, save, share, and explore full website roast reports.

The extension and web app must be connected. The extension should be the fastest way to roast the active page, while the web app should own the full report experience, shareable pages, public landing page, and future growth.

Single purpose:

> Review a webpage’s trust, clarity, copy, CTA, and conversion weaknesses in a playful website-roast format.

---

## Brand personality

PageGoblin must be funny, sharp, memorable, and useful.

It should sound like:

- A tiny goblin living in the browser
- Brutally honest but still helpful
- Founder-level judgement with humour
- “This page looks expensive but says nothing” energy

It must not sound like:

- A corporate audit tool
- A generic SEO checker
- A childish meme app with no value
- A hateful or abusive roast bot

### Voice examples

Good:

- “The hero section is doing interpretive dance instead of selling.”
- “Your CTA is hiding like it owes someone money.”
- “The goblin found trust issues. Bring proof, testimonials, or at least one reason to believe you.”
- “Pretty page. Weak pitch. Classic crime.”

Avoid:

- Personal insults against people
- Slurs, hate, or discriminatory language
- Extreme profanity in store-facing copy
- Claims that the website will definitely fail
- Harassment-style roast language

---

## Product language

Use custom Goblin terms across the extension and web app.

Suggested terms:

- **Goblin Score** — overall score out of 100
- **Biggest Crime** — most damaging issue
- **Goblin Complaints** — key issues list
- **Trust Tax** — how much trust the page loses
- **CTA Corpse** — weak or dead CTA issue
- **Fluff Damage** — vague copy and buzzword problem
- **Buyer Confusion Level** — clarity issue
- **Fix This Before Crying** — top priority fix
- **The Goblin Verdict** — final roast summary
- **Actually Useful Fixes** — practical recommendations

Keep the humour consistent, not random.

---

## Target users

- Founders
- Marketers
- Web designers
- Agencies
- Indie hackers
- SaaS builders
- Freelancers
- Creators with landing pages
- Business owners who want a funny but useful website teardown

---

## Core workflows

### Extension quick roast

1. User opens a website.
2. User clicks PageGoblin.
3. Extension scans active page after user action.
4. Extension shows Goblin Score, Biggest Crime, and quick fixes.
5. User clicks “Open Full Roast” to send extracted page signals to `pagegoblin.org`.
6. Web app opens the full report.

### Web app full roast

1. User lands on `pagegoblin.org`.
2. User can paste a URL or start from extension.
3. Web app creates full roast report.
4. User can view, copy, download, or share the report.
5. Optional account later for saved roasts.

---

## Recommended technology stack

### Chrome extension

- WXT + React + TypeScript
- Chrome Manifest V3
- Tailwind CSS
- Local deterministic analysis engine
- Minimal storage for preferences and recent local roasts
- Explicit user action before page scan or web upload

### Web app

- Latest stable Next.js with App Router
- React + TypeScript
- Tailwind CSS
- Custom playful design system, not default shadcn look
- Supabase or similar Postgres-backed stack for reports, guest sessions, and optional accounts
- Zod or equivalent validation
- Rate limiting and bot protection for URL-based web scans
- Hosted on Vercel, Cloudflare, or a stable Node hosting setup
- Domain: `pagegoblin.org`

---

## Extension permission strategy

Use minimum permissions.

### Required permissions

- `activeTab` — temporary access to the active tab after user clicks.
- `scripting` — inject/read DOM only after user action.
- `storage` — optional local preferences and recent local roasts.

### Avoid

- Avoid persistent all-site access.
- Avoid auto-scanning browsing history.
- Avoid hidden page uploads.
- Avoid remote code.
- Avoid background monitoring.

User must explicitly click “Open Full Roast” before data is sent to `pagegoblin.org`.

---

## Data flow between extension and web app

### Safe V1 data flow

1. Extension extracts only necessary page signals:
   - URL
   - Title
   - Meta description
   - H1/H2 text
   - CTA-like button/link text
   - Visible hero text sample
   - Trust signal indicators
   - Social proof indicators
   - Link/button counts
   - Screenshot optional only if explicitly enabled

2. Extension creates quick local roast.
3. If user chooses full report, extension sends extracted signals to the web app API.
4. Web app creates a report and opens the report page.

### Data minimisation

Do not send full page HTML by default. Do not send forms, passwords, hidden inputs, auth tokens, cookies, local storage, or private account data. Do not include personal information unless it is visibly part of the page and needed for the report.

### Warning for private pages

If the page appears to be behind a login, dashboard, localhost, private IP, or admin area, show a warning before sending to the web app.

---

## Web app architecture

### Public marketing pages

- Homepage with funny PageGoblin positioning
- How it works
- Examples of roast cards
- Chrome extension CTA
- Privacy policy
- Terms
- Support/contact

### App pages

- New roast
- Full roast report
- Shared public roast page
- Private roast page
- Recent roasts if account enabled
- Settings

### Report pages

A full report should include:

- Goblin Score
- Biggest Crime
- Trust Tax
- Fluff Damage
- CTA Corpse
- Buyer Confusion Level
- Hero Section Panic
- Proof/credibility check
- Mobile suspicion warning if detectable
- Actually Useful Fixes
- Goblin Verdict
- Copyable summary

### Sharing

V1 sharing options:

- Private unlisted report link
- Public shareable roast card image if possible
- Copy text summary
- Download Markdown

Do not index private reports.

---

## Page analysis logic

Use deterministic analysis for V1.

### Trust signals

Check for visible indicators such as:

- Testimonials
- Reviews
- Case studies
- Client logos
- Awards
- Certifications
- Founder/team info
- Physical address or contact info
- Security/trust badges where relevant
- Portfolio/work examples

### Clarity signals

Check:

- Is the offer visible above the fold?
- Is the H1 specific?
- Does the page say who it is for?
- Does it explain the outcome?
- Does it have a strong CTA?
- Does it avoid vague buzzwords?

### CTA signals

Check:

- CTA presence
- CTA specificity
- Repeated CTA visibility
- CTA mismatch with offer
- Too many competing CTAs
- Weak CTA text like “Learn More” used without context

### Copy signals

Flag:

- Generic buzzwords
- “Innovative solutions” style fluff
- Long vague hero text
- No clear buyer benefit
- Feature dumping without outcome
- No proof after claim

### Conversion signals

Check:

- Main action path
- Trust before CTA
- Friction points
- Contact options
- Obvious next step

---

## UI and visual direction

PageGoblin should look premium-funny, not cheap-funny.

### Visual style

- Off-white or pale parchment background
- Ink-black text
- Acid green / goblin green accents
- Purple-black secondary accent
- Soft shadows
- Rounded but slightly odd shapes
- Small mascot/icon moments
- Playful microcopy
- Modern card layout

### Web app landing vibe

A tiny goblin tearing through bad landing pages. Use tasteful illustration or mascot direction. Avoid looking like a children’s game.

### Extension popup

- Compact but expressive
- Goblin Score at the top
- One funny verdict
- Three biggest issues
- Button: “Open Full Roast”
- Button: “Copy Roast”
- Button: “Actually Useful Fixes”

---

## AI policy for PageGoblin

V1 should be deterministic and usable without AI.

Future AI roast mode can be added later, but must:

- Require explicit user action
- Clearly disclose data sent to AI provider
- Avoid generating abusive content
- Keep roast focused on the webpage, not people
- Provide useful recommendations, not just jokes

---

## Chrome Store notes

Chrome Store copy should be fun but not risky.

Use:

- “Website roast”
- “Conversion teardown”
- “Trust and clarity checker”
- “Playful but practical feedback”

Avoid:

- Excessive profanity
- Attacks on people
- Fake guarantees
- Claims of ranking improvement
- Broad data collection claims

---

## Non-goals for V1

Do not build:

- Full SEO audit
- Keyword ranking
- Backlink analysis
- Heatmaps
- Full screenshot annotation tool
- Personal insult generator
- Background scanning
- Mandatory account creation

---

## QA scenarios

Test with:

- Agency website
- SaaS landing page
- Restaurant/homepage
- Portfolio website
- Bad generic AI-looking website
- Strong conversion-focused page
- Empty landing page
- Login/dashboard page warning
- Localhost page
- Mobile-width page if possible

---

## Acceptance criteria

The build is complete when:

- Extension creates a quick roast from the active page.
- User explicitly chooses when to send page signals to web app.
- Web app at `pagegoblin.org` creates full roast reports.
- Reports are funny, useful, and consistent with PageGoblin tone.
- Data minimisation is implemented.
- Private pages trigger warnings before upload.
- UI feels unique, memorable, and polished.
- Chrome permissions are minimal and justified.
- Store listing is safe and approval-ready.

## Official references the agent must check before implementation

- Chrome Extensions documentation: https://developer.chrome.com/docs/extensions
- Chrome activeTab permission: https://developer.chrome.com/docs/extensions/develop/concepts/activeTab
- Chrome Manifest V3 remote hosted code requirements: https://developer.chrome.com/docs/webstore/program-policies/mv3-requirements
- Chrome Web Store Developer Programme Policies: https://developer.chrome.com/docs/webstore/program-policies/policies
- Chrome Web Store privacy fields: https://developer.chrome.com/docs/webstore/cws-dashboard-privacy
- WXT browser extension framework: https://wxt.dev

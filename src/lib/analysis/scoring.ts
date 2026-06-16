import type { PageSignals, CategoryScores, GoblinComplaint, UsefulFix, Severity, Priority, Effort } from "./types";

const BUZZWORDS = [
  "innovative", "cutting-edge", "world-class", "seamless", "leverage",
  "scalable solutions", "digital transformation", "synergy", "bespoke",
  "empower", "unlock potential", "next-generation", "game-changing",
  "revolutionize", "paradigm shift", "best-in-class", "state-of-the-art",
  "holistic", "robust",
];

const WEAK_CTAS = ["learn more", "submit", "click here", "read more", "more"];

const STRONG_CTAS = [
  "start free trial", "book a demo", "get started", "see pricing",
  "get quote", "install extension", "sign up free", "try free",
  "start trial", "get demo", "watch demo", "roast my page",
];

const VAGUE_H1_PATTERNS = [
  /^welcome\b/i, /^home$/i, /^the future of/i, /^innovative solutions/i,
  /^we help businesses/i, /^transform your/i, /^revolutionize/i,
  /^the best/i, /^your journey/i, /^discover the/i,
];

const CLEAR_H1_PATTERNS = [
  /\b(crm|erp|saas|app|platform|tool|software|dashboard)\b/i,
  /\bfor\b.*\b(teams|businesses|companies|people|developers|designers)\b/i,
  /\b(close|save|reduce|increase|grow|build|track|manage|automate)\b/i,
  /\b(free trial|demo|pricing|quote)\b/i,
];

function clamp(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function countBuzzwords(text: string): { count: number; found: string[] } {
  const lower = text.toLowerCase();
  const found = BUZZWORDS.filter((bw) => lower.includes(bw));
  return { count: found.length, found };
}

function hasAnyTrue(signals: PageSignals, keys: (keyof PageSignals)[]): number {
  return keys.filter((k) => signals[k] === true).length;
}

export function scoreTrustTax(signals: PageSignals): number {
  let score = 20;
  const trustCount = signals.trustIndicators?.length ?? 0;
  const socialCount = signals.socialProofText?.length ?? 0;
  score += Math.min(trustCount * 8, 30);
  score += Math.min(socialCount * 6, 20);
  const trustBools = hasAnyTrue(signals, [
    "hasTestimonials", "hasCaseStudies", "hasClientLogos",
    "hasSecurityBadges", "hasAddress", "hasTeam",
  ]);
  score += trustBools * 5;
  if (signals.hasContact) score += 8;
  if (signals.hasPricing) score += 5;
  return clamp(score);
}

export function scoreCTACorpse(signals: PageSignals): number {
  const ctas = signals.ctaTexts ?? [];
  if (ctas.length === 0) return 5;
  let score = 30;
  const ctaTexts = ctas.map((c) => c.toLowerCase());
  const strongCount = ctaTexts.filter((cta) =>
    STRONG_CTAS.some((s) => cta.includes(s))
  ).length;
  score += Math.min(strongCount * 15, 30);
  const weakCount = ctaTexts.filter((cta) =>
    WEAK_CTAS.some((w) => cta === w || cta.startsWith(w))
  ).length;
  if (weakCount === ctas.length && ctas.length > 0) score -= 25;
  else score -= weakCount * 5;
  if (ctas.length > 5) score -= 10;
  if (ctas.length >= 1) score += 10;
  return clamp(score);
}

export function scoreFluffDamage(signals: PageSignals): number {
  const allText = [
    signals.heroText ?? "",
    signals.bodyTextSample ?? "",
    signals.visibleTextSample ?? "",
    signals.title ?? "",
    signals.metaDescription ?? "",
  ].join(" ");
  const { count } = countBuzzwords(allText);
  let score = 90 - count * 12;
  const hasSubstance =
    signals.hasPricing || signals.hasTestimonials || signals.hasCaseStudies || signals.trustIndicators?.length;
  if (count >= 3 && !hasSubstance) score -= 15;
  return clamp(score);
}

export function scoreBuyerConfusion(signals: PageSignals): number {
  let score = 30;
  const h1s = signals.h1 ?? [];
  const heroText = signals.heroText ?? "";
  if (h1s.length > 0) {
    score += 15;
    const h1Text = h1s[0].toLowerCase();
    const isVague = VAGUE_H1_PATTERNS.some((p) => p.test(h1Text));
    const isClear = CLEAR_H1_PATTERNS.some((p) => p.test(h1Text));
    if (isClear) score += 20;
    if (isVague) score -= 15;
  }
  if (heroText.length > 20) {
    score += 10;
    const lower = heroText.toLowerCase();
    if (/\b(for|help|teams|businesses|people|developers|companies)\b/.test(lower)) score += 8;
    if (/\b(close|save|reduce|increase|grow|build|track|manage|automate|faster|better|more)\b/.test(lower)) score += 8;
    if (/\b(crm|platform|tool|software|app|dashboard|extension)\b/.test(lower)) score += 8;
  }
  if (signals.metaDescription && signals.metaDescription.length > 30) score += 5;
  if ((signals.h2 ?? []).length >= 2) score += 5;
  return clamp(score);
}

export function scoreConversionFriction(signals: PageSignals): number {
  let score = 40;
  const ctas = signals.ctaTexts ?? [];
  if (ctas.length >= 1) score += 15;
  const hasTrust =
    (signals.trustIndicators?.length ?? 0) > 0 ||
    signals.hasTestimonials ||
    signals.hasSecurityBadges;
  if (ctas.length > 0 && hasTrust) score += 10;
  if (signals.hasContact) score += 10;
  if (signals.hasPricing) score += 10;
  const links = signals.linkCount ?? 0;
  if (links > 40) score -= 15;
  else if (links > 25) score -= 5;
  if ((signals.buttonCount ?? 0) > 10) score -= 10;
  if ((signals.formCount ?? 0) > 0) score += 5;
  return clamp(score);
}

export function computeCategoryScores(signals: PageSignals): CategoryScores {
  return {
    trustTax: scoreTrustTax(signals),
    ctaCorpse: scoreCTACorpse(signals),
    fluffDamage: scoreFluffDamage(signals),
    buyerConfusionLevel: scoreBuyerConfusion(signals),
    conversionFriction: scoreConversionFriction(signals),
  };
}

export function computeGoblinScore(categories: CategoryScores): number {
  const weights = {
    trustTax: 0.2,
    ctaCorpse: 0.25,
    fluffDamage: 0.15,
    buyerConfusionLevel: 0.25,
    conversionFriction: 0.15,
  };
  const weighted =
    categories.trustTax * weights.trustTax +
    categories.ctaCorpse * weights.ctaCorpse +
    categories.fluffDamage * weights.fluffDamage +
    categories.buyerConfusionLevel * weights.buyerConfusionLevel +
    categories.conversionFriction * weights.conversionFriction;
  return clamp(weighted);
}

export function getVerdict(score: number): string {
  if (score >= 80) return "The goblin is grudgingly impressed. Don't let it go to your head.";
  if (score >= 60) return "Not terrible. The goblin has notes.";
  if (score >= 40) return "The goblin found crimes. Many crimes. Sit down.";
  if (score >= 20) return "The goblin is in pain. This page hurts it.";
  return "The goblin has seen things. It wishes it hadn't.";
}

interface ComplaintTemplate {
  id: string;
  title: string;
  severity: Severity;
  condition: (signals: PageSignals, scores: CategoryScores) => boolean;
  detail: (signals: PageSignals) => string;
  evidence?: (signals: PageSignals) => string[];
}

const COMPLAINT_TEMPLATES: ComplaintTemplate[] = [
  {
    id: "no-testimonials",
    title: "Zero social proof. Classic goblin bait.",
    severity: "critical",
    condition: (s) => !s.hasTestimonials && (s.trustIndicators?.length ?? 0) === 0,
    detail: (s) =>
      `Not a single testimonial, review, or case study on ${s.title ?? "this page"}. Visitors have no reason to trust you over the other 47 tabs they have open.`,
    evidence: (s) => {
      const ev: string[] = [];
      if (!s.hasTestimonials) ev.push("No testimonials found");
      if (!s.hasCaseStudies) ev.push("No case studies found");
      if (!s.hasClientLogos) ev.push("No client logos found");
      return ev;
    },
  },
  {
    id: "weak-ctas",
    title: "Your CTA is hiding like it owes someone money.",
    severity: "high",
    condition: (s, scores) => scores.ctaCorpse < 30,
    detail: (s) => {
      const ctas = s.ctaTexts ?? [];
      if (ctas.length === 0) return "Zero CTAs detected. The goblin literally cannot find a button to click.";
      return `Found ${ctas.length} CTA(s): "${ctas.slice(0, 3).join('", "')}". None of them make the goblin want to click.`;
    },
    evidence: (s) => (s.ctaTexts ?? []).slice(0, 5),
  },
  {
    id: "fluff-overload",
    title: "Buzzword overdose. The goblin needs a detox.",
    severity: "high",
    condition: (s, scores) => scores.fluffDamage < 40,
    detail: () =>
      "The page is drowning in corporate jargon. Words like 'innovative', 'cutting-edge', and 'synergy' are doing heavy lifting where actual value propositions should be.",
    evidence: (s) => {
      const allText = [s.heroText ?? "", s.bodyTextSample ?? ""].join(" ").toLowerCase();
      return BUZZWORDS.filter((bw) => allText.includes(bw)).slice(0, 5);
    },
  },
  {
    id: "no-pricing",
    title: "No pricing? The goblin smells fear.",
    severity: "medium",
    condition: (s) => !s.hasPricing,
    detail: () =>
      "No pricing signals found. Hiding prices doesn't build mystery — it builds exit velocity. Visitors bounce to competitors who show their hand.",
  },
  {
    id: "confusing-hero",
    title: "The hero section is doing interpretive dance instead of selling.",
    severity: "high",
    condition: (s, scores) => scores.buyerConfusionLevel < 35,
    detail: (s) => {
      const h1 = s.h1?.[0];
      if (h1) return `Your H1 is "${h1}" — the goblin has no idea what you sell, who it's for, or why it should care.`;
      return "No clear H1 found. The hero section is a mystery wrapped in an enigma wrapped in bad conversion rates.";
    },
    evidence: (s) => (s.h1 ?? []).slice(0, 3),
  },
  {
    id: "no-contact",
    title: "No contact info. Are you in witness protection?",
    severity: "medium",
    condition: (s) => !s.hasContact,
    detail: () =>
      "No email, phone, or contact link found. Visitors can't reach you even if they wanted to. That's not a business, that's a ghost.",
  },
  {
    id: "no-mobile-viewport",
    title: "No mobile viewport. Welcome to 2010.",
    severity: "critical",
    condition: (s) => !s.hasMobileViewport,
    detail: () =>
      "No viewport meta tag detected. Over 60% of web traffic is mobile. This page is invisible to most of the internet.",
  },
  {
    id: "too-many-links",
    title: "Link soup. The goblin got lost.",
    severity: "medium",
    condition: (s) => (s.linkCount ?? 0) > 40,
    detail: (s) =>
      `${s.linkCount} links on one page. That's not navigation, that's a labyrinth. Visitors don't explore — they escape.`,
  },
  {
    id: "no-trust-badges",
    title: "No security badges. The goblin feels exposed.",
    severity: "medium",
    condition: (s) => !s.hasSecurityBadges,
    detail: () =>
      "No SSL badges, trust seals, or security indicators. In a world of phishing scams, your page looks like it might steal my credit card.",
  },
  {
    id: "no-team",
    title: "Who runs this thing? The goblin demands faces.",
    severity: "low",
    condition: (s) => !s.hasTeam,
    detail: () =>
      "No team section found. People buy from people. Show the humans behind the product or the goblin assumes it's run by another goblin.",
  },
];

export function generateComplaints(
  signals: PageSignals,
  scores: CategoryScores
): GoblinComplaint[] {
  const complaints: GoblinComplaint[] = [];
  for (const tmpl of COMPLAINT_TEMPLATES) {
    if (complaints.length >= 8) break;
    if (tmpl.condition(signals, scores)) {
      complaints.push({
        id: tmpl.id,
        title: tmpl.title,
        severity: tmpl.severity,
        detail: tmpl.detail(signals),
        evidence: tmpl.evidence?.(signals),
      });
    }
  }
  // Sort by severity: critical > high > medium > low
  const severityOrder: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  complaints.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
  return complaints.slice(0, 8);
}

interface FixTemplate {
  title: string;
  detail: string;
  priority: Priority;
  effort: Effort;
  condition: (signals: PageSignals, scores: CategoryScores) => boolean;
}

const FIX_TEMPLATES: FixTemplate[] = [
  {
    title: "Add testimonials with real names and photos",
    detail: "Place 3-5 specific testimonials near your CTA. 'Sarah K, Marketing Director' beats 'Happy Customer' every time.",
    priority: "urgent",
    effort: "medium",
    condition: (s) => !s.hasTestimonials,
  },
  {
    title: "Rewrite your H1 to say what you do and for whom",
    detail: "Replace vague hero copy with a clear value proposition. 'CRM for small teams that close faster' > 'Innovative solutions for the modern era'.",
    priority: "high",
    effort: "low",
    condition: (_, scores) => scores.buyerConfusionLevel < 40,
  },
  {
    title: "Add a primary CTA above the fold",
    detail: "One clear action: 'Start Free Trial', 'Book a Demo', 'See Pricing'. Make it a contrasting color. Put it where eyes land first.",
    priority: "urgent",
    effort: "low",
    condition: (_, scores) => scores.ctaCorpse < 30,
  },
  {
    title: "Show your pricing",
    detail: "Even a 'Starting at $X/mo' or transparent tiers reduce bounce. Hiding prices creates friction, not intrigue.",
    priority: "high",
    effort: "medium",
    condition: (s) => !s.hasPricing,
  },
  {
    title: "Cut the buzzwords, add specifics",
    detail: "Replace 'innovative' with a number. Replace 'cutting-edge' with a result. 'Reduce churn by 30%' > 'Revolutionary retention solution'.",
    priority: "high",
    effort: "medium",
    condition: (_, scores) => scores.fluffDamage < 40,
  },
  {
    title: "Add a contact method",
    detail: "Email, chat widget, contact form — anything. Make it obvious visitors can reach a human.",
    priority: "medium",
    effort: "low",
    condition: (s) => !s.hasContact,
  },
  {
    title: "Add client/trust logos",
    detail: "Show recognizable brands that use your product. Even 'Trusted by 500+ teams' with a few logos helps.",
    priority: "medium",
    effort: "low",
    condition: (s) => !s.hasClientLogos,
  },
  {
    title: "Reduce link count",
    detail: "Audit your navigation. Too many options create decision paralysis. Focus on 5-7 primary links.",
    priority: "low",
    effort: "medium",
    condition: (s) => (s.linkCount ?? 0) > 40,
  },
];

export function generateFixes(
  signals: PageSignals,
  scores: CategoryScores
): UsefulFix[] {
  const fixes: UsefulFix[] = [];
  for (const tmpl of FIX_TEMPLATES) {
    if (fixes.length >= 5) break;
    if (tmpl.condition(signals, scores)) {
      fixes.push({
        title: tmpl.title,
        detail: tmpl.detail,
        priority: tmpl.priority,
        effort: tmpl.effort,
      });
    }
  }
  const priorityOrder: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
  fixes.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  return fixes.slice(0, 5);
}

export function getBiggestCrime(complaints: GoblinComplaint[]): string {
  if (complaints.length === 0) return "No major crimes detected. Suspicious.";
  return complaints[0].title;
}

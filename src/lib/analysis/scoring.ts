import type { PageSignals, CategoryScores, GoblinComplaint, UsefulFix } from "./types";

// ─── Buzzword list ───────────────────────────────────────────────────────────

const BUZZWORDS = [
  "innovative",
  "cutting-edge",
  "world-class",
  "seamless",
  "leverage",
  "scalable solutions",
  "digital transformation",
  "synergy",
  "bespoke",
  "empower",
  "unlock potential",
  "next-generation",
  "game-changing",
  "revolutionize",
  "paradigm shift",
  "best-in-class",
  "state-of-the-art",
  "holistic",
  "robust",
];

const WEAK_CTAS = ["learn more", "submit", "click here", "read more", "more"];
const STRONG_CTAS = [
  "start free trial",
  "book a demo",
  "get started",
  "see pricing",
  "get quote",
  "install extension",
  "sign up free",
  "try free",
  "start trial",
  "get demo",
  "watch demo",
  "roast my page",
];

const VAGUE_H1_PATTERNS = [
  /^welcome\b/i,
  /^home$/i,
  /^the future of/i,
  /^innovative solutions/i,
  /^we help businesses/i,
  /^transform your/i,
  /^revolutionize/i,
  /^the best/i,
  /^your journey/i,
  /^discover the/i,
];

const CLEAR_H1_PATTERNS = [
  /\b(crm|erp|saas|app|platform|tool|software|dashboard)\b/i,
  /\bfor\b.*\b(teams|businesses|companies|people|developers|designers)\b/i,
  /\b(close|save|reduce|increase|grow|build|track|manage|automate)\b/i,
  /\b(free trial|demo|pricing|quote)\b/i,
];

// ─── Scoring helpers ─────────────────────────────────────────────────────────

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

// ─── Category scoring functions ──────────────────────────────────────────────

export function scoreTrustTax(signals: PageSignals): number {
  let score = 20; // base

  const trustCount = signals.trustIndicators?.length ?? 0;
  const socialCount = signals.socialProofText?.length ?? 0;

  // Trust indicators
  score += Math.min(trustCount * 8, 30);

  // Social proof
  score += Math.min(socialCount * 6, 20);

  // Boolean trust signals
  const trustBools = hasAnyTrue(signals, [
    "hasTestimonials",
    "hasCaseStudies",
    "hasClientLogos",
    "hasSecurityBadges",
    "hasAddress",
    "hasTeam",
  ]);
  score += trustBools * 5;

  // Contact info
  if (signals.hasContact) score += 8;

  // Has pricing (transparency)
  if (signals.hasPricing) score += 5;

  return clamp(score);
}

export function scoreCTACorpse(signals: PageSignals): number {
  const ctas = signals.ctaTexts ?? [];

  if (ctas.length === 0) return 5;

  let score = 30;

  const ctaTexts = ctas.map((c) => c.toLowerCase());

  // Check for strong CTAs
  const strongCount = ctaTexts.filter((cta) =>
    STRONG_CTAS.some((s) => cta.includes(s))
  ).length;
  score += Math.min(strongCount * 15, 30);

  // Check for weak CTAs
  const weakCount = ctaTexts.filter((cta) =>
    WEAK_CTAS.some((w) => cta === w || cta.startsWith(w))
  ).length;

  // If ALL CTAs are weak, big penalty
  if (weakCount === ctas.length && ctas.length > 0) {
    score -= 25;
  } else {
    score -= weakCount * 5;
  }

  // Too many competing CTAs is bad
  if (ctas.length > 5) score -= 10;

  // Having at least one CTA is good
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

  // Start at 90, deduct for each buzzword
  let score = 90 - count * 12;

  // If there are many buzzwords with no substance, extra penalty
  const hasSubstance =
    signals.hasPricing ||
    signals.hasTestimonials ||
    signals.hasCaseStudies ||
    signals.trustIndicators?.length;

  if (count >= 3 && !hasSubstance) {
    score -= 15;
  }

  return clamp(score);
}

export function scoreBuyerConfusion(signals: PageSignals): number {
  let score = 30;

  const h1s = signals.h1 ?? [];
  const heroText = signals.heroText ?? "";

  // Has H1
  if (h1s.length > 0) {
    score += 15;

    const h1Text = h1s[0].toLowerCase();

    // Check if H1 is specific (not vague)
    const isVague = VAGUE_H1_PATTERNS.some((p) => p.test(h1Text));
    const isClear = CLEAR_H1_PATTERNS.some((p) => p.test(h1Text));

    if (isClear) score += 20;
    if (isVague) score -= 15;
  }

  // Has hero text
  if (heroText.length > 20) {
    score += 10;

    // Check if hero answers what/who/outcome
    const lower = heroText.toLowerCase();
    const hasWhoFor =
      /\b(for|help|teams|businesses|people|developers|companies)\b/.test(lower);
    const hasOutcome =
      /\b(close|save|reduce|increase|grow|build|track|manage|automate|faster|better|more)\b/.test(lower);
    const hasWhat =
      /\b(crm|platform|tool|software|app|dashboard|extension)\b/.test(lower);

    if (hasWhoFor) score += 8;
    if (hasOutcome) score += 8;
    if (hasWhat) score += 8;
  }

  // Has meta description
  if (signals.metaDescription && signals.metaDescription.length > 30) {
    score += 5;
  }

  // Has multiple H2s (content structure)
  const h2s = signals.h2 ?? [];
  if (h2s.length >= 2) score += 5;

  return clamp(score);
}

export function scoreConversionFriction(signals: PageSignals): number {
  let score = 40;

  const ctas = signals.ctaTexts ?? [];

  // Has clear next step (CTA)
  if (ctas.length >= 1) score += 15;

  // Has trust signals near CTA (we approximate: both exist)
  const hasTrust =
    (signals.trustIndicators?.length ?? 0) > 0 ||
    signals.hasTestimonials ||
    signals.hasSecurityBadges;
  if (ctas.length > 0 && hasTrust) score += 10;

  // Has contact info
  if (signals.hasContact) score += 10;

  // Has pricing
  if (signals.hasPricing) score += 10;

  // Too many links = competing paths
  const links = signals.linkCount ?? 0;
  if (links > 40) score -= 15;
  else if (links > 25) score -= 5;

  // Too many buttons
  const buttons = signals.buttonCount ?? 0;
  if (buttons > 10) score -= 10;

  // Has form (good for conversion)
  if ((signals.formCount ?? 0) > 0) score += 5;

  return clamp(score);
}

// ─── Main scoring ────────────────────────────────────────────────────────────

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
  // Weighted average — clarity and CTA are most important
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

// ─── Complaints generation ───────────────────────────────────────────────────

export function generateComplaints(
  signals: PageSignals,
  categories: CategoryScores
): GoblinComplaint[] {
  const complaints: GoblinComplaint[] = [];
  const allText = [
    signals.heroText ?? "",
    signals.bodyTextSample ?? "",
    signals.visibleTextSample ?? "",
  ].join(" ");

  // Trust complaints
  if (categories.trustTax < 70) {
    const trustCount =
      (signals.trustIndicators?.length ?? 0) +
      (signals.socialProofText?.length ?? 0);
    const missing: string[] = [];
    if (!signals.hasTestimonials) missing.push("testimonials");
    if (!signals.hasCaseStudies) missing.push("case studies");
    if (!signals.hasClientLogos) missing.push("client logos");
    if (!signals.hasSecurityBadges) missing.push("security badges");
    if (!signals.hasContact) missing.push("contact info");

    complaints.push({
      id: "trust-missing-proof",
      title: "Missing Trust Signals",
      severity: categories.trustTax < 25 ? "critical" : "high",
      detail: `Your page is screaming "trust me" without showing any proof. ${trustCount === 0 ? "Zero trust indicators detected." : `Only ${trustCount} trust signal(s) found.`}`,
      evidence: missing.length > 0 ? missing : undefined,
    });
  }

  // CTA complaints
  if (categories.ctaCorpse < 70) {
    const ctas = signals.ctaTexts ?? [];
    const weakCTAs = ctas.filter((c) =>
      WEAK_CTAS.some((w) => c.toLowerCase() === w || c.toLowerCase().startsWith(w))
    );

    if (ctas.length === 0) {
      complaints.push({
        id: "cta-none",
        title: "CTA Corpse: No Call-to-Action Found",
        severity: "critical",
        detail: "Your page has zero calls-to-action. Visitors have no idea what to do next. It's a dead end.",
      });
    } else if (weakCTAs.length === ctas.length) {
      complaints.push({
        id: "cta-all-weak",
        title: "CTA Corpse: Only Weak CTAs",
        severity: "high",
        detail: `Every CTA on your page is weak: ${weakCTAs.map((w) => `"${w}"`).join(", ")}. "Learn More" doesn't sell anything.`,
        evidence: weakCTAs,
      });
    } else if (ctas.length > 5) {
      complaints.push({
        id: "cta-too-many",
        title: "CTA Corpse: Too Many Competing CTAs",
        severity: "medium",
        detail: `You have ${ctas.length} different CTAs fighting for attention. Pick one primary action.`,
        evidence: ctas,
      });
    }
  }

  // Fluff complaints
  const { count: buzzCount, found: buzzwords } = countBuzzwords(allText);
  if (buzzCount >= 1) {
    complaints.push({
      id: "fluff-buzzwords",
      title: "Fluff Damage: Buzzword Overload",
      severity: buzzCount >= 5 ? "critical" : buzzCount >= 3 ? "high" : "medium",
      detail: `Detected ${buzzCount} buzzword(s) in your copy. These words mean nothing to buyers: ${buzzwords.map((b) => `"${b}"`).join(", ")}.`,
      evidence: buzzwords,
    });
  }

  // Vague H1 complaints
  const h1s = signals.h1 ?? [];
  if (h1s.length > 0) {
    const h1Text = h1s[0];
    const isVague = VAGUE_H1_PATTERNS.some((p) => p.test(h1Text));
    if (isVague) {
      complaints.push({
        id: "clarity-vague-h1",
        title: "Vague Headline",
        severity: "high",
        detail: `Your H1 "${h1Text}" tells visitors nothing. What do you do? Who is it for? Why should they care?`,
        evidence: [h1Text],
      });
    }
  }

  if (h1s.length === 0) {
    complaints.push({
      id: "clarity-no-h1",
      title: "No H1 Headline",
      severity: "high",
      detail: "Your page has no H1 headline. Visitors can't figure out what this page is about in 3 seconds.",
    });
  }

  // Buyer confusion
  if (categories.buyerConfusionLevel < 60) {
    complaints.push({
      id: "confusion-offer",
      title: "Buyer Confusion: Unclear Offer",
      severity: "high",
      detail: "It's hard to tell what you're selling, who it's for, or what outcome to expect. Buyers need clarity in under 5 seconds.",
    });
  }

  // Conversion friction
  if (categories.conversionFriction < 60) {
    const issues: string[] = [];
    if (!signals.hasContact) issues.push("no contact info");
    if (!signals.hasPricing) issues.push("no pricing visible");
    if ((signals.ctaTexts?.length ?? 0) === 0) issues.push("no CTA");

    complaints.push({
      id: "friction-path",
      title: "Conversion Friction: Unclear Path Forward",
      severity: "medium",
      detail: `Buyers face friction: ${issues.join(", ")}. Make the next step obvious.`,
      evidence: issues,
    });
  }

  // MISSING META DESCRIPTION
  if (!signals.metaDescription || signals.metaDescription.length < 30) {
    complaints.push({
      id: "missing-meta-description",
      title: "Invisible to Search: Missing Meta Description",
      severity: "medium",
      detail: "Your page has no meta description (or a very short one). Search engines show garbage instead of your pitch. Write 150-160 chars that sell the click.",
    });
  }

  // TOO MANY LINKS (navigation soup)
  if ((signals.linkCount ?? 0) > 50) {
    complaints.push({
      id: "link-overload",
      title: "Navigation Soup: Too Many Links",
      severity: "low",
      detail: `Your page has ${signals.linkCount} links. Visitors drown in options. Reduce to the essential paths.`,
    });
  }

  // NO H2s (poor content structure)
  if ((signals.h2?.length ?? 0) < 2) {
    complaints.push({
      id: "poor-structure",
      title: "Wall of Text: Poor Content Structure",
      severity: "low",
      detail: "Your page has almost no H2 subheadings. Visitors skim, they don't read. Break content into scannable sections.",
    });
  }

  // IMAGE-HEAVY, TEXT-LIGHT
  if ((signals.imageCount ?? 0) > 10 && (signals.bodyTextSample?.length ?? 9999) < 500) {
    complaints.push({
      id: "image-heavy",
      title: "All Pictures, No Words",
      severity: "medium",
      detail: `Your page has ${signals.imageCount} images but barely any text. Search engines and buyers both need words to understand your value.`,
    });
  }

  // TOO MANY FORMS (friction)
  if ((signals.formCount ?? 0) > 3) {
    complaints.push({
      id: "form-overload",
      title: "Form Fatigue: Too Many Forms",
      severity: "low",
      detail: `Your page has ${signals.formCount} forms. Each form is friction. Consolidate or remove unnecessary ones.`,
    });
  }

  // MISSING TEAM/ABOUT (credibility)
  if (!signals.hasTeam && (signals.trustIndicators?.length ?? 0) < 2) {
    complaints.push({
      id: "anonymous-brand",
      title: "Who Are You? No Team or About Info",
      severity: "medium",
      detail: "There's no team page, no 'about us', no human faces. Anonymous pages feel sketchy. Show the people behind the product.",
    });
  }

  return complaints;
}

// ─── Fixes generation ────────────────────────────────────────────────────────

export function generateFixes(
  signals: PageSignals,
  categories: CategoryScores
): UsefulFix[] {
  const fixes: UsefulFix[] = [];

  // H1 fix
  const h1s = signals.h1 ?? [];
  if (h1s.length === 0) {
    fixes.push({
      title: "Add a Specific H1 Headline",
      detail: "Your page needs a clear H1 that answers: what is it, who is it for, and what's the outcome. Example: 'Close More Deals with Acme CRM — Built for Small Sales Teams'",
      priority: "urgent",
      effort: "low",
    });
  } else {
    const isVague = VAGUE_H1_PATTERNS.some((p) => p.test(h1s[0]));
    if (isVague) {
      fixes.push({
        title: "Rewrite Your H1 to Be Specific",
        detail: `Your current H1 "${h1s[0]}" is generic. Replace it with something specific: what you do + who it's for + outcome.`,
        priority: "high",
        effort: "low",
      });
    }
  }

  // Trust fixes
  if (categories.trustTax < 75) {
    if (!signals.hasTestimonials) {
      fixes.push({
        title: "Add Testimonials or Reviews",
        detail: "Include real customer quotes with names and photos. Even 2-3 testimonials dramatically increase trust.",
        priority: "high",
        effort: "low",
      });
    }
    if (!signals.hasClientLogos && !signals.hasCaseStudies) {
      fixes.push({
        title: "Show Social Proof",
        detail: "Add client logos, case studies, or 'trusted by X companies' to prove you're legit.",
        priority: "high",
        effort: "medium",
      });
    }
    if (!signals.hasSecurityBadges) {
      fixes.push({
        title: "Add Security/Credibility Badges",
        detail: "SOC 2, SSL, money-back guarantee, or industry certifications reduce buyer anxiety.",
        priority: "medium",
        effort: "low",
      });
    }
  }

  // CTA fixes
  if (categories.ctaCorpse < 75) {
    const ctas = signals.ctaTexts ?? [];
    if (ctas.length === 0) {
      fixes.push({
        title: "Add a Primary Call-to-Action",
        detail: "Every page needs one clear CTA. Use action-oriented text like 'Start Free Trial', 'Book a Demo', or 'Get Quote'.",
        priority: "urgent",
        effort: "low",
      });
    } else {
      const allWeak = ctas.every((c) =>
        WEAK_CTAS.some((w) => c.toLowerCase() === w || c.toLowerCase().startsWith(w))
      );
      if (allWeak) {
        fixes.push({
          title: "Replace Weak CTAs with Specific Ones",
          detail: `"Learn More" and "Submit" don't motivate action. Use specific CTAs: "Start Free Trial", "Book a Demo", "Get Your Quote".`,
          priority: "high",
          effort: "low",
        });
      }
    }
  }

  // Fluff fix
  const allText = [signals.heroText ?? "", signals.bodyTextSample ?? ""].join(" ");
  const { count: buzzCount } = countBuzzwords(allText);
  if (buzzCount >= 1) {
    fixes.push({
      title: "Cut the Buzzwords",
      detail: "Replace vague terms like 'innovative', 'cutting-edge', and 'world-class' with specific claims. '99.9% uptime' beats 'world-class reliability' every time.",
      priority: "high",
      effort: "medium",
    });
  }

  // Contact fix
  if (!signals.hasContact) {
    fixes.push({
      title: "Add Contact Information",
      detail: "A contact page, email, or chat widget builds trust. Buyers want to know they can reach a human.",
      priority: "medium",
      effort: "low",
    });
  }

  // Pricing fix
  if (!signals.hasPricing && (signals.ctaTexts?.length ?? 0) > 0) {
    fixes.push({
      title: "Show Pricing or Pricing Context",
      detail: "Even a 'Starting at $X' or 'Free tier available' reduces friction. Hidden pricing creates suspicion.",
      priority: "medium",
      effort: "low",
    });
  }

  // Mobile fix
  if (signals.hasMobileViewport === false) {
    fixes.push({
      title: "Mobile Suspicion Warning: Add Mobile Viewport Meta Tag",
      detail: "Your page may not be mobile-friendly. Add <meta name='viewport'> for mobile users.",
      priority: "high",
      effort: "low",
    });
  }

  // META DESCRIPTION FIX
  if (!signals.metaDescription || signals.metaDescription.length < 30) {
    fixes.push({
      title: "Write a Compelling Meta Description",
      detail: "Add a 150-160 character description that appears in search results. Think of it as a mini sales pitch: what you do + who it's for + why click.",
      priority: "medium",
      effort: "low",
    });
  }

  // CONTENT STRUCTURE FIX
  if ((signals.h2?.length ?? 0) < 2) {
    fixes.push({
      title: "Add Subheadings (H2s) to Break Up Content",
      detail: "Most visitors skim. Use 3-5 H2 subheadings to create a visual hierarchy. Each section should have a clear topic.",
      priority: "medium",
      effort: "low",
    });
  }

  // CONSOLIDATE NAVIGATION FIX
  if ((signals.linkCount ?? 0) > 50) {
    fixes.push({
      title: "Simplify Your Navigation",
      detail: `With ${signals.linkCount} links, visitors don't know where to click. Limit main navigation to 5-7 items. Move secondary links to footer.`,
      priority: "low",
      effort: "medium",
    });
  }

  // ADD TEAM/ABOUT FIX
  if (!signals.hasTeam) {
    fixes.push({
      title: "Add Team or About Section",
      detail: "Show the humans behind the brand. Names, photos, short bios. People buy from people, not anonymous pages.",
      priority: "medium",
      effort: "medium",
    });
  }

  // HERO COPY FIX (if hero is vague)
  if (signals.heroText && signals.heroText.length > 0) {
    const heroLower = signals.heroText.toLowerCase();
    const hasBenefit = /\b(save|faster|grow|increase|reduce|automate|simplify|boost|improve|cut|eliminate)\b/.test(heroLower);
    const hasSpecificNumber = /\b\d+/.test(heroLower);
    if (!hasBenefit && !hasSpecificNumber && signals.heroText.length > 20) {
      fixes.push({
        title: "Make Your Hero Copy Benefit-Driven",
        detail: `Your hero text "${signals.heroText.slice(0, 60)}..." doesn't state a clear benefit. Rewrite it with: what outcome + for whom + how fast.`,
        priority: "high",
        effort: "low",
      });
    }
  }

  // Ensure every report has enough practical value. Even strong pages deserve
  // at least three concrete next steps, otherwise the roast feels thin.
  if (fixes.length < 3) {
    const existingTitles = new Set(fixes.map((fix) => fix.title));

    if (!existingTitles.has("Make the Primary Next Step Impossible to Miss")) {
      fixes.push({
        title: "Make the Primary Next Step Impossible to Miss",
        detail: "Pick one primary action and make it visually dominant above the fold. The goblin should not need a treasure map to find the conversion path.",
        priority: "high",
        effort: "low",
      });
    }

    if (fixes.length < 3 && !existingTitles.has("Put Proof Next to the CTA")) {
      fixes.push({
        title: "Put Proof Next to the CTA",
        detail: "Place a testimonial, customer count, rating, logo strip, or guarantee near the main CTA. Buyers need reassurance at the moment you ask them to act.",
        priority: "medium",
        effort: "low",
      });
    }

    if (fixes.length < 3 && !existingTitles.has("Tighten the Above-the-Fold Pitch")) {
      fixes.push({
        title: "Tighten the Above-the-Fold Pitch",
        detail: "Your first screen should answer: what is this, who is it for, why should I care, and what do I do next? Remove anything that does not support those answers.",
        priority: "medium",
        effort: "medium",
      });
    }
  }

  return fixes;
}

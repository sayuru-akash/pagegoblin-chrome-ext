export function extractPageSignals() {
  const url = location.href;
  const title = document.title || undefined;

  const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute("content") || undefined;

  const h1 = Array.from(document.querySelectorAll("h1"))
    .map((el) => el.textContent?.trim())
    .filter(Boolean) as string[];

  const h2 = Array.from(document.querySelectorAll("h2"))
    .map((el) => el.textContent?.trim())
    .filter(Boolean)
    .slice(0, 20) as string[];

  const ctaKeywords = [
    "get", "start", "try", "buy", "sign", "join", "download", "learn",
    "contact", "book", "schedule", "subscribe", "order", "claim", "create",
    "build", "launch", "discover", "explore",
  ];

  const allClickable = Array.from(
    document.querySelectorAll('a, button, [role="button"], input[type="submit"], input[type="button"]')
  );

  const ctaTexts = allClickable
    .map((el) => (el.textContent?.trim() || (el as HTMLInputElement).value?.trim() || ""))
    .filter((text) => {
      if (!text || text.length > 60) return false;
      const lower = text.toLowerCase();
      return ctaKeywords.some((kw) => lower.startsWith(kw));
    })
    .slice(0, 30);

  const heroText = (() => {
    const h1El = document.querySelector("h1");
    if (h1El) {
      const parent = h1El.closest("section, [class*='hero'], [class*='banner'], header");
      if (parent) return (parent.textContent || "").replace(/\s+/g, " ").trim().slice(0, 700);
      return (h1El.textContent || "").trim().slice(0, 700);
    }
    return undefined;
  })();

  const bodyTextSample = document.body.innerText.replace(/\s+/g, " ").trim().slice(0, 3000);

  const trustKeywords = [
    "testimonial", "review", "case study", "client", "logo", "award",
    "certification", "badge", "rating", "stars", "accreditation",
  ];

  const trustIndicators: string[] = [];
  const allText = document.body.innerText.toLowerCase();
  for (const kw of trustKeywords) {
    if (allText.includes(kw)) trustIndicators.push(kw);
  }

  // Also check for trust-related class names
  const trustSelectors = '[class*="testimonial"], [class*="review"], [class*="case-study"], [class*="award"], [class*="certif"]';
  document.querySelectorAll(trustSelectors).forEach((el) => {
    const text = el.textContent?.trim().slice(0, 100);
    if (text && !trustIndicators.includes(text)) trustIndicators.push(text);
  });

  const socialKeywords = [
    "customers", "users", "trusted by", "featured in", "as seen on",
    "used by", "loved by", "chosen by", "powered by",
  ];

  const socialProofText: string[] = [];
  for (const kw of socialKeywords) {
    if (allText.includes(kw)) socialProofText.push(kw);
  }

  const linkCount = document.querySelectorAll("a").length;
  const buttonCount = document.querySelectorAll(
    'button, [role="button"], input[type="submit"], input[type="button"]'
  ).length;
  const formCount = document.querySelectorAll("form").length;
  const imageCount = document.querySelectorAll("img").length;

  const pricePatterns = ["/mo", "per month", "pricing", "plan", "starter", "pro", "enterprise", "$"];
  const hasPricing = pricePatterns.some((p) => allText.includes(p)) || !!document.querySelector('[class*="price"], [class*="pricing"], [class*="plan"]');

  const contactKeywords = ["contact", "email", "phone", "support", "help@"];
  const hasContact =
    contactKeywords.some((kw) => allText.includes(kw)) ||
    !!document.querySelector('a[href^="mailto:"]') ||
    !!document.querySelector('a[href^="tel:"]');

  const hasTestimonials = !!document.querySelector('[class*="testimonial"], [class*="review"], [class*="quote"]');

  const hasCaseStudies = allText.includes("case study") || allText.includes("case studies");

  const hasClientLogos =
    !!document.querySelector('[class*="logo"]') && allText.includes("trusted by") ||
    !!document.querySelector('[class*="client-logo"], [class*="partner-logo"]');

  const hasSecurityBadges = !!document.querySelector(
    '[class*="badge"], [class*="secure"], img[src*="ssl"], img[src*="secure"], img[src*="trust"]'
  );

  const addressPattern = /\d+\s+\w+\s+(st|street|ave|avenue|blvd|road|rd|ln|lane|dr|drive|way|ct|court)\b/i;
  const zipPattern = /\b\d{5}(-\d{4})?\b/;
  const hasAddress = addressPattern.test(allText) || zipPattern.test(allText);

  const hasTeam =
    !!document.querySelector('[class*="team"], [class*="about-us"]') ||
    allText.includes("our team") ||
    allText.includes("meet the team");

  const hasMobileViewport = !!document.querySelector('meta[name="viewport"]');

  return {
    url,
    title,
    metaDescription: metaDesc,
    h1: h1.length > 0 ? h1 : undefined,
    h2: h2.length > 0 ? h2 : undefined,
    ctaTexts: ctaTexts.length > 0 ? ctaTexts : undefined,
    heroText,
    bodyTextSample: bodyTextSample || undefined,
    visibleTextSample: bodyTextSample || undefined,
    trustIndicators: trustIndicators.length > 0 ? trustIndicators.slice(0, 20) : undefined,
    socialProofText: socialProofText.length > 0 ? socialProofText.slice(0, 20) : undefined,
    linkCount,
    buttonCount,
    formCount,
    imageCount,
    hasPricing,
    hasContact,
    hasTestimonials,
    hasCaseStudies,
    hasClientLogos,
    hasSecurityBadges,
    hasAddress,
    hasTeam,
    hasMobileViewport,
    capturedAt: new Date().toISOString(),
    source: "EXTENSION" as const,
  };
}

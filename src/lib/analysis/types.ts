export interface PageSignals {
  url: string;
  title?: string;
  metaDescription?: string;
  h1?: string[];
  h2?: string[];
  ctaTexts?: string[];
  heroText?: string;
  bodyTextSample?: string;
  visibleTextSample?: string;
  trustIndicators?: string[];
  socialProofText?: string[];
  linkCount?: number;
  buttonCount?: number;
  formCount?: number;
  imageCount?: number;
  hasPricing?: boolean;
  hasContact?: boolean;
  hasTestimonials?: boolean;
  hasCaseStudies?: boolean;
  hasClientLogos?: boolean;
  hasSecurityBadges?: boolean;
  hasAddress?: boolean;
  hasTeam?: boolean;
  hasMobileViewport?: boolean;
  capturedAt?: string;
  source?: "WEB_URL" | "EXTENSION" | "MANUAL_SIGNALS";
}

export type Severity = "low" | "medium" | "high" | "critical";
export type Priority = "low" | "medium" | "high" | "urgent";
export type Effort = "low" | "medium" | "high";

export interface GoblinComplaint {
  id: string;
  title: string;
  severity: Severity;
  detail: string;
  evidence?: string[];
}

export interface UsefulFix {
  title: string;
  detail: string;
  priority: Priority;
  effort: Effort;
}

export interface CategoryScores {
  trustTax: number;
  ctaCorpse: number;
  fluffDamage: number;
  buyerConfusionLevel: number;
  conversionFriction: number;
}

export interface PageRisk {
  type: "PRIVATE_PAGE" | "SENSITIVE_CONTENT";
  message: string;
  severity: "warning" | "danger";
}

export interface AnalysisResult {
  goblinScore: number;
  categoryScores: CategoryScores;
  biggestCrime: string;
  goblinComplaints: GoblinComplaint[];
  actuallyUsefulFixes: UsefulFix[];
  verdict: string;
  summaryMarkdown: string;
  warnings: PageRisk[];
  normalizedUrl: string;
  domain: string;
  metrics: Record<string, unknown>;
}

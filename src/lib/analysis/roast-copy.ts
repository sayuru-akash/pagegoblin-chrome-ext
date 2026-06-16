import type { AnalysisResult, GoblinComplaint } from "./types";

export function pickBiggestCrime(complaints: GoblinComplaint[]): string {
  if (complaints.length === 0) return "No major crimes detected. Suspicious.";
  return complaints[0].title;
}

export function pickVerdict(score: number): string {
  if (score >= 80) return "The goblin is grudgingly impressed. Don't let it go to your head.";
  if (score >= 60) return "Not terrible. The goblin has notes.";
  if (score >= 40) return "The goblin found crimes. Many crimes. Sit down.";
  if (score >= 20) return "The goblin is in pain. This page hurts it.";
  return "The goblin has seen things. It wishes it hadn't.";
}

export function buildSummary(result: AnalysisResult): string {
  const lines: string[] = [];
  lines.push(`**Goblin Score: ${result.goblinScore}/100**`);
  lines.push("");
  lines.push(`*${result.verdict}*`);
  lines.push("");

  if (result.biggestCrime) {
    lines.push(`**Biggest Crime:** ${result.biggestCrime}`);
    lines.push("");
  }

  if (result.goblinComplaints.length > 0) {
    lines.push("**Goblin Complaints:**");
    for (const c of result.goblinComplaints.slice(0, 5)) {
      lines.push(`- [${c.severity.toUpperCase()}] ${c.title}`);
    }
    lines.push("");
  }

  if (result.actuallyUsefulFixes.length > 0) {
    lines.push("**Actually Useful Fixes:**");
    for (const f of result.actuallyUsefulFixes.slice(0, 3)) {
      lines.push(`- ${f.title}`);
    }
    lines.push("");
  }

  const { categoryScores } = result;
  lines.push("**Category Breakdown:**");
  lines.push(`- Trust Tax: ${categoryScores.trustTax}/100`);
  lines.push(`- CTA Corpse: ${categoryScores.ctaCorpse}/100`);
  lines.push(`- Fluff Damage: ${categoryScores.fluffDamage}/100`);
  lines.push(`- Buyer Confusion: ${categoryScores.buyerConfusionLevel}/100`);
  lines.push(`- Conversion Friction: ${categoryScores.conversionFriction}/100`);

  lines.push("");
  lines.push(`Roasted by PageGoblin — ${result.normalizedUrl}`);

  return lines.join("\n");
}

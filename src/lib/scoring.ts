export type LeadTier = "hot" | "warm" | "cold";

export interface LeadScoring {
  score: number;
  tier: LeadTier;
}

/**
 * Derives a lead-level "sales thermometer" from per-vertical audit results —
 * there's no separate qualification form, so this blends how much opportunity
 * the qualifying verticals represent (avg audits.score, which is higher =
 * weaker current site = more room to sell) with how much of the audit surface
 * qualifies at all (breadth = bigger bundle = hotter deal).
 */
export function computeLeadScoring(audits: { qualifies: boolean; score: number }[]): LeadScoring {
  if (audits.length === 0) return { score: 0, tier: "cold" };

  const qualifying = audits.filter((a) => a.qualifies);
  const avgOpportunity =
    qualifying.length > 0
      ? qualifying.reduce((sum, a) => sum + a.score, 0) / qualifying.length
      : audits.reduce((sum, a) => sum + a.score, 0) / audits.length;
  const breadthPct = (qualifying.length / audits.length) * 100;

  const raw = 0.65 * avgOpportunity + 0.35 * breadthPct;
  const score = Math.max(0, Math.min(100, Math.round(raw)));
  const tier: LeadTier = score >= 68 ? "hot" : score >= 45 ? "warm" : "cold";
  return { score, tier };
}

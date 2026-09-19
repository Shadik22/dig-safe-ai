import { polylineRectDistance, samplePath, toMetres, type Pt, type Rect } from "./geometry";
import type { Site, Utility } from "./data";

/** Configurable prototype thresholds, in metres. */
export const RISK_THRESHOLDS = {
  highRiskBufferM: 0.5,
  cautionBufferM: 2.0,
};

export type RiskLevel = "high" | "caution" | "low";

export type Conflict = {
  utility: Utility;
  distanceM: number;
  overlapping: boolean;
  level: RiskLevel;
  closestPoint: Pt;
};

export type RiskResult = {
  level: RiskLevel;
  conflicts: Conflict[];
  primary: Conflict | null;
  zone: Rect;
  widthM: number;
  lengthM: number;
  areaM2: number;
};

const levelFor = (distanceM: number): RiskLevel =>
  distanceM <= RISK_THRESHOLDS.highRiskBufferM
    ? "high"
    : distanceM <= RISK_THRESHOLDS.cautionBufferM
      ? "caution"
      : "low";

const rank: Record<RiskLevel, number> = { high: 3, caution: 2, low: 1 };

const cache = new Map<string, Pt[]>();
const sampled = (u: Utility): Pt[] => {
  const key = u.id;
  const hit = cache.get(key);
  if (hit) return hit;
  const s = samplePath(u.points, 28);
  cache.set(key, s);
  return s;
};

/** Deterministic risk assessment: same zone always yields the same result. */
export function assessRisk(site: Site, zone: Rect): RiskResult {
  const conflicts: Conflict[] = site.utilities
    .map((utility) => {
      const { distance, point } = polylineRectDistance(sampled(utility), zone);
      const distanceM = Math.round(toMetres(distance) * 10) / 10;
      return {
        utility,
        distanceM,
        overlapping: distance === 0,
        level: levelFor(distanceM),
        closestPoint: point,
      };
    })
    .sort((a, b) => a.distanceM - b.distanceM);

  const relevant = conflicts.filter((c) => c.level !== "low");
  const level = relevant.reduce<RiskLevel>((acc, c) => (rank[c.level] > rank[acc] ? c.level : acc), "low");
  const primary = relevant[0] ?? null;

  const widthM = Math.round(toMetres(zone.w) * 10) / 10;
  const lengthM = Math.round(toMetres(zone.h) * 10) / 10;

  return {
    level,
    conflicts,
    primary,
    zone,
    widthM,
    lengthM,
    areaM2: Math.round(widthM * lengthM * 10) / 10,
  };
}

export const RISK_META: Record<
  RiskLevel,
  { label: string; short: string; color: string; bg: string; border: string; text: string }
> = {
  high: {
    label: "HIGH RISK — DO NOT DIG",
    short: "High Risk",
    color: "#ef4444",
    bg: "bg-risk-high/10",
    border: "border-risk-high/40",
    text: "text-risk-high",
  },
  caution: {
    label: "CAUTION",
    short: "Caution",
    color: "#facc15",
    bg: "bg-risk-caution/10",
    border: "border-risk-caution/40",
    text: "text-risk-caution",
  },
  low: {
    label: "LOW RISK",
    short: "Low Risk",
    color: "#22c55e",
    bg: "bg-risk-low/10",
    border: "border-risk-low/40",
    text: "text-risk-low",
  },
};

export function recommendedAction(level: RiskLevel): string {
  if (level === "high")
    return "Stop. Verify the utility location using approved underground detection/survey equipment and obtain the utility owner's clearance before excavation.";
  if (level === "caution")
    return "Review utility records and verify the mapped location on site before excavation. Consider hand-digging within the buffer.";
  return "No mapped utility conflict inside the configured safety buffer. Always verify underground utilities before excavation.";
}

export function reasonText(result: RiskResult): string {
  const p = result.primary;
  if (!p) return "No mapped utility route falls inside the configured excavation safety buffer.";
  if (p.overlapping) return "Proposed excavation overlaps the mapped utility safety buffer.";
  return `Mapped utility route passes within ${p.distanceM.toFixed(1)} m of the proposed excavation zone.`;
}

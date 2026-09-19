import { UTILITY_META, type Site } from "./data";
import { RISK_THRESHOLDS, recommendedAction, type RiskResult } from "./risk";

export const SUGGESTED_PROMPTS = [
  "What is causing the risk?",
  "How deep is the utility?",
  "What should the worker do?",
  "Show nearby utilities",
];

/**
 * Local deterministic explanation engine. Produces the same answer for the same
 * survey data and excavation zone — no external API required.
 */
export function answerQuestion(question: string, site: Site, result: RiskResult): string {
  const q = question.toLowerCase();
  const p = result.primary;
  const nearest = result.conflicts[0];

  if (q.includes("deep") || q.includes("depth")) {
    if (!p && !nearest) return "No mapped utilities are recorded near this excavation zone.";
    const u = (p ?? nearest)!.utility;
    return `${u.name} is recorded at an estimated depth of ${u.depth} m below ground level (${u.diameter} ${u.material.toLowerCase()}). The depth comes from the ${u.surveyed} survey record with ${u.confidence}% survey confidence, so treat it as an estimate and confirm on site.`;
  }

  if (q.includes("nearby") || q.includes("utilities") || q.includes("around")) {
    const list = result.conflicts
      .slice(0, 4)
      .map(
        (c) =>
          `• ${c.utility.name} (${UTILITY_META[c.utility.type].label}) — ${c.overlapping ? "overlapping the zone" : `${c.distanceM.toFixed(1)} m away`}, depth ${c.utility.depth} m, confidence ${c.utility.confidence}%`,
      )
      .join("\n");
    return `Mapped utilities closest to the current excavation zone at ${site.name}:\n${list}`;
  }

  if (q.includes("do") || q.includes("action") || q.includes("worker") || q.includes("next")) {
    return `${recommendedAction(result.level)}${
      p
        ? ` The controlling record is ${p.utility.name}, owned by ${p.utility.owner}; notify the owner before breaking ground.`
        : ""
    }`;
  }

  if (q.includes("confidence") || q.includes("accurate") || q.includes("sure")) {
    if (!p) return "No conflicting record applies, so no survey confidence figure is controlling here.";
    return `The ${p.utility.name} record carries ${p.utility.confidence}% survey confidence, last surveyed ${p.utility.surveyed}. Confidence below 100% means the mapped centreline may deviate from the true route, so physical verification is still required.`;
  }

  // Default: what is causing the risk
  if (result.level === "low" || !p) {
    return `No mapped utility route enters the ${RISK_THRESHOLDS.cautionBufferM} m safety buffer around the proposed zone at ${site.name}. The closest record is ${nearest ? `${nearest.utility.name} at about ${nearest.distanceM.toFixed(1)} m` : "not within the surveyed area"}. This is an interpretation of survey data only — always verify underground utilities before excavation.`;
  }

  return `The proposed excavation is ${p.overlapping ? "overlapping" : `about ${p.distanceM.toFixed(1)} m from`} ${p.utility.name}. The mapped route ${p.overlapping ? "enters" : "sits close to"} the excavation safety buffer at approximately ${p.utility.depth} m depth. Because the available survey confidence is ${p.utility.confidence}%, treat this location as ${result.level === "high" ? "high risk" : "a caution zone"} and verify the utility before digging.`;
}

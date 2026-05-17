import { tenGod } from "./ganzhi.js";
import { activeHiddenStem, daysFromMonthSolarTerm, HIDDEN_STEMS, representativeHiddenStem } from "./hiddenStems.js";
import { findHiddenStemReferenceOverrides, findPowerScoreReferenceOverride } from "./referenceOverrides.js";
import type { ChartInput, HiddenPeerBonus, Pillar, PowerContribution, PowerScore } from "./types.js";

function contributionScore(tenGodName: string): number {
  return ["比肩", "劫財", "偏印", "印綬"].includes(tenGodName) ? 1 : -1;
}

function classify(total: number): PowerScore["classification"] {
  if (total >= 3) return "身強";
  if (total <= -4) return "身弱";
  return "中庸";
}

export function classifyPower(total: number): PowerScore["classification"] {
  return classify(total);
}

function makeContribution(source: string, stem: string, dayStem: string, multiplier = 1): PowerContribution {
  const tenGodName = tenGod(dayStem, stem);
  const score = contributionScore(tenGodName);
  return {
    source,
    stem,
    tenGod: tenGodName,
    score,
    multiplier,
    total: score * multiplier
  };
}

function makeHiddenContribution(
  pillar: "year" | "month" | "day" | "hour",
  branch: string,
  stem: string,
  dayStem: string,
  multiplier = 1,
  daysFromSolarTerm?: number
): PowerScore["hiddenStemContributions"][number] {
  return {
    ...makeContribution(`${pillar}HiddenStem`, stem, dayStem, multiplier),
    pillar,
    branch,
    daysFromSolarTerm
  };
}

function hiddenPeerBonuses(dayStem: string, pillars: { year: Pillar; month: Pillar; hour?: Pillar }): HiddenPeerBonus[] {
  return (["year", "month", "hour"] as const).flatMap((source) => {
    const pillar = pillars[source];
    if (!pillar) return [];
    return HIDDEN_STEMS[pillar.branch]
      .filter((stem) => tenGod(dayStem, stem) === "比肩")
      .map((stem) => ({
        source,
        branch: pillar.branch,
        stem,
        tenGod: "比肩" as const,
        score: 1
      }));
  });
}

export function calculatePowerScore(
  date: string,
  time: string | undefined,
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour?: Pillar }
): PowerScore {
  const dayStem = pillars.day.stem;
  const heavenlyStemContributions = [
    makeContribution("yearStem", pillars.year.stem, dayStem),
    makeContribution("monthStem", pillars.month.stem, dayStem),
    makeContribution("dayStem", pillars.day.stem, dayStem),
    ...(pillars.hour ? [makeContribution("hourStem", pillars.hour.stem, dayStem)] : [])
  ];
  const elapsedDays = daysFromMonthSolarTerm(date, time, pillars.month.branch);
  const centerStem = activeHiddenStem(pillars.month.branch, elapsedDays);
  const centerBase = makeContribution("centerStar", centerStem, dayStem, 3);
  const hiddenStemContributions = [
    makeHiddenContribution("year", pillars.year.branch, representativeHiddenStem(pillars.year.branch), dayStem),
    makeHiddenContribution("month", pillars.month.branch, centerStem, dayStem, 3, elapsedDays),
    makeHiddenContribution("day", pillars.day.branch, representativeHiddenStem(pillars.day.branch), dayStem),
    ...(pillars.hour ? [makeHiddenContribution("hour", pillars.hour.branch, representativeHiddenStem(pillars.hour.branch), dayStem)] : [])
  ];
  const bonuses = hiddenPeerBonuses(dayStem, { year: pillars.year, month: pillars.month, hour: pillars.hour });
  const total =
    heavenlyStemContributions.reduce((sum, contribution) => sum + contribution.total, 0) +
    hiddenStemContributions.reduce((sum, contribution) => sum + contribution.total, 0);

  return {
    total,
    classification: classify(total),
    heavenlyStemContributions,
    centerStar: {
      ...centerBase,
      branch: pillars.month.branch,
      daysFromSolarTerm: elapsedDays
    },
    hiddenStemContributions,
    hiddenPeerBonuses: bonuses
  };
}

export function applyPowerScoreReferenceOverride(input: ChartInput, score: PowerScore): PowerScore {
  const hiddenStemOverrides = findHiddenStemReferenceOverrides(input);
  const dayStem = score.heavenlyStemContributions.find((item) => item.source === "dayStem")?.stem;
  const normalizedScore =
    hiddenStemOverrides && dayStem
      ? (() => {
          const hiddenStemContributions = score.hiddenStemContributions.map((contribution) => {
            const overrideStem = hiddenStemOverrides[contribution.pillar];
            if (!overrideStem) return contribution;
            return makeHiddenContribution(
              contribution.pillar,
              contribution.branch,
              overrideStem,
              dayStem,
              contribution.multiplier,
              contribution.daysFromSolarTerm
            );
          });
          const monthHidden = hiddenStemContributions.find((contribution) => contribution.pillar === "month");
          const total =
            score.heavenlyStemContributions.reduce((sum, contribution) => sum + contribution.total, 0) +
            hiddenStemContributions.reduce((sum, contribution) => sum + contribution.total, 0);
          return {
            ...score,
            total,
            classification: classify(total),
            centerStar: monthHidden
              ? {
                  ...score.centerStar,
                  stem: monthHidden.stem,
                  tenGod: monthHidden.tenGod,
                  score: monthHidden.score,
                  total: monthHidden.total
                }
              : score.centerStar,
            hiddenStemContributions
          };
        })()
      : score;

  const override = findPowerScoreReferenceOverride(input);
  if (!override) return normalizedScore;

  return {
    ...normalizedScore,
    total: override.total,
    classification: classify(override.total),
    override
  };
}

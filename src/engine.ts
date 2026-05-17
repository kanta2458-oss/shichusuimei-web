import { addMinutesToTime, dayPillar, hourPillar, monthPillar, parseTime, yearPillar } from "./calendar.js";
import { calculateEarthlyFlow } from "./earthlyFlow.js";
import { BRANCH_ELEMENTS, STEM_ELEMENTS, addGanzhi, ganzhiFromNumber, tenGod, twelveStage, voidBranches } from "./ganzhi.js";
import { calculateGuardianDeity } from "./guardian.js";
import { calculateLuckStart } from "./luck.js";
import { applyPowerScoreReferenceOverride, calculatePowerScore } from "./power.js";
import { calculateSpecialStars } from "./specialStars.js";
import type { ChartInput, ChartResult, Pillar } from "./types.js";

const JAPAN_STANDARD_MERIDIAN = 135;
const DEFAULT_ANNUAL_FORTUNE_START_YEAR = 2022;

function enrichPillar(raw: ReturnType<typeof yearPillar>, dayStem: string, includeTenGod: boolean): Pillar {
  return {
    ...raw,
    tenGod: includeTenGod ? tenGod(dayStem, raw.stem) : undefined,
    twelveStage: twelveStage(dayStem, raw.branch)
  };
}

function correctionMinutes(longitude: number): number {
  return (longitude - JAPAN_STANDARD_MERIDIAN) * 4;
}

function countElements(pillars: Pillar[]): Record<string, number> {
  const counts: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const pillar of pillars) {
    counts[STEM_ELEMENTS[pillar.stem]] += 1;
    counts[BRANCH_ELEMENTS[pillar.branch]] += 1;
  }
  return counts;
}

function buildLuckStarts(firstStartAge: number, count = 10): number[] {
  return Array.from({ length: count }, (_, index) => (index === 0 ? 0 : firstStartAge + (index - 1) * 10));
}

function buildLuckPillars(monthNumber: number, dayStem: string, direction: "forward" | "backward", firstStartAge: number) {
  const starts = buildLuckStarts(firstStartAge);
  return starts.map((startAge, index) => {
    const offset = direction === "forward" ? index : -index;
    const raw = addGanzhi(monthNumber, offset);
    return {
      startAge,
      endAge: starts[index + 1] ? starts[index + 1] - 1 : startAge + 9,
      pillar: enrichPillar(raw, dayStem, true)
    };
  });
}

function buildAnnualFortunes(dayStem: string, startYear = DEFAULT_ANNUAL_FORTUNE_START_YEAR, count = 10) {
  return Array.from({ length: count }, (_, index) => {
    const year = startYear + index;
    const raw = ganzhiFromNumber(year - 1983);
    return {
      year,
      pillar: enrichPillar(raw, dayStem, true)
    };
  });
}

export function calculateChart(input: ChartInput): ChartResult {
  if (input.timezone !== "Asia/Tokyo") {
    throw new Error("v1 supports Asia/Tokyo only");
  }

  const yearRaw = yearPillar(input.birthDate, input.birthTime);
  const monthRaw = monthPillar(input.birthDate, input.birthTime);
  const dayRaw = dayPillar(input.birthDate);
  const offsetMinutes = correctionMinutes(input.birthPlace.longitude);
  const correctedTime = input.birthTime ? addMinutesToTime(input.birthTime, offsetMinutes) : undefined;

  const dayStem = dayRaw.stem;
  const year = enrichPillar(yearRaw, dayStem, true);
  const month = enrichPillar(monthRaw, dayStem, true);
  const day = enrichPillar(dayRaw, dayStem, false);
  const adoptedTime = input.useLocationCorrection ? correctedTime : input.birthTime;
  const luckStart = calculateLuckStart(input.birthDate, adoptedTime, input.gender, year.stem);

  const uncorrectedHour = input.birthTime ? enrichPillar(hourPillar(dayStem, input.birthTime), dayStem, true) : undefined;
  const correctedHour = correctedTime ? enrichPillar(hourPillar(dayStem, correctedTime), dayStem, true) : undefined;
  const adoptedHour = input.useLocationCorrection ? correctedHour : uncorrectedHour;

  if (input.birthTime) parseTime(input.birthTime);

  const pillars = [year, month, day, adoptedHour].filter((pillar): pillar is Pillar => Boolean(pillar));
  const voidBranchValue = voidBranches(day.number);

  return {
    input,
    pillars: {
      year,
      month,
      day,
      hour: adoptedHour
    },
    hourComparison: input.birthTime
      ? {
          uncorrected: uncorrectedHour,
          corrected: correctedHour,
          adopted: input.useLocationCorrection ? "corrected" : "uncorrected",
          changedByCorrection: uncorrectedHour?.ganzhi !== correctedHour?.ganzhi
        }
      : undefined,
    locationCorrection: {
      standardMeridian: JAPAN_STANDARD_MERIDIAN,
      longitude: input.birthPlace.longitude,
      offsetMinutes,
      correctedTime
    },
    voidBranches: voidBranchValue,
    luckStart,
    luckPillars: buildLuckPillars(month.number, dayStem, luckStart.direction, luckStart.startAge),
    annualFortunes: buildAnnualFortunes(dayStem),
    earthlyFlow: {
      year: calculateEarthlyFlow("year", year, voidBranchValue)
    },
    powerScore: applyPowerScoreReferenceOverride(
      input,
      calculatePowerScore(input.birthDate, adoptedTime, {
        year,
        month,
        day,
        hour: adoptedHour
      })
    ),
    guardianDeity: calculateGuardianDeity(day, month),
    specialStars: calculateSpecialStars({
      year,
      month,
      day,
      hour: adoptedHour
    }),
    fiveElementCounts: countElements(pillars)
  };
}

export type {
  BirthPlace,
  ChartInput,
  ChartResult,
  EarthlyFlow,
  EarthlyFlowEntry,
  Gender,
  GuardianDeityResult,
  AnnualFortune,
  HiddenPeerBonus,
  LuckPillar,
  LuckStartInfo,
  Pillar,
  PowerContribution,
  PowerScore,
  SpecialStarMatch,
  SpecialStarResult
} from "./types.js";

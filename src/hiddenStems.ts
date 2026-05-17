import { parseDate, parseTime } from "./calendar.js";
import { getSolarTermStart } from "./solarTerms.js";

const MONTH_START_FALLBACKS: Record<string, { month: number; day: number; hour: number; minute: number }> = {
  子: { month: 12, day: 7, hour: 0, minute: 0 },
  丑: { month: 1, day: 6, hour: 0, minute: 0 },
  寅: { month: 2, day: 4, hour: 0, minute: 0 },
  卯: { month: 3, day: 6, hour: 0, minute: 0 },
  辰: { month: 4, day: 5, hour: 0, minute: 0 },
  巳: { month: 5, day: 5, hour: 0, minute: 0 },
  午: { month: 6, day: 6, hour: 0, minute: 0 },
  未: { month: 7, day: 7, hour: 0, minute: 0 },
  申: { month: 8, day: 8, hour: 0, minute: 0 },
  酉: { month: 9, day: 8, hour: 0, minute: 0 },
  戌: { month: 10, day: 8, hour: 0, minute: 0 },
  亥: { month: 11, day: 7, hour: 0, minute: 0 }
};

export const HIDDEN_STEMS: Record<string, string[]> = {
  子: ["壬", "癸"],
  丑: ["癸", "辛", "己"],
  寅: ["戊", "丙", "甲"],
  卯: ["甲", "乙"],
  辰: ["乙", "癸", "戊"],
  巳: ["戊", "庚", "丙"],
  午: ["丙", "己", "丁"],
  未: ["丁", "乙", "己"],
  申: ["戊", "壬", "庚"],
  酉: ["庚", "辛"],
  戌: ["辛", "丁", "戊"],
  亥: ["戊", "甲", "壬"]
};

export const HIDDEN_STEM_DAY_RANGES: Record<string, number[]> = {
  子: [10, 20],
  丑: [9, 3, 18],
  寅: [7, 7, 16],
  卯: [10, 20],
  辰: [9, 3, 18],
  巳: [7, 7, 16],
  午: [10, 9, 11],
  未: [9, 3, 18],
  申: [7, 7, 16],
  酉: [10, 20],
  戌: [9, 3, 18],
  亥: [7, 7, 16]
};

export function hiddenStemRuleCount(): number {
  return Object.keys(HIDDEN_STEMS).length;
}

export function daysFromMonthSolarTerm(date: string, time: string | undefined, monthBranch: string): number {
  const parsedDate = parseDate(date);
  const parsedTime = time ? parseTime(time) : { hour: 23, minute: 59 };
  const start = getSolarTermStart(parsedDate.year, monthBranch) ?? MONTH_START_FALLBACKS[monthBranch];
  const currentUtc = Date.UTC(parsedDate.year, parsedDate.month - 1, parsedDate.day, parsedTime.hour, parsedTime.minute);
  const startUtc = Date.UTC(parsedDate.year, start.month - 1, start.day, start.hour, start.minute);
  return Math.max(0, Math.floor((currentUtc - startUtc) / 86_400_000));
}

export function activeHiddenStem(branch: string, elapsedDays: number): string {
  const stems = HIDDEN_STEMS[branch];
  const ranges = HIDDEN_STEM_DAY_RANGES[branch];
  let cursor = 0;
  for (let index = 0; index < ranges.length; index += 1) {
    cursor += ranges[index];
    if (elapsedDays < cursor) return stems[index];
  }
  return stems[stems.length - 1];
}

export function representativeHiddenStem(branch: string): string {
  const stems = HIDDEN_STEMS[branch];
  return stems[stems.length - 1];
}

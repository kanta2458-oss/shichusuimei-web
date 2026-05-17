import { getSolarTermStart } from "./solarTerms.js";
import type { Gender } from "./types.js";

export type LuckDirection = "forward" | "backward";

export interface LuckStartInfo {
  direction: LuckDirection;
  startAge: number;
  referenceTerm: {
    year: number;
    branch: string;
    at: string;
  };
  daysToReferenceTerm: number;
}

const YANG_STEMS = new Set(["甲", "丙", "戊", "庚", "壬"]);

const MONTH_TERMS = [
  { branch: "丑", month: 1, day: 6 },
  { branch: "寅", month: 2, day: 4 },
  { branch: "卯", month: 3, day: 6 },
  { branch: "辰", month: 4, day: 5 },
  { branch: "巳", month: 5, day: 5 },
  { branch: "午", month: 6, day: 6 },
  { branch: "未", month: 7, day: 7 },
  { branch: "申", month: 8, day: 8 },
  { branch: "酉", month: 9, day: 8 },
  { branch: "戌", month: 10, day: 8 },
  { branch: "亥", month: 11, day: 7 },
  { branch: "子", month: 12, day: 7 }
];

const MS_PER_DAY = 86_400_000;

function directionFromGenderAndYearStem(gender: Gender, yearStem: string): LuckDirection {
  const yangYear = YANG_STEMS.has(yearStem);
  return (gender === "male" && yangYear) || (gender === "female" && !yangYear) ? "forward" : "backward";
}

function parseDateTime(date: string, time?: string): Date {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!dateMatch) throw new Error(`Invalid birthDate: ${date}`);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time ?? "12:00");
  if (!timeMatch) throw new Error(`Invalid birthTime: ${time}`);

  return new Date(
    Date.UTC(
      Number(dateMatch[1]),
      Number(dateMatch[2]) - 1,
      Number(dateMatch[3]),
      Number(timeMatch[1]),
      Number(timeMatch[2])
    )
  );
}

function termDate(year: number, branch: string, fallbackMonth: number, fallbackDay: number): Date {
  const exact = getSolarTermStart(year, branch) ?? { month: fallbackMonth, day: fallbackDay, hour: 0, minute: 0 };
  return new Date(Date.UTC(year, exact.month - 1, exact.day, exact.hour, exact.minute));
}

function formatTermDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function surroundingTerms(year: number) {
  const terms = [];

  for (const termYear of [year - 1, year, year + 1]) {
    for (const term of MONTH_TERMS) {
      terms.push({
        year: termYear,
        branch: term.branch,
        date: termDate(termYear, term.branch, term.month, term.day)
      });
    }
  }

  return terms.sort((a, b) => a.date.getTime() - b.date.getTime());
}

function startAgeFromDays(days: number): number {
  return Math.max(0, Math.round(days / 3));
}

export function calculateLuckStart(date: string, time: string | undefined, gender: Gender, yearStem: string): LuckStartInfo {
  const birth = parseDateTime(date, time);
  const direction = directionFromGenderAndYearStem(gender, yearStem);
  const terms = surroundingTerms(birth.getUTCFullYear());
  const reference =
    direction === "forward"
      ? terms.find((term) => term.date.getTime() > birth.getTime())
      : [...terms].reverse().find((term) => term.date.getTime() <= birth.getTime());

  if (!reference) throw new Error(`No solar term found around ${date}`);

  const diffDays = Math.abs(reference.date.getTime() - birth.getTime()) / MS_PER_DAY;

  return {
    direction,
    startAge: startAgeFromDays(diffDays),
    referenceTerm: {
      year: reference.year,
      branch: reference.branch,
      at: formatTermDate(reference.date)
    },
    daysToReferenceTerm: diffDays
  };
}

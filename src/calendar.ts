import { addGanzhi, ganzhiFromNumber, numberFromStemBranch } from "./ganzhi.js";
import { getSolarTermStart } from "./solarTerms.js";

const UTC_DAY = 86_400_000;
const DAY_EPOCH = Date.UTC(2000, 4, 8);
const DAY_EPOCH_NUMBER = 3;

const MONTH_BOUNDARIES = [
  { month: 1, day: 6, branch: "丑" },
  { month: 2, day: 4, branch: "寅" },
  { month: 3, day: 6, branch: "卯" },
  { month: 4, day: 5, branch: "辰" },
  { month: 5, day: 5, branch: "巳" },
  { month: 6, day: 6, branch: "午" },
  { month: 7, day: 7, branch: "未" },
  { month: 8, day: 8, branch: "申" },
  { month: 9, day: 8, branch: "酉" },
  { month: 10, day: 8, branch: "戌" },
  { month: 11, day: 7, branch: "亥" },
  { month: 12, day: 7, branch: "子" }
];

const TIGER_MONTH_STEMS: Record<string, string> = {
  甲: "丙",
  己: "丙",
  乙: "戊",
  庚: "戊",
  丙: "庚",
  辛: "庚",
  丁: "壬",
  壬: "壬",
  戊: "甲",
  癸: "甲"
};

const HOUR_STEM_FOR_ZI: Record<string, string> = {
  甲: "甲",
  己: "甲",
  乙: "丙",
  庚: "丙",
  丙: "戊",
  辛: "戊",
  丁: "庚",
  壬: "庚",
  戊: "壬",
  癸: "壬"
};

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const MONTH_BRANCHES = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"];
const HOUR_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

export function parseDate(date: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) throw new Error(`Invalid birthDate: ${date}`);
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

export function parseTime(time: string): { hour: number; minute: number } {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) throw new Error(`Invalid birthTime: ${time}`);
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) throw new Error(`Invalid birthTime: ${time}`);
  return { hour, minute };
}

function isAtOrAfter(
  current: { month: number; day: number; hour: number; minute: number },
  start: { month: number; day: number; hour: number; minute: number }
): boolean {
  return (
    current.month > start.month ||
    (current.month === start.month &&
      (current.day > start.day ||
        (current.day === start.day && (current.hour > start.hour || (current.hour === start.hour && current.minute >= start.minute)))))
  );
}

export function yearPillar(date: string, time?: string) {
  const { year, month, day } = parseDate(date);
  const parsedTime = time ? parseTime(time) : { hour: 23, minute: 59 };
  const lichun = getSolarTermStart(year, "寅") ?? { month: 2, day: 4, hour: 0, minute: 0 };
  const beforeLichun = !isAtOrAfter({ month, day, ...parsedTime }, lichun);
  const effectiveYear = beforeLichun ? year - 1 : year;
  return ganzhiFromNumber(effectiveYear - 1983);
}

export function monthPillar(date: string, time?: string) {
  const parsed = parseDate(date);
  const parsedTime = time ? parseTime(time) : { hour: 23, minute: 59 };
  const y = yearPillar(date, time);
  let active = MONTH_BOUNDARIES[0];
  for (const boundary of MONTH_BOUNDARIES) {
    const exact = getSolarTermStart(parsed.year, boundary.branch);
    const start = exact ?? { month: boundary.month, day: boundary.day, hour: 0, minute: 0 };
    if (isAtOrAfter({ month: parsed.month, day: parsed.day, ...parsedTime }, start)) {
      active = boundary;
    }
  }
  const monthIndex = MONTH_BRANCHES.indexOf(active.branch);
  const tigerStem = TIGER_MONTH_STEMS[y.stem];
  const stem = STEMS[(STEMS.indexOf(tigerStem) + monthIndex) % 10];
  return ganzhiFromNumber(numberFromStemBranch(stem, active.branch));
}

export function dayPillar(date: string) {
  const { year, month, day } = parseDate(date);
  const current = Date.UTC(year, month - 1, day);
  const diffDays = Math.round((current - DAY_EPOCH) / UTC_DAY);
  return addGanzhi(DAY_EPOCH_NUMBER, diffDays);
}

export function hourPillar(dayStem: string, time: string) {
  const { hour, minute } = parseTime(time);
  const minutes = hour * 60 + minute;
  const branchIndex = minutes >= 23 * 60 ? 0 : Math.floor((minutes + 60) / 120) % 12;
  const ziStem = HOUR_STEM_FOR_ZI[dayStem];
  const stem = STEMS[(STEMS.indexOf(ziStem) + branchIndex) % 10];
  const branch = HOUR_BRANCHES[branchIndex];
  return ganzhiFromNumber(numberFromStemBranch(stem, branch));
}

export function addMinutesToTime(time: string, minutesToAdd: number): string {
  const parsed = parseTime(time);
  const total = parsed.hour * 60 + parsed.minute + Math.round(minutesToAdd);
  const normalized = ((total % 1440) + 1440) % 1440;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

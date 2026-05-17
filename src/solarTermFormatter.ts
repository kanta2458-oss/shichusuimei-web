import type { SolarTermStart } from "./solarTerms.js";

const MONTH_BRANCHES: Record<number, string> = {
  1: "丑",
  2: "寅",
  3: "卯",
  4: "辰",
  5: "巳",
  6: "午",
  7: "未",
  8: "申",
  9: "酉",
  10: "戌",
  11: "亥",
  12: "子"
};

const JAPANESE_NUMBERS: Record<string, number> = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
  十一: 11,
  十二: 12
};

export type SolarTermInputValue = string | SolarTermStart;
export type SolarTermYearInput = Record<string, SolarTermInputValue>;

function numberFromText(value: string): number {
  const trimmed = value.trim();
  const parsed = Number(trimmed);
  if (Number.isInteger(parsed)) return parsed;
  const japanese = JAPANESE_NUMBERS[trimmed];
  if (japanese) return japanese;
  throw new Error(`Invalid number: ${value}`);
}

export function parseSolarTermValue(value: SolarTermInputValue, fallbackMonth: number): SolarTermStart {
  if (typeof value !== "string") return value;

  const normalized = value
    .trim()
    .replace(/[－ー―]/g, "-")
    .replace(/[：]/g, ":")
    .replace(/[・.]/g, ":")
    .replace(/\s+/g, "-");

  const match = /^([0-9一二三四五六七八九十]+)-([0-9一二三四五六七八九十]+):([0-9]{1,2})$/.exec(normalized);
  if (!match) {
    throw new Error(`Invalid solar term value: ${value}. Use "day-hour:minute", for example "5-13:51".`);
  }

  return {
    month: fallbackMonth,
    day: numberFromText(match[1]),
    hour: numberFromText(match[2]),
    minute: numberFromText(match[3])
  };
}

export function normalizeSolarTermYearInput(input: SolarTermYearInput): Record<string, SolarTermStart> {
  const output: Record<string, SolarTermStart> = {};

  for (let month = 1; month <= 12; month += 1) {
    const raw = input[String(month)];
    if (!raw) throw new Error(`Missing month ${month}`);

    const branch = MONTH_BRANCHES[month];
    output[branch] = parseSolarTermValue(raw, month);
  }

  return output;
}

export function formatSolarTermYear(year: number, input: SolarTermYearInput): string {
  const normalized = normalizeSolarTermYearInput(input);
  const lines = [`  ${year}: {`];

  for (let month = 1; month <= 12; month += 1) {
    const branch = MONTH_BRANCHES[month];
    const value = normalized[branch];
    const comma = month === 12 ? "" : ",";
    lines.push(`    ${branch}: term(${value.month}, ${value.day}, ${value.hour}, ${value.minute})${comma}`);
  }

  lines.push("  }");
  return lines.join("\n");
}

export function formatSolarTermYears(years: Record<string, SolarTermYearInput>): string {
  return Object.keys(years)
    .map(Number)
    .sort((a, b) => a - b)
    .map((year) => formatSolarTermYear(year, years[String(year)]))
    .join(",\n");
}

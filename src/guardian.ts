import type { GuardianDeityResult, Pillar } from "./types.js";

interface GuardianRule {
  guardianStems: string[];
  source: GuardianDeityResult["source"];
  note?: string;
}

const MONTH_BRANCHES = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"] as const;

const RAW_GUARDIAN_TABLE: Record<string, Record<(typeof MONTH_BRANCHES)[number], string>> = {
  甲: {
    寅: "丙癸",
    卯: "庚丙丁戊己",
    辰: "庚丁壬",
    巳: "癸庚丁",
    午: "癸庚丁",
    未: "癸庚丁",
    申: "庚丁壬",
    酉: "庚丁丙",
    戌: "庚丁甲壬癸",
    亥: "庚丙丁戊",
    子: "丁庚丙",
    丑: "丁庚丙"
  },
  乙: {
    寅: "丙癸",
    卯: "丙癸",
    辰: "癸丙戊",
    巳: "癸",
    午: "癸丙",
    未: "癸丙",
    申: "丙癸己",
    酉: "癸丙丁",
    戌: "癸辛",
    亥: "丙戊",
    子: "丙",
    丑: "丙"
  },
  丙: {
    寅: "壬庚",
    卯: "壬己",
    辰: "壬甲",
    巳: "壬庚癸",
    午: "壬庚",
    未: "壬庚",
    申: "壬戊",
    酉: "壬癸",
    戌: "甲壬",
    亥: "甲戊庚",
    子: "壬戊己",
    丑: "壬甲"
  },
  丁: {
    寅: "庚甲",
    卯: "庚甲",
    辰: "甲庚",
    巳: "甲庚",
    午: "壬庚癸",
    未: "甲壬庚",
    申: "甲庚丙",
    酉: "甲庚丙戊",
    戌: "甲庚戊",
    亥: "甲庚",
    子: "甲庚",
    丑: "甲庚"
  },
  戊: {
    寅: "丙甲庚",
    卯: "丙甲癸",
    辰: "甲丙癸",
    巳: "甲丙癸",
    午: "壬甲丙",
    未: "癸甲丙",
    申: "丙甲癸",
    酉: "丙癸",
    戌: "甲丙癸",
    亥: "甲丙",
    子: "丙甲",
    丑: "丙甲"
  },
  己: {
    寅: "丙甲庚",
    卯: "甲癸丙",
    辰: "丙癸甲",
    巳: "癸丙",
    午: "癸丙",
    未: "癸丙",
    申: "丙癸",
    酉: "丙癸",
    戌: "甲丙癸",
    亥: "丙戊甲",
    子: "丙戊甲",
    丑: "丙戊甲"
  },
  庚: {
    寅: "戊甲丙",
    卯: "丁庚甲丙",
    辰: "甲丁壬癸",
    巳: "壬丙戊丁",
    午: "壬癸",
    未: "丁甲",
    申: "丁甲",
    酉: "丁甲丙",
    戌: "甲壬",
    亥: "丁丙甲",
    子: "丁甲丙",
    丑: "丙丁甲"
  },
  辛: {
    寅: "己壬庚",
    卯: "己壬庚",
    辰: "壬甲癸",
    巳: "壬甲癸",
    午: "壬己癸",
    未: "壬甲丁",
    申: "壬甲戊",
    酉: "壬甲丁",
    戌: "壬甲",
    亥: "壬丙",
    子: "丙戊甲",
    丑: "丙壬己"
  },
  壬: {
    寅: "庚丙",
    卯: "丁庚甲",
    辰: "甲庚丙",
    巳: "甲庚丙癸",
    午: "庚辛癸",
    未: "辛甲",
    申: "戊丁",
    酉: "甲丙",
    戌: "甲丙",
    亥: "戊庚丙",
    子: "戊丙",
    丑: "丙甲丁"
  },
  癸: {
    寅: "辛庚丙",
    卯: "庚辛",
    辰: "丙辛甲",
    巳: "辛庚",
    午: "庚壬癸",
    未: "庚壬癸",
    申: "丁",
    酉: "辛丙",
    戌: "辛癸甲",
    亥: "庚辛丁",
    子: "丙辛",
    丑: "丙丁"
  }
};

const OVERRIDES: Record<string, GuardianRule> = {
  "丙:巳": {
    guardianStems: ["乙", "庚"],
    source: "reference-chart",
    note: "藤原幹太さんの鑑定書で確認。表転記より鑑定書を優先"
  },
  "丁:午": {
    guardianStems: ["壬", "庚"],
    source: "reference-chart",
    note: "1971-07-01 05:13の検証画像で確認"
  },
  "丁:未": {
    guardianStems: ["甲", "庚", "壬"],
    source: "course-example",
    note: "講座資料の例。夏至後は甲を第一守護神として扱う説明あり"
  },
  "壬:申": {
    guardianStems: ["戊", "丁"],
    source: "course-example",
    note: "講座資料の例"
  }
};

function parseStems(stems: string): string[] {
  return Array.from(stems);
}

export function guardianRuleCount(): number {
  return Object.values(RAW_GUARDIAN_TABLE).reduce((sum, row) => sum + Object.keys(row).length, 0);
}

export function calculateGuardianDeity(day: Pillar, month: Pillar): GuardianDeityResult {
  const key = `${day.stem}:${month.branch}`;
  const override = OVERRIDES[key];
  const tableValue = RAW_GUARDIAN_TABLE[day.stem]?.[month.branch as (typeof MONTH_BRANCHES)[number]];
  const rule =
    override ??
    (tableValue
      ? {
          guardianStems: parseStems(tableValue),
          source: "almanac-table" as const,
          note: "万年暦画像の調候用神表から目視転記"
        }
      : undefined);

  if (!rule) {
    return {
      method: "調候用神",
      status: "needsData",
      dayStem: day.stem,
      monthBranch: month.branch,
      guardianStems: [],
      source: "unregistered",
      note: "この日干・月支の守護神表はまだ未入力"
    };
  }

  return {
    method: "調候用神",
    status: "known",
    dayStem: day.stem,
    monthBranch: month.branch,
    guardianStems: rule.guardianStems,
    source: rule.source,
    note: rule.note
  };
}

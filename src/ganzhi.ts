export const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

export const STEM_ELEMENTS: Record<string, string> = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水"
};

export const BRANCH_ELEMENTS: Record<string, string> = {
  子: "水",
  丑: "土",
  寅: "木",
  卯: "木",
  辰: "土",
  巳: "火",
  午: "火",
  未: "土",
  申: "金",
  酉: "金",
  戌: "土",
  亥: "水"
};

const YANG_STEMS = new Set(["甲", "丙", "戊", "庚", "壬"]);
const GENERATES: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const CONTROLS: Record<string, string> = { 木: "土", 火: "金", 土: "水", 金: "木", 水: "火" };

export function isYangStem(stem: string): boolean {
  if (!STEMS.includes(stem as (typeof STEMS)[number])) {
    throw new Error(`Invalid stem: ${stem}`);
  }
  return YANG_STEMS.has(stem);
}

export function ganzhiFromNumber(number: number): { number: number; stem: string; branch: string; ganzhi: string } {
  const normalized = ((number - 1) % 60 + 60) % 60;
  const stem = STEMS[normalized % 10];
  const branch = BRANCHES[normalized % 12];
  return { number: normalized + 1, stem, branch, ganzhi: `${stem}${branch}` };
}

export function numberFromStemBranch(stem: string, branch: string): number {
  for (let n = 1; n <= 60; n += 1) {
    const candidate = ganzhiFromNumber(n);
    if (candidate.stem === stem && candidate.branch === branch) return n;
  }
  throw new Error(`Invalid ganzhi pair: ${stem}${branch}`);
}

export function addGanzhi(number: number, offset: number): ReturnType<typeof ganzhiFromNumber> {
  return ganzhiFromNumber(number + offset);
}

export function tenGod(dayStem: string, targetStem: string): string {
  const dayElement = STEM_ELEMENTS[dayStem];
  const targetElement = STEM_ELEMENTS[targetStem];
  const samePolarity = YANG_STEMS.has(dayStem) === YANG_STEMS.has(targetStem);

  if (dayElement === targetElement) return samePolarity ? "比肩" : "劫財";
  if (GENERATES[dayElement] === targetElement) return samePolarity ? "食神" : "傷官";
  if (GENERATES[targetElement] === dayElement) return samePolarity ? "偏印" : "印綬";
  if (CONTROLS[dayElement] === targetElement) return samePolarity ? "偏財" : "正財";
  if (CONTROLS[targetElement] === dayElement) return samePolarity ? "偏官" : "正官";

  throw new Error(`Cannot derive ten god from ${dayStem} to ${targetStem}`);
}

const TWELVE_STAGE_START: Record<string, string[]> = {
  甲: ["亥", "子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌"],
  乙: ["午", "巳", "辰", "卯", "寅", "丑", "子", "亥", "戌", "酉", "申", "未"],
  丙: ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"],
  丁: ["酉", "申", "未", "午", "巳", "辰", "卯", "寅", "丑", "子", "亥", "戌"],
  戊: ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"],
  己: ["酉", "申", "未", "午", "巳", "辰", "卯", "寅", "丑", "子", "亥", "戌"],
  庚: ["巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑", "寅", "卯", "辰"],
  辛: ["子", "亥", "戌", "酉", "申", "未", "午", "巳", "辰", "卯", "寅", "丑"],
  壬: ["申", "酉", "戌", "亥", "子", "丑", "寅", "卯", "辰", "巳", "午", "未"],
  癸: ["卯", "寅", "丑", "子", "亥", "戌", "酉", "申", "未", "午", "巳", "辰"]
};

const TWELVE_STAGES = ["長生", "沐浴", "冠帯", "建禄", "帝旺", "衰", "病", "死", "墓", "絶", "胎", "養"];

export function twelveStage(dayStem: string, branch: string): string {
  const branches = TWELVE_STAGE_START[dayStem];
  const index = branches.indexOf(branch);
  if (index === -1) throw new Error(`Cannot derive twelve stage from ${dayStem} to ${branch}`);
  return TWELVE_STAGES[index];
}

export function voidBranches(dayNumber: number): string {
  const groupStart = Math.floor((dayNumber - 1) / 10) * 10 + 1;
  const groupIndex = Math.floor((groupStart - 1) / 10);
  return ["戌亥", "申酉", "午未", "辰巳", "寅卯", "子丑"][groupIndex];
}

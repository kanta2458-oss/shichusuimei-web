import type { Pillar, SpecialStarMatch, SpecialStarResult } from "./types.js";

type PillarKey = "year" | "month" | "day" | "hour";
type Basis = SpecialStarMatch["basis"];

const STEMS = new Set(["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]);
const BRANCHES = new Set(["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]);

const DAY_STEM_BRANCH_TABLE: Record<string, Record<string, string[]>> = {
  甲: {
    羊刃: ["卯"],
    飛刃: ["酉"],
    暗禄: ["亥"],
    金輿: ["辰"],
    天乙貴人: ["丑", "未"],
    太極貴人: ["午", "子"],
    文昌貴人: ["巳"],
    年月日禄: ["寅"],
    夾四柱禄: ["卯", "丑"],
    紅四柱艶: ["午"],
    流四柱霞: ["酉"]
  },
  乙: {
    羊刃: ["辰"],
    飛刃: ["戌"],
    暗禄: ["戌"],
    金輿: ["巳"],
    天乙貴人: ["子", "申"],
    太極貴人: ["午", "子"],
    文昌貴人: ["午"],
    年月日禄: ["卯"],
    夾四柱禄: ["辰", "寅"],
    紅四柱艶: ["申"],
    流四柱霞: ["戌"]
  },
  丙: {
    羊刃: ["午"],
    飛刃: ["子"],
    暗禄: ["申"],
    金輿: ["未"],
    天乙貴人: ["亥", "酉"],
    太極貴人: ["卯", "酉"],
    文昌貴人: ["申"],
    年月日禄: ["巳"],
    夾四柱禄: ["午", "辰"],
    紅四柱艶: ["寅"],
    流四柱霞: ["未"]
  },
  丁: {
    羊刃: ["未"],
    飛刃: ["丑"],
    暗禄: ["未"],
    金輿: ["申"],
    天乙貴人: ["酉", "亥"],
    太極貴人: ["卯", "酉"],
    文昌貴人: ["酉"],
    年月日禄: ["午"],
    夾四柱禄: ["巳", "未"],
    紅四柱艶: ["未"],
    流四柱霞: ["申"]
  },
  戊: {
    羊刃: ["午"],
    飛刃: ["子"],
    暗禄: ["申"],
    金輿: ["未"],
    天乙貴人: ["未", "丑"],
    太極貴人: ["戌", "辰", "丑", "未"],
    文昌貴人: ["申"],
    年月日禄: ["巳"],
    夾四柱禄: ["午", "辰"],
    紅四柱艶: ["辰"],
    流四柱霞: ["巳"]
  },
  己: {
    羊刃: ["未"],
    飛刃: ["丑"],
    暗禄: ["未"],
    金輿: ["申"],
    天乙貴人: ["申", "子"],
    太極貴人: ["戌", "辰", "丑", "未"],
    文昌貴人: ["酉"],
    年月日禄: ["午"],
    夾四柱禄: ["未", "巳"],
    紅四柱艶: ["辰"],
    流四柱霞: ["午"]
  },
  庚: {
    羊刃: ["酉"],
    飛刃: ["卯"],
    暗禄: ["巳"],
    金輿: ["戌"],
    天乙貴人: ["未", "丑"],
    太極貴人: ["寅"],
    文昌貴人: ["亥"],
    年月日禄: ["申"],
    夾四柱禄: ["酉", "未"],
    紅四柱艶: ["戌"],
    流四柱霞: ["辰"]
  },
  辛: {
    羊刃: ["戌"],
    飛刃: ["辰"],
    暗禄: ["辰"],
    金輿: ["亥"],
    天乙貴人: ["午", "寅"],
    太極貴人: ["寅"],
    文昌貴人: ["子"],
    年月日禄: ["酉"],
    夾四柱禄: ["戌", "申"],
    紅四柱艶: ["酉"],
    流四柱霞: ["卯"]
  },
  壬: {
    羊刃: ["子"],
    飛刃: ["午"],
    暗禄: ["寅"],
    金輿: ["丑"],
    天乙貴人: ["巳", "卯"],
    太極貴人: ["申", "巳"],
    文昌貴人: ["寅"],
    年月日禄: ["亥"],
    夾四柱禄: ["戌", "子"],
    紅四柱艶: ["子"],
    流四柱霞: ["亥"]
  },
  癸: {
    羊刃: ["丑"],
    飛刃: ["未"],
    暗禄: ["丑"],
    金輿: ["寅"],
    天乙貴人: ["卯", "巳"],
    太極貴人: ["申", "巳"],
    文昌貴人: ["卯"],
    年月日禄: ["子"],
    夾四柱禄: ["亥", "丑"],
    紅四柱艶: ["申"],
    流四柱霞: ["寅"]
  }
};

const MONTH_BRANCH_TABLE: Record<string, Record<string, string[]>> = {
  子: {
    天徳貴人: ["巳"],
    月徳貴人: ["壬"],
    天徳合: ["申"],
    月徳合: ["丁"],
    華蓋: ["辰"]
  },
  丑: {
    天徳貴人: ["庚"],
    月徳貴人: ["庚"],
    天徳合: ["乙"],
    月徳合: ["乙"],
    華蓋: ["丑"]
  },
  寅: {
    天徳貴人: ["丁"],
    月徳貴人: ["丙"],
    天徳合: ["壬"],
    月徳合: ["辛"],
    華蓋: ["戌"]
  },
  卯: {
    天徳貴人: ["申"],
    月徳貴人: ["甲"],
    天徳合: ["巳"],
    月徳合: ["己"],
    華蓋: ["未"]
  },
  辰: {
    天徳貴人: ["壬"],
    月徳貴人: ["壬"],
    天徳合: ["丁"],
    月徳合: ["丁"],
    華蓋: ["辰"]
  },
  巳: {
    天徳貴人: ["辛"],
    月徳貴人: ["庚"],
    天徳合: ["丙"],
    月徳合: ["乙"],
    華蓋: ["丑"]
  },
  午: {
    天徳貴人: ["亥"],
    月徳貴人: ["丙"],
    天徳合: ["寅"],
    月徳合: ["辛"],
    華蓋: ["戌"]
  },
  未: {
    天徳貴人: ["甲"],
    月徳貴人: ["甲"],
    天徳合: ["己"],
    月徳合: ["己"],
    華蓋: ["未"]
  },
  申: {
    天徳貴人: ["癸"],
    月徳貴人: ["壬"],
    天徳合: ["戊"],
    月徳合: ["丁"],
    華蓋: ["辰"]
  },
  酉: {
    天徳貴人: ["寅"],
    月徳貴人: ["庚"],
    天徳合: ["亥"],
    月徳合: ["乙"],
    華蓋: ["丑"]
  },
  戌: {
    天徳貴人: ["丙"],
    月徳貴人: ["丙"],
    天徳合: ["辛"],
    月徳合: ["辛"],
    華蓋: ["戌"]
  },
  亥: {
    天徳貴人: ["乙"],
    月徳貴人: ["甲"],
    天徳合: ["庚"],
    月徳合: ["己"],
    華蓋: ["未"]
  }
};

const YEAR_DAY_BRANCH_TABLE: Record<string, Record<string, string[]>> = {
  子: { 駅馬: ["寅"], 寡宿: ["戌"], 孤辰: ["寅"], 白虎殺: ["午"], 劫殺: ["巳"], 咸池: ["酉"] },
  丑: { 駅馬: ["亥"], 寡宿: ["戌"], 孤辰: ["寅"], 白虎殺: ["卯"], 劫殺: ["寅"], 咸池: ["午"] },
  寅: { 駅馬: ["申"], 寡宿: ["丑"], 孤辰: ["巳"], 白虎殺: ["子"], 劫殺: ["亥"], 咸池: ["卯"] },
  卯: { 駅馬: ["巳"], 寡宿: ["丑"], 孤辰: ["巳"], 白虎殺: ["酉"], 劫殺: ["申"], 咸池: ["子"] },
  辰: { 駅馬: ["寅"], 寡宿: ["丑"], 孤辰: ["巳"], 白虎殺: ["午"], 劫殺: ["巳"], 咸池: ["酉"] },
  巳: { 駅馬: ["亥"], 寡宿: ["辰"], 孤辰: ["申"], 白虎殺: ["卯"], 劫殺: ["寅"], 咸池: ["午"] },
  午: { 駅馬: ["申"], 寡宿: ["辰"], 孤辰: ["申"], 白虎殺: ["子"], 劫殺: ["亥"], 咸池: ["卯"] },
  未: { 駅馬: ["巳"], 寡宿: ["辰"], 孤辰: ["申"], 白虎殺: ["酉"], 劫殺: ["申"], 咸池: ["子"] },
  申: { 駅馬: ["寅"], 寡宿: ["未"], 孤辰: ["亥"], 白虎殺: ["午"], 劫殺: ["巳"], 咸池: ["酉"] },
  酉: { 駅馬: ["亥"], 寡宿: ["未"], 孤辰: ["亥"], 白虎殺: ["卯"], 劫殺: ["寅"], 咸池: ["午"] },
  戌: { 駅馬: ["申"], 寡宿: ["未"], 孤辰: ["亥"], 白虎殺: ["子"], 劫殺: ["亥"], 咸池: ["卯"] },
  亥: { 駅馬: ["巳"], 寡宿: ["戌"], 孤辰: ["寅"], 白虎殺: ["酉"], 劫殺: ["申"], 咸池: ["子"] }
};

const PILLAR_GANZHI_TABLE: Record<string, string[]> = {
  魁罡: ["庚辰", "庚戌", "壬辰", "戊戌"]
};

export function specialStarRuleCount(): number {
  return (
    Object.values(DAY_STEM_BRANCH_TABLE).reduce((sum, row) => sum + Object.keys(row).length, 0) +
    Object.values(MONTH_BRANCH_TABLE).reduce((sum, row) => sum + Object.keys(row).length, 0) +
    Object.values(YEAR_DAY_BRANCH_TABLE).reduce((sum, row) => sum + Object.keys(row).length, 0) +
    Object.keys(PILLAR_GANZHI_TABLE).length
  );
}

export function calculateSpecialStars(pillars: { year: Pillar; month: Pillar; day: Pillar; hour?: Pillar }): SpecialStarResult {
  const dayStemRow = DAY_STEM_BRANCH_TABLE[pillars.day.stem];
  const monthBranchRow = MONTH_BRANCH_TABLE[pillars.month.branch];
  const yearBranchRow = YEAR_DAY_BRANCH_TABLE[pillars.year.branch];
  const dayBranchRow = YEAR_DAY_BRANCH_TABLE[pillars.day.branch];
  if (!dayStemRow || !monthBranchRow || !yearBranchRow || !dayBranchRow) {
    return {
      status: "needsData",
      basisDayStem: pillars.day.stem,
      matches: [],
      missingReason: "特殊星表が未登録"
    };
  }

  const pillarEntries = (["year", "month", "day", "hour"] as const)
    .map((key) => [key, pillars[key]] as const)
    .filter((entry): entry is readonly [PillarKey, Pillar] => Boolean(entry[1]));

  function buildMatch(star: string, basis: Basis, targets: string[]): SpecialStarMatch | undefined {
    const targetBranches = targets.filter((target) => BRANCHES.has(target));
    const targetStems = targets.filter((target) => STEMS.has(target));
    const targetGanzhi = targets.filter((target) => target.length === 2 && !STEMS.has(target) && !BRANCHES.has(target));
    const matchedPillars = pillarEntries
      .filter(([, pillar]) => {
        return (
          targetBranches.includes(pillar.branch) ||
          targetStems.includes(pillar.stem) ||
          targetGanzhi.includes(pillar.ganzhi)
        );
      })
      .map(([key]) => key);
    if (matchedPillars.length === 0) return undefined;
    return {
      star,
      basis,
      ...(targetBranches.length ? { targetBranches } : {}),
      ...(targetStems.length ? { targetStems } : {}),
      ...(targetGanzhi.length ? { targetGanzhi } : {}),
      matchedPillars
    };
  }

  const matches: SpecialStarMatch[] = [
    ...Object.entries(dayStemRow).map(([star, targets]) => buildMatch(star, "dayStem", targets)),
    ...Object.entries(monthBranchRow).map(([star, targets]) => buildMatch(star, "monthBranch", targets)),
    ...Object.entries({ ...yearBranchRow, ...dayBranchRow }).map(([star, targets]) =>
      buildMatch(star, "yearDayBranch", [
        ...(yearBranchRow[star] ?? []),
        ...(dayBranchRow[star] ?? [])
      ])
    ),
    ...Object.entries(PILLAR_GANZHI_TABLE).map(([star, targets]) => buildMatch(star, "pillarGanzhi", targets))
  ].filter((match): match is SpecialStarMatch => Boolean(match));

  return {
    status: "known",
    basisDayStem: pillars.day.stem,
    matches
  };
}

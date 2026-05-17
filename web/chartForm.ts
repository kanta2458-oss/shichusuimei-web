import type { ChartInput, ChartResult, Gender } from "../src/index.js";

export interface ChartFormState {
  birthDate: string;
  birthTime: string;
  gender: Gender;
  birthPlaceLabel: string;
  latitude?: number;
  longitude: number;
  useLocationCorrection: boolean;
}

export interface ChartSummary {
  pillars: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  voidBranches: string;
  luckStartAge: number;
  luckDirection: "forward" | "backward";
  powerTotal: number;
  guardianStems: string[];
  specialStarCount: number;
}

type SpecialStarMatch = ChartResult["specialStars"]["matches"][number];

export function formStateToChartInput(state: ChartFormState): ChartInput {
  return {
    birthDate: state.birthDate,
    birthTime: state.birthTime || undefined,
    gender: state.gender,
    birthPlace: {
      label: state.birthPlaceLabel || `longitude ${state.longitude}`,
      longitude: state.longitude
    },
    timezone: "Asia/Tokyo",
    useLocationCorrection: state.useLocationCorrection
  };
}

export function formatSpecialStarBasis(basis: SpecialStarMatch["basis"]): string {
  switch (basis) {
    case "dayStem":
      return "日干";
    case "monthBranch":
      return "月支";
    case "yearDayBranch":
      return "年支・日支";
    case "pillarGanzhi":
      return "干支";
  }
}

export function formatSpecialStarPillars(pillars: SpecialStarMatch["matchedPillars"]): string {
  const labels: Record<SpecialStarMatch["matchedPillars"][number], string> = {
    year: "年柱",
    month: "月柱",
    day: "日柱",
    hour: "時柱"
  };
  return pillars.map((pillar) => labels[pillar]).join("・");
}

export function summarizeChart(chart: ChartResult): ChartSummary {
  return {
    pillars: {
      year: chart.pillars.year.ganzhi,
      month: chart.pillars.month.ganzhi,
      day: chart.pillars.day.ganzhi,
      hour: chart.pillars.hour?.ganzhi ?? "時刻不明"
    },
    voidBranches: chart.voidBranches,
    luckStartAge: chart.luckStart.startAge,
    luckDirection: chart.luckStart.direction,
    powerTotal: chart.powerScore.total,
    guardianStems: chart.guardianDeity.guardianStems,
    specialStarCount: chart.specialStars.matches.length
  };
}

function formatLuckDirection(direction: ChartSummary["luckDirection"]): string {
  return direction === "forward" ? "順行" : "逆行";
}

function formatPillarLine(label: string, pillar: ChartResult["pillars"]["year"] | ChartResult["pillars"]["hour"]): string {
  if (!pillar) return `| ${label} | 時刻不明 | - | - | - | - |`;
  return `| ${label} | ${pillar.ganzhi} | #${pillar.number} | ${pillar.tenGod ?? "-"} | ${pillar.twelveStage ?? "-"} | ${pillar.stem}/${pillar.branch} |`;
}

export function buildNotionTemplate(chart: ChartResult): string {
  const guardian = chart.guardianDeity.guardianStems.join("・") || "未入力";
  const specialStars = chart.specialStars.matches.length > 0
    ? chart.specialStars.matches
        .map((match) => `- ${match.star}: ${formatSpecialStarBasis(match.basis)} / ${formatSpecialStarPillars(match.matchedPillars)}`)
        .join("\n")
    : "- 該当なし";
  const luckRows = chart.luckPillars
    .map((luck) => `| ${luck.startAge}-${luck.endAge} | ${luck.pillar.ganzhi} | ${luck.pillar.tenGod ?? "-"} | ${luck.pillar.twelveStage ?? "-"} |`)
    .join("\n");
  const annualRows = chart.annualFortunes
    .map((fortune) => `| ${fortune.year} | ${fortune.pillar.ganzhi} | ${fortune.pillar.tenGod ?? "-"} | ${fortune.pillar.twelveStage ?? "-"} |`)
    .join("\n");

  return [
    "# 四柱推命 鑑定メモ",
    "",
    "## 入力",
    `- 生年月日: ${chart.input.birthDate}`,
    `- 出生時刻: ${chart.input.birthTime ?? "時刻不明"}`,
    `- 性別: ${chart.input.gender === "male" ? "男性" : "女性"}`,
    `- 出生地: ${chart.input.birthPlace.label}`,
    `- 経度補正: ${chart.input.useLocationCorrection ? "使用" : "未使用"}`,
    "",
    "## 命式",
    "| 柱 | 干支 | 番号 | 通変星 | 十二運 | 天干/地支 |",
    "|---|---|---:|---|---|---|",
    formatPillarLine("年柱", chart.pillars.year),
    formatPillarLine("月柱", chart.pillars.month),
    formatPillarLine("日柱", chart.pillars.day),
    formatPillarLine("時柱", chart.pillars.hour),
    "",
    "## 概要",
    `- 空亡: ${chart.voidBranches}`,
    `- 大運: ${formatLuckDirection(chart.luckStart.direction)} ${chart.luckStart.startAge}歳`,
    `- パワー: ${chart.powerScore.total} / ${chart.powerScore.classification}`,
    `- 守護神: ${guardian}`,
    `- 時柱補正: 補正前 ${chart.hourComparison?.uncorrected?.ganzhi ?? "-"} / 補正後 ${chart.hourComparison?.corrected?.ganzhi ?? "-"} / 採用 ${chart.pillars.hour?.ganzhi ?? "-"}`,
    "",
    "## 特殊星",
    specialStars,
    "",
    "## 大運",
    "| 年齢 | 干支 | 通変星 | 十二運 |",
    "|---|---|---|---|",
    luckRows,
    "",
    "## 流年運",
    "| 年 | 干支 | 通変星 | 十二運 |",
    "|---:|---|---|---|",
    annualRows,
    "",
    "## 鑑定メモ",
    "",
    "- "
  ].join("\n");
}

export function defaultChartFormState(): ChartFormState {
  return {
    birthDate: "2000-05-08",
    birthTime: "15:54",
    gender: "male",
    birthPlaceLabel: "岡山県岡山市南区千鳥町",
    latitude: 34.59,
    longitude: 133.93,
    useLocationCorrection: true
  };
}

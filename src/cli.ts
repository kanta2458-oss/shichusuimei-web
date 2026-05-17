import { calculateChart } from "./engine.js";
import { registerReferenceCaseOverridesFromFile } from "./nodeReferenceCases.js";
import type { ChartInput, ChartResult, Gender, Pillar } from "./types.js";

declare const process: {
  argv: string[];
  exitCode?: number;
};

const USAGE = [
  "Usage:",
  "  npm.cmd run chart -- <birthDate> <birthTime> <gender> <longitude> [--no-correction]",
  "",
  "Example:",
  "  npm.cmd run chart -- 2000-05-08 15:54 male 133.93"
].join("\n");

function parseGender(value: string): Gender {
  if (value === "male" || value === "男" || value === "男性") return "male";
  if (value === "female" || value === "女" || value === "女性") return "female";
  throw new Error(`Invalid gender: ${value}`);
}

function parseLongitude(value: string): number {
  const longitude = Number(value);
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error(`Invalid longitude: ${value}`);
  }
  return longitude;
}

export function parseChartCliArgs(args: string[]): ChartInput {
  const flags = new Set(args.filter((arg) => arg.startsWith("--")));
  const positional = args.filter((arg) => !arg.startsWith("--"));

  if (flags.has("--help") || flags.has("-h")) {
    throw new Error(USAGE);
  }

  if (positional.length < 4) {
    throw new Error(USAGE);
  }

  const [birthDate, birthTime, genderRaw, longitudeRaw] = positional;
  const longitude = parseLongitude(longitudeRaw);

  return {
    birthDate,
    birthTime,
    gender: parseGender(genderRaw),
    birthPlace: {
      label: `longitude ${longitude}`,
      longitude
    },
    timezone: "Asia/Tokyo",
    useLocationCorrection: !flags.has("--no-correction")
  };
}

function formatPillar(label: string, pillar: Pillar | undefined): string {
  if (!pillar) return `${label}: unknown`;

  const details = [
    `#${pillar.number}`,
    pillar.tenGod ? `通変星=${pillar.tenGod}` : undefined,
    pillar.twelveStage ? `十二運=${pillar.twelveStage}` : undefined
  ].filter(Boolean);

  return `${label}: ${pillar.ganzhi} (${details.join(", ")})`;
}

export function formatChart(chart: ChartResult): string {
  const luckDirection = chart.luckStart.direction === "forward" ? "順行" : "逆行";
  const correction = chart.locationCorrection;
  const luckRows = chart.luckPillars
    .slice(0, 10)
    .map((luck) => `${String(luck.startAge).padStart(2, " ")}-${String(luck.endAge).padStart(2, " ")}歳  ${luck.pillar.ganzhi}  ${luck.pillar.tenGod ?? ""}  ${luck.pillar.twelveStage ?? ""}`);
  const yearFlowStart = chart.earthlyFlow.year.cycle.slice(0, 6).map((entry) => entry.ganzhi).join(" -> ");
  const guardian = chart.guardianDeity.guardianStems.length > 0 ? chart.guardianDeity.guardianStems.join("・") : "未入力";

  return [
    `入力: ${chart.input.birthDate} ${chart.input.birthTime ?? "時刻不明"} ${chart.input.gender}`,
    `経度補正: ${chart.input.useLocationCorrection ? "使用" : "未使用"} / ${correction.offsetMinutes.toFixed(2)}分 / 補正後=${correction.correctedTime ?? "-"}`,
    "",
    "四柱",
    formatPillar("年柱", chart.pillars.year),
    formatPillar("月柱", chart.pillars.month),
    formatPillar("日柱", chart.pillars.day),
    formatPillar("時柱", chart.pillars.hour),
    "",
    `空亡: ${chart.voidBranches}`,
    `大運: ${luckDirection} / 開始=${chart.luckStart.startAge}歳 / 参照節=${chart.luckStart.referenceTerm.branch} ${chart.luckStart.referenceTerm.at}`,
    `地の流れ(年): 基準=${chart.earthlyFlow.year.basisStem}${chart.earthlyFlow.year.basisStemPolarity === "yang" ? "陽" : "陰"} / 空亡アンカー=${chart.earthlyFlow.year.anchor.ganzhi} / ${yearFlowStart}`,
    `パワー: ${chart.powerScore.total} (${chart.powerScore.classification}) / 中心星=${chart.powerScore.centerStar.stem}${chart.powerScore.centerStar.tenGod} x${chart.powerScore.centerStar.multiplier}`,
    `守護神: ${guardian} (${chart.guardianDeity.method}${chart.guardianDeity.status === "known" ? "" : "・要データ"})`,
    "",
    "大運表",
    ...luckRows,
    "",
    `五行: ${Object.entries(chart.fiveElementCounts)
      .map(([element, count]) => `${element}${count}`)
      .join(" / ")}`
  ].join("\n");
}

export function runChartCli(args: string[]): string {
  registerReferenceCaseOverridesFromFile();
  return formatChart(calculateChart(parseChartCliArgs(args)));
}

if (process.argv[1]?.endsWith("cli.js")) {
  try {
    console.log(runChartCli(process.argv.slice(2)));
  } catch (error) {
    process.exitCode = 1;
    console.error(error instanceof Error ? error.message : String(error));
  }
}

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

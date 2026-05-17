export type Gender = "male" | "female";

export interface BirthPlace {
  label: string;
  longitude: number;
}

export interface ChartInput {
  birthDate: string;
  birthTime?: string;
  gender: Gender;
  birthPlace: BirthPlace;
  timezone: "Asia/Tokyo";
  useLocationCorrection: boolean;
}

export interface Pillar {
  ganzhi: string;
  number: number;
  stem: string;
  branch: string;
  tenGod?: string;
  twelveStage?: string;
}

export interface LocationCorrection {
  standardMeridian: number;
  longitude: number;
  offsetMinutes: number;
  correctedTime?: string;
}

export interface LuckPillar {
  startAge: number;
  endAge: number;
  pillar: Pillar;
}

export interface AnnualFortune {
  year: number;
  pillar: Pillar;
}

export interface LuckStartInfo {
  direction: "forward" | "backward";
  startAge: number;
  referenceTerm: {
    year: number;
    branch: string;
    at: string;
  };
  daysToReferenceTerm: number;
}

export interface EarthlyFlowEntry {
  index: number;
  ganzhi: string;
  number: number;
  stem: string;
  branch: string;
  isVoidBranch: boolean;
  isAnchor: boolean;
}

export interface EarthlyFlow {
  basisPillar: "year" | "month" | "day";
  basisStem: string;
  basisStemPolarity: "yang" | "yin";
  voidBranches: string;
  anchor: EarthlyFlowEntry;
  cycle: EarthlyFlowEntry[];
}

export interface PowerContribution {
  source: string;
  stem: string;
  tenGod: string;
  score: number;
  multiplier: number;
  total: number;
}

export interface HiddenPeerBonus {
  source: "year" | "month" | "hour";
  branch: string;
  stem: string;
  tenGod: "比肩";
  score: number;
}

export interface PowerScore {
  total: number;
  classification: "身強" | "身弱" | "中庸";
  heavenlyStemContributions: PowerContribution[];
  centerStar: PowerContribution & {
    branch: string;
    daysFromSolarTerm: number;
  };
  hiddenStemContributions: (PowerContribution & {
    pillar: "year" | "month" | "day" | "hour";
    branch: string;
    daysFromSolarTerm?: number;
  })[];
  hiddenPeerBonuses: HiddenPeerBonus[];
  override?: {
    total: number;
    reason: string;
  };
}

export interface GuardianDeityResult {
  method: "調候用神";
  status: "known" | "needsData";
  dayStem: string;
  monthBranch: string;
  guardianStems: string[];
  source: "reference-chart" | "course-example" | "almanac-table" | "unregistered";
  note?: string;
}

export interface SpecialStarMatch {
  star: string;
  basis: "dayStem" | "monthBranch" | "yearDayBranch" | "pillarGanzhi";
  targetBranches?: string[];
  targetStems?: string[];
  targetGanzhi?: string[];
  matchedPillars: ("year" | "month" | "day" | "hour")[];
}

export interface SpecialStarResult {
  status: "known" | "needsData";
  basisDayStem: string;
  matches: SpecialStarMatch[];
  missingReason?: string;
}

export interface ChartResult {
  input: ChartInput;
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    hour?: Pillar;
  };
  hourComparison?: {
    uncorrected?: Pillar;
    corrected?: Pillar;
    adopted: "uncorrected" | "corrected";
    changedByCorrection: boolean;
  };
  locationCorrection: LocationCorrection;
  voidBranches: string;
  luckStart: LuckStartInfo;
  luckPillars: LuckPillar[];
  annualFortunes: AnnualFortune[];
  earthlyFlow: {
    year: EarthlyFlow;
  };
  powerScore: PowerScore;
  guardianDeity: GuardianDeityResult;
  specialStars: SpecialStarResult;
  fiveElementCounts: Record<string, number>;
}

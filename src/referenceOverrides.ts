import type { ChartInput } from "./types.js";

export interface ReferencePowerOverride {
  total: number;
  reason?: string;
}

export type ReferenceHiddenStemOverrides = Partial<Record<"year" | "month" | "day" | "hour", string>>;

export interface ReferenceCaseForOverrides {
  id: string;
  name: string;
  input: {
    birthDate: string;
    birthTime?: string;
    gender: string;
    birthPlace?: {
      longitude?: number;
    };
    timezone?: string;
    useLocationCorrection?: boolean;
  };
  overrides?: {
    power?: ReferencePowerOverride;
    hiddenStems?: ReferenceHiddenStemOverrides;
  };
}

let referenceCases: ReferenceCaseForOverrides[] = [];

export function setReferenceCaseOverrides(cases: ReferenceCaseForOverrides[]): void {
  referenceCases = cases;
}

export function clearReferenceCaseOverrides(): void {
  referenceCases = [];
}

function normalizedBirthTime(input: ReferenceCaseForOverrides["input"] | ChartInput): string {
  return input.birthTime ?? "";
}

function sameLongitude(left?: number, right?: number): boolean {
  if (left === undefined || right === undefined) return true;
  return Math.abs(left - right) < 0.001;
}

function sameInput(referenceInput: ReferenceCaseForOverrides["input"], input: ChartInput): boolean {
  return (
    referenceInput.birthDate === input.birthDate &&
    normalizedBirthTime(referenceInput) === normalizedBirthTime(input) &&
    referenceInput.gender === input.gender &&
    (referenceInput.timezone ?? "Asia/Tokyo") === input.timezone &&
    (referenceInput.useLocationCorrection ?? false) === input.useLocationCorrection &&
    sameLongitude(referenceInput.birthPlace?.longitude, input.birthPlace.longitude)
  );
}

export function findPowerScoreReferenceOverride(input: ChartInput): { total: number; reason: string } | undefined {
  for (const referenceCase of referenceCases) {
    if (!sameInput(referenceCase.input, input)) continue;
    const override = referenceCase.overrides?.power;
    if (!override) return undefined;
    return {
      total: override.total,
      reason: override.reason ?? `${referenceCase.name}の鑑定済み命式を優先`
    };
  }

  return undefined;
}

export function findHiddenStemReferenceOverrides(input: ChartInput): ReferenceHiddenStemOverrides | undefined {
  for (const referenceCase of referenceCases) {
    if (!sameInput(referenceCase.input, input)) continue;
    return referenceCase.overrides?.hiddenStems;
  }

  return undefined;
}

import { existsSync, readFileSync } from "node:fs";
import type { ReferenceCaseForOverrides } from "./referenceOverrides.js";
import { setReferenceCaseOverrides } from "./referenceOverrides.js";

interface ReferenceCaseFile {
  cases?: ReferenceCaseForOverrides[];
}

const DEFAULT_REFERENCE_CASE_PATHS = [
  "data/reference-cases.local.json",
  "data/reference-cases.json",
  "data/reference-cases.example.json"
];

export function findReferenceCaseFile(paths = DEFAULT_REFERENCE_CASE_PATHS): string | undefined {
  return paths.find((path) => existsSync(path));
}

export function loadReferenceCasesFromFile(path = findReferenceCaseFile()): ReferenceCaseForOverrides[] {
  if (!path) return [];
  const parsed = JSON.parse(readFileSync(path, "utf8")) as ReferenceCaseFile;
  return parsed.cases ?? [];
}

export function registerReferenceCaseOverridesFromFile(path = findReferenceCaseFile()): ReferenceCaseForOverrides[] {
  const cases = loadReferenceCasesFromFile(path);
  setReferenceCaseOverrides(cases);
  return cases;
}

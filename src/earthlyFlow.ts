import { ganzhiFromNumber, isYangStem } from "./ganzhi.js";
import type { EarthlyFlow, EarthlyFlowEntry, Pillar } from "./types.js";

function branchList(voidBranches: string): string[] {
  return Array.from(voidBranches);
}

function buildEntry(anchorNumber: number, index: number, voidBranchSet: Set<string>): EarthlyFlowEntry {
  const raw = ganzhiFromNumber(anchorNumber + index);
  return {
    index,
    ...raw,
    isVoidBranch: voidBranchSet.has(raw.branch),
    isAnchor: index === 0
  };
}

export function calculateEarthlyFlow(basisPillar: "year" | "month" | "day", pillar: Pillar, voidBranches: string): EarthlyFlow {
  const basisStemIsYang = isYangStem(pillar.stem);
  const voidBranchSet = new Set(branchList(voidBranches));
  let anchorNumber: number | undefined;

  for (let number = 1; number <= 60; number += 1) {
    const raw = ganzhiFromNumber(number);
    if (voidBranchSet.has(raw.branch) && isYangStem(raw.stem) === basisStemIsYang) {
      anchorNumber = number;
      break;
    }
  }

  if (anchorNumber === undefined) {
    throw new Error(`Cannot find earthly flow anchor for ${pillar.ganzhi} / ${voidBranches}`);
  }

  const cycle = Array.from({ length: 60 }, (_, index) => buildEntry(anchorNumber, index, voidBranchSet));

  return {
    basisPillar,
    basisStem: pillar.stem,
    basisStemPolarity: basisStemIsYang ? "yang" : "yin",
    voidBranches,
    anchor: cycle[0],
    cycle
  };
}

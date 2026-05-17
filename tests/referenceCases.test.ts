import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { calculateChart } from "../src/index.js";
import { setReferenceCaseOverrides } from "../src/referenceOverrides.js";
import type { ChartInput, Pillar, SpecialStarMatch } from "../src/types.js";

interface ExpectedPillar {
  ganzhi: string;
  number: number;
  tenGod?: string;
  twelveStage?: string;
}

interface ExpectedLuckPillar {
  startAge: number;
  endAge: number;
  ganzhi: string;
  tenGod: string;
  twelveStage: string;
}

interface ExpectedHiddenStem {
  stem: string;
  tenGod: string;
}

interface ExpectedSpecialStar {
  star: string;
  basis: SpecialStarMatch["basis"];
  matchedPillars: SpecialStarMatch["matchedPillars"];
}

interface ReferenceCase {
  id: string;
  name: string;
  input: ChartInput;
  expected: {
    pillars: {
      year: ExpectedPillar;
      month: ExpectedPillar;
      day: ExpectedPillar;
      hour?: ExpectedPillar;
    };
    voidBranches: string;
    luckStart: {
      direction: "forward" | "backward";
      startAge: number;
    };
    luckPillars: ExpectedLuckPillar[];
    power: {
      total: number;
    };
    guardianStems: string[];
    hiddenStems?: Partial<Record<"year" | "month" | "day" | "hour", ExpectedHiddenStem>>;
    specialStars?: ExpectedSpecialStar[];
  };
  overrides?: {
    power?: {
      total: number;
      reason: string;
    };
    hiddenStems?: Partial<Record<"year" | "month" | "day" | "hour", string>>;
  };
}

interface ReferenceCaseFile {
  cases: ReferenceCase[];
}

function referenceCasePath(): string {
  for (const path of ["data/reference-cases.local.json", "data/reference-cases.json", "data/reference-cases.example.json"]) {
    if (existsSync(path)) return path;
  }
  throw new Error("No reference cases file found");
}

const referenceCases = JSON.parse(readFileSync(referenceCasePath(), "utf8")) as ReferenceCaseFile;
setReferenceCaseOverrides(referenceCases.cases);

function pickPillar(pillar: Pillar | undefined, expected: ExpectedPillar | undefined): ExpectedPillar | undefined {
  if (!expected) return undefined;
  if (!pillar) return undefined;

  return {
    ganzhi: pillar.ganzhi,
    number: pillar.number,
    ...(expected.tenGod === undefined ? {} : { tenGod: pillar.tenGod }),
    ...(expected.twelveStage === undefined ? {} : { twelveStage: pillar.twelveStage })
  };
}

function pickLuckPillars(luckPillars: ReturnType<typeof calculateChart>["luckPillars"]): ExpectedLuckPillar[] {
  return luckPillars.map((luck) => ({
    startAge: luck.startAge,
    endAge: luck.endAge,
    ganzhi: luck.pillar.ganzhi,
    tenGod: luck.pillar.tenGod ?? "",
    twelveStage: luck.pillar.twelveStage ?? ""
  }));
}

function pickHiddenStems(chart: ReturnType<typeof calculateChart>, expected: ReferenceCase["expected"]["hiddenStems"]) {
  if (!expected) return undefined;

  return Object.fromEntries(
    Object.keys(expected).map((pillar) => {
      const contribution = chart.powerScore.hiddenStemContributions.find((item) => item.pillar === pillar);
      return [
        pillar,
        contribution
          ? {
              stem: contribution.stem,
              tenGod: contribution.tenGod
            }
          : undefined
      ];
    })
  );
}

function pickSpecialStars(
  chart: ReturnType<typeof calculateChart>,
  expected: ReferenceCase["expected"]["specialStars"]
): ExpectedSpecialStar[] | undefined {
  if (!expected) return undefined;

  return expected.map((expectedStar) => {
    const actual = chart.specialStars.matches.find(
      (match) => match.star === expectedStar.star && match.basis === expectedStar.basis
    );
    return {
      star: expectedStar.star,
      basis: expectedStar.basis,
      matchedPillars: actual?.matchedPillars ?? []
    };
  });
}

describe("JSON reference cases", () => {
  for (const referenceCase of referenceCases.cases) {
    it(`${referenceCase.id}: 鑑定済み命式と計算結果が一致する`, () => {
      const chart = calculateChart(referenceCase.input);
      const context = `${referenceCase.id} (${referenceCase.name})`;

      assert.deepEqual(
        {
          year: pickPillar(chart.pillars.year, referenceCase.expected.pillars.year),
          month: pickPillar(chart.pillars.month, referenceCase.expected.pillars.month),
          day: pickPillar(chart.pillars.day, referenceCase.expected.pillars.day),
          hour: pickPillar(chart.pillars.hour, referenceCase.expected.pillars.hour)
        },
        {
          year: referenceCase.expected.pillars.year,
          month: referenceCase.expected.pillars.month,
          day: referenceCase.expected.pillars.day,
          hour: referenceCase.expected.pillars.hour
        },
        `${context}: 四柱・60干支番号`
      );

      assert.equal(chart.voidBranches, referenceCase.expected.voidBranches, `${context}: 空亡`);
      assert.deepEqual(
        {
          direction: chart.luckStart.direction,
          startAge: chart.luckStart.startAge
        },
        referenceCase.expected.luckStart,
        `${context}: 大運開始`
      );
      assert.deepEqual(pickLuckPillars(chart.luckPillars), referenceCase.expected.luckPillars, `${context}: 大運表`);
      assert.deepEqual(
        pickHiddenStems(chart, referenceCase.expected.hiddenStems),
        referenceCase.expected.hiddenStems,
        `${context}: 蔵干・蔵干通変`
      );
      assert.equal(chart.powerScore.total, referenceCase.expected.power.total, `${context}: パワー`);
      assert.deepEqual(chart.guardianDeity.guardianStems, referenceCase.expected.guardianStems, `${context}: 守護神`);
      assert.deepEqual(
        pickSpecialStars(chart, referenceCase.expected.specialStars),
        referenceCase.expected.specialStars,
        `${context}: 特殊星`
      );

      if (referenceCase.overrides?.power) {
        assert.deepEqual(chart.powerScore.override, referenceCase.overrides.power, `${context}: パワーoverride`);
      }
    });
  }
});

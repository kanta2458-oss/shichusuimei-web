import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateChart } from "../src/index.js";

describe("earthly flow", () => {
  it("uses the void ganzhi with the same polarity as the year stem as the anchor", () => {
    const chart = calculateChart({
      birthDate: "2000-05-08",
      birthTime: "15:54",
      gender: "male",
      birthPlace: { label: "Okayama", longitude: 133.93 },
      timezone: "Asia/Tokyo",
      useLocationCorrection: true
    });

    assert.deepEqual(
      {
        basisStem: chart.earthlyFlow.year.basisStem,
        polarity: chart.earthlyFlow.year.basisStemPolarity,
        voidBranches: chart.earthlyFlow.year.voidBranches,
        anchor: [chart.earthlyFlow.year.anchor.ganzhi, chart.earthlyFlow.year.anchor.number, chart.earthlyFlow.year.anchor.isVoidBranch],
        next: chart.earthlyFlow.year.cycle.slice(0, 4).map((entry) => entry.ganzhi)
      },
      {
        basisStem: "庚",
        polarity: "yang",
        voidBranches: "戌亥",
        anchor: ["甲戌", 11, true],
        next: ["甲戌", "乙亥", "丙子", "丁丑"]
      }
    );
  });

  it("selects the yin void ganzhi when the basis stem is yin", () => {
    const chart = calculateChart({
      birthDate: "1971-07-01",
      birthTime: "05:13",
      gender: "female",
      birthPlace: { label: "unknown", longitude: 135 },
      timezone: "Asia/Tokyo",
      useLocationCorrection: false
    });

    assert.deepEqual(
      {
        basisStem: chart.earthlyFlow.year.basisStem,
        polarity: chart.earthlyFlow.year.basisStemPolarity,
        voidBranches: chart.earthlyFlow.year.voidBranches,
        anchor: [chart.earthlyFlow.year.anchor.ganzhi, chart.earthlyFlow.year.anchor.number],
        next: chart.earthlyFlow.year.cycle.slice(0, 4).map((entry) => entry.ganzhi)
      },
      {
        basisStem: "辛",
        polarity: "yin",
        voidBranches: "午未",
        anchor: ["辛未", 8],
        next: ["辛未", "壬申", "癸酉", "甲戌"]
      }
    );
  });
});

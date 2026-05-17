import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateChart } from "../src/index.js";
import { registerReferenceCaseOverridesFromFile } from "../src/nodeReferenceCases.js";

describe("power score", () => {
  registerReferenceCaseOverridesFromFile();

  it("matches the Fujiwara reference power score", () => {
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
        total: chart.powerScore.total,
        classification: chart.powerScore.classification,
        center: [chart.powerScore.centerStar.stem, chart.powerScore.centerStar.tenGod, chart.powerScore.centerStar.total],
        hiddenStems: chart.powerScore.hiddenStemContributions.map((contribution) => [
          contribution.pillar,
          contribution.branch,
          contribution.stem,
          contribution.tenGod,
          contribution.total
        ])
      },
      {
        total: -2,
        classification: "中庸",
        center: ["戊", "食神", -3],
        hiddenStems: [
          ["year", "辰", "戊", "食神", -1],
          ["month", "巳", "戊", "食神", -3],
          ["day", "寅", "甲", "偏印", 1],
          ["hour", "申", "庚", "偏財", -1]
        ]
      }
    );
    assert.deepEqual(chart.powerScore.override, {
      total: -2,
      reason: "藤原幹太さんの鑑定済み命式を優先"
    });
  });

  it("matches the visible 1971 reference image power score", () => {
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
        total: chart.powerScore.total,
        classification: chart.powerScore.classification,
        center: [chart.powerScore.centerStar.stem, chart.powerScore.centerStar.tenGod, chart.powerScore.centerStar.total],
        hiddenStems: chart.powerScore.hiddenStemContributions.map((contribution) => [
          contribution.pillar,
          contribution.branch,
          contribution.stem,
          contribution.tenGod,
          contribution.total
        ])
      },
      {
        total: 4,
        classification: "身強",
        center: ["丁", "比肩", 3],
        hiddenStems: [
          ["year", "亥", "壬", "正官", -1],
          ["month", "午", "丁", "比肩", 3],
          ["day", "亥", "壬", "正官", -1],
          ["hour", "卯", "乙", "偏印", 1]
        ]
      }
    );
    assert.deepEqual(chart.powerScore.override, {
      total: 4,
      reason: "1971-07-01 05:13の鑑定済み命式を優先"
    });
  });

  it("matches the 1969-03-23 reference image power score", () => {
    const chart = calculateChart({
      birthDate: "1969-03-23",
      gender: "male",
      birthPlace: { label: "unknown", longitude: 135 },
      timezone: "Asia/Tokyo",
      useLocationCorrection: false
    });

    assert.equal(chart.powerScore.total, 2);
  });

  it("matches the 1997-06-21 reference image power score", () => {
    const chart = calculateChart({
      birthDate: "1997-06-21",
      birthTime: "02:40",
      gender: "female",
      birthPlace: { label: "unknown", longitude: 135 },
      timezone: "Asia/Tokyo",
      useLocationCorrection: false
    });

    assert.equal(chart.powerScore.total, -6);
  });

  it("matches the 1998-08-18 reference image power score", () => {
    const chart = calculateChart({
      birthDate: "1998-08-18",
      birthTime: "11:18",
      gender: "female",
      birthPlace: { label: "unknown", longitude: 135 },
      timezone: "Asia/Tokyo",
      useLocationCorrection: false
    });

    assert.equal(chart.powerScore.total, -2);
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateChart } from "../src/index.js";

describe("reference image cases", () => {
  it("1971-07-01 05:13 case matches the visible four pillars", () => {
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
        year: [chart.pillars.year.ganzhi, chart.pillars.year.number, chart.pillars.year.tenGod, chart.pillars.year.twelveStage],
        month: [chart.pillars.month.ganzhi, chart.pillars.month.number, chart.pillars.month.tenGod, chart.pillars.month.twelveStage],
        day: [chart.pillars.day.ganzhi, chart.pillars.day.number, chart.pillars.day.twelveStage],
        hour: [chart.pillars.hour?.ganzhi, chart.pillars.hour?.number, chart.pillars.hour?.tenGod, chart.pillars.hour?.twelveStage],
        voidBranches: chart.voidBranches,
        fiveElementCounts: chart.fiveElementCounts
      },
      {
        year: ["辛亥", 48, "偏財", "胎"],
        month: ["甲午", 31, "印綬", "建禄"],
        day: ["丁亥", 24, "胎"],
        hour: ["癸卯", 40, "偏官", "病"],
        voidBranches: "午未",
        fiveElementCounts: { 木: 2, 火: 2, 土: 0, 金: 1, 水: 3 }
      }
    );

    assert.deepEqual(
      chart.luckPillars.slice(0, 8).map((luck) => [luck.pillar.ganzhi, luck.pillar.tenGod, luck.pillar.twelveStage]),
      [
        ["甲午", "印綬", "建禄"],
        ["乙未", "偏印", "冠帯"],
        ["丙申", "劫財", "沐浴"],
        ["丁酉", "比肩", "長生"],
        ["戊戌", "傷官", "養"],
        ["己亥", "食神", "胎"],
        ["庚子", "正財", "絶"],
        ["辛丑", "偏財", "墓"]
      ]
    );

    assert.deepEqual(
      {
        direction: chart.luckStart.direction,
        startAge: chart.luckStart.startAge,
        starts: chart.luckPillars.slice(0, 4).map((luck) => [luck.startAge, luck.endAge, luck.pillar.ganzhi])
      },
      {
        direction: "forward",
        startAge: 2,
        starts: [
          [0, 1, "甲午"],
          [2, 11, "乙未"],
          [12, 21, "丙申"],
          [22, 31, "丁酉"]
        ]
      }
    );
  });
});

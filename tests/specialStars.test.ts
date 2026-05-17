import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateChart, calculateSpecialStars, specialStarRuleCount } from "../src/index.js";
import type { Pillar } from "../src/index.js";

function specialStarMap(chart: ReturnType<typeof calculateChart>, basis?: string): Record<string, string[]> {
  return Object.fromEntries(
    chart.specialStars.matches
      .filter((match) => !basis || match.basis === basis)
      .map((match) => [match.star, match.matchedPillars])
  );
}

describe("special stars", () => {
  function pillar(stem: string, branch: string): Pillar {
    return {
      stem,
      branch,
      ganzhi: `${stem}${branch}`,
      number: 1
    };
  }

  it("contains the complete transcribed day-stem table", () => {
    assert.equal(specialStarRuleCount(), 243);
  });

  it("detects day-stem based special stars for the Fujiwara reference chart", () => {
    const chart = calculateChart({
      birthDate: "2000-05-08",
      birthTime: "15:54",
      gender: "male",
      birthPlace: { label: "Okayama", longitude: 133.93 },
      timezone: "Asia/Tokyo",
      useLocationCorrection: true
    });

    assert.equal(chart.specialStars.status, "known");
    assert.equal(chart.specialStars.basisDayStem, "丙");
    assert.deepEqual(specialStarMap(chart, "dayStem"), {
      暗禄: ["hour"],
      文昌貴人: ["hour"],
      年月日禄: ["month"],
      夾四柱禄: ["year"],
      紅四柱艶: ["day"]
    });
  });

  it("detects day-stem based special stars for the 1997 reference chart", () => {
    const chart = calculateChart({
      birthDate: "1997-06-21",
      birthTime: "02:40",
      gender: "female",
      birthPlace: { label: "unknown", longitude: 135 },
      timezone: "Asia/Tokyo",
      useLocationCorrection: false
    });

    assert.equal(chart.specialStars.status, "known");
    assert.equal(chart.specialStars.basisDayStem, "甲");
    assert.deepEqual(specialStarMap(chart, "dayStem"), {
      天乙貴人: ["year", "hour"],
      太極貴人: ["month", "day"],
      夾四柱禄: ["year", "hour"],
      紅四柱艶: ["month", "day"]
    });
  });

  it("detects transcribed rows for 庚 through 癸 day stems", () => {
    assert.deepEqual(
      calculateSpecialStars({
        year: pillar("甲", "酉"),
        month: pillar("乙", "未"),
        day: pillar("庚", "申"),
        hour: pillar("丙", "戌")
      })
        .matches.filter((match) => match.basis === "dayStem")
        .map((match) => [match.star, match.matchedPillars]),
      [
        ["羊刃", ["year"]],
        ["金輿", ["hour"]],
        ["天乙貴人", ["month"]],
        ["年月日禄", ["day"]],
        ["夾四柱禄", ["year", "month"]],
        ["紅四柱艶", ["hour"]]
      ]
    );

    assert.deepEqual(
      calculateSpecialStars({
        year: pillar("甲", "子"),
        month: pillar("乙", "巳"),
        day: pillar("癸", "丑"),
        hour: pillar("丙", "寅")
      })
        .matches.filter((match) => match.basis === "dayStem")
        .map((match) => [match.star, match.matchedPillars]),
      [
        ["羊刃", ["day"]],
        ["暗禄", ["day"]],
        ["金輿", ["hour"]],
        ["天乙貴人", ["month"]],
        ["太極貴人", ["month"]],
        ["年月日禄", ["year"]],
        ["夾四柱禄", ["day"]],
        ["流四柱霞", ["hour"]]
      ]
    );
  });

  it("detects month-branch based special stars", () => {
    const chart = calculateChart({
      birthDate: "2000-05-08",
      birthTime: "15:54",
      gender: "male",
      birthPlace: { label: "Okayama", longitude: 133.93 },
      timezone: "Asia/Tokyo",
      useLocationCorrection: true
    });

    assert.deepEqual(specialStarMap(chart, "monthBranch"), {
      天徳貴人: ["month"],
      月徳貴人: ["year"],
      天徳合: ["day", "hour"]
    });
  });

  it("detects year/day-branch and pillar-ganzhi based special stars", () => {
    const chart = calculateChart({
      birthDate: "1998-08-18",
      birthTime: "11:18",
      gender: "female",
      birthPlace: { label: "unknown", longitude: 135 },
      timezone: "Asia/Tokyo",
      useLocationCorrection: false
    });

    assert.deepEqual(specialStarMap(chart, "yearDayBranch"), {
      駅馬: ["month"],
      劫殺: ["year"],
      咸池: ["hour"]
    });
    assert.deepEqual(specialStarMap(chart, "pillarGanzhi"), {});
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateChart, guardianRuleCount } from "../src/index.js";

describe("guardian deity", () => {
  it("contains the full day-stem by month-branch table", () => {
    assert.equal(guardianRuleCount(), 120);
  });

  it("returns the guardian stems visible in the Fujiwara reference chart", () => {
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
        status: chart.guardianDeity.status,
        basis: [chart.guardianDeity.dayStem, chart.guardianDeity.monthBranch],
        guardianStems: chart.guardianDeity.guardianStems,
        source: chart.guardianDeity.source
      },
      {
        status: "known",
        basis: ["丙", "巳"],
        guardianStems: ["乙", "庚"],
        source: "reference-chart"
      }
    );
  });

  it("returns the guardian stems visible in the 1971 reference image", () => {
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
        status: chart.guardianDeity.status,
        basis: [chart.guardianDeity.dayStem, chart.guardianDeity.monthBranch],
        guardianStems: chart.guardianDeity.guardianStems,
        source: chart.guardianDeity.source
      },
      {
        status: "known",
        basis: ["丁", "午"],
        guardianStems: ["壬", "庚"],
        source: "reference-chart"
      }
    );
  });

  it("returns transcribed almanac table values for non-reference pairs", () => {
    const chart = calculateChart({
      birthDate: "2000-02-10",
      birthTime: "12:00",
      gender: "male",
      birthPlace: { label: "unknown", longitude: 135 },
      timezone: "Asia/Tokyo",
      useLocationCorrection: false
    });

    assert.equal(chart.guardianDeity.status, "known");
    assert.equal(chart.guardianDeity.source, "almanac-table");
    assert.equal(chart.guardianDeity.guardianStems.length > 0, true);
  });
});

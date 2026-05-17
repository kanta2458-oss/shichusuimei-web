import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { activeHiddenStem, daysFromMonthSolarTerm, hiddenStemRuleCount, representativeHiddenStem } from "../src/index.js";

describe("hidden stem almanac table", () => {
  it("contains all twelve branch rows", () => {
    assert.equal(hiddenStemRuleCount(), 12);
  });

  it("selects the active month hidden stem from elapsed days after solar term", () => {
    assert.equal(daysFromMonthSolarTerm("2000-05-08", "15:50", "巳"), 3);
    assert.equal(activeHiddenStem("巳", 3), "戊");
    assert.equal(activeHiddenStem("巳", 8), "庚");
    assert.equal(activeHiddenStem("巳", 20), "丙");
  });

  it("uses checked almanac times for 1997 and 1998 elapsed-day calculations", () => {
    assert.equal(daysFromMonthSolarTerm("1997-06-21", "02:40", "午"), 15);
    assert.equal(activeHiddenStem("午", 15), "己");
    assert.equal(daysFromMonthSolarTerm("1998-08-18", "11:18", "申"), 10);
    assert.equal(activeHiddenStem("申", 10), "壬");
  });

  it("keeps representative hidden stems available for non-month pillars", () => {
    assert.equal(representativeHiddenStem("辰"), "戊");
    assert.equal(representativeHiddenStem("寅"), "甲");
    assert.equal(representativeHiddenStem("申"), "庚");
  });
});

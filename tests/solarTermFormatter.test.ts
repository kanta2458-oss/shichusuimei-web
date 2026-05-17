import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatSolarTermYear, formatSolarTermYears, normalizeSolarTermYearInput, parseSolarTermValue } from "../src/solarTermFormatter.js";

describe("solar term input formatter", () => {
  const year2000 = {
    "1": "5-15:52",
    "2": "4-21:42",
    "3": "5-15:44",
    "4": "4-20:33",
    "5": "5-13:51",
    "6": "5-18:00",
    "7": "7-4:15",
    "8": "7-14:04",
    "9": "7-17:01",
    "10": "8-8:40",
    "11": "7-11:50",
    "12": "7-4:39"
  };

  it("parses almanac day-hour-minute strings", () => {
    assert.deepEqual(parseSolarTermValue("五-13・51", 5), { month: 5, day: 5, hour: 13, minute: 51 });
    assert.deepEqual(parseSolarTermValue("5 13:51", 5), { month: 5, day: 5, hour: 13, minute: 51 });
  });

  it("normalizes 12 monthly inputs into branch-keyed terms", () => {
    const normalized = normalizeSolarTermYearInput(year2000);

    assert.deepEqual(normalized["寅"], { month: 2, day: 4, hour: 21, minute: 42 });
    assert.deepEqual(normalized["巳"], { month: 5, day: 5, hour: 13, minute: 51 });
    assert.deepEqual(normalized["子"], { month: 12, day: 7, hour: 4, minute: 39 });
  });

  it("formats one year as a paste-ready TypeScript block", () => {
    assert.equal(
      formatSolarTermYear(2000, year2000),
      [
        "  2000: {",
        "    丑: term(1, 5, 15, 52),",
        "    寅: term(2, 4, 21, 42),",
        "    卯: term(3, 5, 15, 44),",
        "    辰: term(4, 4, 20, 33),",
        "    巳: term(5, 5, 13, 51),",
        "    午: term(6, 5, 18, 0),",
        "    未: term(7, 7, 4, 15),",
        "    申: term(8, 7, 14, 4),",
        "    酉: term(9, 7, 17, 1),",
        "    戌: term(10, 8, 8, 40),",
        "    亥: term(11, 7, 11, 50),",
        "    子: term(12, 7, 4, 39)",
        "  }"
      ].join("\n")
    );
  });

  it("sorts multiple years before formatting", () => {
    const output = formatSolarTermYears({ "2001": year2000, "2000": year2000 });

    assert.equal(output.startsWith("  2000:"), true);
  });

  it("rejects missing months", () => {
    assert.throws(() => normalizeSolarTermYearInput({ "1": "5-15:52" }), /Missing month 2/);
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateChart } from "../src/index.js";
import { addMinutesToTime, dayPillar, hourPillar, monthPillar, yearPillar } from "../src/calendar.js";
import { voidBranches } from "../src/ganzhi.js";
import { getSolarTermStart } from "../src/solarTerms.js";

const okayamaMinamiChidoricho = {
  label: "岡山県岡山市南区千鳥町",
  longitude: 133.93
};

describe("藤原幹太 基準ケース", () => {
  const chart = calculateChart({
    birthDate: "2000-05-08",
    birthTime: "15:54",
    gender: "male",
    birthPlace: okayamaMinamiChidoricho,
    timezone: "Asia/Tokyo",
    useLocationCorrection: true
  });

  it("四柱と60干支番号が鑑定書と一致する", () => {
    assert.deepEqual(
      {
        year: [chart.pillars.year.ganzhi, chart.pillars.year.number],
        month: [chart.pillars.month.ganzhi, chart.pillars.month.number],
        day: [chart.pillars.day.ganzhi, chart.pillars.day.number],
        hour: [chart.pillars.hour?.ganzhi, chart.pillars.hour?.number]
      },
      {
        year: ["庚辰", 17],
        month: ["辛巳", 18],
        day: ["丙寅", 3],
        hour: ["丙申", 33]
      }
    );
  });

  it("空亡が戌亥になる", () => {
    assert.equal(chart.voidBranches, "戌亥");
    assert.equal(voidBranches(chart.pillars.day.number), "戌亥");
  });

  it("大運が鑑定書の並びと一致する", () => {
    assert.deepEqual(
      chart.luckPillars.map((luck) => [luck.startAge, luck.endAge, luck.pillar.ganzhi, luck.pillar.tenGod, luck.pillar.twelveStage]),
      [
        [0, 8, "辛巳", "正財", "建禄"],
        [9, 18, "壬午", "偏官", "帝旺"],
        [19, 28, "癸未", "正官", "衰"],
        [29, 38, "甲申", "偏印", "病"],
        [39, 48, "乙酉", "印綬", "死"],
        [49, 58, "丙戌", "比肩", "墓"],
        [59, 68, "丁亥", "劫財", "絶"],
        [69, 78, "戊子", "食神", "胎"],
        [79, 88, "己丑", "傷官", "養"],
        [89, 98, "庚寅", "偏財", "長生"]
      ]
    );
  });

  it("流年運は鑑定書の2022年から2031年の並びと一致する", () => {
    assert.deepEqual(
      chart.annualFortunes.map((fortune) => [
        fortune.year,
        fortune.pillar.ganzhi,
        fortune.pillar.tenGod,
        fortune.pillar.twelveStage
      ]),
      [
        [2022, "壬寅", "偏官", "長生"],
        [2023, "癸卯", "正官", "沐浴"],
        [2024, "甲辰", "偏印", "冠帯"],
        [2025, "乙巳", "印綬", "建禄"],
        [2026, "丙午", "比肩", "帝旺"],
        [2027, "丁未", "劫財", "衰"],
        [2028, "戊申", "食神", "病"],
        [2029, "己酉", "傷官", "死"],
        [2030, "庚戌", "偏財", "墓"],
        [2031, "辛亥", "正財", "絶"]
      ]
    );
  });

  it("岡山市南区千鳥町の経度補正後も申刻のまま", () => {
    assert.equal(Math.round(chart.locationCorrection.offsetMinutes), -4);
    assert.equal(chart.locationCorrection.correctedTime, "15:50");
    assert.equal(chart.hourComparison?.changedByCorrection, false);
    assert.equal(chart.hourComparison?.uncorrected?.ganzhi, "丙申");
    assert.equal(chart.hourComparison?.corrected?.ganzhi, "丙申");
  });
});

describe("暦計算の境界", () => {
  it("年柱は立春前を前年扱いにする", () => {
    assert.equal(yearPillar("2000-02-03").ganzhi, "己卯");
    assert.equal(yearPillar("2000-02-04").ganzhi, "庚辰");
  });

  it("月柱は節入り日で切り替える", () => {
    assert.equal(monthPillar("2000-05-04").ganzhi, "庚辰");
    assert.equal(monthPillar("2000-05-05").ganzhi, "辛巳");
  });

  it("2000年の節入り時刻は参照万年暦の時刻で切り替える", () => {
    assert.equal(yearPillar("2000-02-04", "21:41").ganzhi, "己卯");
    assert.equal(yearPillar("2000-02-04", "21:42").ganzhi, "庚辰");
    assert.equal(monthPillar("2000-05-05", "13:50").ganzhi, "庚辰");
    assert.equal(monthPillar("2000-05-05", "13:51").ganzhi, "辛巳");
  });

  it("参照万年暦から読んだ1997年から2002年の節入り時刻を保持する", () => {
    assert.deepEqual(getSolarTermStart(1997, "寅"), { month: 2, day: 4, hour: 4, minute: 3 });
    assert.deepEqual(getSolarTermStart(1997, "午"), { month: 6, day: 6, hour: 0, minute: 34 });
    assert.deepEqual(getSolarTermStart(1998, "申"), { month: 8, day: 8, hour: 2, minute: 21 });
    assert.deepEqual(getSolarTermStart(1998, "子"), { month: 12, day: 7, hour: 17, minute: 3 });
    assert.deepEqual(getSolarTermStart(1999, "寅"), { month: 2, day: 4, hour: 15, minute: 58 });
    assert.deepEqual(getSolarTermStart(1999, "巳"), { month: 5, day: 6, hour: 8, minute: 2 });
    assert.deepEqual(getSolarTermStart(2000, "寅"), { month: 2, day: 4, hour: 21, minute: 42 });
    assert.deepEqual(getSolarTermStart(2000, "巳"), { month: 5, day: 5, hour: 13, minute: 51 });
    assert.deepEqual(getSolarTermStart(2001, "寅"), { month: 2, day: 4, hour: 3, minute: 31 });
    assert.deepEqual(getSolarTermStart(2002, "寅"), { month: 2, day: 4, hour: 9, minute: 24 });
  });

  it("1999年も参照万年暦の節入り時刻で月柱を切り替える", () => {
    assert.equal(monthPillar("1999-05-06", "08:01").ganzhi, "戊辰");
    assert.equal(monthPillar("1999-05-06", "08:02").ganzhi, "己巳");
  });

  it("1997年と1998年も参照万年暦の節入り時刻で月柱を切り替える", () => {
    assert.equal(monthPillar("1997-06-06", "00:33").ganzhi, "乙巳");
    assert.equal(monthPillar("1997-06-06", "00:34").ganzhi, "丙午");
    assert.equal(monthPillar("1998-08-08", "02:20").ganzhi, "己未");
    assert.equal(monthPillar("1998-08-08", "02:21").ganzhi, "庚申");
  });

  it("2001年と2002年も参照万年暦の立春時刻で年柱を切り替える", () => {
    assert.equal(yearPillar("2001-02-04", "03:30").ganzhi, "庚辰");
    assert.equal(yearPillar("2001-02-04", "03:31").ganzhi, "辛巳");
    assert.equal(yearPillar("2002-02-04", "09:23").ganzhi, "辛巳");
    assert.equal(yearPillar("2002-02-04", "09:24").ganzhi, "壬午");
  });

  it("日柱は基準命式から60日循環で算出する", () => {
    assert.equal(dayPillar("2000-05-08").ganzhi, "丙寅");
    assert.equal(dayPillar("2000-05-09").ganzhi, "丁卯");
  });

  it("時柱は23時台を子刻として扱う", () => {
    assert.equal(hourPillar("丙", "15:54").ganzhi, "丙申");
    assert.equal(hourPillar("丙", "23:30").ganzhi, "戊子");
  });

  it("時刻補正は24時間をまたいでも正規化する", () => {
    assert.equal(addMinutesToTime("00:02", -4), "23:58");
  });
});

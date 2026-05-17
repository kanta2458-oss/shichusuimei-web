import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateChart } from "../src/index.js";
import {
  buildNotionTemplate,
  defaultChartFormState,
  formatSpecialStarBasis,
  formatSpecialStarPillars,
  formStateToChartInput,
  summarizeChart
} from "../web/chartForm.js";
import { googleMapsScriptUrl } from "../web/geocoding.js";
import {
  addChartHistoryItem,
  clearChartHistory,
  deleteChartHistoryItem,
  loadChartHistory,
  type BrowserStorageLike,
  type SavedChartHistoryItem
} from "../web/history.js";

class MemoryStorage implements BrowserStorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

function historyItem(id: string): SavedChartHistoryItem {
  const input = formStateToChartInput(defaultChartFormState());
  const chart = calculateChart(input);
  return {
    id,
    createdAt: "2026-01-01T00:00:00.000Z",
    displayName: input.birthPlace.label,
    input,
    summary: summarizeChart(chart)
  };
}

describe("web support modules", () => {
  it("converts form state into the chart input used by the engine", () => {
    const input = formStateToChartInput(defaultChartFormState());

    assert.deepEqual(input, {
      birthDate: "2000-05-08",
      birthTime: "15:54",
      gender: "male",
      birthPlace: {
        label: "岡山県岡山市南区千鳥町",
        longitude: 133.93
      },
      timezone: "Asia/Tokyo",
      useLocationCorrection: true
    });
  });

  it("summarizes a calculated chart for local history storage", () => {
    const chart = calculateChart(formStateToChartInput(defaultChartFormState()));

    assert.deepEqual(summarizeChart(chart), {
      pillars: {
        year: "庚辰",
        month: "辛巳",
        day: "丙寅",
        hour: "丙申"
      },
      voidBranches: "戌亥",
      luckStartAge: 9,
      luckDirection: "forward",
      powerTotal: -4,
      guardianStems: ["乙", "庚"],
      specialStarCount: 12
    });
  });

  it("stores, loads, deletes, and clears local chart history", () => {
    const storage = new MemoryStorage();
    const first = historyItem("first");
    const second = historyItem("second");

    assert.deepEqual(loadChartHistory(storage), []);
    assert.deepEqual(addChartHistoryItem(storage, first).map((item) => item.id), ["first"]);
    assert.deepEqual(addChartHistoryItem(storage, second).map((item) => item.id), ["second", "first"]);
    assert.deepEqual(loadChartHistory(storage).map((item) => item.id), ["second", "first"]);
    assert.deepEqual(deleteChartHistoryItem(storage, "second").map((item) => item.id), ["first"]);

    clearChartHistory(storage);
    assert.deepEqual(loadChartHistory(storage), []);
  });

  it("formats special star display labels", () => {
    assert.equal(formatSpecialStarBasis("dayStem"), "日干");
    assert.equal(formatSpecialStarBasis("monthBranch"), "月支");
    assert.equal(formatSpecialStarBasis("yearDayBranch"), "年支・日支");
    assert.equal(formatSpecialStarBasis("pillarGanzhi"), "干支");
    assert.equal(formatSpecialStarPillars(["year", "day", "hour"]), "年柱・日柱・時柱");
  });

  it("builds a Notion-ready markdown template from a chart", () => {
    const chart = calculateChart(formStateToChartInput(defaultChartFormState()));
    const template = buildNotionTemplate(chart);

    assert.equal(template.includes("# 四柱推命 鑑定メモ"), true);
    assert.equal(template.includes("- 生年月日: 2000-05-08"), true);
    assert.equal(template.includes("| 年柱 | 庚辰 | #17 | 偏財 | 冠帯 | 庚/辰 |"), true);
    assert.equal(template.includes("- 空亡: 戌亥"), true);
    assert.equal(template.includes("- 守護神: 乙・庚"), true);
    assert.equal(template.includes("## 鑑定メモ"), true);
  });

  it("builds a Google Maps script URL without embedding user input", () => {
    const url = googleMapsScriptUrl("test-key");

    assert.equal(url.startsWith("https://maps.googleapis.com/maps/api/js?"), true);
    assert.equal(url.includes("key=test-key"), true);
    assert.equal(url.includes("libraries=places"), true);
    assert.equal(url.includes("language=ja"), true);
    assert.equal(url.includes("region=JP"), true);
  });
});

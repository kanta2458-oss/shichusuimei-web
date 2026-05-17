import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatChart, parseChartCliArgs, runChartCli } from "../src/cli.js";
import { calculateChart } from "../src/index.js";

describe("chart cli", () => {
  it("parses required arguments", () => {
    assert.deepEqual(parseChartCliArgs(["2000-05-08", "15:54", "male", "133.93"]), {
      birthDate: "2000-05-08",
      birthTime: "15:54",
      gender: "male",
      birthPlace: {
        label: "longitude 133.93",
        longitude: 133.93
      },
      timezone: "Asia/Tokyo",
      useLocationCorrection: true
    });
  });

  it("accepts Japanese gender labels and disabled correction", () => {
    const input = parseChartCliArgs(["1971-07-01", "05:13", "女性", "135", "--no-correction"]);

    assert.equal(input.gender, "female");
    assert.equal(input.useLocationCorrection, false);
  });

  it("formats the Fujiwara reference chart", () => {
    const output = runChartCli(["2000-05-08", "15:54", "male", "133.93"]);

    assert.equal(output.includes("年柱: 庚辰"), true);
    assert.equal(output.includes("月柱: 辛巳"), true);
    assert.equal(output.includes("日柱: 丙寅"), true);
    assert.equal(output.includes("時柱: 丙申"), true);
    assert.equal(output.includes("空亡: 戌亥"), true);
    assert.equal(output.includes("開始=9歳"), true);
    assert.equal(output.includes("空亡アンカー=甲戌"), true);
    assert.equal(output.includes("守護神: 乙・庚"), true);
  });

  it("formats the 1971 reference chart", () => {
    const output = formatChart(
      calculateChart({
        birthDate: "1971-07-01",
        birthTime: "05:13",
        gender: "female",
        birthPlace: { label: "unknown", longitude: 135 },
        timezone: "Asia/Tokyo",
        useLocationCorrection: false
      })
    );

    assert.equal(output.includes("年柱: 辛亥"), true);
    assert.equal(output.includes("開始=2歳"), true);
  });

  it("rejects invalid arguments", () => {
    assert.throws(() => parseChartCliArgs(["2000-05-08"]), /Usage/);
    assert.throws(() => parseChartCliArgs(["2000-05-08", "15:54", "other", "135"]), /Invalid gender/);
    assert.throws(() => parseChartCliArgs(["2000-05-08", "15:54", "male", "999"]), /Invalid longitude/);
  });
});

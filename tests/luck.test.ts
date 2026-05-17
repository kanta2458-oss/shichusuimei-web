import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateLuckStart } from "../src/luck.js";

describe("luck start calculation", () => {
  it("uses forward luck for male yang-year and female yin-year charts", () => {
    assert.deepEqual(
      {
        fujiwara: calculateLuckStart("2000-05-08", "15:50", "male", "庚").startAge,
        image1971: calculateLuckStart("1971-07-01", "05:13", "female", "辛").startAge
      },
      {
        fujiwara: 9,
        image1971: 2
      }
    );
  });

  it("uses backward luck for male yin-year and female yang-year charts", () => {
    assert.equal(calculateLuckStart("1971-07-01", "05:13", "male", "辛").direction, "backward");
    assert.equal(calculateLuckStart("2000-05-08", "15:50", "female", "庚").direction, "backward");
  });
});

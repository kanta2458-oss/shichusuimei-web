import { readFileSync } from "node:fs";
import { formatSolarTermYears } from "../dist/src/solarTermFormatter.js";

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: npm.cmd run format:solar-terms -- path/to/input.json");
  process.exit(1);
}

const input = JSON.parse(readFileSync(filePath, "utf8"));
const years = input.years ?? input;

console.log(formatSolarTermYears(years));

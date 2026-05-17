import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY ?? "";
const config = `window.__SHICHUSUIMEI_CONFIG__ = ${JSON.stringify({ googleMapsApiKey: apiKey })};\n`;

for (const target of [join(root, "runtime-config.js"), join(root, "dist-web", "runtime-config.js")]) {
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, config, "utf8");
}

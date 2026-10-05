import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const outfile = path.join(process.cwd(), "node_modules/.cache/totals-check.mjs");
fs.mkdirSync(path.dirname(outfile), { recursive: true });

await esbuild.build({
  entryPoints: ["src/data/calculations.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile,
  logLevel: "silent",
});

const mod = await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);
const money = mod.money;
console.log(JSON.stringify(money, null, 2));

const expected = {
  documentedOre: 289505,
  excludedOre: 66135,
  housingOre: 223370,
};

for (const key of Object.keys(expected)) {
  if (money[key] !== expected[key]) {
    console.error(`${key}: ${money[key]} !== ${expected[key]}`);
    process.exit(1);
  }
}

console.log("Kontrolsummer stemmer.");

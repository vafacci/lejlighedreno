/**
 * Kontrollerer at hvert billede, der henvises til i data, findes i begge web-størrelser,
 * og at der er målt en ramme for det.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const photos = [...read("src/data/images.ts").matchAll(/photo\(\s*"([^"]+)"/g)].map((m) => m[1]);
const receipts = [...read("src/data/receipts.ts").matchAll(/file: "([^"]+)"/g)].map((m) => m[1]);
const referenced = [...photos, ...receipts];
const unique = [...new Set(referenced)];

const frames = JSON.parse(read("src/data/image-frames.json"));

let failed = false;

const duplicates = referenced.filter((file, index) => referenced.indexOf(file) !== index);
if (duplicates.length) {
  console.error(`Dublerede filnavne i data: ${[...new Set(duplicates)].join(", ")}`);
  failed = true;
}

const missing = [];
for (const file of unique) {
  const base = file.replace(/\.[^.]+$/, ".jpg");
  for (const variant of ["preview", "full"]) {
    if (!fs.existsSync(path.join(root, "public/assets", variant, base))) {
      missing.push(`${variant}/${base}`);
    }
  }
  if (!frames[file]) missing.push(`mål for ${file}`);
}

console.log(`Billeder i data: ${photos.length} af arbejdet + ${receipts.length} kvitteringer`);

if (missing.length) {
  console.error("Mangler:");
  for (const entry of missing) console.error(`- ${entry}`);
  failed = true;
} else {
  console.log("Alle refererede billeder findes i begge størrelser.");
}

const unused = Object.keys(frames)
  .filter((file) => !unique.includes(file))
  .sort();
if (unused.length) {
  console.log(`Originaler uden brug på siden (${unused.length}): ${unused.join(", ")}`);
}

if (failed) process.exit(1);

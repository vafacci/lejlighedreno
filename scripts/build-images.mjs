/**
 * Skalerer originalbillederne i originals/ til to web-størrelser i public/assets/.
 * Originalerne ændres ikke. Der sker ingen beskæring, retouchering eller farvejustering.
 *
 * Kør: npm run images
 */
import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

const SOURCE = "originals";
const OUT = "public/assets";

/** Længste kant i pixels. Kvitteringer får mere, så teksten kan læses. */
const SIZES = {
  preview: { photo: 1000, receipt: 1100, quality: 5 },
  full: { photo: 2200, receipt: 2600, quality: 3 },
};

const RECEIPTS = new Set([
  "IMG_7775", "IMG_7776", "IMG_7777", "IMG_7778", "IMG_7779", "IMG_7780",
  "IMG_7781", "IMG_7782", "IMG_7783", "IMG_44091", "IMG_44061",
]);

/** JPEG Exif Orientation (1 = normal). PNG har ingen rotation. */
function jpegOrientation(file) {
  const data = fs.readFileSync(file);
  if (data[0] !== 0xff || data[1] !== 0xd8) return 1;
  let i = 2;
  while (i + 4 < data.length) {
    if (data[i] !== 0xff) break;
    const marker = data[i + 1];
    const size = data.readUInt16BE(i + 2);
    if (marker === 0xe1 && data.subarray(i + 4, i + 10).toString("ascii") === "Exif\0\0") {
      const tiff = i + 10;
      const le = data.toString("ascii", tiff, tiff + 2) === "II";
      const u16 = (offset) => (le ? data.readUInt16LE(offset) : data.readUInt16BE(offset));
      const u32 = (offset) => (le ? data.readUInt32LE(offset) : data.readUInt32BE(offset));
      let entry = tiff + u32(tiff + 4);
      const count = u16(entry);
      entry += 2;
      for (let n = 0; n < count; n += 1, entry += 12) {
        if (u16(entry) === 0x0112) return u16(entry + 8);
      }
      return 1;
    }
    if (marker === 0xda) break;
    i += 2 + size;
  }
  return 1;
}

function rotateFilter(orientation) {
  switch (orientation) {
    case 3:
      return "transpose=1,transpose=1";
    case 6:
      return "transpose=1";
    case 8:
      return "transpose=2";
    default:
      return null;
  }
}

async function convert(source, target, longEdge, quality) {
  const filters = [];
  const rotate = rotateFilter(jpegOrientation(source));
  if (rotate) filters.push(rotate);
  filters.push(
    `scale=${longEdge}:${longEdge}:force_original_aspect_ratio=decrease:flags=lanczos`,
    "scale=trunc(iw/2)*2:trunc(ih/2)*2",
  );
  await run("ffmpeg", [
    "-y",
    "-v",
    "error",
    "-noautorotate",
    "-i",
    source,
    "-vf",
    filters.join(","),
    "-q:v",
    String(quality),
    "-pix_fmt",
    "yuvj420p",
    target,
  ]);
  const { stdout } = await run("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height",
    "-of",
    "csv=p=0:s=x",
    target,
  ]);
  const [w, h] = stdout.trim().split("x").map(Number);
  return { w, h };
}

const sources = fs
  .readdirSync(SOURCE)
  .filter((name) => /\.(jpe?g|png)$/i.test(name))
  .sort();

for (const variant of Object.keys(SIZES)) {
  fs.mkdirSync(path.join(OUT, variant), { recursive: true });
}

/** Rå gråtoneværdier fra en stribe af billedet, brugt til at finde sorte bjælker. */
async function strip(file, filter) {
  const { stdout } = await run(
    "ffmpeg",
    ["-v", "error", "-i", file, "-vf", `${filter},format=gray`, "-f", "rawvideo", "-"],
    { encoding: "buffer", maxBuffer: 64 * 1024 * 1024 },
  );
  return stdout;
}

const BLACK = 24;

/**
 * Finder motivets udsnit i filer med sorte bjælker (skærmbilleder fra telefon).
 * Der beskæres intet i filen; udsnittet bruges kun til visningen.
 */
async function contentBox(file, width) {
  const rows = await strip(file, "crop=8:ih:(iw-8)/2:0");
  const height = rows.length / 8;
  const lit = (y) => rows.subarray(y * 8, (y + 1) * 8).some((v) => v > BLACK);

  let top = 0;
  let bottom = height - 1;
  while (top < height && !lit(top)) top += 1;
  while (bottom > top && !lit(bottom)) bottom -= 1;

  // Kun vandrette bjælker trimmes. Mørke kanter i selve motivet skal blive stående.
  const trimmed = top > 0 || bottom < height - 1;
  return {
    width,
    height,
    content: trimmed ? { x: 0, y: top, width, height: bottom - top + 1 } : undefined,
  };
}

const manifest = {};

for (const name of sources) {
  const base = name.replace(/\.[^.]+$/, "");
  const source = path.join(SOURCE, name);
  const isReceipt = RECEIPTS.has(base);
  let fullTarget = "";
  let fullSize = { w: 0, h: 0 };

  for (const [variant, config] of Object.entries(SIZES)) {
    const target = path.join(OUT, variant, `${base}.jpg`);
    const longEdge = isReceipt ? config.receipt : config.photo;
    const size = await convert(source, target, longEdge, config.quality);
    if (variant === "full") {
      fullTarget = target;
      fullSize = size;
    }
  }

  const frame = await contentBox(fullTarget, fullSize.w);
  manifest[name] = frame;
  const crop = frame.content ? ` · motiv ${frame.content.width}x${frame.content.height}` : "";
  console.log(`${name} → ${frame.width}x${frame.height}${crop}`);
}

fs.writeFileSync("src/data/image-frames.json", `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`\n${sources.length} billeder skaleret. Mål skrevet til src/data/image-frames.json.`);

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

async function dimensions(file) {
  const { stdout } = await run("ffprobe", [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=width,height",
    "-show_entries", "stream_side_data=rotation",
    "-of", "json",
    file,
  ]);
  const stream = JSON.parse(stdout).streams[0];
  const rotation = Math.abs(Number(stream.side_data_list?.[0]?.rotation ?? 0));
  const turned = rotation === 90 || rotation === 270;
  return {
    width: turned ? stream.height : stream.width,
    height: turned ? stream.width : stream.height,
  };
}

async function convert(source, target, longEdge, quality) {
  const { width, height } = await dimensions(source);
  const scale = Math.min(1, longEdge / Math.max(width, height));
  const w = Math.round((width * scale) / 2) * 2;
  const h = Math.round((height * scale) / 2) * 2;
  await run("ffmpeg", [
    "-y", "-v", "error",
    "-i", source,
    "-vf", `scale=${w}:${h}:flags=lanczos`,
    "-q:v", String(quality),
    "-pix_fmt", "yuvj420p",
    target,
  ]);
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

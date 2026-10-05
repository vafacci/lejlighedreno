import measured from "./image-frames.json";
import type { Frame } from "./types";

type MeasuredFrame = {
  width: number;
  height: number;
  content?: { x: number; y: number; width: number; height: number };
};

const frames = measured as Record<string, MeasuredFrame>;

const FALLBACK: Frame = { width: 3, height: 4 };

/**
 * Billedets mål, målt på den genererede fil af `npm run images`.
 * Målene skrives aldrig i hånden, så visningen ikke kan komme ud af trit med filerne.
 */
export function frameFor(file: string): Frame {
  const frame = frames[file];
  if (!frame) {
    console.warn(`Mangler mål for billede: ${file}`);
    return FALLBACK;
  }
  return frame;
}

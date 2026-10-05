/**
 * Billederne findes i to web-størrelser, genereret fra originalerne med `npm run images`.
 * Skift kun stierne her, hvis mapperne flyttes.
 */
const ASSET_BASE = "/assets";

function webName(file: string): string {
  return file.replace(/\.[^.]+$/, ".jpg");
}

/** Lille version til gallerier. */
export function previewSrc(file: string): string {
  return `${ASSET_BASE}/preview/${webName(file)}`;
}

/** Stor version til lightbox og visning i fuld størrelse. */
export function fullSrc(file: string): string {
  return `${ASSET_BASE}/full/${webName(file)}`;
}

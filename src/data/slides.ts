import { sortedReceipts } from "./calculations";
import { formatDate, formatOre, toOre } from "./format";
import type { LightboxSlide } from "./types";

/** Kvitteringer i samme rækkefølge som kvitteringsgalleriet, så indeks passer begge steder. */
export function receiptSlides(): LightboxSlide[] {
  return sortedReceipts().map((receipt) => ({
    src: receipt.full,
    download: receipt.full,
    file: receipt.file,
    alt: `Kvittering fra ${receipt.store}, ${formatDate(receipt.date)}`,
    caption: `${receipt.store}, ${formatDate(receipt.date)}, ${formatOre(toOre(receipt.total))}`,
    frame: receipt.frame,
  }));
}

export function receiptSlideIndex(receiptId: string): number {
  return Math.max(
    sortedReceipts().findIndex((receipt) => receipt.id === receiptId),
    0,
  );
}

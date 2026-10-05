import { toOre } from "./format";
import { receipts } from "./receipts";
import type { ExpenseLine, ItemStatus, RoomId } from "./types";

export type { ExpenseLine };

export type MoneyTotals = {
  documentedOre: number;
  excludedOre: number;
  relevantOre: number;
  reviewOre: number;
  housingOre: number;
  receiptCount: number;
};

/**
 * Kontrolsummer fra sagsmaterialet. Bruges kun til at stoppe, hvis data ikke stemmer.
 * Beløb i brugerfladen læses fra `money`, som er udregnet af varelinjer og kvitteringer.
 */
const CONTROL = {
  documentedOre: 289_505,
  excludedOre: 66_135,
  housingOre: 223_370,
} as const;

function fail(message: string): never {
  throw new Error(`Kontrol af beløb fejlede: ${message}`);
}

export function allLines(): ExpenseLine[] {
  return receipts
    .flatMap((receipt) => receipt.items.map((item) => ({ item, receipt })))
    .sort((a, b) => {
      const byDate = a.receipt.date.localeCompare(b.receipt.date);
      if (byDate !== 0) return byDate;
      const byTime = (a.receipt.time ?? "").localeCompare(b.receipt.time ?? "");
      if (byTime !== 0) return byTime;
      return a.item.id.localeCompare(b.item.id);
    });
}

export function linesForRoom(room: RoomId): ExpenseLine[] {
  const rank: Record<ItemStatus, number> = { relevant: 0, review: 1, excluded: 2 };
  return allLines()
    .filter((line) => line.item.rooms?.includes(room))
    .sort(
      (a, b) =>
        rank[a.item.status] - rank[b.item.status] ||
        a.receipt.date.localeCompare(b.receipt.date) ||
        a.item.id.localeCompare(b.item.id),
    );
}

export function receiptsForRoom(room: RoomId) {
  const groups = new Map<string, ExpenseLine[]>();
  for (const line of linesForRoom(room)) {
    const current = groups.get(line.receipt.id) ?? [];
    current.push(line);
    groups.set(line.receipt.id, current);
  }
  return [...groups.values()]
    .filter((lines): lines is [ExpenseLine, ...ExpenseLine[]] => lines.length > 0)
    .map((lines) => ({
      receipt: lines[0].receipt,
      lines,
    }))
    .sort(
      (a, b) =>
        a.receipt.date.localeCompare(b.receipt.date) ||
        (a.receipt.time ?? "").localeCompare(b.receipt.time ?? ""),
    );
}

export function linesByStatus(status: ItemStatus): ExpenseLine[] {
  return allLines().filter((line) => line.item.status === status);
}

export type ExcludedGroup = {
  receiptId: string;
  store: string;
  date: string;
  names: string[];
  totalOre: number;
};

export function excludedGroups(): ExcludedGroup[] {
  return receipts
    .map((receipt) => {
      const items = receipt.items.filter((item) => item.status === "excluded");
      return {
        receiptId: receipt.id,
        store: receipt.store,
        date: receipt.date,
        names: items.map((item) => item.name),
        totalOre: items.reduce((sum, item) => sum + toOre(item.price), 0),
      };
    })
    .filter((group) => group.names.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function receiptIncludedOre(receiptId: string): number {
  const receipt = receipts.find((entry) => entry.id === receiptId);
  if (!receipt) return 0;
  return receipt.items
    .filter((item) => item.status !== "excluded")
    .reduce((sum, item) => sum + toOre(item.price), 0);
}

export function receiptExcludedOre(receiptId: string): number {
  const receipt = receipts.find((entry) => entry.id === receiptId);
  if (!receipt) return 0;
  return receipt.items
    .filter((item) => item.status === "excluded")
    .reduce((sum, item) => sum + toOre(item.price), 0);
}

function sumStatus(status: ItemStatus): number {
  return allLines()
    .filter((line) => line.item.status === status)
    .reduce((sum, line) => sum + toOre(line.item.price), 0);
}

function compute(): MoneyTotals {
  for (const receipt of receipts) {
    const lineSum = receipt.items.reduce((sum, item) => sum + toOre(item.price), 0);
    if (lineSum !== toOre(receipt.total)) {
      fail(`${receipt.id}: linjer ${lineSum} øre !== kvittering ${toOre(receipt.total)} øre`);
    }
  }

  const documentedOre = receipts.reduce((sum, receipt) => sum + toOre(receipt.total), 0);
  const excludedOre = sumStatus("excluded");
  const relevantOre = sumStatus("relevant");
  const reviewOre = sumStatus("review");
  const housingOre = documentedOre - excludedOre;

  if (relevantOre + reviewOre + excludedOre !== documentedOre) {
    fail("Statussummer matcher ikke det samlede kvitteringsbeløb.");
  }
  if (relevantOre + reviewOre !== housingOre) {
    fail("Relevant og til vurdering matcher ikke den foreløbige pulje.");
  }
  if (excludedGroups().reduce((sum, group) => sum + group.totalOre, 0) !== excludedOre) {
    fail("Sammensætningen af ikke-medtagne beløb matcher ikke summen.");
  }

  const included = allLines().filter((line) => line.item.status !== "excluded");
  const withoutRoom = included.filter((line) => !line.item.rooms?.length);
  if (withoutRoom.length > 0) {
    fail(`Mangler rum på: ${withoutRoom.map((line) => line.item.name).join(", ")}`);
  }
  if (!included.some((line) => (line.item.rooms?.length ?? 0) > 1)) {
    fail("Forventede materialer knyttet til flere rum uden at beløbet tælles dobbelt.");
  }

  if (documentedOre !== CONTROL.documentedOre) {
    fail(`samlet dokumenteret ${documentedOre} !== ${CONTROL.documentedOre}`);
  }
  if (excludedOre !== CONTROL.excludedOre) {
    fail(`ikke medtaget ${excludedOre} !== ${CONTROL.excludedOre}`);
  }
  if (housingOre !== CONTROL.housingOre) {
    fail(`foreløbig pulje ${housingOre} !== ${CONTROL.housingOre}`);
  }

  return {
    documentedOre,
    excludedOre,
    relevantOre,
    reviewOre,
    housingOre,
    receiptCount: receipts.length,
  };
}

export const money = compute();

export function sortedReceipts() {
  return [...receipts].sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    if (byDate !== 0) return byDate;
    return (a.time ?? "").localeCompare(b.time ?? "");
  });
}

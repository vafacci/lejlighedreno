import { copy } from "./copy";
import type { RoomId } from "./types";

export const ROOM_LABEL: Record<RoomId, string> = {
  bathroom: "Badeværelse",
  bedroom: "Soveværelse",
  kitchen: "Køkken",
};

export function toOre(kroner: number): number {
  return Math.round(kroner * 100);
}

export function formatOre(amountOre: number): string {
  const negative = amountOre < 0;
  const absolute = Math.abs(amountOre);
  const kroner = Math.trunc(absolute / 100);
  const ore = absolute % 100;
  const grouped = kroner.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${negative ? "−" : ""}${grouped},${ore.toString().padStart(2, "0")} kr.`;
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${day}.${month}.${year}`;
}

export function roomUsage(rooms: RoomId[] | undefined): string {
  if (!rooms?.length) return copy.noRoom;
  return rooms.map((room) => ROOM_LABEL[room]).join(", ");
}

export function otherRoomLabel(rooms: RoomId[] | undefined, current: RoomId): string | null {
  const others = (rooms ?? []).filter((room) => room !== current);
  if (!others.length) return null;
  const names = others.map((room) => ROOM_LABEL[room].toLowerCase());
  return `${copy.alsoLinked} ${names.join(" og ")}. ${copy.countedOnce}`;
}

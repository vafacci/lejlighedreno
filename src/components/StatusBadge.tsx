import { copy } from "../data/copy";
import type { ItemStatus } from "../data/types";

export function StatusBadge({ status }: { status: ItemStatus }) {
  return <span className={`badge badge-${status}`}>{copy.filters[status]}</span>;
}

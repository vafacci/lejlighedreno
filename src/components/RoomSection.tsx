import { copy } from "../data/copy";
import { formatDate, formatOre, otherRoomLabel, toOre } from "../data/format";
import { receiptsForRoom } from "../data/calculations";
import { receiptSlideIndex, receiptSlides } from "../data/slides";
import type { EvidenceImage, LightboxSlide, Room } from "../data/types";
import { Gallery } from "./Gallery";
import { StatusBadge } from "./StatusBadge";

type Props = {
  room: Room;
  images: EvidenceImage[];
  onOpen: (slides: LightboxSlide[], index: number) => void;
};

function featuredFirst(images: EvidenceImage[]): EvidenceImage[] {
  return [...images].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
}

export function RoomSection({ room, images, onOpen }: Props) {
  const visible = images.filter((image) => image.room === room.id && image.include !== false);
  const before = featuredFirst(visible.filter((image) => image.phase === "before"));
  const during = visible.filter((image) => image.phase === "during");
  const after = featuredFirst(visible.filter((image) => image.phase === "after"));
  const ordered = [...before, ...during, ...after];
  const receipts = receiptsForRoom(room.id);
  const hasShared = receipts.some((group) =>
    group.lines.some((line) => (line.item.rooms?.length ?? 0) > 1),
  );

  function open(image: EvidenceImage) {
    const slides: LightboxSlide[] = ordered.map((item) => ({
      src: item.full,
      download: item.full,
      file: item.file,
      alt: item.caption,
      caption: item.caption,
      frame: item.frame,
    }));
    const index = ordered.findIndex((item) => item.file === image.file);
    onOpen(slides, Math.max(index, 0));
  }

  return (
    <section className="room" id={room.id} aria-labelledby={`${room.id}-title`}>
      <div className="wrap">
        <h2 id={`${room.id}-title`}>
          {room.number} · {room.title}
        </h2>
        <p className="lead">{room.intro}</p>

        <div className="two-col">
          <div>
            <h3>{copy.phases.before}</h3>
            <ul className="plain-list">
              {room.beforePoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>{copy.workHeading}</h3>
            <ul className="plain-list">
              {room.workDone.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            {room.workNote ? <p className="fine">{room.workNote}</p> : null}
          </div>
        </div>

        <h3 className="phase-heading">{copy.beforePhotos}</h3>
        <Gallery images={before} onOpen={open} />

        {during.length > 0 ? (
          <>
            <h3 className="phase-heading">{copy.phases.during}</h3>
            <Gallery images={during} onOpen={open} />
          </>
        ) : null}

        <h3 className="phase-heading">{copy.afterPhotos}</h3>
        <p className="lead">{room.result}</p>
        {room.resultNote ? <p className="fine">{room.resultNote}</p> : null}
        <Gallery images={after} onOpen={open} />

        <h3 className="phase-heading">{copy.materialsHeading}</h3>
        {hasShared ? <p className="fine">{copy.materialsLead}</p> : null}
        {receipts.length === 0 ? (
          <p>{copy.noMaterials}</p>
        ) : (
          <ul className="room-receipts">
            {receipts.map((group) => {
              const roomTotal = group.lines.reduce((sum, line) => sum + toOre(line.item.price), 0);
              return (
                <li key={group.receipt.id} className="room-receipt">
                  <div className="room-receipt-head">
                    <div>
                      <p className="material-name">{group.receipt.store}</p>
                      <p className="fine">{formatDate(group.receipt.date)}</p>
                    </div>
                    <div className="material-side">
                      <p className="amount">{formatOre(roomTotal)}</p>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => onOpen(receiptSlides(), receiptSlideIndex(group.receipt.id))}
                      >
                        {copy.seeReceipt}
                      </button>
                    </div>
                  </div>
                  <ul className="room-receipt-items">
                    {group.lines.map((line) => {
                      const shared = otherRoomLabel(line.item.rooms, room.id);
                      return (
                        <li key={line.item.id}>
                          <span>
                            {line.item.name}
                            {shared ? <span className="fine"> · {shared}</span> : null}
                          </span>
                          <span className="room-receipt-item-side">
                            <span className="amount">{formatOre(toOre(line.item.price))}</span>
                            <StatusBadge status={line.item.status} />
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

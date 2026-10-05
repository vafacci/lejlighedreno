import { money, receiptsForRoom } from "../data/calculations";
import { copy } from "../data/copy";
import { formatOre } from "../data/format";
import { evidenceImages } from "../data/images";
import { rooms } from "../data/rooms";

export function Overview() {
  return (
    <section className="overview" id="oversigt" aria-labelledby="oversigt-title">
      <div className="wrap">
        <h2 id="oversigt-title">{copy.overviewHeading}</h2>
        <ol className="room-index">
          {rooms.map((room) => {
            const photos = evidenceImages.filter(
              (image) => image.room === room.id && image.include !== false,
            ).length;
            const purchases = receiptsForRoom(room.id).length;
            return (
              <li key={room.id}>
                <a href={`#${room.id}`}>
                  <span className="room-index-number">{room.number}</span>
                  <span className="room-index-body">
                    <span className="room-index-title">{room.title}</span>
                    <span className="room-index-summary">{room.summary}</span>
                  </span>
                  <span className="room-index-meta">
                    {photos} {copy.photos} · {purchases} {copy.purchases}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>

        <dl className="stats">
          <div>
            <dt>{copy.stats.receipts}</dt>
            <dd>{money.receiptCount}</dd>
          </div>
          <div>
            <dt>{copy.stats.total}</dt>
            <dd>{formatOre(money.documentedOre)}</dd>
          </div>
          <div>
            <dt>{copy.totals.housing}</dt>
            <dd>{formatOre(money.housingOre)}</dd>
          </div>
        </dl>
        <p className="disclaimer">{copy.amountDisclaimer}</p>
      </div>
    </section>
  );
}

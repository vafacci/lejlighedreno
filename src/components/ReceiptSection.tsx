import { receiptExcludedOre, receiptIncludedOre, sortedReceipts } from "../data/calculations";
import { copy } from "../data/copy";
import { formatDate, formatOre, toOre } from "../data/format";
import { receiptSlides } from "../data/slides";
import type { LightboxSlide, Receipt } from "../data/types";
import { StatusBadge } from "./StatusBadge";

type Props = {
  onOpen: (slides: LightboxSlide[], index: number) => void;
};

function receiptStatus(receipt: Receipt) {
  const statuses = new Set(receipt.items.map((item) => item.status));
  if (statuses.size === 1) return receipt.items[0]?.status ?? null;
  return null;
}

export function ReceiptSection({ onOpen }: Props) {
  const list = sortedReceipts();
  const slides = receiptSlides();

  return (
    <section className="receipts" id="kvitteringer" aria-labelledby="kvitteringer-title">
      <div className="wrap">
        <h2 id="kvitteringer-title">{copy.receiptsHeading}</h2>
        <p className="lead">{copy.receiptsLead}</p>
        <div className="receipt-grid">
          {list.map((receipt, index) => {
            const included = receiptIncludedOre(receipt.id);
            const excluded = receiptExcludedOre(receipt.id);
            const mixed = included > 0 && excluded > 0;
            const uniform = receiptStatus(receipt);
            return (
              <article key={receipt.id} className="receipt-card" id={`kvittering-${receipt.id}`}>
                <header className="receipt-head">
                  <h3>{receipt.store}</h3>
                  <p className="fine">{formatDate(receipt.date)}</p>
                </header>
                <ul className="receipt-items">
                  {receipt.items.map((item) => (
                    <li key={item.id}>
                      <span>{item.name}</span>
                      {mixed ? <StatusBadge status={item.status} /> : null}
                    </li>
                  ))}
                </ul>
                <p className="amount receipt-total">{formatOre(toOre(receipt.total))}</p>
                {mixed ? (
                  <div className="receipt-split">
                    <p>
                      {formatOre(included)} {copy.housingOnReceipt}
                    </p>
                    <p>
                      {formatOre(excluded)} {copy.excludedOnReceipt}
                    </p>
                  </div>
                ) : null}
                {uniform ? <StatusBadge status={uniform} /> : null}
                {receipt.note ? <p className="fine">{receipt.note}</p> : null}
                <button type="button" className="button" onClick={() => onOpen(slides, index)}>
                  {copy.seeReceipt}
                </button>
                <details>
                  <summary>{copy.details}</summary>
                  <dl className="detail-list">
                    {receipt.address ? (
                      <div>
                        <dt>{copy.detailLabels.address}</dt>
                        <dd>{receipt.address}</dd>
                      </div>
                    ) : null}
                    {receipt.time ? (
                      <div>
                        <dt>{copy.detailLabels.time}</dt>
                        <dd>{receipt.time}</dd>
                      </div>
                    ) : null}
                    {receipt.reference ? (
                      <div>
                        <dt>{copy.detailLabels.reference}</dt>
                        <dd>{receipt.reference}</dd>
                      </div>
                    ) : null}
                    {receipt.register ? (
                      <div>
                        <dt>{copy.detailLabels.register}</dt>
                        <dd>{receipt.register}</dd>
                      </div>
                    ) : null}
                    {receipt.net != null ? (
                      <div>
                        <dt>{copy.detailLabels.net}</dt>
                        <dd>{formatOre(toOre(receipt.net))}</dd>
                      </div>
                    ) : null}
                    {receipt.vat != null ? (
                      <div>
                        <dt>{copy.detailLabels.vat}</dt>
                        <dd>{formatOre(toOre(receipt.vat))}</dd>
                      </div>
                    ) : null}
                  </dl>
                </details>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

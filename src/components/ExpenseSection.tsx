import { useState } from "react";
import {
  excludedGroups,
  linesByStatus,
  money,
} from "../data/calculations";
import { copy } from "../data/copy";
import { formatDate, formatOre, roomUsage, toOre } from "../data/format";
import type { ItemStatus } from "../data/types";
import { StatusBadge } from "./StatusBadge";

const filters: ItemStatus[] = ["relevant", "review", "excluded"];

export function ExpenseSection() {
  const [filter, setFilter] = useState<ItemStatus>("relevant");
  const lines = linesByStatus(filter);
  const groups = excludedGroups();

  return (
    <section className="expense" id="udgifter" aria-labelledby="udgifter-title">
      <div className="wrap">
        <h2 id="udgifter-title">{copy.expensesHeading}</h2>
        <p className="lead">{copy.expensesLead}</p>

        <dl className="totals">
          <div>
            <dt>{copy.totals.documented}</dt>
            <dd>{formatOre(money.documentedOre)}</dd>
          </div>
          <div>
            <dt>{copy.totals.excluded}</dt>
            <dd>{formatOre(money.excludedOre)}</dd>
          </div>
          <div>
            <dt>{copy.totals.housing}</dt>
            <dd>{formatOre(money.housingOre)}</dd>
          </div>
        </dl>
        <p className="formula">
          {formatOre(money.documentedOre)} − {formatOre(money.excludedOre)} = {formatOre(money.housingOre)} ·{" "}
          {copy.ofWhichRelevant} {formatOre(money.relevantOre)} · {copy.ofWhichReview}{" "}
          {formatOre(money.reviewOre)}
        </p>
        <p className="lead">{copy.assessment}</p>

        <details className="breakdown-details">
          <summary>
            {copy.excludedHeading}: {formatOre(groups.reduce((sum, group) => sum + group.totalOre, 0))}
          </summary>
          <ul className="breakdown">
            {groups.map((group) => (
              <li key={group.receiptId}>
                <span>
                  {group.store} · {formatDate(group.date)}
                </span>
                <span className="fine">{group.names.join(", ")}</span>
                <span className="amount">{formatOre(group.totalOre)}</span>
              </li>
            ))}
          </ul>
        </details>

        <aside className="notice">
          <h3>{copy.aboutTitle}</h3>
          <p>{copy.aboutBody}</p>
        </aside>

        <div className="tabs" role="tablist" aria-label={copy.expensesHeading}>
          {filters.map((status) => (
            <button
              key={status}
              type="button"
              role="tab"
              id={`tab-${status}`}
              aria-selected={filter === status}
              aria-controls="expense-panel"
              onClick={() => setFilter(status)}
            >
              {copy.filters[status]}
              <span className="tab-count">{linesByStatus(status).length}</span>
            </button>
          ))}
        </div>

        <div role="tabpanel" id="expense-panel" aria-labelledby={`tab-${filter}`}>
          <h3 className="filter-heading">{copy.filters[filter]}</h3>
          {lines.length === 0 ? (
            <p>{copy.emptyFilter}</p>
          ) : (
            <div className="lines">
              <div className="line line-head" aria-hidden="true">
                <div>{copy.columns.item}</div>
                <div>{copy.columns.usage}</div>
                <div className="amount">{copy.columns.amount}</div>
                <div>{copy.columns.status}</div>
              </div>
              {lines.map((line) => (
                <article key={line.item.id} className="line">
                  <div>
                    <span className="label">{copy.columns.item}</span>
                    <span className="item-name">{line.item.name}</span>
                    <span className="fine">
                      {line.receipt.store} · {formatDate(line.receipt.date)}
                    </span>
                    {line.item.note ? <span className="fine">{line.item.note}</span> : null}
                  </div>
                  <div>
                    <span className="label">{copy.columns.usage}</span>
                    {roomUsage(line.item.rooms)}
                  </div>
                  <div>
                    <span className="label">{copy.columns.amount}</span>
                    <span className="amount">{formatOre(toOre(line.item.price))}</span>
                  </div>
                  <div>
                    <span className="label">{copy.columns.status}</span>
                    <StatusBadge status={line.item.status} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

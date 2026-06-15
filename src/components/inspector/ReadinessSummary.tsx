import type { ReadinessItem } from "../../domain/readiness";
import type { AppCopy } from "../../i18n";

type ReadinessSummaryProps = {
  readonly copy: AppCopy["readiness"];
  readonly readiness: readonly ReadinessItem[];
};

export function ReadinessSummary({ copy, readiness }: ReadinessSummaryProps) {
  const missingCount = readiness.filter((item) => !item.ok).length;

  return (
    <section className={missingCount === 0 ? "readiness-summary ready" : "readiness-summary missing"}>
      <div>
        <h2>{copy.title}</h2>
        <p>{missingCount === 0 ? copy.ready : copy.missingSummary(missingCount)}</p>
      </div>
      <ul className="readiness-list">
        {readiness.map((item) => (
          <li
            aria-label={copy.itemStatus(copy.labels[item.key], item.ok ? copy.complete : copy.missing)}
            className={item.ok ? "ready" : "missing"}
            key={item.key}
          >
            <span>{item.ok ? copy.complete : copy.missing}</span>
            {copy.labels[item.key]}
          </li>
        ))}
      </ul>
    </section>
  );
}

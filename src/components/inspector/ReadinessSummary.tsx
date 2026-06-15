import type { ReadinessItem } from "../../domain/readiness";

type ReadinessSummaryProps = {
  readonly readiness: readonly ReadinessItem[];
};

export function ReadinessSummary({ readiness }: ReadinessSummaryProps) {
  const missingCount = readiness.filter((item) => !item.ok).length;

  return (
    <section className={missingCount === 0 ? "readiness-summary ready" : "readiness-summary missing"}>
      <div>
        <h2>EPUB 준비 상태</h2>
        <p>{missingCount === 0 ? "내보내기 가능" : `${missingCount}개 항목 필요`}</p>
      </div>
      <ul className="readiness-list">
        {readiness.map((item) => (
          <li className={item.ok ? "ready" : "missing"} key={item.label}>
            <span>{item.ok ? "완료" : "필요"}</span>
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

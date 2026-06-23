import type { AppCopy } from "../../i18n";

type WebScopePanelProps = {
  readonly copy: AppCopy["webScope"];
  readonly importSummary: string;
  readonly onSaveProject: () => void;
};

export function WebScopePanel({ copy, importSummary, onSaveProject }: WebScopePanelProps) {
  const hasImportSummary = importSummary.length > 0;

  return (
    <section className="inspector-section web-scope-panel" aria-labelledby="web-scope-title">
      <div className="scope-head">
        <h2 id="web-scope-title">{copy.sectionTitle}</h2>
        <p className="scope-note">{importSummary || copy.importReportFallback}</p>
      </div>
      <button className="inspector-button scope-cta" type="button" onClick={onSaveProject}>
        {copy.appCta}
      </button>
      <details className="scope-details" open={hasImportSummary}>
        <summary>{copy.appTitle}</summary>
        <div className="scope-columns">
          <div>
            <h3>{copy.suitableTitle}</h3>
            <ul>
              {copy.suitableItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>{copy.appTitle}</h3>
            <p>{copy.appDescription}</p>
            <ul>
              {copy.limitations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </details>
    </section>
  );
}

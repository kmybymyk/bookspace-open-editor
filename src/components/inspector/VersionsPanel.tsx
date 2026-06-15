import type { AppCopy, Locale } from "../../i18n";
import type { ProjectSnapshot } from "../../storage/browserProject";

type VersionsPanelProps = {
  readonly copy: AppCopy["versions"];
  readonly locale: Locale;
  readonly snapshots: readonly ProjectSnapshot[];
  readonly onRestoreSnapshot: (snapshotId: string) => void;
};

export function VersionsPanel({ copy, locale, snapshots, onRestoreSnapshot }: VersionsPanelProps) {
  const timeLocale = locale === "en" ? "en-US" : "ko-KR";

  return (
    <section className="inspector-section">
      <h2>{copy.sectionTitle}</h2>
      {snapshots.length === 0 ? (
        <p className="empty-note">{copy.empty}</p>
      ) : (
        <div className="snapshot-list">
          {snapshots.slice(0, 5).map((snapshot) => (
            <button key={snapshot.id} type="button" onClick={() => onRestoreSnapshot(snapshot.id)}>
              <span>{snapshot.project.metadata.title}</span>
              <small>{copy.reasons[snapshot.reason]} · {new Date(snapshot.createdAt).toLocaleTimeString(timeLocale)}</small>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

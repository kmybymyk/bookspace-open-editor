import type { ProjectSnapshot } from "../../storage/browserProject";

type VersionsPanelProps = {
  readonly snapshots: readonly ProjectSnapshot[];
  readonly onRestoreSnapshot: (snapshotId: string) => void;
};

export function VersionsPanel({ snapshots, onRestoreSnapshot }: VersionsPanelProps) {
  return (
    <section className="inspector-section">
      <h2>로컬 버전</h2>
      {snapshots.length === 0 ? (
        <p className="empty-note">아직 저장된 스냅샷이 없습니다.</p>
      ) : (
        <div className="snapshot-list">
          {snapshots.slice(0, 5).map((snapshot) => (
            <button key={snapshot.id} type="button" onClick={() => onRestoreSnapshot(snapshot.id)}>
              <span>{snapshot.project.metadata.title}</span>
              <small>{snapshot.reason} · {new Date(snapshot.createdAt).toLocaleTimeString("ko-KR")}</small>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

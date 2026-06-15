import { useState } from "react";
import type { BookMetadata, DesignSettings } from "../domain/project";
import type { ReadinessItem } from "../domain/readiness";
import type { ProjectSnapshot } from "../storage/browserProject";
import { CoverPanel } from "./inspector/CoverPanel";
import { DesignPanel } from "./inspector/DesignPanel";
import { EpubMetadataPanel } from "./inspector/EpubMetadataPanel";
import { ReadinessSummary } from "./inspector/ReadinessSummary";
import { VersionsPanel } from "./inspector/VersionsPanel";

type InspectorTab = "epub" | "design" | "versions";

type RightInspectorProps = {
  readonly metadata: BookMetadata;
  readonly design: DesignSettings;
  readonly readiness: readonly ReadinessItem[];
  readonly snapshots: readonly ProjectSnapshot[];
  readonly onMetadataChange: (metadata: BookMetadata) => void;
  readonly onDesignChange: (design: DesignSettings) => void;
  readonly onRestoreSnapshot: (snapshotId: string) => void;
};

export function RightInspector({
  metadata,
  design,
  readiness,
  snapshots,
  onMetadataChange,
  onDesignChange,
  onRestoreSnapshot,
}: RightInspectorProps) {
  const [activeTab, setActiveTab] = useState<InspectorTab>("epub");

  return (
    <aside className="right-pane">
      <ReadinessSummary readiness={readiness} />
      <div className="inspector-tabs" role="tablist" aria-label="오른쪽 패널">
        <button className={activeTab === "epub" ? "active" : ""} type="button" role="tab" aria-selected={activeTab === "epub"} onClick={() => setActiveTab("epub")}>
          EPUB
        </button>
        <button className={activeTab === "design" ? "active" : ""} type="button" role="tab" aria-selected={activeTab === "design"} onClick={() => setActiveTab("design")}>
          디자인
        </button>
        <button className={activeTab === "versions" ? "active" : ""} type="button" role="tab" aria-selected={activeTab === "versions"} onClick={() => setActiveTab("versions")}>
          버전
        </button>
      </div>
      {activeTab === "epub" ? (
        <>
          <EpubMetadataPanel metadata={metadata} onMetadataChange={onMetadataChange} />
          <CoverPanel metadata={metadata} onMetadataChange={onMetadataChange} />
        </>
      ) : null}
      {activeTab === "design" ? <DesignPanel design={design} onDesignChange={onDesignChange} /> : null}
      {activeTab === "versions" ? <VersionsPanel snapshots={snapshots} onRestoreSnapshot={onRestoreSnapshot} /> : null}
    </aside>
  );
}

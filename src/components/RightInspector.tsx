import { useState } from "react";
import type { KeyboardEvent } from "react";
import type { BookMetadata, DesignSettings } from "../domain/project";
import type { ReadinessItem } from "../domain/readiness";
import type { AppCopy, Locale } from "../i18n";
import type { ProjectSnapshot } from "../storage/browserProject";
import { CoverPanel } from "./inspector/CoverPanel";
import { DesignPanel } from "./inspector/DesignPanel";
import { EpubMetadataPanel } from "./inspector/EpubMetadataPanel";
import { ReadinessSummary } from "./inspector/ReadinessSummary";
import { VersionsPanel } from "./inspector/VersionsPanel";

type InspectorTab = "epub" | "design" | "versions";
type InspectorTabConfig = {
  readonly id: InspectorTab;
  readonly label: string;
  readonly panelId: string;
  readonly tabId: string;
};

type RightInspectorProps = {
  readonly copy: AppCopy;
  readonly locale: Locale;
  readonly metadata: BookMetadata;
  readonly design: DesignSettings;
  readonly readiness: readonly ReadinessItem[];
  readonly snapshots: readonly ProjectSnapshot[];
  readonly onMetadataChange: (metadata: BookMetadata) => void;
  readonly onDesignChange: (design: DesignSettings) => void;
  readonly onRestoreSnapshot: (snapshotId: string) => void;
};

export function RightInspector({
  copy,
  locale,
  metadata,
  design,
  readiness,
  snapshots,
  onMetadataChange,
  onDesignChange,
  onRestoreSnapshot,
}: RightInspectorProps) {
  const [activeTab, setActiveTab] = useState<InspectorTab>("epub");
  const epubTab: InspectorTabConfig = { id: "epub", label: copy.inspector.epubTab, panelId: "inspector-panel-epub", tabId: "inspector-tab-epub" };
  const designTab: InspectorTabConfig = { id: "design", label: copy.inspector.designTab, panelId: "inspector-panel-design", tabId: "inspector-tab-design" };
  const versionsTab: InspectorTabConfig = { id: "versions", label: copy.inspector.versionsTab, panelId: "inspector-panel-versions", tabId: "inspector-tab-versions" };
  const tabs = [epubTab, designTab, versionsTab] as const;
  const activeTabConfig = tabs.find((tab) => tab.id === activeTab) ?? epubTab;
  const focusTab = (tabId: InspectorTab) => {
    window.requestAnimationFrame(() => {
      document.getElementById(`inspector-tab-${tabId}`)?.focus();
    });
  };
  const selectTab = (tabId: InspectorTab) => {
    setActiveTab(tabId);
    focusTab(tabId);
  };
  const selectTabByOffset = (offset: number) => {
    const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
    const baseIndex = activeIndex === -1 ? 0 : activeIndex;
    const nextIndex = (baseIndex + offset + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];
    if (nextTab !== undefined) {
      selectTab(nextTab.id);
    }
  };
  const handleTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      selectTabByOffset(1);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      selectTabByOffset(-1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      selectTab(epubTab.id);
    }
    if (event.key === "End") {
      event.preventDefault();
      selectTab(versionsTab.id);
    }
  };

  return (
    <aside className="right-pane">
      <ReadinessSummary copy={copy.readiness} readiness={readiness} />
      <div className="inspector-tabs" role="tablist" aria-label={copy.inspector.tabsLabel} onKeyDown={handleTabKeyDown}>
        {tabs.map((tab) => (
          <button
            aria-controls={tab.panelId}
            aria-selected={activeTab === tab.id}
            className={activeTab === tab.id ? "active" : ""}
            id={tab.tabId}
            key={tab.id}
            tabIndex={activeTab === tab.id ? 0 : -1}
            type="button"
            role="tab"
            onClick={() => selectTab(tab.id)}
            data-analytics-event="editor_inspector_tab_click"
            data-analytics-param-tab={tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={activeTabConfig.panelId} aria-labelledby={activeTabConfig.tabId} tabIndex={0}>
        {activeTab === "epub" ? (
          <>
            <EpubMetadataPanel copy={copy.metadata} metadata={metadata} onMetadataChange={onMetadataChange} />
            <CoverPanel copy={copy.cover} metadata={metadata} onMetadataChange={onMetadataChange} />
          </>
        ) : null}
        {activeTab === "design" ? <DesignPanel copy={copy.design} design={design} onDesignChange={onDesignChange} /> : null}
        {activeTab === "versions" ? <VersionsPanel copy={copy.versions} locale={locale} snapshots={snapshots} onRestoreSnapshot={onRestoreSnapshot} /> : null}
      </div>
    </aside>
  );
}

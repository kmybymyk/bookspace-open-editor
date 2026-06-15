import { FileDown, FilePlus2, FileText, FileUp, Save } from "lucide-react";

type TopBarProps = {
  readonly title: string;
  readonly actionNotice: string;
  readonly epubDisabledReason: string;
  readonly epubReady: boolean;
  readonly savedAt: string;
  readonly onNewChapter: () => void;
  readonly onSaveProject: () => void;
  readonly onOpenProject: () => void;
  readonly onImportMarkdown: () => void;
  readonly onExportEpub: () => void;
};

export function TopBar({
  title,
  actionNotice,
  epubDisabledReason,
  epubReady,
  savedAt,
  onNewChapter,
  onSaveProject,
  onOpenProject,
  onImportMarkdown,
  onExportEpub,
}: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="brand-block">
        <div className="brand-mark">B</div>
        <div>
          <p className="brand-name">BookSpace Lite</p>
          <p className="project-name">{title}</p>
        </div>
      </div>
      <div className={actionNotice ? "top-status active" : "top-status"} role="status">
        {actionNotice || `브라우저 자동저장됨 · ${savedAt}`}
      </div>
      <div className="top-actions">
        <button className="ghost-button" type="button" aria-label="챕터" title="챕터" onClick={onNewChapter}>
          <FilePlus2 size={16} strokeWidth={1.75} />
          <span className="top-action-label">챕터</span>
        </button>
        <button className="ghost-button" type="button" aria-label="불러오기" title="불러오기" onClick={onOpenProject}>
          <FileUp size={16} strokeWidth={1.75} />
          <span className="top-action-label">불러오기</span>
        </button>
        <button className="ghost-button" type="button" aria-label="Markdown" title="Markdown" onClick={onImportMarkdown}>
          <FileText size={16} strokeWidth={1.75} />
          <span className="top-action-label">Markdown</span>
        </button>
        <button className="ghost-button" type="button" aria-label="프로젝트" title="프로젝트" onClick={onSaveProject}>
          <Save size={16} strokeWidth={1.75} />
          <span className="top-action-label">프로젝트</span>
        </button>
        <button
          className="primary-button"
          type="button"
          aria-label="EPUB"
          aria-disabled={!epubReady}
          title={epubReady ? "EPUB 내보내기" : epubDisabledReason}
          onClick={onExportEpub}
        >
          <FileDown size={16} strokeWidth={1.75} />
          <span className="top-action-label">EPUB</span>
        </button>
      </div>
    </header>
  );
}

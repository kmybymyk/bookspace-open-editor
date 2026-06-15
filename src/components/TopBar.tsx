import { FileDown, FileText, FileUp, Languages, Save } from "lucide-react";
import type { AppCopy, Locale } from "../i18n";

type TopBarProps = {
  readonly copy: AppCopy["topBar"];
  readonly title: string;
  readonly actionNotice: string;
  readonly epubDisabledReason: string;
  readonly epubReady: boolean;
  readonly locale: Locale;
  readonly savedAt: string;
  readonly onLocaleChange: (locale: Locale) => void;
  readonly onSaveProject: () => void;
  readonly onOpenProject: () => void;
  readonly onImportMarkdown: () => void;
  readonly onExportEpub: () => void;
};

export function TopBar({
  copy,
  title,
  actionNotice,
  epubDisabledReason,
  epubReady,
  locale,
  savedAt,
  onLocaleChange,
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
          <p className="brand-name">
            <span>BookSpace Web</span>
            <span className="brand-beta">Beta</span>
          </p>
          <p className="project-name">{title}</p>
        </div>
      </div>
      <div className={actionNotice ? "top-status active" : "top-status"} role="status">
        {actionNotice || copy.autosaved(savedAt)}
      </div>
      <div className="top-actions">
        <label className="locale-control" title={copy.languageLabel}>
          <Languages size={15} strokeWidth={1.8} />
          <select
            aria-label={copy.languageLabel}
            className="locale-select"
            value={locale}
            onChange={(event) => onLocaleChange(event.currentTarget.value === "en" ? "en" : "ko")}
          >
            <option value="ko">{copy.localeNames.ko}</option>
            <option value="en">{copy.localeNames.en}</option>
          </select>
        </label>
        <div className="top-action-group top-import-group">
          <button className="ghost-button" type="button" aria-label={copy.openProject} title={copy.openProject} onClick={onOpenProject}>
            <FileUp size={16} strokeWidth={1.75} />
          </button>
          <button className="ghost-button" type="button" aria-label={copy.importMarkdown} title={copy.importMarkdown} onClick={onImportMarkdown}>
            <FileText size={16} strokeWidth={1.75} />
          </button>
        </div>
        <div className="top-action-group top-output-group">
          <button className="ghost-button" type="button" aria-label={copy.project} title={copy.project} onClick={onSaveProject}>
            <Save size={16} strokeWidth={1.75} />
          </button>
          <button
            className="primary-button"
            type="button"
            aria-label={copy.exportEpub}
            disabled={!epubReady}
            title={epubReady ? copy.exportEpub : epubDisabledReason}
            onClick={onExportEpub}
          >
            <FileDown size={16} strokeWidth={1.75} />
            <span className="top-action-label">EPUB</span>
          </button>
        </div>
      </div>
    </header>
  );
}

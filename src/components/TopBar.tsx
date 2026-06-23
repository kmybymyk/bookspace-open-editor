import { ArrowLeft, BookOpen, FileDown, FileText, FileUp, Github, Languages, Save } from "lucide-react";
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
  readonly onImportEpub: () => void;
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
  onImportEpub,
  onImportMarkdown,
  onExportEpub,
}: TopBarProps) {
  const homeHref = locale === "en" ? "/en/" : "/";
  const homeLabel = locale === "en" ? "Back to BookSpace home" : "BookSpace 홈으로";
  const sourceLabel = locale === "en" ? "View BookSpace Web source on GitHub" : "BookSpace Web GitHub 소스 보기";

  return (
    <header className="top-bar">
      <a
        className="brand-block brand-link"
        href={homeHref}
        aria-label={homeLabel}
        title={homeLabel}
        data-analytics-event="editor_home_click"
        data-analytics-param-placement="topbar"
      >
        <div className="brand-mark" aria-hidden="true">
          <ArrowLeft size={17} strokeWidth={2.4} />
        </div>
        <div>
          <p className="brand-name">
            <span>BookSpace Web</span>
            <span className="brand-beta">Beta</span>
          </p>
          <p className="project-name">{title}</p>
        </div>
      </a>
      <div className={actionNotice ? "top-status active" : "top-status"} role="status">
        {actionNotice || copy.autosaved(savedAt)}
      </div>
      <div className="top-actions">
        <label className="locale-control" title={copy.languageLabel}>
          <Languages size={15} strokeWidth={1.8} />
          <select
            aria-label={copy.languageLabel}
            className="locale-select"
            data-analytics-change-event="editor_locale_change"
            data-analytics-param-placement="topbar"
            value={locale}
            onChange={(event) => onLocaleChange(event.currentTarget.value === "en" ? "en" : "ko")}
          >
            <option value="ko">{copy.localeNames.ko}</option>
            <option value="en">{copy.localeNames.en}</option>
          </select>
        </label>
        <a
          className="ghost-button source-link"
          href="https://github.com/kmybymyk/bookspace-open-editor"
          target="_blank"
          rel="noreferrer"
          aria-label={sourceLabel}
          title={sourceLabel}
          data-analytics-event="editor_source_click"
          data-analytics-param-placement="topbar"
        >
          <Github size={16} strokeWidth={1.75} />
        </a>
        <div className="top-action-group top-import-group">
          <button className="ghost-button" type="button" aria-label={copy.openProject} title={copy.openProject} onClick={onOpenProject} data-analytics-event="editor_action_click" data-analytics-param-action="open_project" data-analytics-param-placement="topbar">
            <FileUp size={16} strokeWidth={1.75} />
          </button>
          <button className="ghost-button" type="button" aria-label={copy.importEpub} title={copy.importEpub} onClick={onImportEpub} data-analytics-event="editor_action_click" data-analytics-param-action="import_epub" data-analytics-param-placement="topbar">
            <BookOpen size={16} strokeWidth={1.75} />
          </button>
          <button className="ghost-button" type="button" aria-label={copy.importMarkdown} title={copy.importMarkdown} onClick={onImportMarkdown} data-analytics-event="editor_action_click" data-analytics-param-action="import_markdown" data-analytics-param-placement="topbar">
            <FileText size={16} strokeWidth={1.75} />
          </button>
        </div>
        <div className="top-action-group top-output-group">
          <button className="ghost-button" type="button" aria-label={copy.project} title={copy.project} onClick={onSaveProject} data-analytics-event="editor_action_click" data-analytics-param-action="save_project" data-analytics-param-placement="topbar">
            <Save size={16} strokeWidth={1.75} />
          </button>
          <button
            className="primary-button"
            type="button"
            aria-label={copy.exportEpub}
            disabled={!epubReady}
            title={epubReady ? copy.exportEpub : epubDisabledReason}
            onClick={onExportEpub}
            data-analytics-event="editor_action_click"
            data-analytics-param-action="export_epub"
            data-analytics-param-placement="topbar"
            data-analytics-param-ready={epubReady ? "true" : "false"}
          >
            <FileDown size={16} strokeWidth={1.75} />
            <span className="top-action-label">EPUB</span>
          </button>
        </div>
      </div>
    </header>
  );
}

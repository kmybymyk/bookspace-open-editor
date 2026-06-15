import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import type { Chapter, ChapterKind, ProjectFile } from "./domain/project";
import { ProjectParseError, createChapter, createStarterProject, parseProjectFile, serializeProjectFile } from "./domain/project";
import { exportEpub } from "./export/epub";
import { importMarkdownProject } from "./import/markdown";
import { LeftPane } from "./components/LeftPane";
import { RightInspector } from "./components/RightInspector";
import { TopBar } from "./components/TopBar";
import { epubReadiness, isEpubReady, missingReadinessKeys } from "./domain/readiness";
import { appCopy, formatMissingReadinessLabels } from "./i18n";
import type { ProjectSnapshot } from "./storage/browserProject";
import { downloadBlob, epubFileName, projectFileName, readAutosavedProject, readSnapshots, writeAutosavedProject, writeSnapshot } from "./storage/browserProject";
import { FileSizeLimitError, readFileText } from "./storage/readFileText";
import { moveChapter, nowLabel, orderChaptersForBook, reorderChapter, replaceChapter } from "./domain/projectOps";
import { useLocaleState } from "./useLocaleState";

const MAX_PROJECT_FILE_BYTES = 5 * 1024 * 1024;
const MAX_MARKDOWN_FILE_BYTES = 2 * 1024 * 1024;
const CenterEditor = lazy(() => import("./components/CenterEditor").then((module) => ({ default: module.CenterEditor })));

export function App() {
  const [locale, setLocale] = useLocaleState();
  const [project, setProject] = useState<ProjectFile>(() => readAutosavedProject() ?? createStarterProject(locale));
  const [activeChapterId, setActiveChapterId] = useState(project.chapters[0]?.id ?? "chapter-1");
  const [snapshots, setSnapshots] = useState<readonly ProjectSnapshot[]>(() => readSnapshots());
  const [actionNotice, setActionNotice] = useState("");
  const [savedAt, setSavedAt] = useState(nowLabel);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const markdownInputRef = useRef<HTMLInputElement | null>(null);
  const activeChapter = useMemo(
    () => project.chapters.find((chapter) => chapter.id === activeChapterId) ?? project.chapters[0],
    [activeChapterId, project.chapters],
  );
  const readiness = useMemo(() => epubReadiness(project), [project]);
  const copy = appCopy[locale];
  const epubReady = isEpubReady(readiness);
  const epubDisabledReason = epubReady ? "" : `${copy.topBar.requiredPrefix}: ${formatMissingReadinessLabels(copy.readiness.labels, missingReadinessKeys(readiness))}`;

  useEffect(() => {
    writeAutosavedProject(project);
    setSavedAt(nowLabel(locale));
  }, [project]);

  useEffect(() => {
    setSavedAt(nowLabel(locale));
    document.documentElement.lang = locale;
  }, [locale]);

  if (!activeChapter) {
    return null;
  }

  const updateActiveChapter = (patch: Partial<Chapter>) => {
    setProject((current) => replaceChapter(current, { ...activeChapter, ...patch }));
  };

  const handleNewChapter = (type: Chapter["type"] = "chapter") => {
    const title = type === "front" ? copy.structure.kindLabels.prologue : type === "back" ? copy.structure.kindLabels.epilogue : copy.structure.newChapterTitle(project.chapters.length + 1);
    const kind = type === "front" ? "prologue" : type === "back" ? "epilogue" : type === "part" ? "part" : "chapter";
    const chapter = createChapter(title, type, kind);
    setProject((current) => ({ ...current, chapters: orderChaptersForBook([...current.chapters, chapter]) }));
    setActiveChapterId(chapter.id);
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (project.chapters.length <= 1) {
      return;
    }
    const chapterIndex = project.chapters.findIndex((chapter) => chapter.id === chapterId);
    if (chapterIndex === -1) {
      return;
    }
    const nextChapters = project.chapters.filter((chapter) => chapter.id !== chapterId);
    setProject((current) => ({ ...current, chapters: current.chapters.filter((chapter) => chapter.id !== chapterId) }));
    if (chapterId === activeChapterId) {
      const nextActiveChapter = nextChapters[Math.min(chapterIndex, nextChapters.length - 1)];
      setActiveChapterId(nextActiveChapter?.id ?? "chapter-1");
    }
  };

  const handleChangeChapterType = (chapterId: string, type: Chapter["type"], kind: ChapterKind) => {
    setProject((current) => ({
      ...current,
      chapters: orderChaptersForBook(current.chapters.map((chapter) => (chapter.id === chapterId ? { ...chapter, kind, type } : chapter))),
    }));
    setActiveChapterId(chapterId);
  };

  const handleReorderChapter = (draggedChapterId: string, targetChapterId: string, position: "before" | "after") => {
    setProject((current) => ({
      ...current,
      chapters: reorderChapter(current.chapters, draggedChapterId, targetChapterId, position),
    }));
    setActiveChapterId(draggedChapterId);
  };

  const handleMoveChapter = (chapterId: string, direction: "up" | "down") => {
    const nextChapters = moveChapter(project.chapters, chapterId, direction);
    const moved = nextChapters.some((chapter, index) => chapter.id !== project.chapters[index]?.id);
    if (moved) {
      setProject((current) => ({ ...current, chapters: nextChapters }));
      setActiveChapterId(chapterId);
    }
    return moved;
  };

  const handleSaveProject = () => {
    writeSnapshot(project, "manual");
    setSnapshots(readSnapshots());
    const fileName = projectFileName(project);
    const blob = new Blob([serializeProjectFile(project)], { type: "application/json;charset=utf-8" });
    const downloaded = downloadBlob(blob, fileName);
    setActionNotice(copy.notices.projectSaved(fileName, downloaded));
  };

  const handleOpenProject = () => {
    fileInputRef.current?.click();
  };

  const handleImportMarkdown = () => {
    markdownInputRef.current?.click();
  };

  const handleProjectSelected = (file: File | null) => {
    if (file === null) {
      return;
    }
    void readFileText(file, { maxBytes: MAX_PROJECT_FILE_BYTES }).then((raw) => {
      const parsed = parseProjectFile(raw);
      writeSnapshot(project, "import");
      setSnapshots(readSnapshots());
      setProject(parsed);
      setActiveChapterId(parsed.chapters[0]?.id ?? "chapter-1");
      setActionNotice(copy.notices.projectLoaded(file.name));
    }).catch((error: unknown) => {
      if (error instanceof FileSizeLimitError) {
        setActionNotice(copy.notices.projectTooLarge);
        return;
      }
      if (error instanceof ProjectParseError) {
        setActionNotice(copy.notices.projectFileError);
        return;
      }
      if (error instanceof Error) {
        setActionNotice(copy.notices.projectFileError);
        return;
      }
      throw error;
    });
  };

  const handleMarkdownSelected = (file: File | null) => {
    if (file === null) {
      return;
    }
    void readFileText(file, { maxBytes: MAX_MARKDOWN_FILE_BYTES }).then((raw) => {
      const imported = importMarkdownProject(raw);
      writeSnapshot(project, "import");
      setSnapshots(readSnapshots());
      setProject(imported);
      setActiveChapterId(imported.chapters[0]?.id ?? "chapter-1");
      setActionNotice(copy.notices.markdownLoaded(file.name));
    }).catch((error: unknown) => {
      if (error instanceof FileSizeLimitError) {
        setActionNotice(copy.notices.markdownTooLarge);
        return;
      }
      if (error instanceof Error) {
        setActionNotice(copy.notices.markdownReadError);
        return;
      }
      throw error;
    });
  };

  const handleRestoreSnapshot = (snapshotId: string) => {
    const snapshot = snapshots.find((item) => item.id === snapshotId);
    if (!snapshot) {
      return;
    }
    writeSnapshot(project, "manual");
    setProject(snapshot.project);
    setActiveChapterId(snapshot.project.chapters[0]?.id ?? "chapter-1");
    setSnapshots(readSnapshots());
  };

  const handleExportEpub = () => {
    if (!epubReady) {
      setActionNotice(epubDisabledReason);
      return;
    }
    setActionNotice(copy.notices.epubGenerating);
    void exportEpub(project).then((blob) => {
      const fileName = epubFileName(project);
      const downloaded = downloadBlob(blob, fileName);
      setActionNotice(copy.notices.epubDone(fileName, downloaded));
    }).catch(() => {
      setActionNotice(copy.notices.epubFailed);
    });
  };

  return (
    <div className="app-shell">
      <TopBar
        copy={copy.topBar}
        title={project.metadata.title}
        actionNotice={actionNotice}
        epubDisabledReason={epubDisabledReason}
        epubReady={epubReady}
        locale={locale}
        savedAt={savedAt}
        onExportEpub={handleExportEpub}
        onImportMarkdown={handleImportMarkdown}
        onLocaleChange={setLocale}
        onOpenProject={handleOpenProject}
        onSaveProject={handleSaveProject}
      />
      <input
        ref={fileInputRef}
        className="hidden-input"
        accept=".bksp,application/json"
        type="file"
        onChange={(event) => {
          handleProjectSelected(event.currentTarget.files?.item(0) ?? null);
          event.currentTarget.value = "";
        }}
      />
      <input
        ref={markdownInputRef}
        className="hidden-input"
        accept=".md,.markdown,text/markdown,text/plain"
        type="file"
        onChange={(event) => {
          handleMarkdownSelected(event.currentTarget.files?.item(0) ?? null);
          event.currentTarget.value = "";
        }}
      />
      <div className="workspace-grid">
        <LeftPane
          chapters={project.chapters}
          activeChapterId={activeChapter.id}
          copy={copy.structure}
          onAddChapter={handleNewChapter}
          onChangeChapterType={handleChangeChapterType}
          onDeleteChapter={handleDeleteChapter}
          onMoveChapter={handleMoveChapter}
          onReorderChapter={handleReorderChapter}
          onSelectChapter={setActiveChapterId}
        />
        <Suspense fallback={<main className="center-pane"><div className="page-card editor-loading">{copy.editor.loading}</div></main>}>
          <CenterEditor
            chapter={activeChapter}
            copy={copy.editor}
            design={project.design}
            onContentChange={(contentHtml) => updateActiveChapter({ contentHtml })}
            onRename={(title) => updateActiveChapter({ title })}
          />
        </Suspense>
        <RightInspector
          copy={copy}
          design={project.design}
          locale={locale}
          metadata={project.metadata}
          readiness={readiness}
          snapshots={snapshots}
          onDesignChange={(design) => setProject((current) => ({ ...current, design }))}
          onMetadataChange={(metadata) => setProject((current) => ({ ...current, metadata }))}
          onRestoreSnapshot={handleRestoreSnapshot}
        />
      </div>
    </div>
  );
}

import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import type { Chapter, ChapterKind, ProjectFile } from "./domain/project";
import { ProjectParseError, createChapter, createStarterProject, parseProjectFile, serializeProjectFile } from "./domain/project";
import { exportEpub } from "./export/epub";
import { importMarkdownProject } from "./import/markdown";
import { LeftPane } from "./components/LeftPane";
import { RightInspector } from "./components/RightInspector";
import { TopBar } from "./components/TopBar";
import { epubReadiness, isEpubReady, missingReadinessLabels } from "./domain/readiness";
import type { ProjectSnapshot } from "./storage/browserProject";
import { downloadBlob, epubFileName, projectFileName, readAutosavedProject, readSnapshots, writeAutosavedProject, writeSnapshot } from "./storage/browserProject";
import { readFileText } from "./storage/readFileText";
import { nowLabel, orderChaptersForBook, reorderChapter, replaceChapter } from "./domain/projectOps";

const PROJECT_FILE_ERROR_MESSAGE = "프로젝트 파일을 읽을 수 없습니다.";
const CenterEditor = lazy(() => import("./components/CenterEditor").then((module) => ({ default: module.CenterEditor })));

export function App() {
  const [project, setProject] = useState<ProjectFile>(() => readAutosavedProject() ?? createStarterProject());
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
  const epubReady = isEpubReady(readiness);
  const epubDisabledReason = epubReady ? "" : `필수 항목 필요: ${missingReadinessLabels(readiness)}`;

  useEffect(() => {
    writeAutosavedProject(project);
    setSavedAt(nowLabel());
  }, [project]);

  if (!activeChapter) {
    return null;
  }

  const updateActiveChapter = (patch: Partial<Chapter>) => {
    setProject((current) => replaceChapter(current, { ...activeChapter, ...patch }));
  };

  const handleNewChapter = (type: Chapter["type"] = "chapter") => {
    const title = type === "front" ? "프롤로그" : type === "back" ? "에필로그" : `새 챕터 ${project.chapters.length + 1}`;
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

  const handleSaveProject = () => {
    writeSnapshot(project, "manual");
    setSnapshots(readSnapshots());
    const fileName = projectFileName(project);
    const blob = new Blob([serializeProjectFile(project)], { type: "application/json;charset=utf-8" });
    const downloaded = downloadBlob(blob, fileName);
    setActionNotice(downloaded ? `프로젝트 저장됨 · ${fileName} 다운로드 시작` : `프로젝트 저장됨 · ${fileName} · 현재 브라우저에서 다운로드를 지원하지 않습니다`);
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
    void readFileText(file).then((raw) => {
      const parsed = parseProjectFile(raw);
      writeSnapshot(project, "import");
      setSnapshots(readSnapshots());
      setProject(parsed);
      setActiveChapterId(parsed.chapters[0]?.id ?? "chapter-1");
      setActionNotice(`프로젝트 불러옴 · ${file.name}`);
    }).catch((error: unknown) => {
      if (error instanceof ProjectParseError) {
        setActionNotice(error.message);
        return;
      }
      if (error instanceof Error) {
        setActionNotice(PROJECT_FILE_ERROR_MESSAGE);
        return;
      }
      throw error;
    });
  };

  const handleMarkdownSelected = (file: File | null) => {
    if (file === null) {
      return;
    }
    void readFileText(file).then((raw) => {
      const imported = importMarkdownProject(raw);
      writeSnapshot(project, "import");
      setSnapshots(readSnapshots());
      setProject(imported);
      setActiveChapterId(imported.chapters[0]?.id ?? "chapter-1");
      setActionNotice(`Markdown 불러옴 · ${file.name}`);
    }).catch((error: unknown) => {
      if (error instanceof Error) {
        setActionNotice("Markdown 파일을 읽을 수 없습니다.");
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
    setActionNotice("EPUB 파일 생성 중...");
    void exportEpub(project).then((blob) => {
      const fileName = epubFileName(project);
      const downloaded = downloadBlob(blob, fileName);
      setActionNotice(downloaded ? `EPUB 생성됨 · ${fileName} 다운로드 시작` : `EPUB 생성됨 · ${fileName} · 현재 브라우저에서 다운로드를 지원하지 않습니다`);
    }).catch(() => {
      setActionNotice("EPUB 생성 실패 · 필수 정보와 본문을 확인하세요.");
    });
  };

  return (
    <div className="app-shell">
      <TopBar
        title={project.metadata.title}
        actionNotice={actionNotice}
        epubDisabledReason={epubDisabledReason}
        epubReady={epubReady}
        savedAt={savedAt}
        onExportEpub={handleExportEpub}
        onImportMarkdown={handleImportMarkdown}
        onNewChapter={() => handleNewChapter("chapter")}
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
          onAddChapter={handleNewChapter}
          onChangeChapterType={handleChangeChapterType}
          onDeleteChapter={handleDeleteChapter}
          onReorderChapter={handleReorderChapter}
          onSelectChapter={setActiveChapterId}
        />
        <Suspense fallback={<main className="center-pane"><div className="page-card editor-loading">편집기 불러오는 중...</div></main>}>
          <CenterEditor
            chapter={activeChapter}
            design={project.design}
            onContentChange={(contentHtml) => updateActiveChapter({ contentHtml })}
            onRename={(title) => updateActiveChapter({ title })}
          />
        </Suspense>
        <RightInspector
          design={project.design}
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

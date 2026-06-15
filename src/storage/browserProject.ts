import type { ProjectFile } from "../domain/project";
import { ProjectParseError, createStarterProject, parseProjectFile, serializeProjectFile } from "../domain/project";
import { trackEditorEvent } from "../analytics";

const AUTOSAVE_KEY = "bookspace-web:autosave:v1";
const SNAPSHOTS_KEY = "bookspace-web:snapshots:v1";
const LEGACY_AUTOSAVE_KEY = "bookspace-lite:autosave:v1";
const LEGACY_SNAPSHOTS_KEY = "bookspace-lite:snapshots:v1";
const MAX_SNAPSHOTS = 12;
export type SnapshotReason = "manual" | "autosave" | "import";

export type ProjectSnapshot = {
  readonly id: string;
  readonly createdAt: string;
  readonly reason: SnapshotReason;
  readonly project: ProjectFile;
};

function isSnapshotReason(value: unknown): value is SnapshotReason {
  return value === "manual" || value === "autosave" || value === "import";
}

function isUnknownRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRecoverableStorageWriteError(error: unknown): boolean {
  return error instanceof DOMException && (error.name === "QuotaExceededError" || error.name === "SecurityError");
}

function writeLocalStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    if (isRecoverableStorageWriteError(error)) {
      return;
    }
    throw error;
  }
}

function readLocalStorageWithFallback(key: string, legacyKey: string): string | null {
  return window.localStorage.getItem(key) ?? window.localStorage.getItem(legacyKey);
}

export function readAutosavedProject(): ProjectFile | null {
  const raw = readLocalStorageWithFallback(AUTOSAVE_KEY, LEGACY_AUTOSAVE_KEY);
  if (raw === null) {
    return null;
  }
  let project: ProjectFile;
  try {
    project = parseProjectFile(raw);
  } catch (error) {
    if (error instanceof ProjectParseError) {
      return createStarterProject();
    }
    throw error;
  }
  const onlyChapter = project.chapters[0];
  if (project.chapters.length === 1 && onlyChapter?.id === "chapter-1" && onlyChapter.title === "첫 번째 챕터") {
    return createStarterProject();
  }
  if (project.chapters.every((chapter) => chapter.type === "chapter")) {
    const starter = createStarterProject();
    return {
      ...project,
      chapters: [starter.chapters[0], starter.chapters[1], ...project.chapters, starter.chapters[4]].filter((chapter) => chapter !== undefined),
    };
  }
  return project;
}

export function writeAutosavedProject(project: ProjectFile): void {
  writeLocalStorage(AUTOSAVE_KEY, serializeProjectFile(project));
}

export function readSnapshots(): readonly ProjectSnapshot[] {
  const raw = readLocalStorageWithFallback(SNAPSHOTS_KEY, LEGACY_SNAPSHOTS_KEY);
  if (raw === null) {
    return [];
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return [];
    }
    throw error;
  }
  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed.flatMap((item): ProjectSnapshot[] => {
    if (!isUnknownRecord(item)) {
      return [];
    }
    if (
      typeof item["id"] !== "string" ||
      typeof item["createdAt"] !== "string" ||
      !isSnapshotReason(item["reason"])
    ) {
      return [];
    }
    try {
      const project = parseProjectFile(JSON.stringify(item["project"]));
      return [{
        id: item["id"],
        createdAt: item["createdAt"],
        reason: item["reason"],
        project,
      }];
    } catch (error) {
      if (error instanceof ProjectParseError) {
        return [];
      }
      throw error;
    }
  });
}

export function writeSnapshot(project: ProjectFile, reason: SnapshotReason): ProjectSnapshot {
  const snapshot: ProjectSnapshot = {
    id: window.crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    reason,
    project,
  };
  const snapshots = [snapshot, ...readSnapshots()].slice(0, MAX_SNAPSHOTS);
  writeLocalStorage(SNAPSHOTS_KEY, JSON.stringify(snapshots));
  return snapshot;
}

export function downloadBlob(blob: Blob, fileName: string): boolean {
  if (typeof URL.createObjectURL !== "function") {
    trackEditorEvent("editor_file_download", { download_supported: false, file_type: fileTypeFromName(fileName) });
    return false;
  }
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  try {
    anchor.href = url;
    anchor.download = fileName;
    document.body.append(anchor);
    anchor.click();
    trackEditorEvent("editor_file_download", { download_supported: true, file_type: fileTypeFromName(fileName) });
    return true;
  } finally {
    anchor.remove();
    URL.revokeObjectURL(url);
  }
}

function fileTypeFromName(fileName: string): string {
  const extension = fileName.split(".").pop();
  return extension === "epub" || extension === "bksp" ? extension : "unknown";
}

export function projectFileName(project: ProjectFile): string {
  return `${projectFileBaseName(project)}.bksp`;
}

export function epubFileName(project: ProjectFile): string {
  return `${projectFileBaseName(project)}.epub`;
}

function projectFileBaseName(project: ProjectFile): string {
  const baseName = project.metadata.title
    .trim()
    .replaceAll(/[^a-zA-Z0-9가-힣_-]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
  return baseName || "bookspace-project";
}

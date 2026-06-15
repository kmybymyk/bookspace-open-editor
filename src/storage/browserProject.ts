import type { ProjectFile } from "../domain/project";
import { ProjectParseError, createStarterProject, parseProjectFile, serializeProjectFile } from "../domain/project";

const AUTOSAVE_KEY = "bookspace-lite:autosave:v1";
const SNAPSHOTS_KEY = "bookspace-lite:snapshots:v1";
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

export function readAutosavedProject(): ProjectFile | null {
  const raw = window.localStorage.getItem(AUTOSAVE_KEY);
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
  window.localStorage.setItem(AUTOSAVE_KEY, serializeProjectFile(project));
}

export function readSnapshots(): readonly ProjectSnapshot[] {
  const raw = window.localStorage.getItem(SNAPSHOTS_KEY);
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
  window.localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots));
  return snapshot;
}

export function downloadBlob(blob: Blob, fileName: string): boolean {
  if (typeof URL.createObjectURL !== "function") {
    return false;
  }
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  try {
    anchor.href = url;
    anchor.download = fileName;
    document.body.append(anchor);
    anchor.click();
    return true;
  } finally {
    anchor.remove();
    URL.revokeObjectURL(url);
  }
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

import type { Chapter, ProjectFile } from "./project";

export type ReorderPosition = "before" | "after";

export function replaceChapter(project: ProjectFile, chapter: Chapter): ProjectFile {
  return {
    ...project,
    chapters: project.chapters.map((item) => (item.id === chapter.id ? chapter : item)),
  };
}

function isSameStructureGroup(left: Chapter, right: Chapter): boolean {
  if (left.type === "chapter" || left.type === "part") {
    return right.type === "chapter" || right.type === "part";
  }
  return left.type === right.type;
}

function sectionRank(chapter: Chapter): number {
  if (chapter.type === "front") return 0;
  if (chapter.type === "back") return 2;
  return 1;
}

export function orderChaptersForBook(chapters: readonly Chapter[]): Chapter[] {
  return chapters
    .map((chapter, index) => ({ chapter, index }))
    .sort((left, right) => sectionRank(left.chapter) - sectionRank(right.chapter) || left.index - right.index)
    .map((item) => item.chapter);
}

export function moveChapter(chapters: readonly Chapter[], chapterId: string, direction: "up" | "down"): Chapter[] {
  const index = chapters.findIndex((chapter) => chapter.id === chapterId);
  const chapter = chapters[index];
  if (index === -1 || chapter === undefined) {
    return [...chapters];
  }
  const peerIndexes = chapters.flatMap((candidate, candidateIndex) => (isSameStructureGroup(chapter, candidate) ? [candidateIndex] : []));
  const peerIndex = peerIndexes.findIndex((candidateIndex) => candidateIndex === index);
  const targetPeerIndex = direction === "up" ? peerIndex - 1 : peerIndex + 1;
  const targetIndex = peerIndexes[targetPeerIndex];
  if (peerIndex === -1 || targetIndex === undefined) {
    return [...chapters];
  }
  const targetChapter = chapters[targetIndex];
  if (targetChapter === undefined) {
    return [...chapters];
  }
  return chapters.map((item, itemIndex) => {
    if (itemIndex === index) return targetChapter;
    if (itemIndex === targetIndex) return chapter;
    return item;
  });
}

export function reorderChapter(
  chapters: readonly Chapter[],
  draggedChapterId: string,
  targetChapterId: string,
  position: ReorderPosition,
): Chapter[] {
  const draggedIndex = chapters.findIndex((chapter) => chapter.id === draggedChapterId);
  const targetIndex = chapters.findIndex((chapter) => chapter.id === targetChapterId);
  const draggedChapter = chapters[draggedIndex];
  const targetChapter = chapters[targetIndex];
  if (
    draggedIndex === -1 ||
    targetIndex === -1 ||
    draggedChapter === undefined ||
    targetChapter === undefined ||
    !isSameStructureGroup(draggedChapter, targetChapter)
  ) {
    return [...chapters];
  }
  const chaptersWithoutDragged = chapters.filter((chapter) => chapter.id !== draggedChapterId);
  const adjustedTargetIndex = chaptersWithoutDragged.findIndex((chapter) => chapter.id === targetChapterId);
  if (adjustedTargetIndex === -1) {
    return [...chapters];
  }
  const insertIndex = position === "before" ? adjustedTargetIndex : adjustedTargetIndex + 1;
  return [...chaptersWithoutDragged.slice(0, insertIndex), draggedChapter, ...chaptersWithoutDragged.slice(insertIndex)];
}

export function nowLabel(): string {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

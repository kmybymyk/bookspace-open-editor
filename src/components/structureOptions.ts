import type { Chapter, ChapterKind, ChapterType } from "../domain/project";

export const SECTION_ORDER = ["front", "chapter", "back"] as const;

export type ChapterTypeOption = {
  readonly kind: ChapterKind;
  readonly value: ChapterType;
};

export type ChapterTypeGroupKey = "blank" | "front" | "body" | "back";

export const CHAPTER_TYPE_GROUPS: readonly {
  readonly key: ChapterTypeGroupKey;
  readonly items: readonly ChapterTypeOption[];
}[] = [
  { key: "blank", items: [{ kind: "uncategorized", value: "chapter" }] },
  {
    key: "front",
    items: [
      { kind: "blurbs", value: "front" },
      { kind: "copyright", value: "front" },
      { kind: "dedication", value: "front" },
      { kind: "epigraph", value: "front" },
      { kind: "foreword", value: "front" },
      { kind: "introduction", value: "front" },
      { kind: "preface", value: "front" },
      { kind: "prologue", value: "front" },
      { kind: "title-page", value: "front" },
    ],
  },
  {
    key: "body",
    items: [
      { kind: "part", value: "part" },
      { kind: "chapter", value: "chapter" },
      { kind: "divider", value: "chapter" },
    ],
  },
  {
    key: "back",
    items: [
      { kind: "epilogue", value: "back" },
      { kind: "afterword", value: "back" },
      { kind: "bibliography", value: "back" },
      { kind: "acknowledgments", value: "back" },
      { kind: "about-author", value: "back" },
      { kind: "also-by", value: "back" },
    ],
  },
];

export function chapterKind(chapter: Chapter): ChapterKind {
  if (chapter.kind !== undefined) return chapter.kind;
  if (chapter.type === "front") return "prologue";
  if (chapter.type === "back") return "epilogue";
  if (chapter.type === "part") return "part";
  return "chapter";
}

export function groupChapters(chapters: readonly Chapter[], type: (typeof SECTION_ORDER)[number]): readonly Chapter[] {
  if (type === "chapter") return chapters.filter((chapter) => chapter.type === "chapter" || chapter.type === "part");
  return chapters.filter((chapter) => chapter.type === type);
}

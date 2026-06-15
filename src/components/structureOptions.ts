import type { Chapter, ChapterKind, ChapterType } from "../domain/project";

export const SECTION_ORDER = ["front", "chapter", "back"] as const;

export type ChapterTypeOption = {
  readonly description: string;
  readonly kind: ChapterKind;
  readonly label: string;
  readonly value: ChapterType;
};

export const CHAPTER_TYPE_GROUPS: readonly {
  readonly title: string;
  readonly items: readonly ChapterTypeOption[];
}[] = [
  { title: "빈 페이지", items: [{ description: "아직 분류하지 않은 페이지", kind: "uncategorized", label: "빈 페이지", value: "chapter" }] },
  {
    title: "앞부분",
    items: [
      { description: "외부 추천 글", kind: "blurbs", label: "추천사(외부)", value: "front" },
      { description: "저작권/출판 정보", kind: "copyright", label: "판권지", value: "front" },
      { description: "헌정 문구", kind: "dedication", label: "헌정사", value: "front" },
      { description: "도입 인용 글", kind: "epigraph", label: "인용문", value: "front" },
      { description: "저자 서문", kind: "foreword", label: "머리말", value: "front" },
      { description: "본문 전 소개", kind: "introduction", label: "들어가며", value: "front" },
      { description: "본문 전 저자 서문", kind: "preface", label: "서문", value: "front" },
      { description: "1장 전 도입부", kind: "prologue", label: "프롤로그", value: "front" },
      { description: "제목·저자 표기 페이지", kind: "title-page", label: "표제지(속표지)", value: "front" },
    ],
  },
  {
    title: "본문",
    items: [
      { description: "본문에서 상위 묶음으로 사용", kind: "part", label: "파트", value: "part" },
      { description: "일반 본문 챕터", kind: "chapter", label: "챕터(본문)", value: "chapter" },
      { description: "장면 전환/구분 페이지", kind: "divider", label: "간지", value: "chapter" },
    ],
  },
  {
    title: "뒷부분",
    items: [
      { description: "본문 뒤 마무리 글", kind: "epilogue", label: "에필로그", value: "back" },
      { description: "집필 후일담", kind: "afterword", label: "후기", value: "back" },
      { description: "참고 자료 목록", kind: "bibliography", label: "참고문헌", value: "back" },
      { description: "감사 인사", kind: "acknowledgments", label: "감사의 글", value: "back" },
      { description: "저자 약력/소개", kind: "about-author", label: "저자 소개", value: "back" },
      { description: "저자 다른 저서", kind: "also-by", label: "지은 책", value: "back" },
    ],
  },
];

const KIND_LABELS: Record<ChapterKind, string> = Object.fromEntries(
  CHAPTER_TYPE_GROUPS.flatMap((group) => group.items.map((item) => [item.kind, item.label])),
) as Record<ChapterKind, string>;

export function chapterKind(chapter: Chapter): ChapterKind {
  if (chapter.kind !== undefined) return chapter.kind;
  if (chapter.type === "front") return "prologue";
  if (chapter.type === "back") return "epilogue";
  if (chapter.type === "part") return "part";
  return "chapter";
}

export function sectionTitle(type: (typeof SECTION_ORDER)[number]): string {
  if (type === "front") return "앞부분";
  if (type === "back") return "뒷부분";
  return "본문";
}

export function chapterSubtitle(chapter: Chapter): string {
  return KIND_LABELS[chapterKind(chapter)];
}

export function groupChapters(chapters: readonly Chapter[], type: (typeof SECTION_ORDER)[number]): readonly Chapter[] {
  if (type === "chapter") return chapters.filter((chapter) => chapter.type === "chapter" || chapter.type === "part");
  return chapters.filter((chapter) => chapter.type === type);
}

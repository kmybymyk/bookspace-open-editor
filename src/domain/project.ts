import { z } from "zod";

const ChapterTypeSchema = z.union([
  z.literal("front"),
  z.literal("part"),
  z.literal("chapter"),
  z.literal("back"),
]);

const ChapterKindSchema = z.union([
  z.literal("uncategorized"),
  z.literal("blurbs"),
  z.literal("copyright"),
  z.literal("dedication"),
  z.literal("epigraph"),
  z.literal("foreword"),
  z.literal("introduction"),
  z.literal("preface"),
  z.literal("prologue"),
  z.literal("title-page"),
  z.literal("part"),
  z.literal("chapter"),
  z.literal("divider"),
  z.literal("epilogue"),
  z.literal("afterword"),
  z.literal("bibliography"),
  z.literal("acknowledgments"),
  z.literal("about-author"),
  z.literal("also-by"),
]);

const RequiredTextSchema = (fallback: string) => z.string().transform((value) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? value : fallback;
});

const ChapterSchema = z.object({
  id: z.string().min(1),
  title: RequiredTextSchema("제목 없는 페이지"),
  type: ChapterTypeSchema,
  kind: ChapterKindSchema.optional(),
  contentHtml: z.string(),
});

const BookMetadataSchema = z.object({
  title: RequiredTextSchema("제목 없는 책"),
  subtitle: z.string(),
  author: z.string(),
  language: z.string().min(2),
  publisher: z.string(),
  publishDate: z.string().optional(),
  identifierType: z.union([z.literal("isbn"), z.literal("issn"), z.literal("uuid"), z.literal("asin"), z.literal("doi")]).optional(),
  identifier: z.string().optional(),
  coverImage: z.string().optional(),
  description: z.string(),
});

const DesignSettingsSchema = z.object({
  fontFamily: z.string().min(1),
  fontSize: z.number().min(12).max(28),
  lineHeight: z.number().min(1.2).max(2.4),
  pageTone: z.union([z.literal("paper"), z.literal("white"), z.literal("warm")]),
});

const ProjectFileSchema = z.object({
  version: z.literal("bookspace-lite-1"),
  metadata: BookMetadataSchema,
  chapters: z.array(ChapterSchema).min(1),
  design: DesignSettingsSchema,
});

export type ChapterType = z.infer<typeof ChapterTypeSchema>;
export type ChapterKind = z.infer<typeof ChapterKindSchema>;
export type Chapter = z.infer<typeof ChapterSchema>;
export type BookMetadata = z.infer<typeof BookMetadataSchema>;
export type DesignSettings = z.infer<typeof DesignSettingsSchema>;
export type ProjectFile = z.infer<typeof ProjectFileSchema>;

export class ProjectParseError extends Error {
  override readonly name = "ProjectParseError";

  constructor() {
    super("프로젝트 파일을 읽을 수 없습니다.");
  }
}

export function createStarterProject(): ProjectFile {
  return {
    version: "bookspace-lite-1",
    metadata: {
      title: "제목 없는 책",
      subtitle: "",
      author: "",
      language: "ko",
      publisher: "",
      publishDate: "",
      identifierType: "uuid",
      identifier: "",
      description: "",
    },
    chapters: [
      {
        id: "front-1",
        title: "프롤로그",
        type: "front",
        kind: "prologue",
        contentHtml: "<p>책을 시작하는 짧은 글을 작성하세요.</p>",
      },
      {
        id: "part-1",
        title: "Part 1",
        type: "part",
        kind: "part",
        contentHtml: "<p>첫 번째 파트의 방향을 정리하세요.</p>",
      },
      {
        id: "chapter-1",
        title: "Chapter 1",
        type: "chapter",
        kind: "chapter",
        contentHtml:
          "<p>BookSpace Lite에서 원고를 작성하세요. 왼쪽에서 구조를 만들고, 오른쪽에서 책 정보를 다듬은 뒤 EPUB로 내보낼 수 있습니다.</p>",
      },
      {
        id: "chapter-2",
        title: "Chapter 2",
        type: "chapter",
        kind: "chapter",
        contentHtml: "<p>두 번째 챕터의 본문을 작성하세요.</p>",
      },
      {
        id: "back-1",
        title: "에필로그",
        type: "back",
        kind: "epilogue",
        contentHtml: "<p>책을 마무리하는 글을 작성하세요.</p>",
      },
    ],
    design: {
      fontFamily: "system-serif",
      fontSize: 17,
      lineHeight: 1.75,
      pageTone: "white",
    },
  };
}

export function parseProjectFile(raw: string): ProjectFile {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ProjectParseError();
    }
    throw error;
  }

  const result = ProjectFileSchema.safeParse(parsedJson);
  if (!result.success) {
    throw new ProjectParseError();
  }
  return result.data;
}

export function serializeProjectFile(project: ProjectFile): string {
  return JSON.stringify(ProjectFileSchema.parse(project), null, 2);
}

export function createChapter(title: string, type: ChapterType, kind?: ChapterKind): Chapter {
  return {
    id: window.crypto.randomUUID(),
    title,
    type,
    kind,
    contentHtml: "<p></p>",
  };
}

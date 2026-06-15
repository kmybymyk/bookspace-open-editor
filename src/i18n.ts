import type { ChapterKind } from "./domain/project";
import type { ReadinessKey } from "./domain/readiness";
import type { ChapterTypeGroupKey } from "./components/structureOptions";
import type { SnapshotReason } from "./storage/browserProject";

export type Locale = "ko" | "en";

export type AppCopy = {
  readonly topBar: {
    readonly autosaved: (savedAt: string) => string;
    readonly chapter: string;
    readonly exportEpub: string;
    readonly importMarkdown: string;
    readonly languageLabel: string;
    readonly localeNames: Record<Locale, string>;
    readonly openProject: string;
    readonly project: string;
    readonly requiredPrefix: string;
  };
  readonly notices: {
    readonly epubDone: (fileName: string, downloaded: boolean) => string;
    readonly epubFailed: string;
    readonly epubGenerating: string;
    readonly markdownLoaded: (fileName: string) => string;
    readonly markdownReadError: string;
    readonly markdownTooLarge: string;
    readonly projectFileError: string;
    readonly projectLoaded: (fileName: string) => string;
    readonly projectSaved: (fileName: string, downloaded: boolean) => string;
    readonly projectTooLarge: string;
  };
  readonly readiness: {
    readonly complete: string;
    readonly itemStatus: (label: string, status: string) => string;
    readonly labels: Record<ReadinessKey, string>;
    readonly missing: string;
    readonly missingSummary: (count: number) => string;
    readonly ready: string;
    readonly title: string;
  };
  readonly metadata: {
    readonly author: string;
    readonly authorPlaceholder: string;
    readonly description: string;
    readonly descriptionPlaceholder: string;
    readonly identifier: string;
    readonly identifierPlaceholder: string;
    readonly language: string;
    readonly languageOptions: {
      readonly en: string;
      readonly ja: string;
      readonly ko: string;
      readonly zhHans: string;
      readonly zhHant: string;
    };
    readonly publishDate: string;
    readonly publisher: string;
    readonly publisherPlaceholder: string;
    readonly sectionTitle: string;
    readonly subtitle: string;
    readonly subtitlePlaceholder: string;
    readonly title: string;
    readonly titlePlaceholder: string;
  };
  readonly structure: {
    readonly addPage: string;
    readonly changeStructure: string;
    readonly current: string;
    readonly delete: string;
    readonly drag: string;
    readonly dropHere: string;
    readonly emptyPage: string;
    readonly groupTitles: Record<ChapterTypeGroupKey, string>;
    readonly kindDescriptions: Record<ChapterKind, string>;
    readonly kindLabels: Record<ChapterKind, string>;
    readonly moveToSectionHelp: string;
    readonly moveDown: string;
    readonly movedDown: (title: string) => string;
    readonly movedUp: (title: string) => string;
    readonly moveUp: string;
    readonly newChapterTitle: (index: number) => string;
    readonly sections: {
      readonly back: string;
      readonly chapter: string;
      readonly front: string;
    };
    readonly structure: string;
    readonly workSuffix: string;
  };
  readonly editor: {
    readonly blockquote: string;
    readonly bold: string;
    readonly bulletList: string;
    readonly editorLabel: string;
    readonly heading: string;
    readonly horizontalRule: string;
    readonly italic: string;
    readonly loading: string;
    readonly paragraph: string;
    readonly redo: string;
    readonly smallHeading: string;
    readonly titleLabel: string;
    readonly toolbarLabel: string;
    readonly undo: string;
  };
  readonly inspector: {
    readonly coverTab: string;
    readonly designTab: string;
    readonly epubTab: string;
    readonly tabsLabel: string;
    readonly versionsTab: string;
  };
  readonly design: {
    readonly bodySize: string;
    readonly font: string;
    readonly fontLabels: Record<string, string>;
    readonly lineHeight: string;
    readonly pageTone: string;
    readonly pageTones: {
      readonly paper: string;
      readonly warm: string;
      readonly white: string;
    };
    readonly sectionTitle: string;
  };
  readonly cover: {
    readonly add: string;
    readonly alt: string;
    readonly change: string;
    readonly empty: string;
    readonly invalidType: string;
    readonly sectionTitle: string;
    readonly tooLarge: string;
  };
  readonly versions: {
    readonly empty: string;
    readonly reasons: Record<SnapshotReason, string>;
    readonly sectionTitle: string;
  };
};

export const appCopy: Record<Locale, AppCopy> = {
  ko: {
    topBar: {
      autosaved: (savedAt) => `브라우저 자동저장됨 · ${savedAt}`,
      chapter: "챕터",
      exportEpub: "EPUB 내보내기",
      importMarkdown: "Markdown 가져오기",
      languageLabel: "화면 언어",
      localeNames: {
        en: "English",
        ko: "한국어",
      },
      openProject: "프로젝트 불러오기",
      project: "프로젝트 저장",
      requiredPrefix: "필수 항목 필요",
    },
    notices: {
      epubDone: (fileName, downloaded) => downloaded ? `EPUB 생성됨 · ${fileName} 다운로드 시작` : `EPUB 생성됨 · ${fileName} · 현재 브라우저에서 다운로드를 지원하지 않습니다`,
      epubFailed: "EPUB 생성 실패 · 필수 정보와 본문을 확인하세요.",
      epubGenerating: "EPUB 파일 생성 중...",
      markdownLoaded: (fileName) => `Markdown 불러옴 · ${fileName}`,
      markdownReadError: "Markdown 파일을 읽을 수 없습니다.",
      markdownTooLarge: "Markdown 파일은 2MB 이하만 불러올 수 있습니다.",
      projectFileError: "프로젝트 파일을 읽을 수 없습니다.",
      projectLoaded: (fileName) => `프로젝트 불러옴 · ${fileName}`,
      projectSaved: (fileName, downloaded) => downloaded ? `프로젝트 저장됨 · ${fileName} 다운로드 시작` : `프로젝트 저장됨 · ${fileName} · 현재 브라우저에서 다운로드를 지원하지 않습니다`,
      projectTooLarge: "프로젝트 파일은 5MB 이하만 불러올 수 있습니다.",
    },
    readiness: {
      complete: "완료",
      itemStatus: (label, status) => `${label}: ${status}`,
      labels: {
        author: "저자",
        body: "본문",
        language: "언어",
        title: "제목",
      },
      missing: "필요",
      missingSummary: (count) => `${count}개 항목 필요`,
      ready: "내보내기 가능",
      title: "EPUB 준비 상태",
    },
    metadata: {
      author: "저자",
      authorPlaceholder: "EPUB에 표시할 저자명",
      description: "설명",
      descriptionPlaceholder: "서점과 리더 앱에 표시할 책 소개",
      identifier: "식별자",
      identifierPlaceholder: "비워두면 EPUB 생성 시 UUID 자동 생성",
      language: "언어",
      languageOptions: {
        en: "영어",
        ja: "일본어",
        ko: "한국어",
        zhHans: "중국어(간체)",
        zhHant: "중국어(번체)",
      },
      publishDate: "발행일",
      publisher: "출판사",
      publisherPlaceholder: "출판사 또는 발행 주체",
      sectionTitle: "책 정보",
      subtitle: "부제",
      subtitlePlaceholder: "선택 사항",
      title: "제목",
      titlePlaceholder: "책 제목",
    },
    structure: {
      addPage: "+ 페이지 추가",
      changeStructure: "구조 변경",
      current: "현재",
      delete: "삭제",
      drag: "드래그",
      dropHere: "여기에 놓기",
      emptyPage: "빈 페이지",
      groupTitles: {
        back: "뒷부분",
        blank: "빈 페이지",
        body: "본문",
        front: "앞부분",
      },
      kindDescriptions: {
        acknowledgments: "감사 인사",
        "about-author": "저자 약력/소개",
        afterword: "집필 후일담",
        "also-by": "저자 다른 저서",
        bibliography: "참고 자료 목록",
        blurbs: "외부 추천 글",
        chapter: "일반 본문 챕터",
        copyright: "저작권/출판 정보",
        dedication: "헌정 문구",
        divider: "장면 전환/구분 페이지",
        epigraph: "도입 인용 글",
        epilogue: "본문 뒤 마무리 글",
        foreword: "저자 서문",
        introduction: "본문 전 소개",
        part: "본문에서 상위 묶음으로 사용",
        preface: "본문 전 저자 서문",
        prologue: "1장 전 도입부",
        "title-page": "제목·저자 표기 페이지",
        uncategorized: "아직 분류하지 않은 페이지",
      },
      kindLabels: {
        acknowledgments: "감사의 글",
        "about-author": "저자 소개",
        afterword: "후기",
        "also-by": "지은 책",
        bibliography: "참고문헌",
        blurbs: "추천사(외부)",
        chapter: "챕터(본문)",
        copyright: "판권지",
        dedication: "헌정사",
        divider: "간지",
        epigraph: "인용문",
        epilogue: "에필로그",
        foreword: "머리말",
        introduction: "들어가며",
        part: "파트",
        preface: "서문",
        prologue: "프롤로그",
        "title-page": "표제지(속표지)",
        uncategorized: "빈 페이지",
      },
      moveToSectionHelp: "페이지 종류를 바꾸면 해당 섹션으로 자동 이동합니다.",
      moveDown: "아래로 이동",
      movedDown: (title) => `${title} 아래로 이동됨`,
      movedUp: (title) => `${title} 위로 이동됨`,
      moveUp: "위로 이동",
      newChapterTitle: (index) => `새 챕터 ${index}`,
      sections: {
        back: "뒷부분",
        chapter: "본문",
        front: "앞부분",
      },
      structure: "구조",
      workSuffix: "작업",
    },
    editor: {
      blockquote: "인용",
      bold: "굵게",
      bulletList: "목록",
      editorLabel: "본문 편집기",
      heading: "소제목",
      horizontalRule: "구분선",
      italic: "기울임",
      loading: "편집기 불러오는 중...",
      paragraph: "본문",
      redo: "재실행",
      smallHeading: "작은 소제목",
      titleLabel: "챕터 제목",
      toolbarLabel: "본문 서식 도구",
      undo: "실행취소",
    },
    inspector: {
      coverTab: "표지",
      designTab: "디자인",
      epubTab: "EPUB",
      tabsLabel: "오른쪽 패널",
      versionsTab: "버전",
    },
    design: {
      bodySize: "본문 크기",
      font: "글꼴",
      fontLabels: {
        "gowun-batang": "고운바탕",
        "gowun-dodum": "고운돋움",
        "system-sans": "시스템 고딕",
        "system-serif": "시스템 명조",
      },
      lineHeight: "줄간격",
      pageTone: "페이지 톤",
      pageTones: {
        paper: "종이",
        warm: "따뜻한 톤",
        white: "흰색",
      },
      sectionTitle: "디자인",
    },
    cover: {
      add: "표지 추가",
      alt: "EPUB 표지 미리보기",
      change: "표지 변경",
      empty: "EPUB 표지가 아직 없습니다.",
      invalidType: "PNG, JPG, WebP 표지만 사용할 수 있습니다.",
      sectionTitle: "표지",
      tooLarge: "표지는 2MB 이하 이미지만 사용할 수 있습니다.",
    },
    versions: {
      empty: "아직 저장된 스냅샷이 없습니다.",
      reasons: {
        autosave: "자동저장",
        import: "불러오기",
        manual: "수동 저장",
      },
      sectionTitle: "로컬 버전",
    },
  },
  en: {
    topBar: {
      autosaved: (savedAt) => `Autosaved in browser · ${savedAt}`,
      chapter: "Chapter",
      exportEpub: "Export EPUB",
      importMarkdown: "Import Markdown",
      languageLabel: "Interface language",
      localeNames: {
        en: "English",
        ko: "Korean",
      },
      openProject: "Open project",
      project: "Save project",
      requiredPrefix: "Required fields",
    },
    notices: {
      epubDone: (fileName, downloaded) => downloaded ? `EPUB created · ${fileName} download started` : `EPUB created · ${fileName} · downloads are not supported in this browser`,
      epubFailed: "EPUB export failed · check required details and body content.",
      epubGenerating: "Creating EPUB...",
      markdownLoaded: (fileName) => `Markdown imported · ${fileName}`,
      markdownReadError: "Markdown file could not be read.",
      markdownTooLarge: "Markdown files must be 2MB or smaller.",
      projectFileError: "Project file could not be read.",
      projectLoaded: (fileName) => `Project opened · ${fileName}`,
      projectSaved: (fileName, downloaded) => downloaded ? `Project saved · ${fileName} download started` : `Project saved · ${fileName} · downloads are not supported in this browser`,
      projectTooLarge: "Project files must be 5MB or smaller.",
    },
    readiness: {
      complete: "Done",
      itemStatus: (label, status) => `${label}: ${status}`,
      labels: {
        author: "Author",
        body: "Body",
        language: "Language",
        title: "Title",
      },
      missing: "Needed",
      missingSummary: (count) => `${count} ${count === 1 ? "item" : "items"} needed`,
      ready: "Ready to export",
      title: "EPUB readiness",
    },
    metadata: {
      author: "Author",
      authorPlaceholder: "Author name shown in the EPUB",
      description: "Description",
      descriptionPlaceholder: "Book description for stores and reader apps",
      identifier: "Identifier",
      identifierPlaceholder: "Auto UUID on export",
      language: "Language",
      languageOptions: {
        en: "English",
        ja: "Japanese",
        ko: "Korean",
        zhHans: "Chinese (Simplified)",
        zhHant: "Chinese (Traditional)",
      },
      publishDate: "Publication date",
      publisher: "Publisher",
      publisherPlaceholder: "Publisher or imprint",
      sectionTitle: "Book details",
      subtitle: "Subtitle",
      subtitlePlaceholder: "Optional",
      title: "Title",
      titlePlaceholder: "Book title",
    },
    structure: {
      addPage: "+ Add page",
      changeStructure: "Change structure",
      current: "Current",
      delete: "Delete",
      drag: "Drag",
      dropHere: "Drop here",
      emptyPage: "Blank page",
      groupTitles: {
        back: "Back matter",
        blank: "Blank page",
        body: "Body",
        front: "Front matter",
      },
      kindDescriptions: {
        acknowledgments: "Thanks and credits",
        "about-author": "Author bio",
        afterword: "Postscript after the main text",
        "also-by": "Other books by the author",
        bibliography: "Reference list",
        blurbs: "External endorsements",
        chapter: "Standard body chapter",
        copyright: "Copyright and publication details",
        dedication: "Dedication text",
        divider: "Scene break or separator page",
        epigraph: "Opening quotation",
        epilogue: "Closing text after the body",
        foreword: "Foreword by the author or contributor",
        introduction: "Introduction before the body",
        part: "Higher-level body section",
        preface: "Author preface before the body",
        prologue: "Opening before chapter one",
        "title-page": "Title and author page",
        uncategorized: "Unclassified page",
      },
      kindLabels: {
        acknowledgments: "Acknowledgments",
        "about-author": "About the author",
        afterword: "Afterword",
        "also-by": "Also by",
        bibliography: "Bibliography",
        blurbs: "Blurbs",
        chapter: "Chapter",
        copyright: "Copyright",
        dedication: "Dedication",
        divider: "Divider",
        epigraph: "Epigraph",
        epilogue: "Epilogue",
        foreword: "Foreword",
        introduction: "Introduction",
        part: "Part",
        preface: "Preface",
        prologue: "Prologue",
        "title-page": "Title page",
        uncategorized: "Blank page",
      },
      moveToSectionHelp: "Changing the page type moves it to the matching section.",
      moveDown: "Move down",
      movedDown: (title) => `${title} moved down`,
      movedUp: (title) => `${title} moved up`,
      moveUp: "Move up",
      newChapterTitle: (index) => `New chapter ${index}`,
      sections: {
        back: "Back matter",
        chapter: "Body",
        front: "Front matter",
      },
      structure: "Structure",
      workSuffix: "actions",
    },
    editor: {
      blockquote: "Quote",
      bold: "Bold",
      bulletList: "List",
      editorLabel: "Body editor",
      heading: "Heading",
      horizontalRule: "Divider",
      italic: "Italic",
      loading: "Loading editor...",
      paragraph: "Body",
      redo: "Redo",
      smallHeading: "Small heading",
      titleLabel: "Chapter title",
      toolbarLabel: "Body formatting tools",
      undo: "Undo",
    },
    inspector: {
      coverTab: "Cover",
      designTab: "Design",
      epubTab: "EPUB",
      tabsLabel: "Right panel",
      versionsTab: "Versions",
    },
    design: {
      bodySize: "Body size",
      font: "Font",
      fontLabels: {
        "gowun-batang": "Gowun Batang",
        "gowun-dodum": "Gowun Dodum",
        "system-sans": "System sans",
        "system-serif": "System serif",
      },
      lineHeight: "Line height",
      pageTone: "Page tone",
      pageTones: {
        paper: "Paper",
        warm: "Warm",
        white: "White",
      },
      sectionTitle: "Design",
    },
    cover: {
      add: "Add cover",
      alt: "EPUB cover preview",
      change: "Change cover",
      empty: "No EPUB cover yet.",
      invalidType: "Use a PNG, JPG, or WebP cover.",
      sectionTitle: "Cover",
      tooLarge: "Use a cover image under 2MB.",
    },
    versions: {
      empty: "No saved snapshots yet.",
      reasons: {
        autosave: "Autosave",
        import: "Import",
        manual: "Manual save",
      },
      sectionTitle: "Local versions",
    },
  },
};

export function formatMissingReadinessLabels(labels: Record<ReadinessKey, string>, keys: readonly ReadinessKey[]): string {
  return keys.map((key) => labels[key]).join(", ");
}

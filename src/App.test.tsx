import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { App } from "./App";
import { LEGACY_LOCALE_STORAGE_KEY, LOCALE_STORAGE_KEY } from "./i18nLocale";

function setNavigatorLanguages(languages: readonly string[]) {
  Object.defineProperty(window.navigator, "languages", {
    configurable: true,
    value: languages,
  });
}

describe("BookSpace Web editor", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, "", "/");
    setNavigatorLanguages(["ko-KR", "ko"]);
  });

  it("adds a new chapter and keeps the three-pane editor usable", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "빈 페이지" }));

    expect(screen.getByRole("button", { name: /새 챕터 6 현재 챕터\(본문\)/i })).toBeInTheDocument();
    expect(await screen.findByLabelText("챕터 제목")).toHaveValue("새 챕터 6");
    expect(screen.getByRole("textbox", { name: "본문 편집기" })).toHaveClass("writing-surface");
    expect(await screen.findByRole("button", { name: "소제목" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "실행취소" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "작은 소제목" })).toBeInTheDocument();
    expect(screen.getByText("책 정보")).toBeInTheDocument();
    expect(screen.getByText("EPUB 준비 상태")).toBeInTheDocument();
  });

  it("starts with front, body, and back matter like the desktop structure pane", () => {
    render(<App />);

    expect(screen.getByText("앞부분")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /프롤로그 현재 프롤로그/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Part 1 파트/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Chapter 1 챕터\(본문\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /에필로그 에필로그/i })).toBeInTheDocument();
  });

  it("deletes a page from the structure pane and selects the next available page", async () => {
    render(<App />);

    const deleteButton = screen.getAllByTitle("삭제")[0];
    if (!deleteButton) {
      throw new Error("삭제 버튼을 찾을 수 없습니다.");
    }
    fireEvent.click(deleteButton);

    expect(screen.queryByRole("button", { name: /프롤로그 현재 프롤로그/i })).not.toBeInTheDocument();
    expect(await screen.findByLabelText("챕터 제목")).toHaveValue("Part 1");
  });

  it("changes a page type from the structure action menu", () => {
    render(<App />);

    const chapterActions = screen.getByLabelText("Chapter 1 작업");
    fireEvent.click(within(chapterActions).getByTitle("구조"));
    const menu = chapterActions.querySelector(".convert-menu");
    if (!(menu instanceof HTMLElement)) {
      throw new Error("구조 변경 메뉴를 찾을 수 없습니다.");
    }
    expect(within(menu).getAllByRole("button")).toHaveLength(19);
    expect(within(menu).getByRole("button", { name: /판권지 저작권/i })).toBeInTheDocument();
    expect(within(menu).getByRole("button", { name: /간지 장면 전환/i })).toBeInTheDocument();
    fireEvent.click(within(menu).getByRole("button", { name: /파트 본문에서/i }));

    expect(screen.getByRole("button", { name: /Chapter 1 현재 파트/i })).toBeInTheDocument();
  });

  it("moves pages with keyboard-accessible move buttons", () => {
    render(<App />);

    const chapterOneActions = screen.getByLabelText("Chapter 1 작업");
    fireEvent.click(within(chapterOneActions).getByRole("button", { name: "Chapter 1 아래로 이동" }));

    const bodyRows = screen.getAllByRole("button", { name: /챕터\(본문\)|파트/i });
    expect(bodyRows.map((row) => row.textContent)).toEqual(["Part 1파트", "Chapter 2챕터(본문)", "Chapter 1현재챕터(본문)"]);
    expect(screen.getByText("Chapter 1 아래로 이동됨")).toBeInTheDocument();
  });

  it("shows a floating preview while dragging a page", () => {
    render(<App />);

    const chapterOneActions = screen.getByLabelText("Chapter 1 작업");
    fireEvent.pointerDown(within(chapterOneActions).getByTitle("드래그"), { clientX: 80, clientY: 240, pointerId: 1 });

    const preview = document.querySelector(".drag-preview");
    expect(preview).toBeInTheDocument();
    expect(preview?.textContent).toContain("Chapter 1");
  });

  it("reorders a page by pointer-dragging the handle onto a target row", () => {
    render(<App />);

    const chapterOneActions = screen.getByLabelText("Chapter 1 작업");
    const chapterTwoRow = screen.getByRole("button", { name: /Chapter 2 챕터\(본문\)/i }).closest(".chapter-row");
    if (chapterTwoRow === null) {
      throw new Error("드롭 대상 행을 찾을 수 없습니다.");
    }
    fireEvent.pointerDown(within(chapterOneActions).getByTitle("드래그"), { clientX: 80, clientY: 240, pointerId: 1 });
    fireEvent.pointerMove(chapterTwoRow, { clientX: 80, clientY: 1, pointerId: 1 });
    expect(screen.getByText("여기에 놓기")).toBeInTheDocument();
    expect(chapterTwoRow).toHaveClass("drop-after");
    fireEvent.pointerUp(chapterTwoRow, { pointerId: 1 });

    const bodyRows = screen.getAllByRole("button", { name: /챕터\(본문\)|파트/i });
    expect(bodyRows.map((row) => row.textContent)).toEqual(["Part 1파트", "Chapter 2챕터(본문)", "Chapter 1현재챕터(본문)"]);
  });

  it("updates book metadata from the inspector", () => {
    render(<App />);

    expect(screen.getByPlaceholderText("EPUB에 표시할 저자명")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("서점과 리더 앱에 표시할 책 소개")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("제목"), {
      target: { value: "웹에서 쓰는 책" },
    });

    expect(screen.getByText("웹에서 쓰는 책")).toBeInTheDocument();
  });

  it("switches core editor chrome between Korean and English", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("화면 언어"), {
      target: { value: "en" },
    });

    expect(screen.getByRole("button", { name: "Blank page" })).toBeInTheDocument();
    expect(screen.getByText("Front matter")).toBeInTheDocument();
    expect(screen.getByText("Back matter")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Body editor" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Heading" })).toBeInTheDocument();
    expect(screen.getByText("EPUB readiness")).toBeInTheDocument();
    expect(screen.getByText("Book details")).toBeInTheDocument();
    expect(screen.getByLabelText("Author")).toHaveAttribute("placeholder", "Author name shown in the EPUB");
    expect(screen.getByRole("status")).toHaveTextContent("Autosaved in browser");
    expect(document.documentElement.lang).toBe("en");

    fireEvent.click(screen.getByRole("tab", { name: "Design" }));

    expect(screen.getByLabelText("Font")).toBeInTheDocument();
    expect(screen.getByText("System serif")).toBeInTheDocument();
    expect(screen.getByText("Noto Serif KR")).toBeInTheDocument();
    expect(screen.getByText("Noto Sans KR")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Versions" }));

    expect(screen.getByText("No saved snapshots yet.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save project" }));

    expect(screen.getByRole("status")).toHaveTextContent("Project saved");
  });

  it("can start in English from the lang query parameter", () => {
    window.history.replaceState(null, "", "/?lang=en");

    render(<App />);

    expect(screen.getByLabelText("Interface language")).toHaveValue("en");
    expect(screen.getByDisplayValue("Untitled book")).toBeInTheDocument();
    expect(screen.getByLabelText("Language")).toHaveValue("en");
    expect(screen.getByText("EPUB readiness")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
  });

  it("uses the browser language when there is no manual language setting", () => {
    setNavigatorLanguages(["en-US", "en"]);

    render(<App />);

    expect(screen.getByLabelText("Interface language")).toHaveValue("en");
    expect(screen.getByDisplayValue("Untitled book")).toBeInTheDocument();
  });

  it("keeps a manual language selection across reloads", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("화면 언어"), {
      target: { value: "en" },
    });

    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("en");

    cleanup();
    setNavigatorLanguages(["ko-KR", "ko"]);
    render(<App />);

    expect(screen.getByLabelText("Interface language")).toHaveValue("en");
  });

  it("reads manual language selection from the legacy storage key", () => {
    window.localStorage.setItem(LEGACY_LOCALE_STORAGE_KEY, "en");

    render(<App />);

    expect(screen.getByLabelText("Interface language")).toHaveValue("en");
  });

  it("blocks EPUB export until required metadata is complete", () => {
    render(<App />);

    const exportButton = screen.getByRole("button", { name: "EPUB 내보내기" });
    expect(exportButton).toBeDisabled();
    expect(screen.getByText("1개 항목 필요")).toBeInTheDocument();
    expect(screen.getByLabelText("저자: 필요")).toBeInTheDocument();
    fireEvent.click(exportButton);
    expect(screen.getByRole("status")).not.toHaveTextContent("필수 항목 필요: 저자");

    fireEvent.change(screen.getByLabelText("저자"), {
      target: { value: "김작가" },
    });

    expect(exportButton).not.toBeDisabled();
    expect(screen.getByText("내보내기 가능")).toBeInTheDocument();
  });

  it("supports the right inspector tab keyboard pattern", () => {
    render(<App />);

    const tablist = screen.getByRole("tablist", { name: "오른쪽 패널" });
    expect(screen.getByRole("tab", { name: "EPUB" })).toHaveAttribute("aria-controls", "inspector-panel-epub");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "inspector-tab-epub");

    fireEvent.keyDown(tablist, { key: "ArrowRight" });

    expect(screen.getByRole("tab", { name: "디자인" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "inspector-tab-design");
  });

  it("shows feedback when the project export button is used", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "프로젝트 저장" }));

    expect(screen.getByRole("status")).toHaveTextContent("프로젝트 저장됨");
    expect(screen.getByRole("status")).toHaveTextContent(".bksp");
  });

  it("shows feedback when a project file cannot be opened", async () => {
    render(<App />);
    const fileInput = document.querySelector('input[accept=".bksp,application/json"]');
    if (!(fileInput instanceof HTMLInputElement)) {
      throw new Error("프로젝트 파일 입력을 찾을 수 없습니다.");
    }
    const file = new File(["not-json"], "broken.bksp", { type: "application/json" });

    fireEvent.change(fileInput, {
      target: {
        files: {
          0: file,
          item: (index: number) => (index === 0 ? file : null),
          length: 1,
        },
      },
    });

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("프로젝트 파일을 읽을 수 없습니다."));
  });

  it("blocks oversized project files before reading them", async () => {
    render(<App />);
    const fileInput = document.querySelector('input[accept=".bksp,application/json"]');
    if (!(fileInput instanceof HTMLInputElement)) {
      throw new Error("프로젝트 파일 입력을 찾을 수 없습니다.");
    }
    const file = new File(["x".repeat(5 * 1024 * 1024 + 1)], "huge.bksp", { type: "application/json" });

    fireEvent.change(fileInput, {
      target: {
        files: {
          0: file,
          item: (index: number) => (index === 0 ? file : null),
          length: 1,
        },
      },
    });

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("프로젝트 파일은 5MB 이하만 불러올 수 있습니다."));
  });

  it("blocks oversized Markdown files before import", async () => {
    render(<App />);
    const markdownInput = document.querySelector('input[accept=".md,.markdown,text/markdown,text/plain"]');
    if (!(markdownInput instanceof HTMLInputElement)) {
      throw new Error("Markdown 파일 입력을 찾을 수 없습니다.");
    }
    const file = new File(["x".repeat(2 * 1024 * 1024 + 1)], "huge.md", { type: "text/markdown" });

    fireEvent.change(markdownInput, {
      target: {
        files: {
          0: file,
          item: (index: number) => (index === 0 ? file : null),
          length: 1,
        },
      },
    });

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Markdown 파일은 2MB 이하만 불러올 수 있습니다."));
  });
});

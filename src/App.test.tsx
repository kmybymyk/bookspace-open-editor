import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { App } from "./App";

describe("BookSpace Lite editor", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("adds a new chapter and keeps the three-pane editor usable", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "챕터" }));

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
    const menu = screen.getByRole("menu", { name: "Chapter 1 구조 변경" });
    expect(within(menu).getAllByRole("button")).toHaveLength(19);
    expect(within(menu).getByRole("button", { name: /판권지 저작권/i })).toBeInTheDocument();
    expect(within(menu).getByRole("button", { name: /간지 장면 전환/i })).toBeInTheDocument();
    fireEvent.click(within(menu).getByRole("button", { name: /파트 본문에서/i }));

    expect(screen.getByRole("button", { name: /Chapter 1 현재 파트/i })).toBeInTheDocument();
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

    fireEvent.change(screen.getByLabelText("제목"), {
      target: { value: "웹에서 쓰는 책" },
    });

    expect(screen.getByText("웹에서 쓰는 책")).toBeInTheDocument();
  });

  it("blocks EPUB export until required metadata is complete", () => {
    render(<App />);

    const exportButton = screen.getByRole("button", { name: "EPUB" });
    expect(exportButton).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("1개 항목 필요")).toBeInTheDocument();
    fireEvent.click(exportButton);
    expect(screen.getByRole("status")).toHaveTextContent("필수 항목 필요: 저자");

    fireEvent.change(screen.getByLabelText("저자"), {
      target: { value: "김작가" },
    });

    expect(exportButton).toHaveAttribute("aria-disabled", "false");
    expect(screen.getByText("내보내기 가능")).toBeInTheDocument();
  });

  it("shows feedback when the project export button is used", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "프로젝트" }));

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
});

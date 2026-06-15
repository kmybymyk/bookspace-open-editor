import { describe, expect, it } from "vitest";
import { createStarterProject, parseProjectFile, serializeProjectFile } from "./project";
import { orderChaptersForBook } from "./projectOps";

describe("BookSpace project file", () => {
  it("round-trips a starter project when serialized as bksp JSON", () => {
    const project = createStarterProject();

    const raw = serializeProjectFile(project);
    const parsed = parseProjectFile(raw);

    expect(parsed.metadata.title).toBe("제목 없는 책");
    expect(parsed.chapters).toHaveLength(5);
    expect(parsed.chapters.map((chapter) => chapter.type)).toEqual(["front", "part", "chapter", "chapter", "back"]);
    expect(parsed.chapters[0]?.title).toBe("프롤로그");
  });

  it("creates an English starter project for English UI sessions", () => {
    const project = createStarterProject("en");

    expect(project.metadata.title).toBe("Untitled book");
    expect(project.metadata.language).toBe("en");
    expect(project.chapters[0]?.title).toBe("Prologue");
    expect(project.chapters[2]?.contentHtml).toContain("BookSpace Web");
  });

  it("rejects malformed project files at the boundary", () => {
    const malformed = JSON.stringify({ metadata: { title: 7 }, chapters: [] });

    expect(() => parseProjectFile(malformed)).toThrow("프로젝트 파일을 읽을 수 없습니다.");
  });

  it("rejects unsafe project metadata at the boundary", () => {
    const project = createStarterProject();
    const malformed = JSON.stringify({
      ...project,
      metadata: {
        ...project.metadata,
        coverImage: "data:text/html;base64,PHNjcmlwdD4=",
        language: "javascript:alert(1)",
      },
    });

    expect(() => parseProjectFile(malformed)).toThrow("프로젝트 파일을 읽을 수 없습니다.");
  });

  it("treats an empty cover image as no cover image", () => {
    const project = createStarterProject();
    const parsed = parseProjectFile(JSON.stringify({
      ...project,
      metadata: {
        ...project.metadata,
        coverImage: "",
      },
    }));

    expect(parsed.metadata.coverImage).toBeUndefined();
  });

  it("rejects oversized chapter HTML at the boundary", () => {
    const project = createStarterProject();
    const firstChapter = project.chapters[0];
    if (firstChapter === undefined) {
      throw new Error("기본 프로젝트에 첫 페이지가 없습니다.");
    }
    const malformed = JSON.stringify({
      ...project,
      chapters: [
        {
          ...firstChapter,
          contentHtml: `<p>${"a".repeat(250_001)}</p>`,
        },
      ],
    });

    expect(() => parseProjectFile(malformed)).toThrow("프로젝트 파일을 읽을 수 없습니다.");
  });

  it("orders chapters by book section while preserving section-local order", () => {
    const project = createStarterProject();
    const front = project.chapters[0];
    const part = project.chapters[1];
    const body = project.chapters[2];
    const back = project.chapters[4];
    if (front === undefined || part === undefined || body === undefined || back === undefined) {
      throw new Error("기본 프로젝트 구조를 찾을 수 없습니다.");
    }

    const ordered = orderChaptersForBook([body, back, front, part]);

    expect(ordered.map((chapter) => chapter.id)).toEqual([front.id, body.id, part.id, back.id]);
  });
});

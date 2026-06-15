import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { createStarterProject } from "../domain/project";
import { exportEpub } from "./epub";
import { validateEpubBlob } from "./epubValidation";

describe("EPUB export", () => {
  it("creates a readable EPUB package with manifest, navigation, and chapter XHTML", async () => {
    const project = {
      ...createStarterProject(),
      metadata: {
        ...createStarterProject().metadata,
        author: "테스트 저자",
        coverImage: "data:image/png;base64,iVBORw0KGgo=",
        description: "소개 문구",
        identifier: "urn:uuid:test-book",
        identifierType: "uuid" as const,
        publishDate: "2026-06-15",
        publisher: "테스트 출판사",
      },
    };

    const blob = await exportEpub(project);
    const zip = await JSZip.loadAsync(blob);
    const opf = await zip.file("OEBPS/content.opf")?.async("string");

    expect(await zip.file("mimetype")?.async("string")).toBe("application/epub+zip");
    expect(zip.file("META-INF/container.xml")).not.toBeNull();
    expect(zip.file("OEBPS/content.opf")).not.toBeNull();
    expect(zip.file("OEBPS/nav.xhtml")).not.toBeNull();
    expect(zip.file("OEBPS/cover.xhtml")).not.toBeNull();
    expect(zip.file("OEBPS/images/cover.png")).not.toBeNull();
    expect(zip.file("OEBPS/chapters/01-front-1.xhtml")).not.toBeNull();
    expect(zip.file("OEBPS/chapters/03-chapter-1.xhtml")).not.toBeNull();
    expect(opf).toContain("<dc:publisher>테스트 출판사</dc:publisher>");
    expect(opf).toContain("<dc:date>2026-06-15</dc:date>");
    expect(opf).toContain('properties="cover-image"');
  });

  it("passes structural EPUB package validation", async () => {
    const project = {
      ...createStarterProject(),
      metadata: {
        ...createStarterProject().metadata,
        author: "테스트 저자",
        coverImage: "data:image/png;base64,iVBORw0KGgo=",
        identifier: "urn:uuid:test-book",
      },
    };

    const blob = await exportEpub(project);
    const result = await validateEpubBlob(blob);

    expect(result.errors).toEqual([]);
  });

  it("creates namespace-valid XHTML for chapter epub types and void elements", async () => {
    const starter = createStarterProject();
    const firstChapter = starter.chapters[0];
    if (firstChapter === undefined) {
      throw new Error("기본 프로젝트에 첫 페이지가 없습니다.");
    }
    const project = {
      ...starter,
      metadata: {
        ...starter.metadata,
        author: "테스트 저자",
      },
      chapters: [
        {
          ...firstChapter,
          contentHtml: "<p>문단<br>다음 줄</p><hr>",
        },
      ],
    };

    const blob = await exportEpub(project);
    const zip = await JSZip.loadAsync(blob);
    const chapter = await zip.file("OEBPS/chapters/01-front-1.xhtml")?.async("string");
    const parsed = new DOMParser().parseFromString(chapter ?? "", "application/xhtml+xml");

    expect(parsed.querySelector("parsererror")).toBeNull();
    expect(chapter).toContain('xmlns:epub="http://www.idpf.org/2007/ops"');
    expect(chapter).toContain("<br />");
    expect(chapter).toContain("<hr />");
  });

  it("exports chapters in visible book section order", async () => {
    const starter = createStarterProject();
    const front = starter.chapters[0];
    const body = starter.chapters[2];
    const back = starter.chapters[4];
    if (front === undefined || body === undefined || back === undefined) {
      throw new Error("기본 프로젝트 구조를 찾을 수 없습니다.");
    }
    const project = {
      ...starter,
      metadata: {
        ...starter.metadata,
        author: "테스트 저자",
      },
      chapters: [body, back, front],
    };

    const blob = await exportEpub(project);
    const zip = await JSZip.loadAsync(blob);
    const nav = await zip.file("OEBPS/nav.xhtml")?.async("string");

    expect(nav?.indexOf(front.title)).toBeLessThan(nav?.indexOf(body.title) ?? Number.POSITIVE_INFINITY);
    expect(nav?.indexOf(body.title)).toBeLessThan(nav?.indexOf(back.title) ?? Number.POSITIVE_INFINITY);
  });

  it("ignores unsupported or malformed cover data URLs", async () => {
    const starter = createStarterProject();
    const project = {
      ...starter,
      metadata: {
        ...starter.metadata,
        author: "테스트 저자",
        coverImage: "data:text/html;base64,%%%not-base64",
      },
    };

    const blob = await exportEpub(project);
    const zip = await JSZip.loadAsync(blob);

    expect(zip.file("OEBPS/cover.xhtml")).toBeNull();
    expect(zip.file("OEBPS/images/cover.jpg")).toBeNull();
  });

  it("removes unsafe chapter HTML when creating XHTML", async () => {
    const starter = createStarterProject();
    const firstChapter = starter.chapters[0];
    if (firstChapter === undefined) {
      throw new Error("기본 프로젝트에 첫 페이지가 없습니다.");
    }
    const project = {
      ...starter,
      metadata: {
        ...starter.metadata,
        author: "테스트 저자",
      },
      chapters: [
        {
          ...firstChapter,
          contentHtml: '<p onclick="steal()">안전한 문장<script>alert("x")</script><a href="javascript:bad()">링크</a><img src="x" onerror="bad()" /></p>',
        },
      ],
    };

    const blob = await exportEpub(project);
    const zip = await JSZip.loadAsync(blob);
    const chapter = await zip.file("OEBPS/chapters/01-front-1.xhtml")?.async("string");

    expect(chapter).toContain("<p>안전한 문장<a>링크</a></p>");
    expect(chapter).not.toContain("script");
    expect(chapter).not.toContain("onclick");
    expect(chapter).not.toContain("javascript:");
    expect(chapter).not.toContain("onerror");
  });
});

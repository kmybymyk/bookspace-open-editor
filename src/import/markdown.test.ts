import { describe, expect, it } from "vitest";
import { importMarkdownProject } from "./markdown";

describe("Markdown import", () => {
  it("creates chapters from first-level headings and book metadata from the first heading", () => {
    const markdown = "# 웹에서 쓰는 책\n\n첫 문단입니다.\n\n# 두 번째 장\n\n- 항목 하나\n- 항목 둘";

    const project = importMarkdownProject(markdown);

    expect(project.metadata.title).toBe("웹에서 쓰는 책");
    expect(project.chapters).toHaveLength(2);
    expect(project.chapters[0]?.title).toBe("웹에서 쓰는 책");
    expect(project.chapters[1]?.contentHtml).toContain("<ul>");
  });

  it("falls back to a single chapter when headings are missing", () => {
    const project = importMarkdownProject("문단만 있는 원고입니다.");

    expect(project.chapters).toHaveLength(1);
    expect(project.chapters[0]?.title).toBe("가져온 원고");
    expect(project.chapters[0]?.contentHtml).toContain("문단만 있는 원고입니다.");
  });
});

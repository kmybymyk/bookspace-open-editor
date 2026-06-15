import { beforeEach, describe, expect, it } from "vitest";
import { createStarterProject } from "../domain/project";
import { readAutosavedProject, readSnapshots, writeAutosavedProject, writeSnapshot } from "./browserProject";

describe("Browser project snapshots", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("stores the newest project snapshots first", () => {
    const project = createStarterProject();

    writeSnapshot(project, "manual");
    writeSnapshot({ ...project, metadata: { ...project.metadata, title: "두 번째" } }, "autosave");

    const snapshots = readSnapshots();
    expect(snapshots).toHaveLength(2);
    expect(snapshots[0]?.project.metadata.title).toBe("두 번째");
    expect(snapshots[1]?.reason).toBe("manual");
  });

  it("keeps autosaved projects readable when titles are blank", () => {
    const project = createStarterProject();

    writeAutosavedProject({
      ...project,
      metadata: { ...project.metadata, title: "" },
      chapters: project.chapters.map((chapter, index) => (index === 0 ? { ...chapter, title: "" } : chapter)),
    });

    const restored = readAutosavedProject();
    expect(restored?.metadata.title).toBe("제목 없는 책");
    expect(restored?.chapters[0]?.title).toBe("제목 없는 페이지");
  });

  it("ignores malformed snapshot storage", () => {
    window.localStorage.setItem("bookspace-lite:snapshots:v1", "not-json");

    expect(readSnapshots()).toEqual([]);
  });

  it("filters snapshots with invalid project payloads", () => {
    const project = createStarterProject();
    window.localStorage.setItem("bookspace-lite:snapshots:v1", JSON.stringify([
      {
        createdAt: "2026-06-15T00:00:00.000Z",
        id: "bad",
        project: { metadata: { title: 7 } },
        reason: "manual",
      },
      {
        createdAt: "2026-06-15T00:01:00.000Z",
        id: "good",
        project,
        reason: "manual",
      },
    ]));

    const snapshots = readSnapshots();
    expect(snapshots).toHaveLength(1);
    expect(snapshots[0]?.id).toBe("good");
  });
});

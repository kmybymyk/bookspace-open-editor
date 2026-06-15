import type { PointerEvent } from "react";
import { useState } from "react";
import { ChevronDown, CircleHelp, CornerDownRight, GripVertical, ListTree, Plus, Trash2 } from "lucide-react";
import type { Chapter, ChapterKind, ChapterType } from "../domain/project";
import { DragPreview } from "./DragPreview";
import { CHAPTER_TYPE_GROUPS, SECTION_ORDER, chapterKind, chapterSubtitle, groupChapters, sectionTitle } from "./structureOptions";

type DropTarget = {
  readonly chapterId: string;
  readonly position: "before" | "after";
};

type LeftPaneProps = {
  readonly chapters: readonly Chapter[];
  readonly activeChapterId: string;
  readonly onAddChapter: (type: ChapterType) => void;
  readonly onChangeChapterType: (chapterId: string, type: ChapterType, kind: ChapterKind) => void;
  readonly onDeleteChapter: (chapterId: string) => void;
  readonly onReorderChapter: (draggedChapterId: string, targetChapterId: string, position: "before" | "after") => void;
  readonly onSelectChapter: (chapterId: string) => void;
};

export function LeftPane({
  chapters,
  activeChapterId,
  onAddChapter,
  onChangeChapterType,
  onDeleteChapter,
  onReorderChapter,
  onSelectChapter,
}: LeftPaneProps) {
  const [openMenu, setOpenMenu] = useState<null | { readonly chapterId: string; readonly kind: "type" }>(null);
  const [draggedChapterId, setDraggedChapterId] = useState<string | null>(null);
  const [dragPreviewPoint, setDragPreviewPoint] = useState<null | { readonly x: number; readonly y: number }>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  const closeMenu = () => setOpenMenu(null);
  const toggleMenu = (chapterId: string, kind: "type") => {
    setOpenMenu((current) => (current?.chapterId === chapterId && current.kind === kind ? null : { chapterId, kind }));
  };
  const targetFromPoint = (x: number, y: number): DropTarget | null => {
    if (typeof document.elementFromPoint !== "function") return null;
    const row = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-chapter-id]");
    const chapterId = row?.dataset["chapterId"];
    if (row === null || row === undefined || chapterId === undefined || chapterId === draggedChapterId) return null;
    const rect = row.getBoundingClientRect();
    return { chapterId, position: y < rect.top + rect.height / 2 ? "before" : "after" };
  };
  const targetFromRow = (row: HTMLDivElement, chapterId: string, y: number): DropTarget | null => {
    if (chapterId === draggedChapterId) return null;
    const rect = row.getBoundingClientRect();
    return { chapterId, position: y < rect.top + rect.height / 2 ? "before" : "after" };
  };
  const handlePointerStart = (event: PointerEvent<HTMLButtonElement>, chapterId: string) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDraggedChapterId(chapterId);
    setDragPreviewPoint({ x: event.clientX, y: event.clientY });
    setDropTarget(null);
    closeMenu();
  };
  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (draggedChapterId === null) return;
    setDragPreviewPoint({ x: event.clientX, y: event.clientY });
    setDropTarget(targetFromPoint(event.clientX, event.clientY));
  };
  const handlePointerEnd = () => {
    if (draggedChapterId !== null && dropTarget !== null) {
      onReorderChapter(draggedChapterId, dropTarget.chapterId, dropTarget.position);
    }
    setDraggedChapterId(null);
    setDragPreviewPoint(null);
    setDropTarget(null);
  };
  const draggedChapter = chapters.find((chapter) => chapter.id === draggedChapterId);

  return (
    <aside className="left-pane" onPointerCancel={handlePointerEnd} onPointerMove={handlePointerMove} onPointerUp={handlePointerEnd}>
      <div className="left-pane-top">
        <button className="empty-page-button" type="button" onClick={() => onAddChapter("chapter")}>
          <Plus size={17} strokeWidth={2.1} />
          빈 페이지
        </button>
      </div>
      <div className="structure-tree">
        {SECTION_ORDER.map((section) => {
          const sectionChapters = groupChapters(chapters, section);
          return (
            <section className="structure-section" key={section}>
              <div className="structure-section-heading">
                <span>{sectionTitle(section)}</span>
                <CircleHelp size={15} strokeWidth={2.1} />
              </div>
              {sectionChapters.length === 0 ? (
                <button className="empty-section-row" type="button" onClick={() => onAddChapter(section)}>
                  + 페이지 추가
                </button>
              ) : (
                <div className="section-page-list">
                  {sectionChapters.map((chapter, index) => {
                    const active = chapter.id === activeChapterId;
                    const isChild = section === "chapter" && index > 0;
                    const selectedKind = chapterKind(chapter);
                    const rowClassName = [
                      "chapter-row",
                      active ? "active" : "",
                      isChild ? "child-row" : "",
                      draggedChapterId === chapter.id ? "dragging" : "",
                      dropTarget?.chapterId === chapter.id ? "drop-target" : "",
                      dropTarget?.chapterId === chapter.id ? `drop-${dropTarget.position}` : "",
                    ].filter(Boolean).join(" ");
                    return (
                      <div
                        className={rowClassName}
                        data-chapter-id={chapter.id}
                        key={chapter.id}
                        onPointerMove={(event) => {
                          if (draggedChapterId !== null && draggedChapterId !== chapter.id) {
                            event.stopPropagation();
                            setDragPreviewPoint({ x: event.clientX, y: event.clientY });
                            setDropTarget(targetFromRow(event.currentTarget, chapter.id, event.clientY));
                          }
                        }}
                      >
                        {dropTarget?.chapterId === chapter.id ? <div className="drop-target-label">여기에 놓기</div> : null}
                        <button
                          className={isChild ? "chapter-select child" : "chapter-select"}
                          type="button"
                          onClick={() => onSelectChapter(chapter.id)}
                        >
                          {isChild ? <CornerDownRight size={16} strokeWidth={1.9} /> : section === "chapter" ? <ChevronDown size={17} /> : null}
                          <span className="chapter-copy">
                            <span className="chapter-title-line">
                              <span className="chapter-title-text">{chapter.title}</span>
                              {active ? <span className="current-badge">현재</span> : null}
                            </span>
                            <span className="chapter-subtitle">{chapterSubtitle(chapter)}</span>
                          </span>
                        </button>
                        <div className="chapter-actions" aria-label={`${chapter.title} 작업`}>
                          <button type="button" aria-label={`${chapter.title} 구조 변경`} title="구조" onClick={() => toggleMenu(chapter.id, "type")}>
                            <ListTree size={18} />
                          </button>
                          <button
                            type="button"
                            aria-label={`${chapter.title} 드래그로 이동`}
                            title="드래그"
                            onPointerDown={(event) => handlePointerStart(event, chapter.id)}
                          >
                            <GripVertical size={18} />
                          </button>
                          <button type="button" aria-label={`${chapter.title} 삭제`} title="삭제" onClick={() => onDeleteChapter(chapter.id)}>
                            <Trash2 size={18} />
                          </button>
                          {openMenu?.chapterId === chapter.id && openMenu.kind === "type" ? (
                            <div className="chapter-action-menu convert-menu" role="menu" aria-label={`${chapter.title} 구조 변경`}>
                              <div className="convert-menu-help">페이지 종류를 바꾸면 해당 섹션으로 자동 이동합니다.</div>
                              <div className="convert-menu-scroll">
                                {CHAPTER_TYPE_GROUPS.map((group, groupIndex) => (
                                  <div className={groupIndex > 0 ? "convert-menu-group divided" : "convert-menu-group"} key={group.title}>
                                    <div className="convert-menu-title">{group.title}</div>
                                    {group.items.map((option) => (
                                      <button
                                        className="convert-menu-item"
                                        disabled={selectedKind === option.kind}
                                        key={option.kind}
                                        type="button"
                                        onClick={() => {
                                          onChangeChapterType(chapter.id, option.value, option.kind);
                                          closeMenu();
                                        }}
                                      >
                                        <span className="convert-menu-check">{selectedKind === option.kind ? "✓" : ""}</span>
                                        <span>
                                          <span className="convert-menu-label">{option.label}</span>
                                          <span className="convert-menu-description">{option.description}</span>
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
      {draggedChapter !== undefined && dragPreviewPoint !== null ? (
        <DragPreview
          subtitle={chapterSubtitle(draggedChapter)}
          title={draggedChapter.title}
          x={dragPreviewPoint.x}
          y={dragPreviewPoint.y}
        />
      ) : null}
    </aside>
  );
}

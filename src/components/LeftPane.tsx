import type { PointerEvent } from "react";
import { useState } from "react";
import { ChevronDown, CircleHelp, CornerDownRight, GripVertical, ListTree, Plus, Trash2 } from "lucide-react";
import type { Chapter, ChapterKind, ChapterType } from "../domain/project";
import type { AppCopy } from "../i18n";
import { trackEditorEvent } from "../analytics";
import { DragPreview } from "./DragPreview";
import { CHAPTER_TYPE_GROUPS, SECTION_ORDER, chapterKind, groupChapters } from "./structureOptions";

type DropTarget = {
  readonly chapterId: string;
  readonly position: "before" | "after";
};

type LeftPaneProps = {
  readonly chapters: readonly Chapter[];
  readonly activeChapterId: string;
  readonly copy: AppCopy["structure"];
  readonly onAddChapter: (type: ChapterType) => void;
  readonly onChangeChapterType: (chapterId: string, type: ChapterType, kind: ChapterKind) => void;
  readonly onDeleteChapter: (chapterId: string) => void;
  readonly onReorderChapter: (draggedChapterId: string, targetChapterId: string, position: "before" | "after") => void;
  readonly onSelectChapter: (chapterId: string) => void;
};

export function LeftPane({
  chapters,
  activeChapterId,
  copy,
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
      trackEditorEvent("editor_chapter_reorder", { position: dropTarget.position });
    }
    setDraggedChapterId(null);
    setDragPreviewPoint(null);
    setDropTarget(null);
  };
  const draggedChapter = chapters.find((chapter) => chapter.id === draggedChapterId);

  return (
    <aside id="structure-pane" className="left-pane" onPointerCancel={handlePointerEnd} onPointerMove={handlePointerMove} onPointerUp={handlePointerEnd}>
      <div className="left-pane-top">
        <button className="empty-page-button" type="button" onClick={() => onAddChapter("chapter")} data-analytics-event="editor_chapter_add" data-analytics-param-chapter-type="chapter" data-analytics-param-placement="left_pane_top">
          <Plus size={17} strokeWidth={2.1} />
          {copy.emptyPage}
        </button>
      </div>
      <div className="structure-tree">
        {SECTION_ORDER.map((section) => {
          const sectionChapters = groupChapters(chapters, section);
          return (
            <section className="structure-section" key={section}>
              <div className="structure-section-heading">
                <span>{copy.sections[section]}</span>
                <CircleHelp size={15} strokeWidth={2.1} />
              </div>
              {sectionChapters.length === 0 ? (
                <button className="empty-section-row" type="button" onClick={() => onAddChapter(section)} data-analytics-event="editor_chapter_add" data-analytics-param-chapter-type={section} data-analytics-param-placement="empty_section">
                  {copy.addPage}
                </button>
              ) : (
                <div className="section-page-list">
                  {sectionChapters.map((chapter, index) => {
                    const active = chapter.id === activeChapterId;
                    const isChild = section === "chapter" && chapter.type !== "part";
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
                        {dropTarget?.chapterId === chapter.id ? <div className="drop-target-label">{copy.dropHere}</div> : null}
                        <button
                          className={isChild ? "chapter-select child" : "chapter-select"}
                          type="button"
                          onClick={() => onSelectChapter(chapter.id)}
                          data-analytics-event="editor_chapter_select"
                          data-analytics-param-chapter-type={chapter.type}
                        >
                          {isChild ? <CornerDownRight size={16} strokeWidth={1.9} /> : section === "chapter" ? <ChevronDown size={17} /> : <span className="chapter-select-spacer" aria-hidden="true" />}
                          <span className="chapter-copy">
                            <span className="chapter-title-line">
                              <span className="chapter-title-text">{chapter.title}</span>
                              {active ? <span className="current-badge">{copy.current}</span> : null}
                            </span>
                            <span className="chapter-subtitle">{copy.kindLabels[chapterKind(chapter)]}</span>
                          </span>
                        </button>
                        <div className="chapter-actions" aria-label={`${chapter.title} ${copy.workSuffix}`}>
                          <button
                            type="button"
                            aria-expanded={openMenu?.chapterId === chapter.id && openMenu.kind === "type"}
                            aria-label={`${chapter.title} ${copy.changeStructure}`}
                            aria-controls={`${chapter.id}-structure-menu`}
                            aria-haspopup="dialog"
                            title={copy.structure}
                            onClick={() => toggleMenu(chapter.id, "type")}
                            data-analytics-event="editor_chapter_menu_open"
                            data-analytics-param-menu="structure"
                          >
                            <ListTree size={18} />
                          </button>
                          <button
                            type="button"
                            aria-label={`${chapter.title} ${copy.drag}`}
                            title={copy.drag}
                            onPointerDown={(event) => handlePointerStart(event, chapter.id)}
                          >
                            <GripVertical size={18} />
                          </button>
                          <button type="button" aria-label={`${chapter.title} ${copy.delete}`} title={copy.delete} onClick={() => onDeleteChapter(chapter.id)} data-analytics-event="editor_chapter_delete" data-analytics-param-chapter-type={chapter.type}>
                            <Trash2 size={18} />
                          </button>
                          {openMenu?.chapterId === chapter.id && openMenu.kind === "type" ? (
                            <div className="chapter-action-menu convert-menu" id={`${chapter.id}-structure-menu`} aria-label={`${chapter.title} ${copy.changeStructure}`}>
                              <div className="convert-menu-help">{copy.moveToSectionHelp}</div>
                              <div className="convert-menu-scroll">
                                {CHAPTER_TYPE_GROUPS.map((group, groupIndex) => (
                                  <div className={groupIndex > 0 ? "convert-menu-group divided" : "convert-menu-group"} key={group.key}>
                                    <div className="convert-menu-title">{copy.groupTitles[group.key]}</div>
                                    {group.items.map((option) => (
                                      <button
                                        className="convert-menu-item"
                                        disabled={selectedKind === option.kind}
                                        key={option.kind}
                                        type="button"
                                        onClick={() => {
                                          onChangeChapterType(chapter.id, option.value, option.kind);
                                          trackEditorEvent("editor_chapter_type_change", { target_chapter_type: option.value, target_chapter_kind: option.kind });
                                          closeMenu();
                                        }}
                                      >
                                        <span className="convert-menu-check">{selectedKind === option.kind ? "✓" : ""}</span>
                                        <span>
                                          <span className="convert-menu-label">{copy.kindLabels[option.kind]}</span>
                                          <span className="convert-menu-description">{copy.kindDescriptions[option.kind]}</span>
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
          subtitle={copy.kindLabels[chapterKind(draggedChapter)]}
          title={draggedChapter.title}
          x={dragPreviewPoint.x}
          y={dragPreviewPoint.y}
        />
      ) : null}
    </aside>
  );
}

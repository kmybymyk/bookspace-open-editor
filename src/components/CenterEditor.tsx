import { useEffect } from "react";
import type { ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading2, Heading3, Italic, List, Minus, Pilcrow, Quote, Redo2, Undo2 } from "lucide-react";
import type { Chapter, DesignSettings } from "../domain/project";
import { fontOptionFor } from "../domain/fonts";

type CenterEditorProps = {
  readonly chapter: Chapter;
  readonly design: DesignSettings;
  readonly onRename: (title: string) => void;
  readonly onContentChange: (contentHtml: string) => void;
};

type EditorToolbarProps = {
  readonly editor: Editor | null;
};

type ToolbarButtonProps = {
  readonly active?: boolean;
  readonly children: ReactNode;
  readonly disabled: boolean;
  readonly label: string;
  readonly onClick: () => void;
};

function ToolbarButton({ active = false, children, disabled, label, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={active ? "active" : ""}
      disabled={disabled}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function EditorToolbar({ editor }: EditorToolbarProps) {
  const disabled = editor === null;
  const run = (command: () => boolean) => {
    command();
  };

  return (
    <div className="editor-toolbar" aria-label="본문 서식 도구">
      <div className="editor-toolbar-group">
        <ToolbarButton disabled={disabled} label="실행취소" onClick={() => run(() => editor?.chain().focus().undo().run() ?? false)}>
          <Undo2 size={15} />
        </ToolbarButton>
        <ToolbarButton disabled={disabled} label="재실행" onClick={() => run(() => editor?.chain().focus().redo().run() ?? false)}>
          <Redo2 size={15} />
        </ToolbarButton>
      </div>
      <div className="editor-toolbar-group">
        <ToolbarButton disabled={disabled} label="본문" active={editor?.isActive("paragraph") ?? false} onClick={() => run(() => editor?.chain().focus().setParagraph().run() ?? false)}>
          <Pilcrow size={15} />
        </ToolbarButton>
        <ToolbarButton disabled={disabled} label="소제목" active={editor?.isActive("heading", { level: 2 }) ?? false} onClick={() => run(() => editor?.chain().focus().toggleHeading({ level: 2 }).run() ?? false)}>
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton disabled={disabled} label="작은 소제목" active={editor?.isActive("heading", { level: 3 }) ?? false} onClick={() => run(() => editor?.chain().focus().toggleHeading({ level: 3 }).run() ?? false)}>
          <Heading3 size={16} />
        </ToolbarButton>
      </div>
      <div className="editor-toolbar-group">
        <ToolbarButton disabled={disabled} label="굵게" active={editor?.isActive("bold") ?? false} onClick={() => run(() => editor?.chain().focus().toggleBold().run() ?? false)}>
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton disabled={disabled} label="기울임" active={editor?.isActive("italic") ?? false} onClick={() => run(() => editor?.chain().focus().toggleItalic().run() ?? false)}>
          <Italic size={15} />
        </ToolbarButton>
      </div>
      <div className="editor-toolbar-group">
        <ToolbarButton disabled={disabled} label="목록" active={editor?.isActive("bulletList") ?? false} onClick={() => run(() => editor?.chain().focus().toggleBulletList().run() ?? false)}>
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton disabled={disabled} label="인용" active={editor?.isActive("blockquote") ?? false} onClick={() => run(() => editor?.chain().focus().toggleBlockquote().run() ?? false)}>
          <Quote size={15} />
        </ToolbarButton>
        <ToolbarButton disabled={disabled} label="구분선" onClick={() => run(() => editor?.chain().focus().setHorizontalRule().run() ?? false)}>
          <Minus size={16} />
        </ToolbarButton>
      </div>
    </div>
  );
}

function sanitizePastedHtml(html: string): string {
  const template = document.createElement("template");
  template.innerHTML = html;
  for (const element of Array.from(template.content.querySelectorAll("script, style, meta, link"))) {
    element.remove();
  }
  for (const element of Array.from(template.content.querySelectorAll("*"))) {
    const href = element.tagName.toLowerCase() === "a" ? element.getAttribute("href") : null;
    for (const attribute of Array.from(element.attributes)) {
      element.removeAttribute(attribute.name);
    }
    if (href !== null && (href.startsWith("#") || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:"))) {
      element.setAttribute("href", href);
    }
    if (element.tagName.toLowerCase() === "span" || element.tagName.toLowerCase() === "font") {
      element.replaceWith(...Array.from(element.childNodes));
    }
  }
  return template.innerHTML;
}

export function CenterEditor({ chapter, design, onRename, onContentChange }: CenterEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
    ],
    content: chapter.contentHtml,
    editorProps: {
      attributes: {
        "aria-label": "본문 편집기",
        class: "writing-surface",
        role: "textbox",
      },
      transformPastedHTML: sanitizePastedHtml,
    },
    onUpdate: ({ editor: updatedEditor }) => onContentChange(updatedEditor.getHTML()),
  });

  useEffect(() => {
    if (editor === null) return;
    if (editor.isDestroyed || editor.schema === null) return;
    if (editor.getHTML() !== chapter.contentHtml) {
      editor.commands.setContent(chapter.contentHtml, { emitUpdate: false });
    }
  }, [chapter.contentHtml, chapter.id, editor]);

  return (
    <main className="center-pane">
      <div className={`page-card tone-${design.pageTone}`}>
        <EditorToolbar editor={editor} />
        <input
          aria-label="챕터 제목"
          className="chapter-title-input"
          value={chapter.title}
          onChange={(event) => onRename(event.currentTarget.value)}
        />
        <EditorContent
          editor={editor}
          style={{
            fontFamily: fontOptionFor(design.fontFamily).cssFamily,
            fontSize: `${design.fontSize}px`,
            lineHeight: design.lineHeight,
          }}
        />
      </div>
    </main>
  );
}

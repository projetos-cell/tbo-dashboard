"use client";

import { useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Mention from "@tiptap/extension-mention";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  CheckSquare,
  Link2,
  Heading2,
  Quote,
  Code,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createMentionSuggestion, type MentionDataProvider } from "./mention-suggestion";

// ─── Types ───────────────────────────────────────────────────

interface RichTextEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  onBlur?: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  /** Show toolbar (default: true for description, false for comments) */
  toolbar?: boolean;
  /** Minimal mode for comment composer (single-line feel) */
  minimal?: boolean;
  /** Data provider for @mentions suggestions */
  mentionProvider?: MentionDataProvider;
  /** Auto-focus the editor */
  autoFocus?: boolean;
  /** Ctrl+Enter submit handler */
  onSubmit?: (html: string) => void;
}

export function RichTextEditor({
  content = "",
  onChange,
  onBlur,
  placeholder = "Escreva algo...",
  editable = true,
  className,
  toolbar = true,
  minimal = false,
  mentionProvider,
  autoFocus = false,
  onSubmit,
}: RichTextEditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onBlurRef = useRef(onBlur);
  onBlurRef.current = onBlur;
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  const extensions = [
    StarterKit.configure({
      heading: minimal ? false : { levels: [2, 3] },
      blockquote: minimal ? false : undefined,
      codeBlock: minimal ? false : undefined,
      horizontalRule: minimal ? false : undefined,
    }),
    Placeholder.configure({ placeholder }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: "text-primary underline cursor-pointer" },
    }),
    ...(minimal
      ? []
      : [
          TaskList,
          TaskItem.configure({ nested: true }),
        ]),
    ...(mentionProvider
      ? [
          Mention.configure({
            HTMLAttributes: {
              class:
                "mention bg-primary/10 text-primary rounded px-1 py-0.5 font-medium text-sm",
            },
            suggestion: createMentionSuggestion(mentionProvider),
          }),
        ]
      : []),
  ];

  const editor = useEditor({
    extensions,
    content,
    editable,
    autofocus: autoFocus,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none",
          minimal ? "min-h-[40px] py-2 px-3" : "min-h-[80px] p-3",
          "[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5",
          "[&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1",
          "[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1",
          "[&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
          "[&_p]:my-1",
        ),
      },
      handleKeyDown: (_view, event) => {
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          const html = editor?.getHTML() ?? "";
          onSubmitRef.current?.(html);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: e }) => {
      onChangeRef.current?.(e.getHTML());
    },
    onBlur: ({ editor: e }) => {
      onBlurRef.current?.(e.getHTML());
    },
  });

  // Sync content from outside
  useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== content) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        "rounded-lg border bg-background transition-colors",
        editor.isFocused && "ring-1 ring-ring",
        className
      )}
    >
      {toolbar && !minimal && editable && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

// ─── Toolbar ─────────────────────────────────────────────────

function Toolbar({ editor }: { editor: Editor }) {
  const addLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1">
      <ToolbarButton
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        icon={<Heading2 className="h-3.5 w-3.5" />}
        title="Título"
      />
      <ToolbarButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        icon={<Bold className="h-3.5 w-3.5" />}
        title="Negrito"
      />
      <ToolbarButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        icon={<Italic className="h-3.5 w-3.5" />}
        title="Itálico"
      />
      <ToolbarButton
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        icon={<Strikethrough className="h-3.5 w-3.5" />}
        title="Tachado"
      />
      <div className="mx-1 h-4 w-px bg-border" />
      <ToolbarButton
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        icon={<List className="h-3.5 w-3.5" />}
        title="Lista"
      />
      <ToolbarButton
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        icon={<ListOrdered className="h-3.5 w-3.5" />}
        title="Lista numerada"
      />
      <ToolbarButton
        active={editor.isActive("taskList")}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        icon={<CheckSquare className="h-3.5 w-3.5" />}
        title="Checklist"
      />
      <div className="mx-1 h-4 w-px bg-border" />
      <ToolbarButton
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        icon={<Quote className="h-3.5 w-3.5" />}
        title="Citação"
      />
      <ToolbarButton
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
        icon={<Code className="h-3.5 w-3.5" />}
        title="Código"
      />
      <ToolbarButton
        active={editor.isActive("link")}
        onClick={addLink}
        icon={<Link2 className="h-3.5 w-3.5" />}
        title="Link"
      />
      <div className="mx-1 h-4 w-px bg-border" />
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        icon={<Undo className="h-3.5 w-3.5" />}
        title="Desfazer"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        icon={<Redo className="h-3.5 w-3.5" />}
        title="Refazer"
      />
    </div>
  );
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  icon,
  title,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "rounded p-1.5 transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        disabled && "opacity-30 cursor-not-allowed"
      )}
    >
      {icon}
    </button>
  );
}

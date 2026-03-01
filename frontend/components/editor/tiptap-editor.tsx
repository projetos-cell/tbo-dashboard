"use client";

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  ListChecks,
  Undo,
  Redo,
  Code,
  Quote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";

interface TiptapEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  editable?: boolean;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function TiptapEditor({
  content = "",
  onChange,
  editable = true,
  placeholder = "Escreva aqui...",
  className,
  minHeight = "min-h-[200px]",
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline cursor-pointer" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-md max-w-full" },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none px-3 py-2",
          minHeight
        ),
      },
    },
  });

  const addLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL da imagem");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        "border rounded-md bg-background overflow-hidden",
        className
      )}
    >
      {editable && (
        <div className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1 bg-muted/30">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Negrito"
          >
            <Bold className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Itálico"
          >
            <Italic className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            title="Tachado"
          >
            <Strikethrough className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            title="Código"
          >
            <Code className="size-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            active={editor.isActive("heading", { level: 1 })}
            title="Título 1"
          >
            <Heading1 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor.isActive("heading", { level: 2 })}
            title="Título 2"
          >
            <Heading2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            active={editor.isActive("heading", { level: 3 })}
            title="Título 3"
          >
            <Heading3 className="size-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Lista"
          >
            <List className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Lista numerada"
          >
            <ListOrdered className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            active={editor.isActive("taskList")}
            title="Checklist"
          >
            <ListChecks className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Citação"
          >
            <Quote className="size-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton onClick={addLink} active={editor.isActive("link")} title="Link">
            <LinkIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton onClick={addImage} title="Imagem">
            <ImageIcon className="size-4" />
          </ToolbarButton>

          <div className="ml-auto flex items-center gap-0.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Desfazer"
            >
              <Undo className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Refazer"
            >
              <Redo className="size-4" />
            </ToolbarButton>
          </div>
        </div>
      )}

      {editable && editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="flex items-center gap-0.5 rounded-md border bg-background p-1 shadow-md"
        >
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            size="sm"
          >
            <Bold className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            size="sm"
          >
            <Italic className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={addLink}
            active={editor.isActive("link")}
            size="sm"
          >
            <LinkIcon className="size-3.5" />
          </ToolbarButton>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
  size = "default",
}: {
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
  size?: "default" | "sm";
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        size === "sm" ? "size-6" : "size-7",
        active && "bg-accent text-accent-foreground"
      )}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
    >
      {children}
    </Button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}

"use client";

import { useState, useRef } from "react";
import { EditorContent, BubbleMenu } from "@tiptap/react";
import {
  IconBold,
  IconItalic,
  IconLink,
  IconCode,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { renderToHTML, isEmptyDescription } from "@/lib/tiptap-helpers";
import { useTaskDescriptionEditor } from "@/features/tasks/hooks/use-task-description-editor";
import { BubbleBtn } from "./bubble-btn";

interface TaskDescriptionEditorProps {
  taskId: string;
  description: string | null;
}

export function TaskDescriptionEditor({
  taskId,
  description,
}: TaskDescriptionEditorProps) {
  const { editor, editing, setEditing, saveStatus } =
    useTaskDescriptionEditor(taskId, description);

  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);

  const empty = isEmptyDescription(description);

  // ─── Read mode ─────────────────────────────────────

  if (!editing) {
    return (
      <div
        className="py-2 cursor-text group"
        onClick={() => setEditing(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setEditing(true)}
        aria-label="Editar descrição"
      >
        {empty ? (
          <p className="text-sm text-muted-foreground/60 italic px-1 group-hover:text-muted-foreground transition-colors select-none">
            Adicione uma descrição para dar contexto à tarefa...
          </p>
        ) : (
          <div
            className="prose prose-sm max-w-none text-foreground px-1
              prose-p:my-1 prose-ul:my-1 prose-ol:my-1
              prose-headings:font-semibold prose-headings:text-foreground
              prose-code:text-xs prose-code:bg-muted prose-code:px-1 prose-code:rounded"
            dangerouslySetInnerHTML={{ __html: renderToHTML(description) }}
          />
        )}
      </div>
    );
  }

  // ─── Edit mode ─────────────────────────────────────

  function handleLinkConfirm() {
    if (!editor) return;
    if (linkUrl) editor.chain().focus().setLink({ href: linkUrl }).run();
    else editor.chain().focus().unsetLink().run();
    setLinkOpen(false);
    setLinkUrl("");
  }

  function handleLinkCancel() {
    setLinkOpen(false);
    setLinkUrl("");
    editor?.commands.focus();
  }

  return (
    <div className="py-2">
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="flex items-center gap-0.5 rounded-md border bg-popover px-1 py-0.5 shadow-md"
        >
          {linkOpen ? (
            <div className="flex items-center gap-1 px-1">
              <input
                ref={linkInputRef}
                autoFocus
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLinkConfirm();
                  if (e.key === "Escape") handleLinkCancel();
                }}
                placeholder="https://..."
                className="h-6 w-44 rounded border border-border px-1.5 text-xs outline-none focus:border-ring"
              />
              <button
                type="button"
                onClick={handleLinkConfirm}
                aria-label="Confirmar link"
                className="rounded p-0.5 text-green-600 hover:bg-green-50 transition-colors"
              >
                <IconCheck className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleLinkCancel}
                aria-label="Cancelar"
                className="rounded p-0.5 text-muted-foreground hover:bg-muted transition-colors"
              >
                <IconX className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <>
              <BubbleBtn
                active={editor.isActive("bold")}
                onClick={() => editor.chain().focus().toggleBold().run()}
                label="Negrito"
              >
                <IconBold className="h-3.5 w-3.5" />
              </BubbleBtn>
              <BubbleBtn
                active={editor.isActive("italic")}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                label="Itálico"
              >
                <IconItalic className="h-3.5 w-3.5" />
              </BubbleBtn>
              <BubbleBtn
                active={editor.isActive("code")}
                onClick={() => editor.chain().focus().toggleCode().run()}
                label="Código inline"
              >
                <IconCode className="h-3.5 w-3.5" />
              </BubbleBtn>
              <BubbleBtn
                active={editor.isActive("link")}
                onClick={() => {
                  const current = editor.getAttributes("link").href as
                    | string
                    | undefined;
                  setLinkUrl(current ?? "");
                  setLinkOpen(true);
                  setTimeout(() => linkInputRef.current?.focus(), 50);
                }}
                label="Link"
              >
                <IconLink className="h-3.5 w-3.5" />
              </BubbleBtn>
            </>
          )}
        </BubbleMenu>
      )}

      <div className="rounded border border-border/60 focus-within:border-ring/60 transition-colors bg-background">
        <EditorContent editor={editor} />
        <div className="flex items-center justify-between border-t border-border/30 px-2 py-1">
          <span className="text-[10px] text-muted-foreground">
            @ mencionar · / comandos
          </span>
          <div className="flex items-center gap-2">
            {saveStatus === "saving" && (
              <span className="text-[10px] text-muted-foreground animate-pulse">
                Salvando...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="text-[10px] text-green-600">Salvo</span>
            )}
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


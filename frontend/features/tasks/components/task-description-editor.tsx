"use client";

import { useState, useRef, useCallback } from "react";
import { EditorContent } from "@tiptap/react";
import {
  IconBold,
  IconItalic,
  IconLink,
  IconCode,
  IconList,
  IconListNumbers,
  IconCheck,
  IconX,
  IconIndentIncrease,
  IconIndentDecrease,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useTaskDescriptionEditor } from "@/features/tasks/hooks/use-task-description-editor";

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

  const handleClose = useCallback(() => {
    // Flush any pending saves
    if (editor) {
      editor.commands.blur();
    }
    // Defer state change to next tick to avoid DOM conflicts
    requestAnimationFrame(() => {
      setEditing(false);
    });
  }, [editor, setEditing]);

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

  // ─── Read mode ─────────────────────────────────────

  if (!editing) {
    return (
      <div
        className="cursor-text group"
        onClick={() => setEditing(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setEditing(true)}
        aria-label="Editar descrição"
      >
        {editor && !editor.isEmpty ? (
          <div className="rounded-md px-1 py-1 group-hover:bg-muted/20 transition-colors duration-150">
            <EditorContent editor={editor} />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/60 px-3 py-3 group-hover:border-border group-hover:bg-muted/30 transition-all duration-150">
            <p className="text-sm text-muted-foreground/60 group-hover:text-muted-foreground transition-colors select-none">
              Clique para adicionar uma descrição...
            </p>
          </div>
        )}
      </div>
    );
  }

  // ─── Edit mode ─────────────────────────────────────

  return (
    <div className="py-1">
      <div className="rounded-lg border border-border/60 focus-within:border-ring/60 transition-colors bg-background">
        {/* ── Fixed Toolbar ───────────────────── */}
        {editor && (
          <div className="flex items-center gap-0.5 border-b border-border/40 px-2 py-1">
            <ToolbarBtn
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
              label="Negrito"
            >
              <IconBold className="h-3.5 w-3.5" />
            </ToolbarBtn>
            <ToolbarBtn
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              label="Itálico"
            >
              <IconItalic className="h-3.5 w-3.5" />
            </ToolbarBtn>
            <ToolbarBtn
              active={editor.isActive("code")}
              onClick={() => editor.chain().focus().toggleCode().run()}
              label="Código"
            >
              <IconCode className="h-3.5 w-3.5" />
            </ToolbarBtn>

            <div className="w-px h-4 bg-border mx-1" />

            <ToolbarBtn
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              label="Lista com pontos"
            >
              <IconList className="h-3.5 w-3.5" />
            </ToolbarBtn>
            <ToolbarBtn
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              label="Lista numerada"
            >
              <IconListNumbers className="h-3.5 w-3.5" />
            </ToolbarBtn>

            {/* Indent / Outdent for sub-lists */}
            <ToolbarBtn
              onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
              disabled={!editor.can().sinkListItem("listItem")}
              label="Aumentar recuo"
            >
              <IconIndentIncrease className="h-3.5 w-3.5" />
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor.chain().focus().liftListItem("listItem").run()}
              disabled={!editor.can().liftListItem("listItem")}
              label="Diminuir recuo"
            >
              <IconIndentDecrease className="h-3.5 w-3.5" />
            </ToolbarBtn>

            <div className="w-px h-4 bg-border mx-1" />

            {/* Link */}
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
                  className="h-6 w-36 rounded border border-border px-1.5 text-xs outline-none focus:border-ring"
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
              <ToolbarBtn
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
              </ToolbarBtn>
            )}
          </div>
        )}

        {/* ── Editor Content ──────────────────── */}
        <EditorContent editor={editor} />

        {/* ── Footer ─────────────────────────── */}
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
              onClick={handleClose}
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

// ─── Toolbar Button ───────────────────────────────────

function ToolbarBtn({
  active,
  disabled,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // prevent editor blur
        onClick();
      }}
      disabled={disabled}
      className={cn(
        "rounded p-1 transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "disabled:opacity-30 disabled:pointer-events-none",
        active && "bg-accent text-accent-foreground",
      )}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

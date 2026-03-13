"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useEditor,
  EditorContent,
  BubbleMenu,
  generateHTML,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import LinkExt from "@tiptap/extension-link";
import MentionExt from "@tiptap/extension-mention";
import {
  IconBold,
  IconItalic,
  IconLink,
  IconCode,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import { useMentionProvider } from "@/features/tasks/hooks/use-mention-provider";
import { createMentionSuggestion } from "@/components/shared/mention-suggestion";
import { createSlashCommandExtension } from "./slash-command-extension";

// ─── Helpers ──────────────────────────────────────────

const RENDER_EXTENSIONS = [StarterKit, LinkExt, MentionExt];

function isJsonDoc(raw: string | null): boolean {
  if (!raw) return false;
  try {
    const p = JSON.parse(raw);
    return p?.type === "doc";
  } catch {
    return false;
  }
}

function getInitialContent(description: string | null): object | string {
  if (!description) return "";
  if (isJsonDoc(description)) {
    try {
      return JSON.parse(description) as object;
    } catch {
      return description;
    }
  }
  return description;
}

function renderToHTML(description: string | null): string {
  if (!description) return "";
  if (isJsonDoc(description)) {
    try {
      return generateHTML(
        JSON.parse(description) as Parameters<typeof generateHTML>[0],
        RENDER_EXTENSIONS
      );
    } catch {
      return "";
    }
  }
  return description;
}

function isEmptyDescription(description: string | null): boolean {
  if (!description) return true;
  if (description === "{}") return true;
  try {
    const p = JSON.parse(description);
    if (p?.type === "doc" && (!p.content || p.content.length === 0)) return true;
    if (
      p?.type === "doc" &&
      p.content?.length === 1 &&
      p.content[0]?.type === "paragraph" &&
      !p.content[0]?.content
    )
      return true;
  } catch {
    // not JSON — treat as non-empty if has text
    return description.trim() === "" || description === "<p></p>";
  }
  return false;
}

// ─── Component ────────────────────────────────────────

interface TaskDescriptionEditorProps {
  taskId: string;
  description: string | null;
}

type SaveStatus = "idle" | "saving" | "saved";

export function TaskDescriptionEditor({
  taskId,
  description,
}: TaskDescriptionEditorProps) {
  const [editing, setEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateTask = useUpdateTask();
  const mentionProvider = useMentionProvider();

  const save = useCallback(
    (json: unknown) => {
      setSaveStatus("saving");
      updateTask.mutate(
        { id: taskId, updates: { description: JSON.stringify(json) } },
        {
          onSuccess: () => {
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
          },
          onError: () => setSaveStatus("idle"),
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [taskId]
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Adicione uma descrição para dar contexto à tarefa...",
      }),
      LinkExt.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline cursor-pointer" },
      }),
      MentionExt.configure({
        HTMLAttributes: { class: "text-primary font-medium" },
        suggestion: createMentionSuggestion(mentionProvider),
      }),
      createSlashCommandExtension(),
    ],
    content: getInitialContent(description),
    editable: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none px-3 py-2 min-h-[80px]",
      },
    },
    onUpdate: ({ editor }) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => save(editor.getJSON()), 1000);
    },
  });

  useEffect(() => {
    editor?.setEditable(editing);
    if (editing) setTimeout(() => editor?.commands.focus("end"), 50);
  }, [editing, editor]);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

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

  return (
    <div className="py-2">
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="flex items-center gap-0.5 rounded-md border bg-popover px-1 py-0.5 shadow-md"
        >
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
              const url = prompt("URL do link");
              if (url) editor.chain().focus().setLink({ href: url }).run();
              else if (url === "") editor.chain().focus().unsetLink().run();
            }}
            label="Link"
          >
            <IconLink className="h-3.5 w-3.5" />
          </BubbleBtn>
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

// ─── BubbleBtn ────────────────────────────────────────

function BubbleBtn({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "rounded p-1 transition-colors",
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

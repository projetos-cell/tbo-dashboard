"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import LinkExt from "@tiptap/extension-link";
import MentionExt from "@tiptap/extension-mention";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import { useMentionProvider } from "@/features/tasks/hooks/use-mention-provider";
import { createMentionSuggestion } from "@/components/shared/mention-suggestion";
import { createSlashCommandExtension } from "@/features/tasks/components/slash-command-extension";
import { getInitialContent } from "@/lib/tiptap-helpers";

type SaveStatus = "idle" | "saving" | "saved";

export function useTaskDescriptionEditor(
  taskId: string,
  description: string | null
) {
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
          onError: () => {
            setSaveStatus("idle");
          },
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

  return { editor, editing, setEditing, saveStatus };
}

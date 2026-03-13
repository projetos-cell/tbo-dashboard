"use client";

import { FileText } from "lucide-react";

interface TaskDetailDescriptionProps {
  description: string | null;
}

/**
 * Read-only description renderer.
 * Renders HTML from Tiptap JSONB or raw string.
 * Empty state encourages adding a description.
 */
export function TaskDetailDescription({ description }: TaskDetailDescriptionProps) {
  const isEmpty = !description || description === "{}" || description === "<p></p>";

  if (isEmpty) {
    return (
      <div className="flex items-start gap-2 py-4 px-1 text-muted-foreground">
        <FileText className="h-4 w-4 mt-0.5 shrink-0" />
        <p className="text-sm italic">
          Adicione uma descrição para dar contexto à tarefa
        </p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div
        className="prose prose-sm max-w-none text-foreground
          prose-p:my-1 prose-ul:my-1 prose-ol:my-1
          prose-headings:font-semibold prose-headings:text-foreground"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  );
}

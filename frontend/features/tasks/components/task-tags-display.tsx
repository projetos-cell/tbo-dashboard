"use client";

import { useState } from "react";
import { IconX, IconPlus } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTaskTags, useRemoveTagFromTask } from "@/features/tasks/hooks/use-task-tags";
import { TaskTagPicker } from "./task-tag-picker";

// ─── Component ─────────────────────────────────────

interface TaskTagsDisplayProps {
  taskId: string;
}

export function TaskTagsDisplay({ taskId }: TaskTagsDisplayProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { data: tags = [] } = useTaskTags(taskId);
  const removeTag = useRemoveTagFromTask();

  return (
    <div className="flex flex-wrap items-center gap-1 min-h-[22px]">
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          variant="secondary"
          className="group text-[10px] px-1.5 py-0 pr-1 gap-0.5 cursor-default border"
          style={
            tag.color
              ? {
                  backgroundColor: tag.color + "22",
                  color: tag.color,
                  borderColor: tag.color + "44",
                }
              : undefined
          }
        >
          {tag.name}
          <button
            type="button"
            className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 hover:text-destructive rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              removeTag.mutate({ taskId, tagId: tag.id });
            }}
            aria-label={`Remover tag ${tag.name}`}
          >
            <IconX className="h-2.5 w-2.5" />
          </button>
        </Badge>
      ))}

      <TaskTagPicker taskId={taskId} open={pickerOpen} onOpenChange={setPickerOpen}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
          onClick={() => setPickerOpen(true)}
        >
          <IconPlus className="h-3 w-3 mr-0.5" />
          {tags.length === 0 ? "Adicionar tag" : ""}
        </Button>
      </TaskTagPicker>
    </div>
  );
}

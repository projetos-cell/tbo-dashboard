"use client";

import { useState, type ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  useTaskTags,
  useOrgTags,
  useAddTagToTask,
  useRemoveTagFromTask,
  useCreateTag,
} from "@/features/tasks/hooks/use-task-tags";
import type { Tag } from "@/schemas/tag";
import { TAG_COLORS, SearchView, CreateView } from "./task-tag-picker-views";

export { TAG_COLORS } from "./task-tag-picker-views";

type PickerView = "search" | "create";

interface TaskTagPickerProps {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function TaskTagPicker({
  taskId,
  open,
  onOpenChange,
  children,
}: TaskTagPickerProps) {
  const [view, setView] = useState<PickerView>("search");
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<string>(TAG_COLORS[5].hex);

  const { data: taskTags = [] } = useTaskTags(taskId);
  const { data: orgTags = [] } = useOrgTags();
  const addTag = useAddTagToTask();
  const removeTag = useRemoveTagFromTask();
  const createTag = useCreateTag();

  const taskTagIds = new Set(taskTags.map((t) => t.id));

  const filteredOrgTags = orgTags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const showCreateOption =
    search.length > 0 &&
    !orgTags.some((t) => t.name.toLowerCase() === search.toLowerCase());

  function handleToggle(tag: Tag) {
    if (taskTagIds.has(tag.id)) {
      removeTag.mutate({ taskId, tagId: tag.id });
    } else {
      addTag.mutate({ taskId, tag });
    }
  }

  function handleOpenCreate() {
    setNewName(search);
    setView("create");
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    try {
      const tag = await createTag.mutateAsync({
        name: newName.trim(),
        color: newColor,
      });
      addTag.mutate({ taskId, tag });
      setView("search");
      setSearch("");
      setNewName("");
      setNewColor(TAG_COLORS[5].hex);
    } catch {
      // error handled by mutation toast
    }
  }

  function handleOpenChange(o: boolean) {
    onOpenChange(o);
    if (!o) {
      setView("search");
      setSearch("");
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>

      <PopoverContent className="w-[260px] p-0" align="start" sideOffset={6}>
        {view === "search" ? (
          <SearchView
            search={search}
            onSearchChange={setSearch}
            orgTags={filteredOrgTags}
            taskTagIds={taskTagIds}
            showCreateOption={showCreateOption}
            onToggle={handleToggle}
            onOpenCreate={handleOpenCreate}
          />
        ) : (
          <CreateView
            newName={newName}
            newColor={newColor}
            isPending={createTag.isPending}
            onNameChange={setNewName}
            onColorChange={setNewColor}
            onCancel={() => setView("search")}
            onCreate={handleCreate}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

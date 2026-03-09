---
description: Rules for drag and drop, reordering, and sortable interactions
globs: ["**/*drag*", "**/*drop*", "**/*sortable*", "**/*dnd*", "**/*reorder*", "**/*kanban*"]
---

# Drag & Drop Universal Rules

## Requirements
- EVERY module, section, and child MUST have vertical D&D
- Use @dnd-kit/core + @dnd-kit/sortable
- Optimistic update via React Query onMutate + rollback on error
- Ctrl+Z (undo) MANDATORY â€” maintain undo stack
- Persist to Supabase immediately (never local-only state)
- Broadcast to all users via Supabase Realtime

## Section Rules (auto-apply on drop)
When item moves to new section, automatically apply:
1. Default status of target section
2. Required tags of target section
3. Default assignee of target section
4. Inherited permissions of target section

## Pattern
```
DndContext -> onDragEnd -> {
  1. Get target section rules
  2. Optimistic cache update (queryClient.setQueryData)
  3. Push to undo stack (previous state)
  4. Mutate Supabase (update order + section_id + section rules)
  5. On error: rollback from undo stack + toast error
  6. On settled: invalidate queries
}
```

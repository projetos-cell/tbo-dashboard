"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconChecklist } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];
type TaskWithMilestone = TaskRow & { is_milestone?: boolean };

interface PortalTrackChecklistProps {
  tasks: TaskRow[];
  sections?: { id: string; title: string }[];
}

export function PortalTrackChecklist({ tasks, sections = [] }: PortalTrackChecklistProps) {
  const items = useMemo(() => {
    const milestonesTasks = (tasks as TaskWithMilestone[]).filter((t) => t.is_milestone);

    // If we have explicit milestones, use them
    if (milestonesTasks.length > 0) {
      return milestonesTasks.sort((a, b) => {
        if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
        if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
        if (a.due_date) return -1;
        if (b.due_date) return 1;
        return (a.order_index ?? 0) - (b.order_index ?? 0);
      });
    }

    // Auto-populate: first task of each section as "key deliverable"
    if (sections.length > 0) {
      const parentTasks = tasks.filter((t) => !t.parent_id);
      const keyTasks: TaskRow[] = [];

      for (const section of sections) {
        const sectionTasks = parentTasks
          .filter((t) => t.section_id === section.id)
          .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

        if (sectionTasks.length > 0) {
          keyTasks.push(sectionTasks[0]);
        }
      }

      if (keyTasks.length > 0) return keyTasks;
    }

    // Last fallback: top 6 tasks ordered by due_date
    return tasks
      .filter((t) => !t.parent_id)
      .sort((a, b) => {
        if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
        if (a.due_date) return -1;
        if (b.due_date) return 1;
        return (a.order_index ?? 0) - (b.order_index ?? 0);
      })
      .slice(0, 6);
  }, [tasks, sections]);

  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <IconChecklist className="size-4" />
          Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {items.map((m) => (
          <label
            key={m.id}
            className="flex items-start gap-2.5 rounded-md px-1 py-1"
          >
            <span
              className={cn(
                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
                m.is_completed
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/30",
              )}
            >
              {m.is_completed && (
                <svg
                  className="size-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </span>
            <span
              className={cn(
                "text-sm leading-snug",
                m.is_completed && "text-muted-foreground line-through",
              )}
            >
              {m.title}
            </span>
          </label>
        ))}
      </CardContent>
    </Card>
  );
}

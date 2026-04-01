"use client";

import Link from "next/link";
import {
  IconBriefcase,
  IconChevronRight,
  IconExternalLink,
  IconPlus,
} from "@tabler/icons-react";
import { useMyTasks } from "@/features/tasks/hooks/use-my-tasks";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionCard } from "./section-card";

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-destructive/10 text-destructive",
  high: "bg-hub-orange-glow text-hub-orange",
  medium: "bg-hub-bg-alt text-muted-foreground",
  low: "bg-hub-bg-alt text-muted-foreground",
};

export function ProjectsWidget() {
  const { data: tasks = [], isLoading } = useMyTasks(false);
  const recentTasks = tasks.slice(0, 4);

  return (
    <SectionCard>
      <h3 className="text-sm font-semibold mb-3 text-foreground">
        Minhas Tarefas
      </h3>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : recentTasks.length === 0 ? (
        <div className="text-center py-6">
          <IconBriefcase className="size-6 mx-auto mb-2 text-muted-foreground opacity-30" />
          <p className="text-xs text-muted-foreground mb-2">
            Nenhuma tarefa pendente
          </p>
          <Link
            href="/tarefas"
            className="inline-flex items-center gap-1 text-xs font-medium text-hub-orange hover:underline"
          >
            <IconPlus className="size-3" />
            Criar tarefa
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {recentTasks.map((task) => (
            <div key={task.id} className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium leading-snug text-foreground truncate">
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      PRIORITY_STYLES[task.priority ?? "medium"] ?? PRIORITY_STYLES.medium
                    }`}
                  >
                    {task.priority ?? "media"}
                  </span>
                </div>
              </div>
              <Link
                href="/tarefas"
                className="text-[9px] font-semibold uppercase tracking-wider shrink-0 mt-1 text-hub-orange"
              >
                VER <IconChevronRight className="inline size-2.5 -mt-px" />
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-hub-border-solid">
        <Link
          href="/tarefas"
          className="text-xs font-medium text-hub-orange inline-flex items-center gap-0.5"
        >
          <IconPlus className="size-3" /> Adicionar tarefa
        </Link>
        <Link
          href="/tarefas"
          className="text-[10px] font-medium text-muted-foreground inline-flex items-center gap-0.5"
        >
          Ver tarefas <IconExternalLink className="size-3" />
        </Link>
      </div>
    </SectionCard>
  );
}

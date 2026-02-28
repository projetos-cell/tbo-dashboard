"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";
import { useUpdateTask } from "@/hooks/use-tasks";
import type { Database } from "@/lib/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Circle } from "lucide-react";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface TaskListProps {
  tasks: TaskRow[];
  onSelect: (task: TaskRow) => void;
}

export function TaskList({ tasks, onSelect }: TaskListProps) {
  const updateTask = useUpdateTask();

  const toggleComplete = (task: TaskRow, e: React.MouseEvent) => {
    e.stopPropagation();
    updateTask.mutate({
      id: task.id,
      updates: {
        status: task.is_completed ? "pendente" : "concluida",
        is_completed: !task.is_completed,
      },
    });
  };

  if (tasks.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Nenhuma tarefa encontrada
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10" />
          <TableHead>Titulo</TableHead>
          <TableHead className="hidden md:table-cell">Status</TableHead>
          <TableHead className="hidden md:table-cell">Prioridade</TableHead>
          <TableHead className="hidden lg:table-cell">Responsavel</TableHead>
          <TableHead className="hidden lg:table-cell">Prazo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => {
          const statusCfg = TASK_STATUS[task.status as keyof typeof TASK_STATUS];
          const priCfg = TASK_PRIORITY[task.priority as keyof typeof TASK_PRIORITY];
          const overdue =
            task.due_date &&
            !task.is_completed &&
            task.due_date < new Date().toISOString().split("T")[0];

          return (
            <TableRow
              key={task.id}
              className="cursor-pointer"
              onClick={() => onSelect(task)}
            >
              <TableCell>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={(e) => toggleComplete(task, e)}
                >
                  {task.is_completed ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </TableCell>
              <TableCell>
                <span className={task.is_completed ? "line-through opacity-60" : ""}>
                  {task.title}
                </span>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {statusCfg && (
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
                  >
                    {statusCfg.label}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {priCfg && (
                  <span className="text-xs font-medium" style={{ color: priCfg.color }}>
                    {priCfg.label}
                  </span>
                )}
              </TableCell>
              <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                {task.assignee_name ?? "—"}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {task.due_date ? (
                  <span
                    className={`text-sm ${overdue ? "font-medium text-red-600" : "text-muted-foreground"}`}
                  >
                    {format(new Date(task.due_date + "T12:00:00"), "dd MMM yyyy", {
                      locale: ptBR,
                    })}
                  </span>
                ) : (
                  "—"
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

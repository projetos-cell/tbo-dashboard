import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";
import type { MyTaskWithSection } from "@/features/tasks/services/my-tasks";

// ─── Sort constants ──────────────────────────────────────────

const PRIORITY_SORT: Record<string, number> = {
  urgente: 0,
  alta: 1,
  media: 2,
  baixa: 3,
};

const STATUS_SORT: Record<string, number> = {
  pendente: 0,
  em_andamento: 1,
  revisao: 2,
  concluida: 3,
  bloqueada: 4,
  cancelada: 5,
};

// ─── Sort ────────────────────────────────────────────────────

export function compareTasks(
  a: MyTaskWithSection,
  b: MyTaskWithSection,
  sortBy: string,
  direction: "asc" | "desc"
): number {
  const dir = direction === "asc" ? 1 : -1;

  switch (sortBy) {
    case "title":
      return dir * (a.title ?? "").localeCompare(b.title ?? "");
    case "due_date": {
      const aDate = a.due_date ?? "9999-12-31";
      const bDate = b.due_date ?? "9999-12-31";
      return dir * aDate.localeCompare(bDate);
    }
    case "priority": {
      const aSort = PRIORITY_SORT[a.priority ?? "media"] ?? 99;
      const bSort = PRIORITY_SORT[b.priority ?? "media"] ?? 99;
      return dir * (aSort - bSort);
    }
    case "status": {
      const aSort = STATUS_SORT[a.status ?? "pendente"] ?? 99;
      const bSort = STATUS_SORT[b.status ?? "pendente"] ?? 99;
      return dir * (aSort - bSort);
    }
    case "created_at": {
      const aDate = a.created_at ?? "";
      const bDate = b.created_at ?? "";
      return dir * aDate.localeCompare(bDate);
    }
    case "project_id":
      return dir * (a.project_id ?? "").localeCompare(b.project_id ?? "");
    default:
      return 0;
  }
}

// ─── Filter ──────────────────────────────────────────────────

interface FilterRule {
  field: string;
  operator: string;
  value: string;
}

export interface MyTasksFilters {
  rules?: FilterRule[];
  [key: string]: unknown;
}

export function applyFilters(
  tasks: MyTaskWithSection[],
  filters: MyTasksFilters | undefined
): MyTaskWithSection[] {
  const rules = filters?.rules;
  if (!rules || rules.length === 0) return tasks;

  return tasks.filter((task) =>
    rules.every((rule) => {
      const taskValue = (task as unknown as Record<string, unknown>)[rule.field];
      const valueStr = String(taskValue ?? "");

      switch (rule.operator) {
        case "is":
          return valueStr === rule.value;
        case "is_not":
          return valueStr !== rule.value;
        default:
          return true;
      }
    })
  );
}

// ─── Dynamic grouping ────────────────────────────────────────

export interface DynamicGroup {
  id: string;
  label: string;
  tasks: MyTaskWithSection[];
}

export function groupTasksDynamic(
  tasks: MyTaskWithSection[],
  groupBy: string,
  projectMap: Map<string, string>
): DynamicGroup[] {
  const groups = new Map<string, MyTaskWithSection[]>();

  for (const task of tasks) {
    let key: string;

    switch (groupBy) {
      case "status":
        key = task.status ?? "pendente";
        break;
      case "priority":
        key = task.priority ?? "media";
        break;
      case "project_id":
        key = task.project_id ?? "__none__";
        break;
      case "due_date": {
        if (!task.due_date) {
          key = "__no_date__";
        } else {
          const d = new Date(task.due_date + "T12:00:00");
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const diff = Math.floor(
            (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diff < 0) key = "Atrasadas";
          else if (diff === 0) key = "Hoje";
          else if (diff <= 7) key = "Esta semana";
          else if (diff <= 14) key = "Próxima semana";
          else key = "Mais tarde";
        }
        break;
      }
      default:
        key = "__all__";
    }

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(task);
  }

  return Array.from(groups.entries()).map(([key, groupTasks]) => {
    let label = key;

    if (groupBy === "status") {
      label = TASK_STATUS[key as keyof typeof TASK_STATUS]?.label ?? key;
    } else if (groupBy === "priority") {
      label = TASK_PRIORITY[key as keyof typeof TASK_PRIORITY]?.label ?? key;
    } else if (groupBy === "project_id") {
      label = key === "__none__" ? "Sem projeto" : (projectMap.get(key) ?? key);
    } else if (groupBy === "due_date" && key === "__no_date__") {
      label = "Sem prazo";
    }

    return { id: key, label, tasks: groupTasks };
  });
}

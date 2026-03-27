import { PROJECT_STATUS, type ProjectStatusKey } from "@/lib/constants";
import type { GroupField } from "./project-list-toolbar";
import type { Database } from "@/lib/supabase/types";

export type Project = Database["public"]["Tables"]["projects"]["Row"];

export type SortField = "code" | "name" | "status" | "construtora" | "owner" | "due_date" | "created_at";
export type SortDir = "asc" | "desc";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUUID(value: string): boolean {
  return UUID_RE.test(value);
}

export function getGroupLabel(value: string, field: GroupField): string {
  if (!value || isUUID(value)) {
    switch (field) {
      case "construtora":
        return "Sem construtora";
      case "status":
        return "Sem status";
      case "priority":
        return "Sem prioridade";
      case "owner":
        return "Sem responsavel";
      default:
        return "Outros";
    }
  }
  return value;
}

export function sortProjects(projects: Project[], field: SortField, dir: SortDir): Project[] {
  return [...projects].sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case "code":
        cmp = (a.code ?? "").localeCompare(b.code ?? "");
        break;
      case "name":
        cmp = (a.name ?? "").localeCompare(b.name ?? "", "pt-BR");
        break;
      case "status":
        cmp = (a.status ?? "").localeCompare(b.status ?? "");
        break;
      case "construtora":
        cmp = (a.construtora ?? "").localeCompare(b.construtora ?? "", "pt-BR");
        break;
      case "owner":
        cmp = (a.owner_name ?? "").localeCompare(b.owner_name ?? "", "pt-BR");
        break;
      case "due_date":
        cmp = (a.due_date_end ?? "").localeCompare(b.due_date_end ?? "");
        break;
      case "created_at":
        cmp = (a.created_at ?? "").localeCompare(b.created_at ?? "");
        break;
    }
    return dir === "desc" ? -cmp : cmp;
  });
}

export function groupProjects(
  projects: Project[],
  field: GroupField,
): { label: string; color?: string; items: Project[] }[] {
  if (field === "none") return [{ label: "", items: projects }];

  const groups = new Map<string, Project[]>();
  const order: string[] = [];

  for (const p of projects) {
    let key: string;
    switch (field) {
      case "status":
        key = p.status ?? "sem_status";
        break;
      case "construtora":
        key = p.construtora && !isUUID(p.construtora) ? p.construtora : "sem_construtora";
        break;
      case "priority":
        key = p.priority ?? "sem_prioridade";
        break;
      case "owner":
        key = p.owner_name ?? "sem_responsavel";
        break;
      default:
        key = "all";
    }
    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }
    groups.get(key)!.push(p);
  }

  return order.map((key) => {
    let label = getGroupLabel(key, field);
    let color: string | undefined;
    if (field === "status") {
      const status = PROJECT_STATUS[key as ProjectStatusKey];
      if (status) {
        label = status.label;
        color = status.color;
      }
    }
    return { label, color, items: groups.get(key)! };
  });
}

import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { IconExternalLink, IconTrash, IconChevronDown } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PROJECT_STATUS, PROJECT_PRIORITY, type ProjectStatusKey, type ProjectPriorityKey } from "@/lib/constants";
import type { ColumnDef } from "@/lib/column-types";
import type { Database } from "@/lib/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ColumnDeps {
  onDelete: (project: Project) => void;
  onUpdatePriority: (id: string, priority: string | null) => void;
  isDeleting: boolean;
}

export function buildProjectColumns({ onDelete, onUpdatePriority, isDeleting }: ColumnDeps): ColumnDef<Project>[] {
  return [
    {
      id: "code",
      label: "Código",
      width: "w-[90px]",
      sortable: true,
      sortType: "string",
      sortAccessor: (row) => row.code,
      cellRender: (row) => (
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
          {row.code || "\u2014"}
        </span>
      ),
    },
    {
      id: "name",
      label: "Nome",
      hideable: false,
      sortable: true,
      sortType: "string",
      sortAccessor: (row) => row.name,
      cellRender: (row) => (
        <Link
          href={`/projetos/${row.id}`}
          className="font-medium hover:underline"
        >
          {row.name}
        </Link>
      ),
    },
    {
      id: "status",
      label: "Status",
      width: "w-[130px]",
      sortable: true,
      sortType: "string",
      sortAccessor: (row) => row.status,
      cellRender: (row) => {
        const status =
          PROJECT_STATUS[row.status as ProjectStatusKey];
        return status ? (
          <Badge
            variant="secondary"
            className="text-xs"
            style={{
              backgroundColor: status.bg,
              color: status.color,
            }}
          >
            {status.label}
          </Badge>
        ) : null;
      },
    },
    {
      id: "priority",
      label: "Prioridade",
      width: "w-[130px]",
      sortable: true,
      sortType: "string",
      sortAccessor: (row) => {
        const key = row.priority as ProjectPriorityKey | null;
        return key && PROJECT_PRIORITY[key] ? String(PROJECT_PRIORITY[key].sort) : "9";
      },
      cellRender: (row) => {
        const key = row.priority as ProjectPriorityKey | null;
        const cfg = key ? PROJECT_PRIORITY[key] : null;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              >
                {cfg ? (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer select-none gap-1.5 text-xs hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: cfg.bg, color: cfg.color }}
                  >
                    <span
                      className="size-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: cfg.color }}
                    />
                    {cfg.label}
                    <IconChevronDown className="size-3 opacity-50" />
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-xs cursor-pointer hover:text-foreground transition-colors">
                    —
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              {Object.entries(PROJECT_PRIORITY).map(([k, c]) => (
                <DropdownMenuItem
                  key={k}
                  onClick={() => onUpdatePriority(row.id, k)}
                  className="gap-2"
                >
                  <div
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  {c.label}
                </DropdownMenuItem>
              ))}
              {cfg && (
                <DropdownMenuItem
                  onClick={() => onUpdatePriority(row.id, null)}
                  className="text-muted-foreground"
                >
                  Remover
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
    {
      id: "construtora",
      label: "Construtora",
      responsive: "md" as const,
      sortable: true,
      sortType: "string",
      sortAccessor: (row) => row.construtora,
      cellRender: (row) => (
        <span className="text-gray-500">
          {row.construtora || "\u2014"}
        </span>
      ),
    },
    {
      id: "owner",
      label: "Responsavel",
      responsive: "lg" as const,
      cellRender: (row) => (
        <span className="text-gray-500">
          {row.owner_name || "\u2014"}
        </span>
      ),
    },
    {
      id: "due_date",
      label: "Prazo",
      responsive: "lg" as const,
      width: "w-[110px]",
      sortable: true,
      sortType: "date",
      sortAccessor: (row) => row.due_date_end,
      cellRender: (row) => (
        <span className="text-gray-500 text-sm">
          {row.due_date_end
            ? format(new Date(row.due_date_end), "dd MMM yyyy", {
                locale: ptBR,
              })
            : "\u2014"}
        </span>
      ),
    },
    {
      id: "notion",
      label: "",
      width: "w-[40px]",
      hideable: false,
      reorderable: false,
      cellRender: (row) =>
        row.notion_url ? (
          <a
            href={row.notion_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <IconExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null,
    },
    {
      id: "actions",
      label: "",
      width: "w-[40px]",
      hideable: false,
      reorderable: false,
      cellRender: (row) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-gray-500 hover:text-red-500"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(row);
          }}
          disabled={isDeleting}
          aria-label="Excluir projeto"
        >
          <IconTrash className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  IconCalendar,
  IconUser,
  IconExternalLink,
  IconCheck,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  PROJECT_STATUS,
  BU_LIST,
  BU_COLORS,
  type ProjectStatusKey,
} from "@/lib/constants";
import { parseBus } from "@/features/projects/utils/parse-bus";
import { useUpdateProject } from "@/features/projects/hooks/use-projects";
import type { Database } from "@/lib/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectCardProps {
  project: Project;
  editable?: boolean;
}

function InlineText({
  value,
  onSave,
  className,
  placeholder,
}: {
  value: string;
  onSave: (v: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else setDraft(value);
    setEditing(false);
  }

  if (!editing) {
    return (
      <span
        className={cn("cursor-text rounded px-0.5 hover:bg-accent/50 transition-colors", className)}
        onClick={(e) => {
          e.stopPropagation();
          setEditing(true);
        }}
        title="Clique para editar"
      >
        {value || placeholder}
      </span>
    );
  }

  return (
    <Input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      }}
      onClick={(e) => e.stopPropagation()}
      className={cn("h-6 px-1 text-sm border-primary/30", className)}
    />
  );
}

function StatusSelect({
  value,
  onSave,
}: {
  value: string;
  onSave: (v: string) => void;
}) {
  const status = PROJECT_STATUS[value as ProjectStatusKey];

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Select value={value} onValueChange={onSave}>
        <SelectTrigger className="h-6 w-auto gap-1 border-none bg-transparent p-0 shadow-none hover:bg-accent/50 focus:ring-0 [&>svg]:h-3 [&>svg]:w-3">
          <Badge
            variant="secondary"
            className="text-[10px] cursor-pointer"
            style={status ? { backgroundColor: status.bg, color: status.color } : undefined}
          >
            {status?.label ?? value}
          </Badge>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(PROJECT_STATUS).map(([key, cfg]) => (
            <SelectItem key={key} value={key}>
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: cfg.color }}
                />
                {cfg.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function BuEditor({
  value,
  onSave,
}: {
  value: string[];
  onSave: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(value);

  const toggle = useCallback(
    (bu: string) => {
      setSelected((prev) => {
        const next = prev.includes(bu)
          ? prev.filter((b) => b !== bu)
          : [...prev, bu];
        return next;
      });
    },
    []
  );

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      if (JSON.stringify(selected) !== JSON.stringify(value)) {
        onSave(selected);
      }
    }
    setOpen(isOpen);
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Popover open={open} onOpenChange={handleClose}>
        <PopoverTrigger asChild>
          <div className="flex flex-wrap gap-1 cursor-pointer rounded px-0.5 py-0.5 hover:bg-accent/50 transition-colors min-h-[20px]">
            {value.length > 0 ? (
              value.map((bu) => {
                const buColor = BU_COLORS[bu];
                return (
                  <Badge
                    key={bu}
                    variant="outline"
                    className="px-1.5 py-0 text-[10px]"
                    style={
                      buColor
                        ? {
                            backgroundColor: buColor.bg,
                            color: buColor.color,
                            borderColor: "transparent",
                          }
                        : undefined
                    }
                  >
                    {bu}
                  </Badge>
                );
              })
            ) : (
              <span className="text-muted-foreground text-[10px]">+ BU</span>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="start">
          <p className="text-xs font-medium mb-2">Unidades de Negócio</p>
          <div className="flex flex-col gap-1">
            {BU_LIST.map((bu) => {
              const isOn = selected.includes(bu);
              const buColor = BU_COLORS[bu];
              return (
                <button
                  key={bu}
                  type="button"
                  onClick={() => toggle(bu)}
                  className={cn(
                    "flex items-center justify-between rounded px-2 py-1 text-xs transition-colors",
                    isOn ? "bg-accent" : "hover:bg-accent/50"
                  )}
                >
                  <span
                    style={buColor ? { color: buColor.color } : undefined}
                  >
                    {bu}
                  </span>
                  {isOn && <IconCheck className="h-3 w-3" />}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function ProjectCard({ project, editable = false }: ProjectCardProps) {
  const router = useRouter();
  const updateProject = useUpdateProject();
  const status = PROJECT_STATUS[project.status as ProjectStatusKey];
  const busList = parseBus(project.bus);

  function save(updates: Record<string, unknown>) {
    updateProject.mutate({ id: project.id, updates: updates as never });
  }

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => router.push(`/projetos/${project.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {project.code && (
              <span className="text-muted-foreground mb-0.5 block text-[10px] font-mono uppercase tracking-wider">
                {project.code}
              </span>
            )}
            {editable ? (
              <InlineText
                value={project.name}
                onSave={(v) => save({ name: v })}
                className="line-clamp-2 text-sm font-medium leading-tight"
              />
            ) : (
              <CardTitle className="line-clamp-2 text-sm font-medium leading-tight">
                {project.name}
              </CardTitle>
            )}
          </div>
          {project.notion_url && (
            <a
              href={project.notion_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              <IconExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Status */}
        {editable ? (
          <StatusSelect
            value={project.status ?? "em_andamento"}
            onSave={(v) => save({ status: v })}
          />
        ) : (
          status && (
            <Badge
              variant="secondary"
              className="text-xs"
              style={{ backgroundColor: status.bg, color: status.color }}
            >
              {status.label}
            </Badge>
          )
        )}

        {/* BU tags */}
        {editable ? (
          <BuEditor
            value={busList}
            onSave={(v) => save({ bus: JSON.stringify(v) })}
          />
        ) : (
          busList.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {busList.map((bu) => {
                const buColor = BU_COLORS[bu];
                return (
                  <Badge
                    key={bu}
                    variant="outline"
                    className="px-1.5 py-0 text-[10px]"
                    style={
                      buColor
                        ? {
                            backgroundColor: buColor.bg,
                            color: buColor.color,
                            borderColor: "transparent",
                          }
                        : undefined
                    }
                  >
                    {bu}
                  </Badge>
                );
              })}
            </div>
          )
        )}

        {/* Construtora */}
        {editable ? (
          <div className="text-muted-foreground text-xs">
            <InlineText
              value={project.construtora ?? ""}
              onSave={(v) => save({ construtora: v })}
              className="text-xs"
              placeholder="+ Construtora"
            />
          </div>
        ) : (
          project.construtora && (
            <p className="text-muted-foreground truncate text-xs">
              {project.construtora}
            </p>
          )
        )}

        {/* Footer: owner + date */}
        <div className="text-muted-foreground flex items-center justify-between pt-1 text-xs">
          {editable ? (
            <div className="flex items-center gap-1 truncate">
              <IconUser className="h-3 w-3 shrink-0" />
              <InlineText
                value={project.owner_name ?? ""}
                onSave={(v) => save({ owner_name: v })}
                className="text-xs"
                placeholder="+ Responsável"
              />
            </div>
          ) : (
            project.owner_name && (
              <div className="flex items-center gap-1 truncate">
                <IconUser className="h-3 w-3 shrink-0" />
                <span className="truncate">{project.owner_name}</span>
              </div>
            )
          )}
          {project.due_date_end && (
            <div className="flex shrink-0 items-center gap-1">
              <IconCalendar className="h-3 w-3" />
              <span>
                {format(new Date(project.due_date_end), "dd MMM", {
                  locale: ptBR,
                })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

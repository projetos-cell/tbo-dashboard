"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  IconCalendar,
  IconUser,
  IconExternalLink,
  IconCheck,
  IconGripVertical,
  IconChevronDown,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useProfiles } from "@/features/people/hooks/use-people";
import type { Database } from "@/lib/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectCardProps {
  project: Project;
  editable?: boolean;
  dragListeners?: SyntheticListenerMap;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
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

/* ── Status Badge (always clickable) ────────────────────────────────── */

function StatusBadgeSelect({
  value,
  onSave,
}: {
  value: string;
  onSave: (v: string) => void;
}) {
  const status = PROJECT_STATUS[value as ProjectStatusKey];

  return (
    <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="focus:outline-none">
            <Badge
              variant="secondary"
              className="text-[10px] cursor-pointer gap-1 select-none hover:opacity-80 transition-opacity"
              style={status ? { backgroundColor: status.bg, color: status.color } : undefined}
            >
              <span
                className="size-1.5 rounded-full shrink-0"
                style={{ backgroundColor: status?.color }}
              />
              {status?.label ?? value}
              <IconChevronDown className="size-2.5 opacity-50" />
            </Badge>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          {Object.entries(PROJECT_STATUS).map(([key, cfg]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => onSave(key)}
              className="gap-2"
            >
              <div
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: cfg.color }}
              />
              {cfg.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/* ── Owner Selector (dropdown with avatars) ─────────────────────────── */

function OwnerSelector({
  currentName,
  currentId,
  onSave,
}: {
  currentName: string | null;
  currentId: string | null;
  onSave: (name: string, id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: profiles } = useProfiles();

  const filtered = (profiles || []).filter((p) =>
    p.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded px-1 py-0.5 hover:bg-accent/50 transition-colors text-xs text-muted-foreground cursor-pointer min-w-0"
          >
            {currentName ? (
              <>
                <Avatar className="size-4 shrink-0">
                  <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                    {getInitials(currentName)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{currentName}</span>
              </>
            ) : (
              <>
                <IconUser className="h-3 w-3 shrink-0 opacity-50" />
                <span className="text-muted-foreground/60">+ Responsável</span>
              </>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-0" align="start">
          <div className="p-2 border-b">
            <input
              autoFocus
              placeholder="Buscar pessoa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-44 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-3">
                Nenhum resultado
              </p>
            ) : (
              filtered.map((person) => {
                const isSelected = person.id === currentId || person.full_name === currentName;
                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => {
                      onSave(person.full_name ?? "", person.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 w-full px-2 py-1.5 text-sm hover:bg-accent/60 transition-colors",
                      isSelected && "bg-accent/40"
                    )}
                  >
                    <Avatar className="size-5 shrink-0">
                      <AvatarImage src={person.avatar_url ?? undefined} />
                      <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                        {getInitials(person.full_name ?? "?")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-left truncate">{person.full_name}</span>
                    {isSelected && (
                      <IconCheck className="size-3.5 text-primary shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/* ── BU Editor (improved design) ────────────────────────────────────── */

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
    <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
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
                    className="px-1.5 py-0 text-[10px] font-medium"
                    style={
                      buColor
                        ? {
                            backgroundColor: buColor.bg,
                            color: buColor.color,
                            borderColor: `${buColor.color}30`,
                          }
                        : undefined
                    }
                  >
                    {bu}
                  </Badge>
                );
              })
            ) : (
              <span className="text-muted-foreground/60 text-[10px]">+ BU</span>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-0" align="start">
          <div className="px-3 py-2 border-b">
            <p className="text-xs font-semibold text-foreground">Unidades de Negócio</p>
          </div>
          <div className="p-1.5 space-y-0.5">
            {BU_LIST.map((bu) => {
              const isOn = selected.includes(bu);
              const buColor = BU_COLORS[bu];
              return (
                <button
                  key={bu}
                  type="button"
                  onClick={() => toggle(bu)}
                  className={cn(
                    "flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-xs transition-colors",
                    isOn
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div
                    className="size-2.5 rounded-full shrink-0 ring-1 ring-inset"
                    style={
                      buColor
                        ? {
                            backgroundColor: isOn ? buColor.color : buColor.bg,
                            boxShadow: `inset 0 0 0 1px ${buColor.color}`,
                          }
                        : undefined
                    }
                  />
                  <span className="flex-1 text-left font-medium">{bu}</span>
                  {isOn && <IconCheck className="h-3.5 w-3.5 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/* ── Project Card ───────────────────────────────────────────────────── */

export function ProjectCard({ project, editable = false, dragListeners }: ProjectCardProps) {
  const router = useRouter();
  const updateProject = useUpdateProject();
  const status = PROJECT_STATUS[project.status as ProjectStatusKey];
  const busList = parseBus(project.bus);

  function save(updates: Record<string, unknown>) {
    updateProject.mutate({ id: project.id, updates: updates as never });
  }

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md group/card"
      onClick={() => router.push(`/projetos/${project.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 flex items-start gap-1.5">
            {/* Drag handle */}
            {dragListeners && (
              <button
                type="button"
                className="text-muted-foreground/30 hover:text-muted-foreground mt-0.5 shrink-0 cursor-grab opacity-0 group-hover/card:opacity-100 transition-opacity active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                {...dragListeners}
              >
                <IconGripVertical className="h-3.5 w-3.5" />
              </button>
            )}
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
        {/* Status — always interactive */}
        {editable ? (
          <StatusBadgeSelect
            value={project.status ?? "em_andamento"}
            onSave={(v) => save({ status: v })}
          />
        ) : (
          status && (
            <Badge
              variant="secondary"
              className="text-xs gap-1"
              style={{ backgroundColor: status.bg, color: status.color }}
            >
              <span
                className="size-1.5 rounded-full shrink-0"
                style={{ backgroundColor: status.color }}
              />
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
            <OwnerSelector
              currentName={project.owner_name}
              currentId={project.owner_id ?? null}
              onSave={(name, id) => save({ owner_name: name, owner_id: id })}
            />
          ) : (
            project.owner_name && (
              <div className="flex items-center gap-1 truncate">
                <Avatar className="size-4 shrink-0">
                  <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                    {getInitials(project.owner_name)}
                  </AvatarFallback>
                </Avatar>
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

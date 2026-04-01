"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IconCheck, IconSearch, IconX } from "@tabler/icons-react";
import { useProjects } from "@/features/projects/hooks/use-projects";

interface InlineProjectSelectProps {
  value: string | null;
  projectName?: string;
  onSave: (projectId: string | null) => void;
  disabled?: boolean;
}

export function InlineProjectSelect({
  value,
  projectName,
  onSave,
  disabled = false,
}: InlineProjectSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [flashing, setFlashing] = React.useState(false);
  const { data: projects = [] } = useProjects();

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return projects;
    return projects.filter((p) =>
      (p.name ?? "").toLowerCase().includes(q)
    );
  }, [projects, search]);

  const handleSelect = (projectId: string | null) => {
    onSave(projectId);
    setFlashing(true);
    setTimeout(() => setFlashing(false), 600);
    setSearch("");
    setOpen(false);
  };

  const stopProp = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
  };

  return (
    <div onClick={stopProp} onPointerDown={stopProp}>
      <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch(""); }}>
        <PopoverTrigger asChild disabled={disabled}>
          <button
            type="button"
            className={cn(
              "max-w-[130px] truncate rounded px-1 py-0.5 text-xs transition-all",
              "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              flashing && "animate-save-flash",
            )}
          >
            {projectName ?? <span className="text-muted-foreground/40">—</span>}
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-56 p-1.5" align="start" sideOffset={4}>
          {/* Search */}
          <div className="relative mb-1">
            <IconSearch className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar projeto..."
              className="w-full rounded-md border-0 bg-muted/40 py-1 pl-6 pr-2 text-xs outline-none placeholder:text-muted-foreground/60 focus:bg-muted/60"
            />
          </div>

          {/* Clear option */}
          {value && (
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted/60 transition-colors"
            >
              <IconX className="h-3 w-3" />
              Sem projeto
            </button>
          )}

          {/* Project list */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="py-2 text-center text-xs text-muted-foreground">
                Nenhum projeto encontrado
              </p>
            ) : (
              filtered.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => handleSelect(project.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                    "hover:bg-muted/60",
                    project.id === value && "bg-muted/40",
                  )}
                >
                  <span className="flex-1 truncate text-left">{project.name ?? project.id}</span>
                  {project.id === value && (
                    <IconCheck className="h-3 w-3 shrink-0 text-muted-foreground" />
                  )}
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

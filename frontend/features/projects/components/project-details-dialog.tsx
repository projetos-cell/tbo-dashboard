"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  IconX,
  IconPlus,
  IconUserCircle,
  IconBuilding,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { useUpdateProject, useProjects } from "@/features/projects/hooks/use-projects";
import { useTeamMembers } from "@/hooks/use-team";
import { useToast } from "@/hooks/use-toast";
import {
  PROJECT_STATUS,
  BU_LIST,
  BU_COLORS,
} from "@/lib/constants";
import { parseBus } from "@/features/projects/utils/parse-bus";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectDetailsDialogProps {
  project: ProjectRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectDetailsDialog({
  project,
  open,
  onOpenChange,
}: ProjectDetailsDialogProps) {
  const updateProject = useUpdateProject();
  const { toast } = useToast();
  const { data: teamMembers } = useTeamMembers({ is_active: true });
  const { data: allProjects } = useProjects();

  const [name, setName] = useState(project.name);
  const [construtora, setConstrutora] = useState(project.construtora ?? "");
  const [ownerName, setOwnerName] = useState(project.owner_name ?? "");
  const [ownerId, setOwnerId] = useState(project.owner_id ?? "");
  const [status, setStatus] = useState(project.status ?? "em_andamento");
  const [priority, setPriority] = useState(project.priority ?? "media");
  const [selectedBus, setSelectedBus] = useState<string[]>(parseBus(project.bus));
  const [dueDateStart, setDueDateStart] = useState(project.due_date_start ?? "");
  const [dueDateEnd, setDueDateEnd] = useState(project.due_date_end ?? "");
  const [notes, setNotes] = useState(project.notes ?? "");

  useEffect(() => {
    if (open) {
      setName(project.name);
      setConstrutora(project.construtora ?? "");
      setOwnerName(project.owner_name ?? "");
      setOwnerId(project.owner_id ?? "");
      setStatus(project.status ?? "em_andamento");
      setPriority(project.priority ?? "media");
      setSelectedBus(parseBus(project.bus));
      setDueDateStart(project.due_date_start ?? "");
      setDueDateEnd(project.due_date_end ?? "");
      setNotes(project.notes ?? "");
    }
  }, [open, project]);

  // Unique construtoras from existing projects (same source as project-compact-list)
  const construtoras = useMemo(() => {
    const set = new Set<string>();
    if (allProjects) {
      for (const p of allProjects) {
        if (p.construtora && !/^[0-9a-f]{8}-/i.test(p.construtora)) {
          set.add(p.construtora);
        }
      }
    }
    if (construtora && !set.has(construtora)) {
      set.add(construtora);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [allProjects, construtora]);

  function toggleBu(bu: string) {
    setSelectedBus((prev) =>
      prev.includes(bu) ? prev.filter((b) => b !== bu) : [...prev, bu]
    );
  }

  function handleSave() {
    if (!name.trim()) return;

    updateProject.mutate(
      {
        id: project.id,
        updates: {
          name: name.trim(),
          construtora: construtora.trim() || null,
          owner_name: ownerName.trim() || null,
          owner_id: ownerId || null,
          status,
          priority,
          bus: selectedBus.length ? JSON.stringify(selectedBus) : null,
          due_date_start: dueDateStart || null,
          due_date_end: dueDateEnd || null,
          notes: notes.trim() || null,
        } as never,
      },
      {
        onSuccess: () => {
          toast({ title: "Projeto atualizado" });
          onOpenChange(false);
        },
        onError: () => {
          toast({ title: "Erro ao atualizar", variant: "destructive" });
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar detalhes do projeto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Código (read-only) */}
          {project.code && (
            <div className="space-y-1">
              <Label className="text-muted-foreground">Código</Label>
              <p className="font-mono text-sm font-medium">{project.code}</p>
            </div>
          )}

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome do Projeto *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do projeto"
            />
          </div>

          {/* Status + Prioridade */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROJECT_STATUS).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div
                          className="size-2 rounded-full"
                          style={{ backgroundColor: cfg.color }}
                        />
                        {cfg.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* BU */}
          <div className="space-y-2">
            <Label>Unidades de Negócio</Label>
            <div className="flex flex-wrap gap-2">
              {BU_LIST.map((bu) => {
                const isSelected = selectedBus.includes(bu);
                const buStyle = BU_COLORS[bu];
                return (
                  <Badge
                    key={bu}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer select-none transition-colors",
                      !isSelected && "hover:bg-accent"
                    )}
                    style={
                      isSelected && buStyle
                        ? { backgroundColor: buStyle.color, color: "#fff", borderColor: "transparent" }
                        : undefined
                    }
                    onClick={() => toggleBu(bu)}
                  >
                    {bu}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Construtora (dropdown) + Responsável (dropdown) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Construtora</Label>
              <ConstrutoraDropdown
                value={construtora}
                construtoras={construtoras}
                onChange={(v) => setConstrutora(v ?? "")}
              />
            </div>
            <div className="space-y-2">
              <Label>Responsável</Label>
              <ResponsavelDropdown
                value={ownerName}
                currentId={ownerId}
                members={teamMembers ?? []}
                onChange={(id, name) => {
                  setOwnerId(id ?? "");
                  setOwnerName(name ?? "");
                }}
              />
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-start">Data Início</Label>
              <Input
                id="edit-start"
                type="date"
                value={dueDateStart}
                onChange={(e) => setDueDateStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-end">Data Entrega</Label>
              <Input
                id="edit-end"
                type="date"
                value={dueDateEnd}
                onChange={(e) => setDueDateEnd(e.target.value)}
              />
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notas</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre o projeto..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || updateProject.isPending}
            style={{ backgroundColor: "#e85102", borderColor: "#e85102" }}
          >
            {updateProject.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Construtora Dropdown ─────────────────────────────────────────────────────

function ConstrutoraDropdown({
  value,
  construtoras,
  onChange,
}: {
  value: string;
  construtoras: string[];
  onChange: (v: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return construtoras;
    const q = search.toLowerCase();
    return construtoras.filter((c) => c.toLowerCase().includes(q));
  }, [construtoras, search]);

  const isNewValue = search.trim() && !construtoras.some(
    (c) => c.toLowerCase() === search.trim().toLowerCase()
  );

  function handleSelect(v: string) {
    onChange(v);
    setOpen(false);
    setSearch("");
  }

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSearch(""); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-1.5 truncate rounded-md border border-input bg-transparent px-3 py-2 text-sm transition-colors hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring h-9"
        >
          <IconBuilding className="size-3.5 shrink-0 text-muted-foreground" />
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || "Selecionar..."}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start" sideOffset={4}>
        <div className="border-b border-border/60 p-2">
          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar construtora..."
            className="h-7 w-full rounded border-0 bg-muted/40 px-2 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto p-1">
          {value && (
            <button
              type="button"
              onClick={() => { onChange(null); setOpen(false); setSearch(""); }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              <IconX className="size-3.5" />
              <span>Remover construtora</span>
            </button>
          )}
          {isNewValue && (
            <button
              type="button"
              onClick={() => handleSelect(search.trim().toUpperCase())}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-primary transition-colors hover:bg-muted"
            >
              <IconPlus className="size-3.5" />
              <span>Criar &quot;{search.trim().toUpperCase()}&quot;</span>
            </button>
          )}
          {filtered.length === 0 && !isNewValue ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              Nenhuma construtora encontrada
            </p>
          ) : (
            filtered.map((c) => {
              const isSelected = c === value;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                    isSelected && "bg-muted/60"
                  )}
                >
                  <IconBuilding className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate text-left">{c}</span>
                  {isSelected && (
                    <span className="text-xs text-muted-foreground">atual</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Responsável Dropdown ─────────────────────────────────────────────────────

function ResponsavelDropdown({
  value,
  currentId,
  members,
  onChange,
}: {
  value: string;
  currentId: string;
  members: { id: string; full_name: string; avatar_url?: string | null }[];
  onChange: (id: string | null, name: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!members) return [];
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter((m) => m.full_name.toLowerCase().includes(q));
  }, [members, search]);

  function getInitials(name: string): string {
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSearch(""); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-1.5 truncate rounded-md border border-input bg-transparent px-3 py-2 text-sm transition-colors hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring h-9"
        >
          {value ? (
            <>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-semibold text-blue-700">
                {getInitials(value)}
              </span>
              <span className="truncate">{value}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Selecionar...</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start" sideOffset={4}>
        <div className="border-b border-border/60 p-2">
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar membro..."
            className="h-7 w-full rounded border-0 bg-muted/40 px-2 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-[220px] overflow-y-auto p-1">
          {currentId && (
            <button
              type="button"
              onClick={() => { onChange(null, null); setOpen(false); setSearch(""); }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              <IconUserCircle className="size-4" />
              <span>Remover responsável</span>
            </button>
          )}
          {filtered.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              Nenhum membro encontrado
            </p>
          ) : (
            filtered.map((member) => {
              const isSelected = member.id === currentId;
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => { onChange(member.id, member.full_name); setOpen(false); setSearch(""); }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                    isSelected && "bg-muted/60"
                  )}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-semibold">
                    {getInitials(member.full_name)}
                  </span>
                  <span className="flex-1 truncate text-left">{member.full_name}</span>
                  {isSelected && (
                    <span className="text-xs text-muted-foreground">atual</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

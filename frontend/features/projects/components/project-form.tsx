"use client";

import { useState, useMemo } from "react";
import { z } from "zod";
import { IconBuilding, IconCheck, IconPlus, IconSearch, IconUserCircle, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCreateProject, useProjects } from "@/features/projects/hooks/use-projects";
import { formatProjectName } from "@/features/projects/services/projects";
import { useTeamMembers } from "@/hooks/use-team";
import { useAuthStore } from "@/stores/auth-store";
import { BU_LIST, BU_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const projectSchema = z.object({
  name: z.string().min(1, "Nome do projeto é obrigatório"),
  construtora: z.string().optional(),
  owner_name: z.string().optional(),
  bus: z.array(z.string()).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectForm({ open, onOpenChange }: ProjectFormProps) {
  const [name, setName] = useState("");
  const [construtora, setConstrutora] = useState("");
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState("");
  const [selectedBus, setSelectedBus] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});
  const createProject = useCreateProject();
  const tenantId = useAuthStore((s) => s.tenantId);

  function toggleBu(bu: string) {
    setSelectedBus((prev) =>
      prev.includes(bu) ? prev.filter((b) => b !== bu) : [...prev, bu],
    );
  }

  function resetForm() {
    setName("");
    setConstrutora("");
    setOwnerId(null);
    setOwnerName("");
    setSelectedBus([]);
    setErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = projectSchema.safeParse({
      name: name.trim(),
      construtora: construtora.trim(),
      owner_name: ownerName.trim(),
      bus: selectedBus,
    });
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ProjectFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ProjectFormData;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    if (!tenantId) return;

    await createProject.mutateAsync({
      name: result.data.name,
      construtora: result.data.construtora || null,
      owner_name: result.data.owner_name || null,
      owner_id: ownerId,
      bus: result.data.bus?.length ? JSON.stringify(result.data.bus) : null,
      status: "em_andamento",
      tenant_id: tenantId,
    } as never);

    resetForm();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Novo Projeto</DialogTitle>
          <DialogDescription>
            Crie um novo projeto para acompanhar no board.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Empreendimento *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: undefined })); }}
              placeholder="Ex: Residencial Aurora"
              required
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
            {name.trim() && (
              <p className="text-[11px] text-muted-foreground">
                <span className="font-medium text-foreground">
                  {formatProjectName(name, construtora)}
                </span>
                {" · "}TBO-{new Date().getFullYear()}-NNN
              </p>
            )}
            {!name.trim() && (
              <p className="text-muted-foreground text-[11px]">
                Padrão: CONSTRUTORA_EMPREENDIMENTO · TBO-{new Date().getFullYear()}-NNN
              </p>
            )}
          </div>

          {/* BU Selection */}
          <div className="space-y-2">
            <Label>Setores (BU)</Label>
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
                      !isSelected && "hover:bg-accent",
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

          <div className="space-y-2">
            <Label>Construtora / Incorporadora</Label>
            <ConstrutoraFormPicker
              value={construtora}
              onSelect={(v) => setConstrutora(v)}
              onClear={() => setConstrutora("")}
            />
          </div>

          {/* Responsável — dropdown com membros do time */}
          <div className="space-y-2">
            <Label>Responsável</Label>
            <MemberPicker
              value={ownerName}
              onSelect={(id, fullName) => {
                setOwnerId(id);
                setOwnerName(fullName);
              }}
              onClear={() => {
                setOwnerId(null);
                setOwnerName("");
              }}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? "Criando..." : "Criar Projeto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Member Picker Dropdown ───────────────────────────────────────────────────

function MemberPicker({
  value,
  onSelect,
  onClear,
}: {
  value: string;
  onSelect: (id: string, fullName: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: members } = useTeamMembers({ is_active: true });
  const user = useAuthStore((s) => s.user);

  const filtered = useMemo(() => {
    if (!members) return [];
    const q = search.toLowerCase();
    const list = q ? members.filter((m) => m.full_name.toLowerCase().includes(q)) : members;
    // Sort: current user first
    return [...list].sort((a, b) => {
      if (a.id === user?.id) return -1;
      if (b.id === user?.id) return 1;
      return a.full_name.localeCompare(b.full_name, "pt-BR");
    });
  }, [members, search, user?.id]);

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors",
            "hover:bg-accent focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            !value && "text-muted-foreground",
          )}
        >
          {value ? (
            <>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700">
                {getInitials(value)}
              </span>
              <span className="flex-1 truncate text-left">{value}</span>
              <span
                role="button"
                tabIndex={-1}
                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.stopPropagation(); onClear(); }
                }}
              >
                <IconX className="size-3.5" />
              </span>
            </>
          ) : (
            <>
              <IconUserCircle className="size-4" />
              <span>Selecionar responsável</span>
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start" sideOffset={4}>
        {/* Search */}
        <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
          <IconSearch className="size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar membro..."
            className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Header */}
        <div className="px-3 pt-2 pb-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Selecionar um
          </p>
        </div>

        {/* Members list */}
        <div className="max-h-[240px] overflow-y-auto px-1 pb-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              Nenhum membro encontrado
            </p>
          ) : (
            filtered.map((member) => {
              const isCurrentUser = member.id === user?.id;
              const isSelected = member.full_name === value;
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => {
                    onSelect(member.id, member.full_name);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted",
                    isSelected && "bg-muted/60",
                  )}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold">
                    {getInitials(member.full_name)}
                  </span>
                  <span className="flex-1 truncate text-left">
                    {member.full_name}
                    {isCurrentUser && (
                      <span className="ml-1 text-muted-foreground">(você)</span>
                    )}
                  </span>
                  {isSelected && (
                    <IconCheck className="size-4 text-foreground" />
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

// ─── Construtora Picker (form) ───────────────────────────────────────────────

function ConstrutoraFormPicker({
  value,
  onSelect,
  onClear,
}: {
  value: string;
  onSelect: (name: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: projects } = useProjects();

  const construtoras = useMemo(() => {
    if (!projects) return [];
    const set = new Set<string>();
    for (const p of projects) {
      if (p.construtora && !/^[0-9a-f]{8}-/i.test(p.construtora)) {
        set.add(p.construtora);
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [projects]);

  const filtered = useMemo(() => {
    if (!search.trim()) return construtoras;
    const q = search.toLowerCase();
    return construtoras.filter((c) => c.toLowerCase().includes(q));
  }, [construtoras, search]);

  const isNewValue = search.trim() && !construtoras.some(
    (c) => c.toLowerCase() === search.trim().toLowerCase()
  );

  function handlePick(v: string) {
    onSelect(v);
    setOpen(false);
    setSearch("");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors",
            "hover:bg-accent focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            !value && "text-muted-foreground",
          )}
        >
          {value ? (
            <>
              <IconBuilding className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-left">{value}</span>
              <span
                role="button"
                tabIndex={-1}
                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.stopPropagation(); onClear(); }
                }}
              >
                <IconX className="size-3.5" />
              </span>
            </>
          ) : (
            <>
              <IconBuilding className="size-4" />
              <span>Selecionar construtora</span>
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start" sideOffset={4}>
        <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
          <IconSearch className="size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && search.trim()) {
                handlePick(search.trim().toUpperCase());
              }
            }}
            placeholder="Buscar ou criar..."
            className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="max-h-[240px] overflow-y-auto px-1 py-1">
          {/* Create new */}
          {isNewValue && (
            <button
              type="button"
              onClick={() => handlePick(search.trim().toUpperCase())}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm text-blue-600 transition-colors hover:bg-muted"
            >
              <IconPlus className="size-4" />
              <span>Criar &quot;{search.trim().toUpperCase()}&quot;</span>
            </button>
          )}
          {filtered.length === 0 && !isNewValue ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              Nenhuma construtora encontrada
            </p>
          ) : (
            filtered.map((c) => {
              const isSelected = c === value;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => handlePick(c)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted",
                    isSelected && "bg-muted/60",
                  )}
                >
                  <IconBuilding className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate text-left">{c}</span>
                  {isSelected && (
                    <IconCheck className="size-4 text-foreground" />
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

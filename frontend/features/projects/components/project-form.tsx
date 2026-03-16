"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  IconBuilding,
  IconCheck,
  IconChevronDown,
  IconPlus,
  IconSearch,
  IconTemplate,
  IconUserCircle,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateProject, useProjects } from "@/features/projects/hooks/use-projects";
import { useApplyProjectTemplate, PROJECT_TEMPLATES, DEFAULT_TEMPLATE_ID } from "@/features/projects/hooks/use-project-templates";
import { formatProjectName } from "@/features/projects/services/projects";
import { useTeamMembers } from "@/hooks/use-team";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";
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
  const [construtora, setConstrutora] = useState("HORIZONTE");
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState("");
  const [selectedBus, setSelectedBus] = useState<string[]>([]);
  const [useTemplate, setUseTemplate] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState(DEFAULT_TEMPLATE_ID);
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});

  const createProject = useCreateProject();
  const applyTemplate = useApplyProjectTemplate();
  const tenantId = useAuthStore((s) => s.tenantId);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const isPending = createProject.isPending || applyTemplate.isPending;

  function toggleBu(bu: string) {
    setSelectedBus((prev) =>
      prev.includes(bu) ? prev.filter((b) => b !== bu) : [...prev, bu],
    );
  }

  function resetForm() {
    setName("");
    setConstrutora("HORIZONTE");
    setOwnerId(null);
    setOwnerName("");
    setSelectedBus([]);
    setUseTemplate(true);
    setSelectedTemplateId(DEFAULT_TEMPLATE_ID);
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

    const project = await createProject.mutateAsync({
      name: result.data.name,
      construtora: result.data.construtora || null,
      owner_name: result.data.owner_name || null,
      owner_id: ownerId,
      bus: result.data.bus?.length ? JSON.stringify(result.data.bus) : null,
      status: "em_andamento",
      tenant_id: tenantId,
    } as never);

    const projectId = (project as { id?: string })?.id;

    // Apply template: creates sections + zeroed tasks
    if (useTemplate && projectId) {
      await applyTemplate.mutateAsync({
        projectId,
        tenantId,
        templateId: selectedTemplateId,
      });
    }

    // Auto-add creator as first project member
    if (projectId && user?.id) {
      const supabase = createClient();
      await supabase.from("project_memberships").insert({
        project_id: projectId,
        user_id: user.id,
        tenant_id: tenantId,
        granted_by: user.id,
      } as never).single();
    }

    resetForm();
    onOpenChange(false);

    // Navigate to the newly created project
    if (projectId) {
      router.push(`/projetos/${projectId}`);
    }
  }

  const selectedTemplate = PROJECT_TEMPLATES.find((t) => t.id === selectedTemplateId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
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
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Ex: Residencial Aurora"
              required
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            {name.trim() && (
              <p className="text-[11px] text-muted-foreground">
                <span className="font-medium text-foreground">
                  {formatProjectName(name, construtora)}
                </span>
                {" · "}TBO-{new Date().getFullYear()}-NNN
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

          {/* Construtora */}
          <div className="space-y-2">
            <Label>Construtora / Incorporadora</Label>
            <ConstrutoraFormPicker
              value={construtora}
              onSelect={(v) => setConstrutora(v)}
              onClear={() => setConstrutora("")}
            />
          </div>

          {/* Responsável */}
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

          {/* Template toggle */}
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconTemplate className="size-4 text-muted-foreground" />
                <Label className="cursor-pointer text-sm font-medium" htmlFor="use-template">
                  Usar template de seções
                </Label>
              </div>
              <Switch
                id="use-template"
                checked={useTemplate}
                onCheckedChange={setUseTemplate}
              />
            </div>

            {useTemplate && (
              <div className="space-y-1.5">
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger className="h-8 text-sm bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_TEMPLATES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <span className="mr-1.5">{t.icon}</span>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate && (
                  <p className="text-[11px] text-muted-foreground">
                    {selectedTemplate.sections.length} seções ·{" "}
                    {selectedTemplate.sections.reduce((sum, s) => sum + s.tasks.length, 0)} tarefas padrão — tudo zerado
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {createProject.isPending
                ? "Criando..."
                : applyTemplate.isPending
                  ? "Aplicando template..."
                  : "Criar Projeto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Member Picker ─────────────────────────────────────────────────────────────

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
    return [...list].sort((a, b) => {
      if (a.id === user?.id) return -1;
      if (b.id === user?.id) return 1;
      return a.full_name.localeCompare(b.full_name, "pt-BR");
    });
  }, [members, search, user?.id]);

  function getInitials(name: string) {
    return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
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
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onClear(); } }}
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
        <div className="px-3 pt-2 pb-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Selecionar um
          </p>
        </div>
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
                    {isCurrentUser && <span className="ml-1 text-muted-foreground">(você)</span>}
                  </span>
                  {isSelected && <IconCheck className="size-4 text-foreground" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Construtora Picker ───────────────────────────────────────────────────────

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
    const set = new Set<string>(["HORIZONTE"]);
    if (projects) {
      for (const p of projects) {
        if (p.construtora && !/^[0-9a-f]{8}-/i.test(p.construtora)) {
          set.add(p.construtora);
        }
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [projects]);

  const filtered = useMemo(() => {
    if (!search.trim()) return construtoras;
    const q = search.toLowerCase();
    return construtoras.filter((c) => c.toLowerCase().includes(q));
  }, [construtoras, search]);

  const isNewValue =
    search.trim() &&
    !construtoras.some((c) => c.toLowerCase() === search.trim().toLowerCase());

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
              <IconChevronDown className="size-3.5 text-muted-foreground" />
              <span
                role="button"
                tabIndex={-1}
                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onClear(); } }}
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
                  {isSelected && <IconCheck className="size-4 text-foreground" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

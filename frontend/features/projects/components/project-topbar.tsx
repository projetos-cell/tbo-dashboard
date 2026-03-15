"use client";

import { useState } from "react";
import {
  IconDots,
  IconCopy,
  IconArchive,
  IconTrash,
  IconEdit,
  IconSettings,
  IconShare,
  IconSparkles,
  IconAdjustments,
  IconLayoutDashboard,
  IconList,
  IconLayoutKanban,
  IconChartArrowsVertical,
  IconPaperclip,
  IconHistory,
  IconChartBar,
  IconGlobe,
  IconCalendar,
  IconSpeakerphone,
  IconAlertTriangle,
  IconTemplate,
  IconLink,
  IconPrinter,
  IconCheck,
  IconClipboardList,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { InlineEditable } from "@/components/ui/inline-editable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUpdateProject, useDeleteProject, useCreateProject } from "@/features/projects/hooks/use-projects";
import { useSaveProjectAsTemplate } from "@/features/projects/hooks/use-project-templates";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ProjectStatusBadge } from "./project-status-badge";
import { ProjectDetailsDialog } from "./project-details-dialog";
import { ProjectAiSheet } from "./project-ai-sheet";
import { MemberAvatarStack, type MemberInfo } from "./member-avatar-stack";
import { MembersDrawer } from "./members-drawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";
import type { UserOption } from "@/components/ui/user-selector";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

// ─── Tab config ──────────────────────────────────────────────────────────────

const TABS = [
  { key: "overview", label: "Visão Geral", icon: IconLayoutDashboard },
  { key: "list", label: "Lista", icon: IconList },
  { key: "board", label: "Board", icon: IconLayoutKanban },
  { key: "gantt", label: "Gantt", icon: IconChartArrowsVertical },
  { key: "calendar", label: "Calendário", icon: IconCalendar },
  { key: "files", label: "Arquivos", icon: IconPaperclip },
  { key: "updates", label: "Updates", icon: IconSpeakerphone },
  { key: "activity", label: "Atividade", icon: IconHistory },
  { key: "dashboard", label: "Dashboard", icon: IconChartBar },
  { key: "overdue", label: "Atrasadas", icon: IconAlertTriangle },
  { key: "intake", label: "Intake", icon: IconClipboardList },
  { key: "settings", label: "Configurações", icon: IconSettings },
  { key: "portal", label: "Portal do Cliente", icon: IconGlobe },
] as const;

export type ProjectTabKey = (typeof TABS)[number]["key"];

// ─── Props ───────────────────────────────────────────────────────────────────

interface ProjectTopbarProps {
  project: ProjectRow;
  users?: UserOption[];
  members?: MemberInfo[];
  allProfiles?: MemberInfo[];
  activeTab: ProjectTabKey;
  onTabChange: (tab: ProjectTabKey) => void;
  onAddMember?: (member: MemberInfo) => void;
  onRemoveMember?: (memberId: string) => void;
  membersOpen?: boolean;
  onMembersOpenChange?: (open: boolean) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ProjectTopbar({
  project,
  users = [],
  members = [],
  allProfiles = [],
  activeTab,
  onTabChange,
  onAddMember,
  onRemoveMember,
  membersOpen: membersOpenProp,
  onMembersOpenChange,
}: ProjectTopbarProps) {
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const createProject = useCreateProject();
  const saveAsTemplate = useSaveProjectAsTemplate();
  const router = useRouter();
  const { toast } = useToast();
  const tenantId = useAuthStore((s) => s.tenantId);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [membersOpenLocal, setMembersOpenLocal] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [portalLinkCopied, setPortalLinkCopied] = useState(false);
  const [generatingPortal, setGeneratingPortal] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [aiSheetOpen, setAiSheetOpen] = useState(false);
  const [dupOptions, setDupOptions] = useState({
    copySections: true,
    copyTasks: true,
    copyAssignees: false,
    copyDates: false,
  });

  const membersOpen = membersOpenProp ?? membersOpenLocal;
  const setMembersOpen = onMembersOpenChange ?? setMembersOpenLocal;

  const handleNameSave = (name: string) => {
    updateProject.mutate({ id: project.id, updates: { name } });
  };

  const handleStatusChange = (status: string) => {
    updateProject.mutate({ id: project.id, updates: { status } });
  };

  const handleSaveAsTemplate = () => {
    if (!tenantId) return;
    saveAsTemplate.mutate({
      projectId: project.id,
      tenantId,
      name: project.name,
      description: `Template criado a partir do projeto "${project.name}"`,
    });
  };

  const handleDuplicate = () => {
    setDuplicateDialogOpen(true);
  };

  const handleDuplicateConfirm = async () => {
    if (!tenantId) return;
    setDuplicating(true);

    try {
      const newProject = await createProject.mutateAsync({
        tenant_id: project.tenant_id,
        name: `${project.name} (cópia)`,
        status: project.status,
        client: project.client,
        client_company: project.client_company,
        client_id: project.client_id,
        owner_name: dupOptions.copyAssignees ? project.owner_name : null,
        owner_id: dupOptions.copyAssignees ? project.owner_id : null,
        priority: project.priority,
        due_date_start: dupOptions.copyDates ? project.due_date_start : null,
        due_date_end: dupOptions.copyDates ? project.due_date_end : null,
        bus: project.bus,
        services: project.services,
        notes: project.notes,
        notion_url: project.notion_url,
        value: project.value,
      } as never);

      const newId = (newProject as { id?: string })?.id;

      // Copy sections + tasks if selected
      if (newId && (dupOptions.copySections || dupOptions.copyTasks)) {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        if (dupOptions.copySections) {
          // Load original sections
          const { data: origSections } = await supabase
            .from("os_sections")
            .select("*")
            .eq("project_id", project.id)
            .order("order_index", { ascending: true });

          const sectionMap = new Map<string, string>();

          for (const sec of origSections ?? []) {
            const { data: newSec } = await supabase
              .from("os_sections")
              .insert({
                project_id: newId,
                tenant_id: tenantId,
                title: sec.title,
                color: sec.color,
                order_index: sec.order_index,
              } as never)
              .select("id")
              .single();
            if (newSec) sectionMap.set(sec.id, newSec.id);
          }

          if (dupOptions.copyTasks) {
            const { data: origTasks } = await supabase
              .from("os_tasks")
              .select("*")
              .eq("project_id", project.id)
              .is("parent_id", null)
              .order("order_index", { ascending: true });

            for (const task of origTasks ?? []) {
              await supabase.from("os_tasks").insert({
                project_id: newId,
                tenant_id: tenantId,
                section_id: task.section_id ? (sectionMap.get(task.section_id) ?? null) : null,
                title: task.title,
                description: task.description,
                status: "pendente",
                priority: task.priority,
                order_index: task.order_index,
                assignee_id: dupOptions.copyAssignees ? task.assignee_id : null,
                assignee_name: dupOptions.copyAssignees ? task.assignee_name : null,
                start_date: dupOptions.copyDates ? task.start_date : null,
                due_date: dupOptions.copyDates ? task.due_date : null,
                is_completed: false,
              } as never);
            }
          }
        }
      }

      toast({ title: `Projeto duplicado — "${project.name} (cópia)"` });
    } catch {
      toast({ title: "Erro ao duplicar projeto", variant: "destructive" });
    } finally {
      setDuplicating(false);
      setDuplicateDialogOpen(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/projetos/${project.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const portalToken = (project as Record<string, unknown>).portal_token as string | null;

  const handleCopyPortalLink = () => {
    if (!portalToken) return;
    const url = `${window.location.origin}/portal/projeto/${portalToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setPortalLinkCopied(true);
      setTimeout(() => setPortalLinkCopied(false), 2000);
    });
  };

  const handleGeneratePortalToken = () => {
    setGeneratingPortal(true);
    const token = crypto.randomUUID();
    updateProject.mutate(
      { id: project.id, updates: { portal_token: token } as never },
      {
        onSuccess: () => {
          toast({ title: "Link do portal gerado com sucesso" });
          setGeneratingPortal(false);
        },
        onError: () => {
          toast({ title: "Erro ao gerar link", variant: "destructive" });
          setGeneratingPortal(false);
        },
      }
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleArchive = () => {
    updateProject.mutate(
      { id: project.id, updates: { status: "parado" } },
      {
        onSuccess: () => toast({ title: "Projeto pausado" }),
        onError: () => toast({ title: "Erro ao pausar projeto", variant: "destructive" }),
      }
    );
  };

  const handleDeleteConfirm = () => {
    deleteProject.mutate(project.id, {
      onSuccess: () => {
        toast({ title: "Projeto excluído" });
        router.push("/projetos");
      },
      onError: () =>
        toast({ title: "Erro ao excluir", variant: "destructive" }),
    });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border/50 bg-background">
      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 pb-0 pt-3">
        {/* Left: title */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 pb-2.5">
            <div
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-[13px] text-white"
              style={{ background: "linear-gradient(135deg, #e85102, #c44000)" }}
            >
              {project.name?.charAt(0)?.toUpperCase() ?? "P"}
            </div>
            <InlineEditable
              value={project.name}
              onSave={handleNameSave}
              className="text-base font-medium"
            />
            <ProjectStatusBadge
              status={project.status ?? "em_andamento"}
              onChange={handleStatusChange}
            />
          </div>
        </div>

        {/* Right: members + action buttons */}
        <div className="flex shrink-0 items-center gap-2 pb-2.5">
          {members.length > 0 && (
            <button type="button" onClick={() => setMembersOpen(true)} className="focus:outline-none">
              <MemberAvatarStack members={members} />
            </button>
          )}

          <Button
            size="sm"
            className="gap-1.5 text-xs"
            style={{ backgroundColor: "#e85102", borderColor: "#e85102" }}
            onClick={() => setShareOpen(true)}
          >
            <IconShare className="size-3.5" />
            Compartilhar
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setAiSheetOpen(true)}
          >
            <IconSparkles className="size-3.5" />
            Ask AI
          </Button>

          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <IconAdjustments className="size-3.5" />
            Personalizar
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                aria-label="Mais opções"
              >
                <IconDots className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => setDetailsOpen(true)}>
                <IconEdit className="mr-2 size-3.5" />
                Editar detalhes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDuplicate} disabled={duplicating}>
                <IconCopy className="mr-2 size-3.5" />
                Duplicar projeto
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSaveAsTemplate} disabled={saveAsTemplate.isPending}>
                <IconTemplate className="mr-2 size-3.5" />
                Salvar como template
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleArchive} disabled={updateProject.isPending}>
                <IconArchive className="mr-2 size-3.5" />
                Pausar projeto
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/projetos/configuracoes")}>
                <IconSettings className="mr-2 size-3.5" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => setDeleteOpen(true)}
              >
                <IconTrash className="mr-2 size-3.5" />
                Excluir projeto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── CODE BAR ──────────────────────────────────────────── */}
      {project.code && (
        <div className="flex items-center px-4 py-1.5 text-xs text-muted-foreground">
          <span className="font-mono font-medium text-foreground">{project.code}</span>
        </div>
      )}

      {/* ── TABS BAR ────────────────────────────────────────────── */}
      <div className="flex items-center gap-0 border-b border-border/50 px-4">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onTabChange(key)}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] transition-colors select-none whitespace-nowrap",
              activeTab === key
                ? "border-[#e85102] font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-3.5 opacity-65" />
            {label}
          </button>
        ))}
      </div>

      {/* ── EDIT DETAILS ──────────────────────────────────────── */}
      <ProjectDetailsDialog
        project={project}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      {/* ── DELETE CONFIRM ──────────────────────────────────────── */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir projeto"
        description={`Excluir "${project.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
      />

      {/* ── DUPLICATE OPTIONS DIALOG (TM03) ───────────────────── */}
      <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Duplicar Projeto</DialogTitle>
            <DialogDescription>
              Selecione o que copiar para o novo projeto.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={dupOptions.copySections}
                onCheckedChange={(v) => setDupOptions((p) => ({ ...p, copySections: !!v }))}
              />
              <span className="text-sm">Copiar seções</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={dupOptions.copyTasks}
                disabled={!dupOptions.copySections}
                onCheckedChange={(v) => setDupOptions((p) => ({ ...p, copyTasks: !!v }))}
              />
              <span className="text-sm">Copiar tarefas</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={dupOptions.copyAssignees}
                onCheckedChange={(v) => setDupOptions((p) => ({ ...p, copyAssignees: !!v }))}
              />
              <span className="text-sm">Copiar responsáveis</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={dupOptions.copyDates}
                onCheckedChange={(v) => setDupOptions((p) => ({ ...p, copyDates: !!v }))}
              />
              <span className="text-sm">Copiar datas</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDuplicateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleDuplicateConfirm} disabled={duplicating}>
              {duplicating ? "Duplicando..." : "Duplicar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── SHARE SHEET (UX01) ──────────────────────────────────── */}
      <Sheet open={shareOpen} onOpenChange={setShareOpen}>
        <SheetContent className="w-[380px]">
          <SheetHeader>
            <SheetTitle>Compartilhar projeto</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-5">
            {/* Copy link */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Link do projeto</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 truncate rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/projetos/${project.id}`
                    : `/projetos/${project.id}`}
                </div>
                <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={handleCopyLink}>
                  {linkCopied ? <IconCheck className="size-3.5 text-green-500" /> : <IconLink className="size-3.5" />}
                  {linkCopied ? "Copiado" : "Copiar"}
                </Button>
              </div>
            </div>

            {/* Portal link (CL02) */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <IconGlobe className="size-3.5" />
                Link do Portal do Cliente
              </label>
              {portalToken ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 truncate rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                    {typeof window !== "undefined"
                      ? `${window.location.origin}/portal/projeto/${portalToken}`
                      : `/portal/projeto/${portalToken}`}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 shrink-0"
                    onClick={handleCopyPortalLink}
                  >
                    {portalLinkCopied ? (
                      <IconCheck className="size-3.5 text-green-500" />
                    ) : (
                      <IconLink className="size-3.5" />
                    )}
                    {portalLinkCopied ? "Copiado" : "Copiar"}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={handleGeneratePortalToken}
                  disabled={generatingPortal}
                >
                  <IconGlobe className="size-3.5" />
                  {generatingPortal ? "Gerando..." : "Gerar link público"}
                </Button>
              )}
              <p className="text-[11px] text-muted-foreground">
                O cliente pode acompanhar o progresso e aprovar entregas por esse link.
              </p>
            </div>

            {/* Print */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Exportar</label>
              <Button variant="outline" size="sm" className="w-full gap-2" onClick={handlePrint}>
                <IconPrinter className="size-3.5" />
                Imprimir / Salvar como PDF
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── MEMBERS DRAWER ─────────────────────────────────────── */}
      <MembersDrawer
        open={membersOpen}
        onOpenChange={setMembersOpen}
        members={members}
        allProfiles={allProfiles}
        onAddMember={(m) => onAddMember?.(m)}
        onRemoveMember={(id) => onRemoveMember?.(id)}
      />

      {/* ── ASK AI SHEET (UX02) ──────────────────────────────── */}
      <ProjectAiSheet
        open={aiSheetOpen}
        onOpenChange={setAiSheetOpen}
        projectId={project.id}
        projectName={project.name}
      />
    </div>
  );
}

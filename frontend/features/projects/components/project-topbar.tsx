"use client";

import { useState } from "react";
import {
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
  IconSettings,
  IconClipboardList,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { InlineEditable } from "@/components/ui/inline-editable";
import { useUpdateProject, useDeleteProject } from "@/features/projects/hooks/use-projects";
import { useSaveProjectAsTemplate } from "@/features/projects/hooks/use-project-templates";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ProjectStatusBadge } from "./project-status-badge";
import { ProjectDetailsDialog } from "./project-details-dialog";
import { ProjectAiSheet } from "./project-ai-sheet";
import { MemberAvatarStack, type MemberInfo } from "./member-avatar-stack";
import { MembersDrawer } from "./members-drawer";
import { ProjectActionsMenu } from "./project-actions-menu";
import { ProjectDuplicateDialog } from "./project-duplicate-dialog";
import { ProjectShareSheet } from "./project-share-sheet";
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
  const saveAsTemplate = useSaveProjectAsTemplate();
  const router = useRouter();
  const { toast } = useToast();
  const tenantId = useAuthStore((s) => s.tenantId);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [membersOpenLocal, setMembersOpenLocal] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [aiSheetOpen, setAiSheetOpen] = useState(false);

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

          <ProjectActionsMenu
            onEditDetails={() => setDetailsOpen(true)}
            onDuplicate={() => setDuplicateDialogOpen(true)}
            onSaveAsTemplate={handleSaveAsTemplate}
            onArchive={handleArchive}
            onSettings={() => router.push("/projetos/configuracoes")}
            onDelete={() => setDeleteOpen(true)}
            duplicating={false}
            savingTemplate={saveAsTemplate.isPending}
            archiving={updateProject.isPending}
          />
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

      {/* ── DIALOGS & SHEETS ─────────────────────────────────── */}
      <ProjectDetailsDialog
        project={project}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir projeto"
        description={`Excluir "${project.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
      />

      <ProjectDuplicateDialog
        project={project}
        open={duplicateDialogOpen}
        onOpenChange={setDuplicateDialogOpen}
      />

      <ProjectShareSheet
        project={project}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />

      <MembersDrawer
        open={membersOpen}
        onOpenChange={setMembersOpen}
        members={members}
        allProfiles={allProfiles}
        onAddMember={(m) => onAddMember?.(m)}
        onRemoveMember={(id) => onRemoveMember?.(id)}
      />

      <ProjectAiSheet
        open={aiSheetOpen}
        onOpenChange={setAiSheetOpen}
        projectId={project.id}
        projectName={project.name}
      />
    </div>
  );
}

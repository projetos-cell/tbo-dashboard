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
  IconChartArrowsVertical,
  IconPaperclip,
  IconHistory,
  IconChartBar,
  IconGlobe,
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
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ProjectStatusBadge } from "./project-status-badge";
import { ProjectDetailsDialog } from "./project-details-dialog";
import { MemberAvatarStack, type MemberInfo } from "./member-avatar-stack";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";
import type { UserOption } from "@/components/ui/user-selector";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

// ─── Tab config ──────────────────────────────────────────────────────────────

const TABS = [
  { key: "overview", label: "Visão Geral", icon: IconLayoutDashboard },
  { key: "list", label: "Lista", icon: IconList },
  { key: "gantt", label: "Gantt", icon: IconChartArrowsVertical },
  { key: "files", label: "Arquivos", icon: IconPaperclip },
  { key: "activity", label: "Atividade", icon: IconHistory },
  { key: "dashboard", label: "Dashboard", icon: IconChartBar },
  { key: "portal", label: "Portal do Cliente", icon: IconGlobe },
] as const;

export type ProjectTabKey = (typeof TABS)[number]["key"];

// ─── Props ───────────────────────────────────────────────────────────────────

interface ProjectTopbarProps {
  project: ProjectRow;
  users?: UserOption[];
  members?: MemberInfo[];
  activeTab: ProjectTabKey;
  onTabChange: (tab: ProjectTabKey) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ProjectTopbar({
  project,
  users = [],
  members = [],
  activeTab,
  onTabChange,
}: ProjectTopbarProps) {
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const createProject = useCreateProject();
  const router = useRouter();
  const { toast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const handleNameSave = (name: string) => {
    updateProject.mutate({ id: project.id, updates: { name } });
  };

  const handleStatusChange = (status: string) => {
    updateProject.mutate({ id: project.id, updates: { status } });
  };

  const handleDuplicate = () => {
    setDuplicating(true);
    createProject.mutate(
      {
        tenant_id: project.tenant_id,
        name: `${project.name} (cópia)`,
        status: project.status,
        client: project.client,
        client_company: project.client_company,
        client_id: project.client_id,
        owner_name: project.owner_name,
        owner_id: project.owner_id,
        priority: project.priority,
        due_date_start: project.due_date_start,
        due_date_end: project.due_date_end,
        bus: project.bus,
        services: project.services,
        notes: project.notes,
        notion_url: project.notion_url,
        value: project.value,
      },
      {
        onSuccess: () => {
          toast({ title: "Projeto duplicado com sucesso!" });
          setDuplicating(false);
        },
        onError: () => {
          toast({ title: "Erro ao duplicar projeto", variant: "destructive" });
          setDuplicating(false);
        },
      }
    );
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
          {members.length > 0 && <MemberAvatarStack members={members} />}

          <Button
            size="sm"
            className="gap-1.5 text-xs"
            style={{ backgroundColor: "#e85102", borderColor: "#e85102" }}
          >
            <IconShare className="size-3.5" />
            Compartilhar
          </Button>

          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
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
    </div>
  );
}

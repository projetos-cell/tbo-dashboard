"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconDots,
  IconCopy,
  IconArchive,
  IconTrash,
  IconSettings,
  IconExternalLink,
  IconChevronDown,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InlineEditable } from "@/components/ui/inline-editable";
import { DateRangePicker, type DateRange } from "@/components/ui/date-range-picker";
import { UserSelector, type UserOption } from "@/components/ui/user-selector";
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
import { PROJECT_STATUS, type ProjectStatusKey } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectTopbarProps {
  project: ProjectRow;
  users?: UserOption[];
}

export function ProjectTopbar({ project, users = [] }: ProjectTopbarProps) {
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const createProject = useCreateProject();
  const router = useRouter();
  const { toast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const handleNameSave = (name: string) => {
    updateProject.mutate({ id: project.id, updates: { name } });
  };

  const handleStatusChange = (newStatus: string) => {
    updateProject.mutate({ id: project.id, updates: { status: newStatus } });
  };

  const handleOwnerChange = (ownerId: string | null) => {
    const owner = users.find((u) => u.id === ownerId);
    updateProject.mutate({
      id: project.id,
      updates: { owner_name: owner?.full_name || null },
    });
  };

  const handleDateChange = (range: DateRange) => {
    updateProject.mutate({
      id: project.id,
      updates: {
        due_date_start: range.start?.toISOString().split("T")[0] || null,
        due_date_end: range.end?.toISOString().split("T")[0] || null,
      },
    });
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
          toast({
            title: "Erro ao duplicar projeto",
            description: "Tente novamente.",
            variant: "destructive",
          });
          setDuplicating(false);
        },
      }
    );
  };

  const handleArchive = () => {
    updateProject.mutate(
      { id: project.id, updates: { status: "parado" } },
      {
        onSuccess: () => {
          toast({ title: "Projeto pausado", description: "Status alterado para Parado." });
        },
        onError: () => {
          toast({ title: "Erro ao pausar projeto", variant: "destructive" });
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    deleteProject.mutate(project.id, {
      onSuccess: () => {
        toast({ title: "Projeto excluído" });
        router.push("/projetos");
      },
      onError: () => {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o projeto.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <Link href="/projetos">
          <Button variant="ghost" size="icon" className="mt-1" aria-label="Voltar">
            <IconArrowLeft className="size-4" />
          </Button>
        </Link>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-3">
            <InlineEditable
              value={project.name}
              onSave={handleNameSave}
              variant="h1"
            />
            <StatusDropdown
              current={project.status || ""}
              onChange={handleStatusChange}
            />
          </div>
          {project.code && (
            <p className="text-sm text-gray-500">{project.code}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {project.notion_url && (
            <a href={project.notion_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <IconExternalLink className="size-3.5 mr-1" />
                Notion
              </Button>
            </a>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Mais opções">
                <IconDots className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
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

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir projeto"
        description={`Excluir "${project.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
      />

      {/* Secondary row */}
      <div className="flex items-center gap-4 pl-12">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 text-xs">Responsável:</span>
          <UserSelector
            mode="single"
            selected={users.find((u) => u.full_name === project.owner_name)?.id || null}
            onChange={handleOwnerChange}
            users={users}
            className="h-8 w-[180px]"
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 text-xs">Período:</span>
          <DateRangePicker
            value={{
              start: project.due_date_start
                ? new Date(project.due_date_start + "T00:00:00")
                : null,
              end: project.due_date_end
                ? new Date(project.due_date_end + "T00:00:00")
                : null,
            }}
            onChange={handleDateChange}
            className="h-8"
          />
        </div>
      </div>
    </div>
  );
}

// ─── StatusDropdown ─────────────────────────────────────────────────

function StatusDropdown({
  current,
  onChange,
}: {
  current: string;
  onChange: (status: string) => void;
}) {
  const statusCfg = PROJECT_STATUS[current as ProjectStatusKey];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge
          className="cursor-pointer gap-1 select-none"
          style={
            statusCfg
              ? { backgroundColor: statusCfg.bg, color: statusCfg.color }
              : undefined
          }
        >
          {statusCfg?.label || current}
          <IconChevronDown className="size-3 opacity-60" />
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        {Object.entries(PROJECT_STATUS).map(([key, cfg]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => onChange(key)}
            className="gap-2"
          >
            <div
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: cfg.color }}
            />
            {cfg.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

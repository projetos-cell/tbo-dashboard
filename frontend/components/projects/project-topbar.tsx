"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MoreHorizontal,
  Copy,
  Archive,
  Trash2,
  Settings,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InlineEditable } from "@/components/ui/inline-editable";
import { DateRangePicker, type DateRange } from "@/components/ui/date-range-picker";
import { UserSelector, type UserOption } from "@/components/ui/user-selector";
import { useUpdateProject, useDeleteProject } from "@/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { toast } = useToast();
  const [showMenu, setShowMenu] = useState(false);

  const status = PROJECT_STATUS[project.status as ProjectStatusKey];

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
      updates: {
        owner_name: owner?.full_name || null,
      },
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

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Excluir "${project.name}"? Esta acao nao pode ser desfeita.`
    );
    if (!confirmed) return;
    deleteProject.mutate(project.id, {
      onSuccess: () => {
        toast({ title: "Projeto excluido" });
        router.push("/projetos");
      },
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <Link href="/projetos">
          <Button variant="ghost" size="icon" className="mt-1" aria-label="Voltar">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-3">
            <InlineEditable
              value={project.name}
              onSave={handleNameSave}
              variant="h1"
            />
            {status && (
              <StatusDropdown
                current={project.status || ""}
                onChange={handleStatusChange}
              />
            )}
          </div>
          {project.code && (
            <p className="text-sm text-muted-foreground">{project.code}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {project.notion_url && (
            <a
              href={project.notion_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <ExternalLink className="size-3.5 mr-1" />
                Notion
              </Button>
            </a>
          )}

          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Mais opcoes"
            >
              <MoreHorizontal className="size-4" />
            </Button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-popover border rounded-md shadow-md z-20 py-1 min-w-[160px]">
                <MenuButton icon={Copy} label="Duplicar" onClick={() => setShowMenu(false)} />
                <MenuButton icon={Archive} label="Arquivar" onClick={() => setShowMenu(false)} />
                <MenuButton icon={Settings} label="Configuracoes" onClick={() => setShowMenu(false)} />
                <div className="h-px bg-border my-1" />
                <MenuButton
                  icon={Trash2}
                  label="Excluir"
                  danger
                  onClick={() => {
                    setShowMenu(false);
                    handleDelete();
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary row */}
      <div className="flex items-center gap-4 pl-12">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground text-xs">Responsavel:</span>
          <UserSelector
            mode="single"
            selected={users.find((u) => u.full_name === project.owner_name)?.id || null}
            onChange={handleOwnerChange}
            users={users}
            className="h-8 w-[180px]"
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground text-xs">Periodo:</span>
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

function StatusDropdown({
  current,
  onChange,
}: {
  current: string;
  onChange: (status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const statusCfg = PROJECT_STATUS[current as ProjectStatusKey];

  return (
    <div className="relative">
      <Badge
        className="cursor-pointer"
        style={
          statusCfg
            ? { backgroundColor: statusCfg.bg, color: statusCfg.color }
            : undefined
        }
        onClick={() => setOpen(!open)}
      >
        {statusCfg?.label || current}
      </Badge>
      {open && (
        <div className="absolute left-0 top-full mt-1 bg-popover border rounded-md shadow-md z-20 py-1 min-w-[140px]">
          {Object.entries(PROJECT_STATUS).map(([key, cfg]) => (
            <button
              key={key}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent"
              onClick={() => {
                onChange(key);
                setOpen(false);
              }}
            >
              <div
                className="size-2.5 rounded-full"
                style={{ backgroundColor: cfg.color }}
              />
              {cfg.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MenuButton({
  icon: Icon,
  label,
  danger,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent ${
        danger ? "text-destructive" : ""
      }`}
      onClick={onClick}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}

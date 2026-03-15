"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  IconPlayerPlay,
  IconAlertTriangle,
  IconCalendar,
  IconUser,
  IconClipboardList,
  IconProgress,
  IconTarget,
  IconFile,
  IconSparkles,
  IconLink,
  IconHistory,
  IconPlus,
  IconPencil,
  IconCheck,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProject, useUpdateProject } from "@/features/projects/hooks/use-projects";
import { useProjectTasks, useProjectSections, useProjectTaskStats } from "@/features/projects/hooks/use-project-tasks";
import { useProfiles } from "@/features/people/hooks/use-people";
import { PROJECT_STATUS, type ProjectStatusKey } from "@/lib/constants";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { MemberInfo } from "@/features/projects/components/member-avatar-stack";

interface ProjectOverviewProps {
  projectId: string;
  members?: MemberInfo[];
  onOpenMembers?: () => void;
}

const AVATAR_COLORS = [
  { bg: "#d1e8fb", text: "#0c447c" },
  { bg: "#faeeda", text: "#633806" },
  { bg: "#eaf3de", text: "#27500a" },
  { bg: "#fbeaf0", text: "#72243e" },
  { bg: "#e1f5ee", text: "#085041" },
  { bg: "#e8e0f5", text: "#4a2174" },
];

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function ProjectOverview({ projectId, members = [], onOpenMembers }: ProjectOverviewProps) {
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: stats, isLoading: statsLoading } = useProjectTaskStats(projectId);
  const { allTasks, isLoading: tasksLoading } = useProjectTasks(projectId);
  const { data: sections } = useProjectSections(projectId);
  const { data: profiles } = useProfiles();
  const updateProject = useUpdateProject();

  const isLoading = projectLoading || statsLoading || tasksLoading;

  // Editable description state
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const notesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingNotes && notesRef.current) {
      notesRef.current.focus();
      notesRef.current.style.height = "auto";
      notesRef.current.style.height = notesRef.current.scrollHeight + "px";
    }
  }, [editingNotes]);

  function handleSaveNotes() {
    const trimmed = notesValue.trim();
    updateProject.mutate({
      id: projectId,
      updates: { notes: trimmed || null } as never,
    });
    setEditingNotes(false);
  }

  function handleStatusChange(status: string) {
    updateProject.mutate({
      id: projectId,
      updates: { status } as never,
    });
  }

  const progressPercent = useMemo(() => {
    if (!stats || stats.totalTasks === 0) return 0;
    return Math.round((stats.completedTasks / stats.totalTasks) * 100);
  }, [stats]);

  const keyTasks = useMemo(() => {
    if (!allTasks) return { overdue: [], upcoming: [], inProgress: [] };
    const now = new Date();
    const nowStr = now.toISOString().split("T")[0];
    const weekAhead = new Date(now);
    weekAhead.setDate(weekAhead.getDate() + 7);
    const weekStr = weekAhead.toISOString().split("T")[0];

    const overdue = allTasks.filter(
      (t) => !t.is_completed && !t.parent_id && t.due_date && t.due_date < nowStr
    );
    const upcoming = allTasks.filter(
      (t) => !t.is_completed && !t.parent_id && t.due_date && t.due_date >= nowStr && t.due_date <= weekStr
    );
    const inProgress = allTasks.filter(
      (t) => !t.is_completed && !t.parent_id && (t.status === "em_andamento" || t.status === "revisao")
    );

    return { overdue, upcoming, inProgress };
  }, [allTasks]);

  const sectionProgress = useMemo(() => {
    if (!sections || !allTasks) return [];
    return sections.map((section) => {
      const sectionTasks = allTasks.filter((t) => t.section_id === section.id && !t.parent_id);
      const completed = sectionTasks.filter((t) => t.is_completed).length;
      const total = sectionTasks.length;
      return {
        ...section,
        total,
        completed,
        percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
  }, [sections, allTasks]);

  // Enrich members with cargo from profiles
  const enrichedMembers = useMemo(() => {
    if (!profiles) return members.map((m) => ({ ...m, cargo: null as string | null }));
    return members.map((m) => {
      const profile = profiles.find((p) => p.id === m.id);
      return { ...m, cargo: (profile as Record<string, unknown>)?.cargo as string | null ?? null };
    });
  }, [members, profiles]);

  // Recent activity: combine overdue + in progress + upcoming
  const recentActivity = useMemo(() => {
    const all = [
      ...keyTasks.overdue.map((t) => ({ ...t, _variant: "overdue" as const })),
      ...keyTasks.inProgress.map((t) => ({ ...t, _variant: "progress" as const })),
      ...keyTasks.upcoming.map((t) => ({ ...t, _variant: "upcoming" as const })),
    ];
    return all.slice(0, 8);
  }, [keyTasks]);

  // Resource links (placeholder — future: stored in Supabase)
  const [resources] = useState([
    { id: "brief", label: "Brief do cliente", url: "#" },
    { id: "drive", label: "Pasta Drive do projeto", url: "#" },
    { id: "contrato", label: "Contrato comercial", url: "#" },
  ]);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  const statusCfg = PROJECT_STATUS[project?.status as ProjectStatusKey];
  const daysLeft = project?.due_date_end
    ? differenceInDays(new Date(project.due_date_end), new Date())
    : null;

  return (
    <div className="space-y-6">
      {/* ── 2-Column Layout ─────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* ═══ LEFT COLUMN ═══ */}
        <div className="space-y-4">
          {/* Descrição do Projeto (editável) */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <IconClipboardList className="size-4 text-muted-foreground" />
                  Descrição do Projeto
                </CardTitle>
                {!editingNotes && (
                  <button
                    type="button"
                    onClick={() => {
                      setNotesValue(project?.notes ?? "");
                      setEditingNotes(true);
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <IconPencil className="size-3.5" />
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingNotes ? (
                <div className="space-y-2">
                  <textarea
                    ref={notesRef}
                    value={notesValue}
                    onChange={(e) => {
                      setNotesValue(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setEditingNotes(false);
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSaveNotes();
                    }}
                    className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring min-h-[80px]"
                    placeholder="Descreva o projeto..."
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setEditingNotes(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={handleSaveNotes}
                      disabled={updateProject.isPending}
                    >
                      <IconCheck className="size-3" />
                      Salvar
                    </Button>
                  </div>
                </div>
              ) : project?.notes ? (
                <button
                  type="button"
                  onClick={() => {
                    setNotesValue(project.notes ?? "");
                    setEditingNotes(true);
                  }}
                  className="w-full text-left"
                >
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed hover:bg-muted/30 rounded-md px-1 py-0.5 -mx-1 transition-colors">
                    {project.notes}
                  </p>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setNotesValue("");
                    setEditingNotes(true);
                  }}
                  className="w-full text-left"
                >
                  <p className="text-sm text-muted-foreground italic hover:bg-muted/30 rounded-md px-1 py-0.5 -mx-1 transition-colors">
                    Clique para adicionar uma descrição...
                  </p>
                </button>
              )}
            </CardContent>
          </Card>

          {/* Membros do Projeto */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <IconUser className="size-4 text-muted-foreground" />
                  Membros do Projeto
                </CardTitle>
                {onOpenMembers && (
                  <button
                    type="button"
                    onClick={onOpenMembers}
                    className="text-xs font-medium text-[#e85102] hover:underline"
                  >
                    Gerenciar
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {enrichedMembers.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {enrichedMembers.map((member, i) => {
                    const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                    return (
                      <div key={member.id} className="flex items-center gap-3">
                        <Avatar className="size-10">
                          {member.avatar_url && <AvatarImage src={member.avatar_url} />}
                          <AvatarFallback
                            className="text-xs font-semibold"
                            style={{ backgroundColor: color.bg, color: color.text }}
                          >
                            {getInitials(member.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {member.full_name?.split(" ")[0]}
                          </p>
                          {member.cargo && (
                            <p className="text-xs text-muted-foreground truncate">
                              {member.cargo}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {onOpenMembers && (
                    <button
                      type="button"
                      onClick={onOpenMembers}
                      className="flex size-10 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 text-muted-foreground/50 hover:border-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    >
                      <IconPlus className="size-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground italic">
                    Nenhum membro neste projeto.
                  </p>
                  {onOpenMembers && (
                    <button
                      type="button"
                      onClick={onOpenMembers}
                      className="flex size-10 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 text-muted-foreground/50 hover:border-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    >
                      <IconPlus className="size-4" />
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metas Conectadas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <IconTarget className="size-4 text-muted-foreground" />
                Metas Conectadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">
                Nenhuma meta conectada a este projeto.
              </p>
            </CardContent>
          </Card>

          {/* Arquivos Recentes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <IconFile className="size-4 text-muted-foreground" />
                Arquivos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">
                Nenhum arquivo adicionado a este projeto.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div className="space-y-4">
          {/* Status + Progresso */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <IconProgress className="size-4 text-muted-foreground" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="rounded-full transition-colors hover:ring-1 hover:ring-border focus:outline-none">
                      {statusCfg ? (
                        <Badge
                          className="text-xs gap-1.5 cursor-pointer"
                          style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
                        >
                          <span className="size-1.5 rounded-full" style={{ backgroundColor: statusCfg.color }} />
                          {statusCfg.label}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs cursor-pointer">Sem status</Badge>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44">
                    {(Object.entries(PROJECT_STATUS) as [ProjectStatusKey, (typeof PROJECT_STATUS)[ProjectStatusKey]][]).map(
                      ([key, cfg]) => (
                        <DropdownMenuItem
                          key={key}
                          onClick={() => handleStatusChange(key)}
                          className="gap-2"
                        >
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                          <span>{cfg.label}</span>
                          {key === project?.status && <span className="ml-auto text-xs text-muted-foreground">atual</span>}
                        </DropdownMenuItem>
                      ),
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <span className="text-2xl font-bold text-primary">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs">
                  {stats?.completedTasks ?? 0} de {stats?.totalTasks ?? 0} tarefas concluídas
                </p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <IconPlayerPlay className="size-3 text-blue-500" />
                    {stats?.inProgressTasks ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <IconAlertTriangle className="size-3 text-red-500" />
                    {stats?.overdueTasks ?? 0}
                  </span>
                </div>
              </div>

              {/* Section progress inline */}
              {sectionProgress.length > 0 && (
                <div className="space-y-3 border-t pt-3">
                  <p className="text-xs font-medium text-muted-foreground">Por Seção</p>
                  {sectionProgress.map((section) => (
                    <div key={section.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {section.color && (
                            <div
                              className="size-2 rounded-full shrink-0"
                              style={{ backgroundColor: section.color }}
                            />
                          )}
                          <span className="text-xs">{section.title}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          {section.completed}/{section.total}
                        </span>
                      </div>
                      <Progress value={section.percent} className="h-1" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Período */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <IconCalendar className="size-4 text-muted-foreground" />
                Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {project?.due_date_start && project?.due_date_end ? (
                  <p className="text-sm font-medium">
                    {format(new Date(project.due_date_start), "dd MMM", { locale: ptBR })}
                    {" → "}
                    {format(new Date(project.due_date_end), "dd MMM yyyy", { locale: ptBR })}
                  </p>
                ) : project?.due_date_end ? (
                  <p className="text-sm font-medium">
                    Entrega: {format(new Date(project.due_date_end), "dd MMM yyyy", { locale: ptBR })}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem prazo definido</p>
                )}
                {daysLeft !== null && (
                  <p className={cn(
                    "text-xs font-medium",
                    daysLeft < 0 ? "text-red-600" : daysLeft <= 7 ? "text-amber-600" : "text-green-600"
                  )}>
                    {daysLeft < 0
                      ? `${Math.abs(daysLeft)} dias atrasado`
                      : daysLeft === 0
                        ? "Prazo é hoje"
                        : `${daysLeft} dias restantes`}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resumo do Projeto por IA */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <IconSparkles className="size-4 text-muted-foreground" />
                  Resumo do Projeto por IA
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 text-xs"
                >
                  <IconSparkles className="size-3" />
                  Gerar com IA
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">
                O resumo inteligente será gerado automaticamente com base no progresso e atividades do projeto.
              </p>
            </CardContent>
          </Card>

          {/* Recursos-Chave */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Recursos-Chave
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center gap-3 rounded-lg bg-muted/40 px-4 py-3 text-sm transition-colors hover:bg-muted/60 cursor-pointer"
                >
                  <IconLink className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{resource.label}</span>
                </div>
              ))}
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <IconPlus className="size-3.5" />
                Adicionar recurso
              </button>
            </CardContent>
          </Card>

          {/* Atividade Recente */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((task) => (
                    <OverviewTaskRow key={task.id} task={task} variant={task._variant} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Nenhuma atividade recente neste projeto.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ── Helper Components ──────────────────────────────────────────────── */

function OverviewTaskRow({
  task,
  variant,
}: {
  task: { id: string; title: string | null; assignee_name: string | null; due_date: string | null; status: string | null };
  variant: "overdue" | "progress" | "upcoming";
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold",
        variant === "overdue" && "bg-red-100 text-red-700",
        variant === "progress" && "bg-blue-100 text-blue-700",
        variant === "upcoming" && "bg-amber-100 text-amber-700",
      )}>
        {task.assignee_name
          ? task.assignee_name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
          : "?"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-semibold">{task.assignee_name?.split(" ")[0] ?? "Alguém"}</span>
          {" "}
          <span className="text-muted-foreground">
            {variant === "overdue" && "tem tarefa atrasada"}
            {variant === "progress" && "está trabalhando em"}
            {variant === "upcoming" && "tem tarefa próxima"}
          </span>
        </p>
        <p className="text-xs text-muted-foreground truncate">{task.title}</p>
      </div>
      {task.due_date && (
        <span className={cn(
          "text-xs shrink-0",
          variant === "overdue" ? "text-red-600 font-medium" : "text-muted-foreground"
        )}>
          {format(new Date(task.due_date), "dd MMM", { locale: ptBR })}
        </span>
      )}
    </div>
  );
}

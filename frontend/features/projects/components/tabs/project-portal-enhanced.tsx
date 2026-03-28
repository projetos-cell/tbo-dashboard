"use client";

import { useMemo } from "react";
import {
  IconCheck,
  IconClock,
  IconFile,
  IconSpeakerphone,
  IconMessageCircle,
  IconUpload,
  IconTimeline,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared";
import { useProjectTasks } from "@/features/projects/hooks/use-project-tasks";
import { useProjectStatusUpdates } from "@/features/projects/hooks/use-project-status-updates";
import { useRequestApproval } from "@/features/projects/hooks/use-portal";
import { useAuthStore } from "@/stores/auth-store";
import { PROJECT_HEALTH, computeProjectHealth, type ProjectHealthKey } from "@/lib/constants";
import { isPast, isToday } from "date-fns";
import { toast } from "sonner";
import { PortalBranding } from "@/features/projects/components/portal/portal-branding";
import { PortalCommentsSection } from "@/features/projects/components/portal/portal-comments-section";
import { PortalFileUpload } from "@/features/projects/components/portal/portal-file-upload";
import { PortalApprovalTimeline } from "@/features/projects/components/portal/portal-approval-timeline";
import { PortalStatCard, PortalEnhancedTaskRow } from "./portal-enhanced-parts";

interface ProjectPortalEnhancedProps {
  projectId: string;
  projectName?: string;
  tenantId: string;
  portalLogoUrl?: string | null;
  portalPrimaryColor?: string | null;
  portalCompanyName?: string | null;
  isInternal?: boolean;
  clientName?: string | null;
  clientEmail?: string | null;
}

export function ProjectPortalEnhanced({
  projectId,
  projectName,
  tenantId,
  portalLogoUrl,
  portalPrimaryColor,
  portalCompanyName,
  isInternal = false,
  clientName,
  clientEmail,
}: ProjectPortalEnhancedProps) {
  const user = useAuthStore((s) => s.user);
  const { data: tasks = [], isLoading: tasksLoading } = useProjectTasks(projectId);
  const { data: updates = [], isLoading: updatesLoading } = useProjectStatusUpdates(projectId);
  const requestApproval = useRequestApproval();

  const stats = useMemo(() => {
    const total = tasks.filter((t) => !t.parent_id).length;
    const completed = tasks.filter((t) => !t.parent_id && t.is_completed).length;
    const overdue = tasks.filter(
      (t) =>
        !t.parent_id &&
        !t.is_completed &&
        t.due_date &&
        isPast(new Date(t.due_date + "T23:59:59")) &&
        !isToday(new Date(t.due_date + "T00:00:00")),
    ).length;
    const inProgress = tasks.filter(
      (t) => !t.parent_id && t.status === "em_andamento",
    ).length;
    const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const health = computeProjectHealth({ total, overdue });
    return { total, completed, overdue, inProgress, progressPct, health };
  }, [tasks]);

  const visibleTasks = useMemo(
    () =>
      tasks
        .filter(
          (t) =>
            !t.parent_id &&
            (t.status === "concluida" ||
              t.status === "revisao" ||
              t.status === "em_andamento"),
        )
        .sort((a, b) => {
          if (a.is_completed && !b.is_completed) return -1;
          if (!a.is_completed && b.is_completed) return 1;
          return (b.updated_at ?? "").localeCompare(a.updated_at ?? "");
        })
        .slice(0, 30),
    [tasks],
  );

  const latestUpdate = updates[0];
  const healthConf = PROJECT_HEALTH[stats.health];

  function handleRequestApproval(taskId: string) {
    requestApproval.mutate(
      {
        tenant_id: tenantId,
        project_id: projectId,
        task_id: taskId,
        sla_hours: 48,
        client_name: clientName ?? null,
      },
      {
        onSuccess: () => toast.success("Aprovacao solicitada ao cliente"),
        onError: () => toast.error("Erro ao solicitar aprovacao"),
      },
    );
  }

  if (tasksLoading || updatesLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-2xl bg-muted" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Branding */}
      <PortalBranding
        portalLogoUrl={portalLogoUrl}
        portalPrimaryColor={portalPrimaryColor}
        portalCompanyName={portalCompanyName}
        subtitle={projectName}
      />

      {/* Progress card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Progresso Geral</CardTitle>
            <Badge
              variant="outline"
              style={{
                borderColor: healthConf.color,
                color: healthConf.color,
                backgroundColor: healthConf.bg,
              }}
            >
              {healthConf.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {stats.completed} de {stats.total} tarefas concluidas
              </span>
              <span className="font-semibold">{stats.progressPct}%</span>
            </div>
            <Progress value={stats.progressPct} className="h-2.5" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            <PortalStatCard label="Total" value={stats.total} icon={IconFile} />
            <PortalStatCard label="Concluidas" value={stats.completed} icon={IconCheck} color="#22c55e" />
            <PortalStatCard label="Em Andamento" value={stats.inProgress} icon={IconClock} color="#3b82f6" />
            <PortalStatCard label="Atrasadas" value={stats.overdue} icon={IconClock} color="#ef4444" />
          </div>
        </CardContent>
      </Card>

      {/* Latest status update */}
      {latestUpdate && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <IconSpeakerphone className="size-4" />
              Ultimo Update
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <Badge
                variant="outline"
                style={{
                  borderColor: PROJECT_HEALTH[latestUpdate.health as ProjectHealthKey]?.color,
                  color: PROJECT_HEALTH[latestUpdate.health as ProjectHealthKey]?.color,
                  backgroundColor: PROJECT_HEALTH[latestUpdate.health as ProjectHealthKey]?.bg,
                }}
              >
                {PROJECT_HEALTH[latestUpdate.health as ProjectHealthKey]?.label}
              </Badge>
              <div className="min-w-0 flex-1">
                <p className="text-sm">{latestUpdate.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(latestUpdate.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Deliverables */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Entregas
        </h3>
        {visibleTasks.length === 0 ? (
          <EmptyState
            title="Nenhuma entrega visivel"
            description="Tarefas em andamento, revisao ou concluidas aparecerao aqui."
            compact
          />
        ) : (
          <div className="space-y-1.5">
            {visibleTasks.map((task) => (
              <PortalEnhancedTaskRow
                key={task.id}
                task={task}
                canRequestApproval={isInternal}
                onRequestApproval={handleRequestApproval}
                isRequesting={requestApproval.isPending}
              />
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="comments">
        <TabsList className="w-full">
          <TabsTrigger value="comments" className="flex-1 gap-1.5">
            <IconMessageCircle className="size-4" />
            Comentarios
          </TabsTrigger>
          <TabsTrigger value="files" className="flex-1 gap-1.5">
            <IconUpload className="size-4" />
            Arquivos
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex-1 gap-1.5">
            <IconTimeline className="size-4" />
            Aprovacoes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="pt-4">
          <PortalCommentsSection
            projectId={projectId}
            tenantId={tenantId}
            isInternal={isInternal}
            authorName={clientName ?? undefined}
            authorEmail={clientEmail ?? undefined}
          />
        </TabsContent>

        <TabsContent value="files" className="pt-4">
          <PortalFileUpload
            projectId={projectId}
            tenantId={tenantId}
            uploaderName={clientName ?? user?.user_metadata?.name ?? undefined}
            uploaderEmail={clientEmail ?? user?.email ?? undefined}
          />
        </TabsContent>

        <TabsContent value="approvals" className="pt-4">
          <PortalApprovalTimeline
            projectId={projectId}
            canRespond={isInternal}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

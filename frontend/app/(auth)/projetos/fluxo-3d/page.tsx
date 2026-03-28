"use client";

import { useState, useMemo } from "react";
import {
  IconCube,
  IconPlus,
  IconShare,
  IconShareOff,
  IconCopy,
  IconCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ErrorState, EmptyState } from "@/components/shared";
import { useToast } from "@/hooks/use-toast";
import {
  D3DPipelineBoard,
  D3DTimelineBar,
  D3D_STATUS_DISPLAY,
  useD3DFlows,
  useCreateD3DFlow,
  useUpdateStageStatus,
  useToggleD3DShare,
} from "@/features/projects/d3d-pipeline";
import { RequireRole } from "@/features/auth/components/require-role";

export default function ProjetosFluxo3DPage() {
  const { toast } = useToast();
  const { data: pipelines, isLoading, error, refetch } = useD3DFlows();
  const createFlow = useCreateD3DFlow();
  const updateStatus = useUpdateStageStatus();
  const toggleShare = useToggleD3DShare();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Filter only D3D projects
  const d3dPipelines = useMemo(
    () => (pipelines ?? []).filter((p) => p.project?.bu === "Digital 3D" || !p.project?.bu),
    [pipelines]
  );

  const activePipeline = selectedProjectId
    ? d3dPipelines.find((p) => p.flow.project_id === selectedProjectId)
    : d3dPipelines[0];

  // Computed stats
  const stats = useMemo(() => {
    if (!activePipeline) return null;
    const stages = activePipeline.stages;
    const phases = stages.filter((s) => s.stage_type === "phase");
    const completed = phases.filter((s) => s.status === "completed" || s.status === "approved");
    const gates = stages.filter((s) => s.stage_type === "gate");
    const approvedGates = gates.filter((s) => s.status === "approved");
    return {
      totalPhases: phases.length,
      completedPhases: completed.length,
      totalGates: gates.length,
      approvedGates: approvedGates.length,
      progress: phases.length > 0 ? Math.round((completed.length / phases.length) * 100) : 0,
    };
  }, [activePipeline]);

  const handleStatusChange = (stageId: string, status: string) => {
    updateStatus.mutate(
      { stageId, status },
      {
        onSuccess: () => toast({ title: "Status atualizado" }),
        onError: () => toast({ title: "Erro ao atualizar", variant: "destructive" }),
      }
    );
  };

  const handleApproveGate = (stageId: string) => {
    updateStatus.mutate(
      { stageId, status: "approved" },
      {
        onSuccess: () => toast({ title: "Gate aprovado" }),
      }
    );
  };

  const handleRequestChanges = (stageId: string) => {
    updateStatus.mutate(
      { stageId, status: "changes_requested" },
      {
        onSuccess: () => toast({ title: "Revisão solicitada" }),
      }
    );
  };

  const handleToggleShare = () => {
    if (!activePipeline) return;
    const isCurrentlyShared = activePipeline.flow.share_enabled;
    toggleShare.mutate(
      { flowId: activePipeline.flow.id, enabled: !isCurrentlyShared },
      {
        onSuccess: (token) => {
          toast({
            title: isCurrentlyShared ? "Link desativado" : "Link ativado para o cliente",
          });
        },
      }
    );
  };

  const handleCopyShareLink = () => {
    if (!activePipeline?.flow.share_token) return;
    const url = `${window.location.origin}/portal-cliente/${activePipeline.flow.share_token}/fluxo`;
    navigator.clipboard.writeText(url);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
    toast({ title: "Link copiado!" });
  };

  if (error) {
    return <ErrorState message="Erro ao carregar pipelines D3D" onRetry={() => refetch()} />;
  }

  return (
    <RequireRole module="projetos">
    <div className="flex h-full min-h-0 flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <IconCube className="h-5 w-5 text-purple-600" />
            <h1 className="text-2xl font-bold tracking-tight">Fluxo 3D</h1>
            <Badge variant="secondary" className="bg-purple-50 text-purple-600">
              Digital 3D
            </Badge>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Pipeline de produção de imagens 3D — do briefing à entrega final.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Project selector */}
          {d3dPipelines.length > 1 && (
            <Select
              value={selectedProjectId ?? d3dPipelines[0]?.flow.project_id}
              onValueChange={setSelectedProjectId}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Selecionar projeto" />
              </SelectTrigger>
              <SelectContent>
                {d3dPipelines.map((p) => (
                  <SelectItem key={p.flow.project_id} value={p.flow.project_id}>
                    {p.project?.name ?? "Projeto sem nome"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Share toggle */}
          {activePipeline && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleShare}
                className={activePipeline.flow.share_enabled ? "border-emerald-200 text-emerald-600" : ""}
              >
                {activePipeline.flow.share_enabled ? (
                  <IconShare className="mr-1.5 h-4 w-4" />
                ) : (
                  <IconShareOff className="mr-1.5 h-4 w-4" />
                )}
                {activePipeline.flow.share_enabled ? "Compartilhado" : "Compartilhar"}
              </Button>
              {activePipeline.flow.share_enabled && activePipeline.flow.share_token && (
                <Button variant="ghost" size="sm" onClick={handleCopyShareLink}>
                  {copiedToken ? (
                    <IconCheck className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <IconCopy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          )}

          <Button onClick={() => setShowCreateDialog(true)}>
            <IconPlus className="mr-1.5 h-4 w-4" />
            Novo Fluxo
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      {stats && activePipeline && (
        <div className="flex items-center gap-6 rounded-lg border bg-white px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Projeto:</span>
            <span className="text-sm font-medium">{activePipeline.project?.name ?? "—"}</span>
          </div>
          <div className="h-4 w-px bg-zinc-200" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Progresso:</span>
            <span className="text-sm font-medium text-orange-600">{stats.progress}%</span>
          </div>
          <div className="h-4 w-px bg-zinc-200" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Fases:</span>
            <span className="text-sm font-medium">
              {stats.completedPhases}/{stats.totalPhases}
            </span>
          </div>
          <div className="h-4 w-px bg-zinc-200" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Aprovações:</span>
            <span className="text-sm font-medium">
              {stats.approvedGates}/{stats.totalGates}
            </span>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-20 rounded-xl" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[420px] w-[268px] flex-shrink-0 rounded-2xl" />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && d3dPipelines.length === 0 && (
        <EmptyState
          icon={IconCube}
          title="Nenhum fluxo D3D criado"
          description="Crie um fluxo de produção 3D para acompanhar o pipeline de um projeto Digital 3D."
        />
      )}

      {/* Pipeline content */}
      {!isLoading && activePipeline && (
        <>
          {/* Global timeline */}
          <D3DTimelineBar stages={activePipeline.stages} />

          {/* Scroll hint */}
          <p className="text-[11px] tracking-wider text-zinc-400 lg:hidden">
            ← scroll horizontal para navegar →
          </p>

          {/* Pipeline board */}
          <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden pb-4">
            <D3DPipelineBoard
              stages={activePipeline.stages}
              onStatusChange={handleStatusChange}
              onApproveGate={handleApproveGate}
              onRequestChangesGate={handleRequestChanges}
            />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 pb-2">
            {[
              { color: "#E85102", label: "Kickoff / Input" },
              { color: "#3B82F6", label: "Referência" },
              { color: "#FD8241", label: "Produção TBO" },
              { color: "#F59E0B", label: "Entrega + Aprovação" },
              { color: "#10B981", label: "Aprovação Final" },
              { color: "#18181B", label: "Entrega Final" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs text-zinc-400">
                <div className="h-2.5 w-2.5 rounded" style={{ backgroundColor: item.color }} />
                {item.label}
              </div>
            ))}
          </div>

          {/* Footnote */}
          <div className="mx-auto max-w-3xl pb-8 text-center text-xs leading-relaxed text-zinc-400">
            <strong className="font-medium text-zinc-500">Observações</strong>
            <br />
            Cada entrega ao cliente requer aprovação formal por e-mail ou registro em ata.
            Rodadas durante o processo são entregues em JPG 72dpi via Google Drive.
            A entrega final inclui versões HQ (TIFF/PNG 300dpi) e web (JPG 72dpi).
            Rodadas adicionais além da R02 são escopo extra e requerem aditivo contratual.
          </div>
        </>
      )}

      {/* Create dialog (placeholder — connects to project selector) */}
      <CreateFlowDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={(projectId) => {
          createFlow.mutate(projectId, {
            onSuccess: () => {
              setShowCreateDialog(false);
              toast({ title: "Fluxo D3D criado com sucesso" });
            },
            onError: () => {
              toast({ title: "Erro ao criar fluxo", variant: "destructive" });
            },
          });
        }}
        isCreating={createFlow.isPending}
      />
    </div>
    </RequireRole>
  );
}

// ── Create Flow Dialog ───────────────────────────────────────────────

function CreateFlowDialog({
  open,
  onClose,
  onCreate,
  isCreating,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (projectId: string) => void;
  isCreating: boolean;
}) {
  const [projectId, setProjectId] = useState("");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Fluxo D3D</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-zinc-500">
            Selecione o projeto Digital 3D para criar o pipeline de produção.
          </p>
          <input
            type="text"
            placeholder="ID do projeto (cole o UUID)"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => onCreate(projectId)}
            disabled={!projectId.trim() || isCreating}
          >
            Criar Fluxo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

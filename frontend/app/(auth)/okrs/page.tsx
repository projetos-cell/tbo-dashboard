"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Target,
  Settings2,
  Trash2,
  Pencil,
  MessageSquare,
  History,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  User,
  BarChart3,
  MessageSquarePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RequireRole } from "@/components/auth/require-role";
import { OkrCycleSelector } from "@/components/okrs/okr-cycle-selector";
import { OkrKpis } from "@/components/okrs/okr-kpis";
import { OkrFilters } from "@/components/okrs/okr-filters";
import { OkrObjectiveDialog } from "@/components/okrs/okr-objective-dialog";
import { OkrKeyResultDialog } from "@/components/okrs/okr-key-result-dialog";
import { OkrCycleDialog } from "@/components/okrs/okr-cycle-dialog";
import { OkrCheckinDialog } from "@/components/okrs/okr-checkin-dialog";
import { OkrComments } from "@/components/okrs/okr-comments";
import { OkrCheckinHistory } from "@/components/okrs/okr-checkin-history";
import {
  useCycles,
  useActiveCycle,
  useObjectives,
  useKeyResults,
  useDeleteObjective,
  useDeleteKeyResult,
} from "@/hooks/use-okrs";
import { useAuthStore } from "@/stores/auth-store";
import { computeOkrKPIs } from "@/services/okrs";
import { useToast } from "@/hooks/use-toast";
import { OKR_STATUS, OKR_LEVELS } from "@/lib/constants";
import type { OkrStatusKey, OkrLevelKey } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type ObjectiveRow = Database["public"]["Tables"]["okr_objectives"]["Row"];
type KeyResultRow = Database["public"]["Tables"]["okr_key_results"]["Row"];
type CycleRow = Database["public"]["Tables"]["okr_cycles"]["Row"];

// ── Key Result Row ────────────────────────────────────────────────────

function KeyResultItem({
  kr,
  onCheckin,
  onEdit,
  onDelete,
  onHistory,
}: {
  kr: KeyResultRow;
  onCheckin: (kr: KeyResultRow) => void;
  onEdit: (kr: KeyResultRow) => void;
  onDelete: (kr: KeyResultRow) => void;
  onHistory: (kr: KeyResultRow) => void;
}) {
  const start = kr.start_value ?? 0;
  const target = kr.target_value ?? 100;
  const current = kr.current_value ?? start;
  const range = target - start;
  const pct = range > 0 ? Math.min(((current - start) / range) * 100, 100) : 0;
  const statusCfg =
    OKR_STATUS[(kr.status as OkrStatusKey) ?? "on_track"] ?? OKR_STATUS.on_track;

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background p-3">
      <BarChart3 className="h-4 w-4 text-muted-foreground shrink-0" />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{kr.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <Progress value={pct} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {current}
            {kr.unit ? ` ${kr.unit}` : ""} / {target}
            {kr.unit ? ` ${kr.unit}` : ""}
          </span>
        </div>
      </div>

      <Badge
        variant="outline"
        className="text-xs shrink-0"
        style={{ borderColor: statusCfg.color, color: statusCfg.color }}
      >
        {statusCfg.label}
      </Badge>

      <span className="text-xs font-medium w-[36px] text-right shrink-0">
        {Math.round(pct)}%
      </span>

      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 shrink-0"
        onClick={() => onCheckin(kr)}
        aria-label="Novo check-in"
      >
        <MessageSquarePlus className="h-3.5 w-3.5" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 shrink-0"
            aria-label="Mais ações"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(kr)}>
            <Pencil className="h-3.5 w-3.5 mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onHistory(kr)}>
            <History className="h-3.5 w-3.5 mr-2" />
            Histórico
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => onDelete(kr)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ── Key Results List ──────────────────────────────────────────────────

function OkrKeyResultList({
  objectiveId,
  onCheckin,
  onEditKr,
  onDeleteKr,
  onHistoryKr,
  onAddKr,
}: {
  objectiveId: string;
  onCheckin: (kr: KeyResultRow) => void;
  onEditKr: (kr: KeyResultRow) => void;
  onDeleteKr: (kr: KeyResultRow) => void;
  onHistoryKr: (kr: KeyResultRow) => void;
  onAddKr: (objectiveId: string) => void;
}) {
  const { data: keyResults, isLoading } = useKeyResults(objectiveId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {keyResults && keyResults.length > 0 ? (
        keyResults.map((kr) => (
          <KeyResultItem
            key={kr.id}
            kr={kr}
            onCheckin={onCheckin}
            onEdit={onEditKr}
            onDelete={onDeleteKr}
            onHistory={onHistoryKr}
          />
        ))
      ) : (
        <p className="text-xs text-muted-foreground py-2">
          Nenhum key result cadastrado.
        </p>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-xs"
        onClick={() => onAddKr(objectiveId)}
      >
        <Plus className="h-3.5 w-3.5 mr-1" />
        Adicionar Key Result
      </Button>
    </div>
  );
}

// ── Objective Card ────────────────────────────────────────────────────

function ObjectiveCard({
  objective,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onAddKr,
  showComments,
  onToggleComments,
  children,
}: {
  objective: ObjectiveRow;
  expanded: boolean;
  onToggle: () => void;
  onEdit: (obj: ObjectiveRow) => void;
  onDelete: (obj: ObjectiveRow) => void;
  onAddKr: (objectiveId: string) => void;
  showComments: boolean;
  onToggleComments: () => void;
  children?: React.ReactNode;
}) {
  const statusCfg =
    OKR_STATUS[(objective.status as OkrStatusKey) ?? "on_track"] ??
    OKR_STATUS.on_track;
  const levelCfg =
    OKR_LEVELS[(objective.level as OkrLevelKey) ?? "squad"] ??
    OKR_LEVELS.squad;
  const progress = objective.progress ?? 0;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header row */}
        <div className="flex items-center gap-3 p-4">
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center gap-3 flex-1 min-w-0 text-left hover:bg-muted/40 -m-1 p-1 rounded transition-colors"
            aria-label={expanded ? "Recolher objetivo" : "Expandir objetivo"}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className="text-xs px-1.5"
                  style={{ borderColor: levelCfg.color, color: levelCfg.color }}
                >
                  {levelCfg.label}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs px-1.5"
                  style={{
                    borderColor: statusCfg.color,
                    color: statusCfg.color,
                  }}
                >
                  {statusCfg.label}
                </Badge>
              </div>
              <p className="text-sm font-medium truncate">{objective.title}</p>
              {objective.description && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {objective.description}
                </p>
              )}
            </div>
          </button>

          <div className="flex items-center gap-3 shrink-0">
            {objective.owner_id && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
              </div>
            )}
            <div className="flex items-center gap-2 min-w-[120px]">
              <Progress value={progress} className="h-2 flex-1" />
              <span className="text-xs font-medium w-[36px] text-right">
                {Math.round(progress)}%
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  aria-label="Ações do objetivo"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(objective)}>
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddKr(objective.id)}>
                  <Plus className="h-3.5 w-3.5 mr-2" />
                  Adicionar Key Result
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleComments}>
                  <MessageSquare className="h-3.5 w-3.5 mr-2" />
                  Comentários
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(objective)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Expanded: KRs */}
        {expanded && children && (
          <div className="border-t px-4 py-3 space-y-2 bg-muted/20">
            {children}
          </div>
        )}

        {/* Comments section */}
        {showComments && (
          <div className="border-t px-4 py-3 bg-muted/10">
            <OkrComments objectiveId={objective.id} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Content ──────────────────────────────────────────────────────

function OkrsContent() {
  const { toast } = useToast();
  const userId = useAuthStore((s) => s.user?.id);
  const { data: cycles, isLoading: loadingCycles } = useCycles();
  const { data: activeCycle } = useActiveCycle();
  const deleteObjective = useDeleteObjective();
  const deleteKeyResult = useDeleteKeyResult();

  // State
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [commentIds, setCommentIds] = useState<Set<string>>(new Set());
  const [viewTab, setViewTab] = useState("all");

  // Dialogs
  const [objDialog, setObjDialog] = useState<{
    open: boolean;
    objective?: ObjectiveRow | null;
  }>({ open: false });
  const [krDialog, setKrDialog] = useState<{
    open: boolean;
    objectiveId: string;
    keyResult?: KeyResultRow | null;
  }>({ open: false, objectiveId: "" });
  const [cycleDialog, setCycleDialog] = useState<{
    open: boolean;
    cycle?: CycleRow | null;
  }>({ open: false });
  const [checkinKr, setCheckinKr] = useState<KeyResultRow | null>(null);
  const [historyKrId, setHistoryKrId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "objective" | "kr";
    id: string;
    title: string;
  } | null>(null);

  const effectiveCycleId = selectedCycleId ?? activeCycle?.id ?? null;

  // Filters for "Meus OKRs" tab
  const ownerFilter = viewTab === "mine" ? userId : undefined;

  const { data: objectives, isLoading: loadingObjs } = useObjectives({
    cycleId: effectiveCycleId ?? undefined,
    status: statusFilter || undefined,
    level: levelFilter || undefined,
    ownerId: ownerFilter ?? undefined,
  });

  const filtered = useMemo(() => {
    if (!objectives) return [];
    if (!search) return objectives;
    const q = search.toLowerCase();
    return objectives.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        (o.description ?? "").toLowerCase().includes(q),
    );
  }, [objectives, search]);

  const kpis = useMemo(() => computeOkrKPIs(filtered), [filtered]);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleComments(id: string) {
    setCommentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "objective") {
        await deleteObjective.mutateAsync(deleteTarget.id);
      } else {
        await deleteKeyResult.mutateAsync(deleteTarget.id);
      }
      toast({
        title:
          deleteTarget.type === "objective"
            ? "Objetivo excluído"
            : "Key Result excluído",
      });
    } catch {
      toast({
        title: "Erro ao excluir",
        variant: "destructive",
      });
    }
    setDeleteTarget(null);
  }

  // Loading state
  if (loadingCycles) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-6 w-6" />
            OKRs
          </h1>
          <p className="text-muted-foreground text-sm">
            Objetivos e resultados-chave
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <OkrCycleSelector
            cycles={cycles ?? []}
            selectedId={effectiveCycleId}
            onSelect={setSelectedCycleId}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Gerenciar ciclos"
              >
                <Settings2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => setCycleDialog({ open: true })}
              >
                <Plus className="h-3.5 w-3.5 mr-2" />
                Novo Ciclo
              </DropdownMenuItem>
              {cycles && cycles.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  {cycles.map((c) => (
                    <DropdownMenuItem
                      key={c.id}
                      onClick={() =>
                        setCycleDialog({ open: true, cycle: c })
                      }
                    >
                      <Pencil className="h-3.5 w-3.5 mr-2" />
                      {c.name}
                      {c.is_active && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Ativo
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setObjDialog({ open: true })}>
            <Plus className="h-4 w-4 mr-1" />
            Novo Objetivo
          </Button>
        </div>
      </div>

      {/* View tabs */}
      <Tabs value={viewTab} onValueChange={setViewTab}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="mine">Meus OKRs</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* KPIs */}
      <OkrKpis data={kpis} />

      {/* Filters */}
      <OkrFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        levelFilter={levelFilter}
        onLevelChange={setLevelFilter}
      />

      {/* Objectives list */}
      {loadingObjs ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Target className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground mb-4">
            {!effectiveCycleId
              ? "Selecione ou crie um ciclo para começar."
              : viewTab === "mine"
                ? "Você não possui objetivos neste ciclo."
                : "Nenhum objetivo encontrado neste ciclo."}
          </p>
          <Button
            variant="outline"
            onClick={() => setObjDialog({ open: true })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Criar Objetivo
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((obj) => (
            <ObjectiveCard
              key={obj.id}
              objective={obj}
              expanded={expandedIds.has(obj.id)}
              onToggle={() => toggleExpand(obj.id)}
              onEdit={(o) => setObjDialog({ open: true, objective: o })}
              onDelete={(o) =>
                setDeleteTarget({
                  type: "objective",
                  id: o.id,
                  title: o.title,
                })
              }
              onAddKr={(objId) =>
                setKrDialog({ open: true, objectiveId: objId })
              }
              showComments={commentIds.has(obj.id)}
              onToggleComments={() => toggleComments(obj.id)}
            >
              <OkrKeyResultList
                objectiveId={obj.id}
                onCheckin={setCheckinKr}
                onEditKr={(kr) =>
                  setKrDialog({
                    open: true,
                    objectiveId: obj.id,
                    keyResult: kr,
                  })
                }
                onDeleteKr={(kr) =>
                  setDeleteTarget({
                    type: "kr",
                    id: kr.id,
                    title: kr.title,
                  })
                }
                onHistoryKr={(kr) => setHistoryKrId(kr.id)}
                onAddKr={(objId) =>
                  setKrDialog({ open: true, objectiveId: objId })
                }
              />
            </ObjectiveCard>
          ))}
        </div>
      )}

      {/* ── Dialogs ──────────────────────────────────────── */}

      {/* Objective create/edit */}
      <OkrObjectiveDialog
        open={objDialog.open}
        onClose={() => setObjDialog({ open: false })}
        objective={objDialog.objective ?? null}
        cycleId={effectiveCycleId}
      />

      {/* Key Result create/edit */}
      <OkrKeyResultDialog
        open={krDialog.open}
        onClose={() => setKrDialog({ open: false, objectiveId: "" })}
        objectiveId={krDialog.objectiveId}
        keyResult={krDialog.keyResult ?? null}
      />

      {/* Cycle create/edit */}
      <OkrCycleDialog
        open={cycleDialog.open}
        onClose={() => setCycleDialog({ open: false })}
        cycle={cycleDialog.cycle ?? null}
      />

      {/* Check-in dialog */}
      <OkrCheckinDialog
        kr={checkinKr}
        open={!!checkinKr}
        onClose={() => setCheckinKr(null)}
      />

      {/* Check-in history dialog */}
      {historyKrId && (
        <Dialog
          open={!!historyKrId}
          onOpenChange={(v) => {
            if (!v) setHistoryKrId(null);
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Histórico de Check-ins</DialogTitle>
            </DialogHeader>
            <OkrCheckinHistory keyResultId={historyKrId} />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === "objective"
                ? `O objetivo "${deleteTarget?.title}" e todos os seus key results serão arquivados.`
                : `O key result "${deleteTarget?.title}" será arquivado.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Dialog import (for history) ───────────────────────────────────────
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function OkrsPage() {
  return (
    <RequireRole allowed={["admin", "po", "member", "founder"]}>
      <OkrsContent />
    </RequireRole>
  );
}

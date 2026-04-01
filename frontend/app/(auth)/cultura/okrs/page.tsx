"use client";

import { useState, useMemo } from "react";
import {
  IconTarget,
  IconAdjustments,
  IconPlus,
  IconPencil,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RequireRole } from "@/features/auth/components/require-role";
import { ErrorState } from "@/components/shared";
import { OkrCycleSelector } from "@/features/okrs/components/okr-cycle-selector";
import { OkrKpis } from "@/features/okrs/components/okr-kpis";
import { OkrFilters } from "@/features/okrs/components/okr-filters";
import { OkrObjectiveDialog } from "@/features/okrs/components/okr-objective-dialog";
import { OkrKeyResultDialog } from "@/features/okrs/components/okr-key-result-dialog";
import { OkrCycleDialog } from "@/features/okrs/components/okr-cycle-dialog";
import { OkrCheckinDialog } from "@/features/okrs/components/okr-checkin-dialog";
import { OkrCheckinHistory } from "@/features/okrs/components/okr-checkin-history";
import { OkrObjectiveCard } from "@/features/okrs/components/okr-objective-card";
import { OkrKeyResultList } from "@/features/okrs/components/okr-key-result-item";
import {
  useCycles,
  useActiveCycle,
  useObjectives,
  useDeleteObjective,
  useDeleteKeyResult,
} from "@/features/okrs/hooks/use-okrs";
import { useAuthStore } from "@/stores/auth-store";
import { computeOkrKPIs } from "@/features/okrs/services/okrs";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/types";

type ObjectiveRow = Database["public"]["Tables"]["okr_objectives"]["Row"];
type KeyResultRow = Database["public"]["Tables"]["okr_key_results"]["Row"];
type CycleRow = Database["public"]["Tables"]["okr_cycles"]["Row"];

// ── Main Content ──────────────────────────────────────────────────────

function OkrsContent() {
  const { toast } = useToast();
  const userId = useAuthStore((s) => s.user?.id);
  const { data: cycles, isLoading: loadingCycles, error: cyclesError, refetch: refetchCycles } = useCycles();
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
  const [objDialog, setObjDialog] = useState<{ open: boolean; objective?: ObjectiveRow | null }>({ open: false });
  const [krDialog, setKrDialog] = useState<{ open: boolean; objectiveId: string; keyResult?: KeyResultRow | null }>({ open: false, objectiveId: "" });
  const [cycleDialog, setCycleDialog] = useState<{ open: boolean; cycle?: CycleRow | null }>({ open: false });
  const [checkinKr, setCheckinKr] = useState<KeyResultRow | null>(null);
  const [historyKrId, setHistoryKrId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "objective" | "kr"; id: string; title: string } | null>(null);

  const effectiveCycleId = selectedCycleId ?? activeCycle?.id ?? null;
  const ownerFilter = viewTab === "mine" ? userId : undefined;

  const { data: objectives, isLoading: loadingObjs, error: objsError, refetch: refetchObjs } = useObjectives({
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
      (o) => o.title.toLowerCase().includes(q) || (o.description ?? "").toLowerCase().includes(q),
    );
  }, [objectives, search]);

  const kpis = useMemo(() => computeOkrKPIs(filtered), [filtered]);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleComments(id: string) {
    setCommentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
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
      toast({ title: deleteTarget.type === "objective" ? "Objetivo excluído" : "Key Result excluído" });
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
    setDeleteTarget(null);
  }

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

  if (cyclesError) {
    return <ErrorState message={cyclesError.message} onRetry={() => refetchCycles()} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <IconTarget className="h-6 w-6" />
            OKRs
          </h1>
          <p className="text-gray-500 text-sm">Objetivos e resultados-chave</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <OkrCycleSelector
            cycles={cycles ?? []}
            selectedId={effectiveCycleId}
            onSelect={setSelectedCycleId}
            onCreateCycle={() => setCycleDialog({ open: true })}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Gerenciar ciclos">
                <IconAdjustments className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setCycleDialog({ open: true })}>
                <IconPlus className="h-3.5 w-3.5 mr-2" />
                Novo Ciclo
              </DropdownMenuItem>
              {cycles && cycles.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  {cycles.map((c) => (
                    <DropdownMenuItem
                      key={c.id}
                      onClick={() => setCycleDialog({ open: true, cycle: c })}
                    >
                      <IconPencil className="h-3.5 w-3.5 mr-2" />
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
            <IconPlus className="h-4 w-4 mr-1" />
            Novo Objetivo
          </Button>
        </div>
      </div>

      {/* Onboarding: no cycles */}
      {cycles && cycles.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-tbo-orange/10 p-4 mb-4">
              <IconTarget className="h-10 w-10 text-tbo-orange" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Comece definindo seus ciclos de OKR</h2>
            <p className="text-gray-500 text-sm max-w-md mb-6">
              Ciclos organizam seus objetivos por trimestre, semestre ou qualquer período que faça
              sentido para sua equipe. Crie o primeiro ciclo para começar a acompanhar seus OKRs.
            </p>
            <Button onClick={() => setCycleDialog({ open: true })}>
              <IconPlus className="h-4 w-4 mr-1" />
              Criar Ciclo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Tabs value={viewTab} onValueChange={setViewTab}>
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="mine">Meus OKRs</TabsTrigger>
            </TabsList>
          </Tabs>

          <OkrKpis data={kpis} />

          <OkrFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            levelFilter={levelFilter}
            onLevelChange={setLevelFilter}
          />

          {loadingObjs ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : objsError ? (
            <ErrorState message={objsError.message} onRetry={() => refetchObjs()} />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <IconTarget className="h-12 w-12 text-gray-500/40 mb-3" />
              <p className="text-gray-500 mb-4">
                {viewTab === "mine"
                  ? "Você não possui objetivos neste ciclo."
                  : "Nenhum objetivo encontrado neste ciclo."}
              </p>
              <Button variant="outline" onClick={() => setObjDialog({ open: true })}>
                <IconPlus className="h-4 w-4 mr-1" />
                Criar Objetivo
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((obj) => (
                <OkrObjectiveCard
                  key={obj.id}
                  objective={obj}
                  expanded={expandedIds.has(obj.id)}
                  onToggle={() => toggleExpand(obj.id)}
                  onEdit={(o) => setObjDialog({ open: true, objective: o })}
                  onDelete={(o) => setDeleteTarget({ type: "objective", id: o.id, title: o.title })}
                  onAddKr={(objId) => setKrDialog({ open: true, objectiveId: objId })}
                  showComments={commentIds.has(obj.id)}
                  onToggleComments={() => toggleComments(obj.id)}
                >
                  <OkrKeyResultList
                    objectiveId={obj.id}
                    onCheckin={setCheckinKr}
                    onEditKr={(kr) => setKrDialog({ open: true, objectiveId: obj.id, keyResult: kr })}
                    onDeleteKr={(kr) => setDeleteTarget({ type: "kr", id: kr.id, title: kr.title })}
                    onHistoryKr={(kr) => setHistoryKrId(kr.id)}
                    onAddKr={(objId) => setKrDialog({ open: true, objectiveId: objId })}
                  />
                </OkrObjectiveCard>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Dialogs ─────────────────────────────────────── */}

      <OkrObjectiveDialog
        open={objDialog.open}
        onClose={() => setObjDialog({ open: false })}
        objective={objDialog.objective ?? null}
        cycleId={effectiveCycleId}
      />

      <OkrKeyResultDialog
        open={krDialog.open}
        onClose={() => setKrDialog({ open: false, objectiveId: "" })}
        objectiveId={krDialog.objectiveId}
        keyResult={krDialog.keyResult ?? null}
      />

      <OkrCycleDialog
        open={cycleDialog.open}
        onClose={() => setCycleDialog({ open: false })}
        cycle={cycleDialog.cycle ?? null}
      />

      <OkrCheckinDialog
        kr={checkinKr}
        open={!!checkinKr}
        onClose={() => setCheckinKr(null)}
      />

      {historyKrId && (
        <Dialog open={!!historyKrId} onOpenChange={(v) => { if (!v) setHistoryKrId(null); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Histórico de Check-ins</DialogTitle>
            </DialogHeader>
            <OkrCheckinHistory keyResultId={historyKrId} />
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
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
              className="bg-red-500 text-white hover:bg-red-500/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export default function OkrsPage() {
  return (
    <RequireRole minRole="colaborador">
      <OkrsContent />
    </RequireRole>
  );
}

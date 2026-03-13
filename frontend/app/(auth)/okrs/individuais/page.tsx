"use client";

import { useState, useMemo } from "react";
import {
  IconUser,
  IconPlus,
  IconTarget,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { RequireRole } from "@/features/auth/components/require-role";
import { ErrorState } from "@/components/shared";
import { OkrCycleSelector } from "@/features/okrs/components/okr-cycle-selector";
import { OkrKpis } from "@/features/okrs/components/okr-kpis";
import { OkrObjectiveDialog } from "@/features/okrs/components/okr-objective-dialog";
import { OkrKeyResultDialog } from "@/features/okrs/components/okr-key-result-dialog";
import { OkrCycleDialog } from "@/features/okrs/components/okr-cycle-dialog";
import { OkrCheckinDialog } from "@/features/okrs/components/okr-checkin-dialog";
import { OkrObjectiveCard } from "@/features/okrs/components/okr-objective-card";
import { OkrKeyResultList } from "@/features/okrs/components/okr-key-result-item";
import {
  useCycles,
  useActiveCycle,
  useObjectives,
  useDeleteObjective,
  useDeleteKeyResult,
} from "@/features/okrs/hooks/use-okrs";
import { computeOkrKPIs } from "@/features/okrs/services/okrs";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/types";

type ObjectiveRow = Database["public"]["Tables"]["okr_objectives"]["Row"];
type KeyResultRow = Database["public"]["Tables"]["okr_key_results"]["Row"];
type CycleRow = Database["public"]["Tables"]["okr_cycles"]["Row"];

function IndividualOKRsContent() {
  const { toast } = useToast();
  const userId = useAuthStore((s) => s.user?.id);
  const { data: cycles, isLoading: loadingCycles, error: cyclesError, refetch } = useCycles();
  const { data: activeCycle } = useActiveCycle();
  const deleteObjective = useDeleteObjective();
  const deleteKeyResult = useDeleteKeyResult();

  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [commentIds, setCommentIds] = useState<Set<string>>(new Set());
  const [objDialog, setObjDialog] = useState<{ open: boolean; objective?: ObjectiveRow | null }>({ open: false });
  const [krDialog, setKrDialog] = useState<{ open: boolean; objectiveId: string; keyResult?: KeyResultRow | null }>({ open: false, objectiveId: "" });
  const [cycleDialog, setCycleDialog] = useState<{ open: boolean; cycle?: CycleRow | null }>({ open: false });
  const [checkinKr, setCheckinKr] = useState<KeyResultRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "objective" | "kr"; id: string; title: string } | null>(null);

  const effectiveCycleId = selectedCycleId ?? activeCycle?.id ?? null;

  const { data: objectives, isLoading: loadingObjs, error: objsError, refetch: refetchObjs } = useObjectives({
    cycleId: effectiveCycleId ?? undefined,
    level: "individual",
    ownerId: userId,
  });

  const kpis = useMemo(() => computeOkrKPIs(objectives ?? []), [objectives]);

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
    return <ErrorState message={cyclesError.message} onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <IconUser className="h-6 w-6" />
            OKRs Individuais
          </h1>
          <p className="text-gray-500 text-sm">Seus objetivos e resultados-chave pessoais</p>
        </div>
        <div className="flex items-center gap-2">
          <OkrCycleSelector
            cycles={cycles ?? []}
            selectedId={effectiveCycleId}
            onSelect={setSelectedCycleId}
            onCreateCycle={() => setCycleDialog({ open: true })}
          />
          <Button onClick={() => setObjDialog({ open: true })}>
            <IconPlus className="h-4 w-4 mr-1" />
            Novo Objetivo
          </Button>
        </div>
      </div>

      <OkrKpis data={kpis} />

      {loadingObjs ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : objsError ? (
        <ErrorState message={objsError.message} onRetry={() => refetchObjs()} />
      ) : (objectives ?? []).length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <IconTarget className="h-12 w-12 text-gray-500/40 mb-3" />
            <p className="text-gray-500 mb-4">Você não possui objetivos individuais neste ciclo.</p>
            <Button variant="outline" onClick={() => setObjDialog({ open: true })}>
              <IconPlus className="h-4 w-4 mr-1" />
              Criar Objetivo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(objectives ?? []).map((obj) => (
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
                onHistoryKr={() => {}}
                onAddKr={(objId) => setKrDialog({ open: true, objectiveId: objId })}
              />
            </OkrObjectiveCard>
          ))}
        </div>
      )}

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

export default function IndividualOKRsPage() {
  return (
    <RequireRole minRole="colaborador">
      <IndividualOKRsContent />
    </RequireRole>
  );
}

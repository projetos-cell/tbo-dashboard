"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ConfirmDialog } from "@/components/shared";
import { PdiActionsInline } from "./pdi-actions-inline";
import { PdiGoalForm } from "./pdi-goal-form";
import { usePdiGoals, useCreatePdiGoal, useDeletePdiGoal, useUpdatePdi, useDeletePdi, usePersonSkills } from "@/features/pdi/hooks/use-pdi";
import { useProfiles } from "@/features/people/hooks/use-people";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import {
  PDI_STATUS,
  PDI_STATUS_KEYS,
  GOAL_STATUS,
  GOAL_STATUS_KEYS,
  getPdiStatusBadgeProps,
  getGoalStatusBadgeProps,
  formatDate,
} from "@/features/pdi/utils/pdi-utils";
import { computePdiProgress } from "@/features/pdi/services/pdi";
import type { PdiRow, PdiGoalWithActions } from "@/features/pdi/services/pdi";
import {
  Target,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  User,
  CalendarDays,
  Pencil,
} from "lucide-react";

interface PdiDetailProps {
  pdi: PdiRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (pdi: PdiRow) => void;
}

export function PdiDetail({ pdi, open, onOpenChange, onEdit }: PdiDetailProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const { data: profiles } = useProfiles();
  const { data: goals, isLoading: goalsLoading } = usePdiGoals(pdi?.id ?? null);
  const createGoalMutation = useCreatePdiGoal();
  const deleteGoalMutation = useDeletePdiGoal();
  const updatePdiMutation = useUpdatePdi();
  const deletePdiMutation = useDeletePdi();
  const { toast } = useToast();

  const { data: personSkills } = usePersonSkills(pdi?.person_id ?? null);

  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [editGoalData, setEditGoalData] = useState<PdiGoalWithActions | null>(null);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p.full_name ?? "Sem nome"])
  );

  if (!pdi) return null;

  const progress = goals ? computePdiProgress(goals) : 0;

  function toggleGoalExpanded(goalId: string) {
    setExpandedGoals((prev) => {
      const next = new Set(prev);
      if (next.has(goalId)) next.delete(goalId);
      else next.add(goalId);
      return next;
    });
  }

  function handleCreateGoal() {
    if (!newGoalTitle.trim() || !tenantId || !pdi) return;
    createGoalMutation.mutate(
      { tenant_id: tenantId, pdi_id: pdi.id, title: newGoalTitle.trim() },
      {
        onSuccess: () => setNewGoalTitle(""),
        onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
      }
    );
  }

  function handleDeleteGoal(goalId: string) {
    if (!pdi) return;
    deleteGoalMutation.mutate(
      { id: goalId, pdiId: pdi.id },
      { onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }) }
    );
  }

  function handleStatusChange(status: string) {
    if (!pdi) return;
    updatePdiMutation.mutate(
      { id: pdi.id, updates: { status } },
      {
        onSuccess: () => toast({ title: `Status alterado para ${PDI_STATUS[status as keyof typeof PDI_STATUS]?.label ?? status}` }),
        onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
      }
    );
  }

  function handleDelete() {
    if (!pdi) return;
    deletePdiMutation.mutate(pdi.id, {
      onSuccess: () => {
        toast({ title: "PDI removido" });
        onOpenChange(false);
      },
      onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-xl">
        <div className="space-y-5 p-6">
          {/* Header */}
          <SheetHeader className="space-y-1">
            <SheetTitle className="text-lg">{pdi.title || "PDI sem título"}</SheetTitle>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <User className="h-4 w-4" />
              {profileMap.get(pdi.person_id) ?? "Desconhecido"}
            </div>
          </SheetHeader>

          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            {PDI_STATUS_KEYS.map((key) => {
              const { label, style } = getPdiStatusBadgeProps(key);
              const active = pdi.status === key;
              return (
                <Badge
                  key={key}
                  variant={active ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  style={active ? style : undefined}
                  onClick={() => handleStatusChange(key)}
                >
                  {label}
                </Badge>
              );
            })}
          </div>

          {/* Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Progresso</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Dates */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CalendarDays className="h-4 w-4" />
            Criado em {pdi.created_at ? formatDate(pdi.created_at) : "—"}
            {pdi.last_updated_at && (
              <span>· Atualizado {formatDate(pdi.last_updated_at)}</span>
            )}
          </div>

          <Separator />

          {/* Goals section */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold">
              <Target className="h-4 w-4" /> Metas ({goals?.length ?? 0})
            </h4>

            {goalsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg border bg-gray-100/40" />
                ))}
              </div>
            ) : (
              <>
                {(goals ?? []).map((goal) => {
                  const expanded = expandedGoals.has(goal.id);
                  const goalBadge = getGoalStatusBadgeProps(goal.status);
                  const doneActions = goal.pdi_actions.filter((a: { completed: boolean }) => a.completed).length;
                  const totalActions = goal.pdi_actions.length;

                  return (
                    <div key={goal.id} className="rounded-lg border">
                      {/* Goal header */}
                      <div
                        className="flex cursor-pointer items-center gap-2 p-3"
                        onClick={() => toggleGoalExpanded(goal.id)}
                      >
                        {expanded ? (
                          <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 shrink-0 text-gray-500" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">{goal.title}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs" style={goalBadge.style}>
                              {goalBadge.label}
                            </Badge>
                            {totalActions > 0 && (
                              <span className="text-xs text-gray-500">
                                {doneActions}/{totalActions} ações
                              </span>
                            )}
                            {goal.skill_id && (
                              <span className="text-xs text-gray-500">
                                Skill vinculada
                                {goal.target_level_percent != null && ` · Meta ${goal.target_level_percent}%`}
                              </span>
                            )}
                            {goal.target_date && (
                              <span className="text-xs text-gray-500">
                                Meta: {formatDate(goal.target_date)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-500 hover:text-gray-900"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditGoalData(goal);
                              setGoalFormOpen(true);
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-500 hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGoal(goal.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Expanded: actions */}
                      {expanded && (
                        <div className="border-t px-3 py-3">
                          {goal.description && (
                            <p className="mb-3 text-sm text-gray-500">{goal.description}</p>
                          )}
                          <PdiActionsInline
                            goalId={goal.id}
                            pdiId={pdi.id}
                            actions={goal.pdi_actions}
                            mode="full"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* New goal input (quick) */}
                <div className="flex items-center gap-2">
                  <Input
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    placeholder="Nova meta rápida..."
                    className="h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateGoal();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 shrink-0"
                    onClick={handleCreateGoal}
                    disabled={!newGoalTitle.trim() || createGoalMutation.isPending}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* New goal with Scorecard link */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setEditGoalData(null);
                    setGoalFormOpen(true);
                  }}
                >
                  <Target className="mr-1 h-3 w-3" /> Nova meta com detalhes / vincular competência
                </Button>
              </>
            )}
          </div>

          <Separator />

          {/* Footer: edit + delete */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="sm" onClick={() => onEdit?.(pdi)}>
              Editar PDI
            </Button>
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-500"
                >
                  <Trash2 className="mr-1 h-3 w-3" /> Excluir
                </Button>
              }
              title="Excluir PDI"
              description="Tem certeza? Todas as metas e ações vinculadas também serão removidas."
              onConfirm={handleDelete}
              confirmLabel="Excluir"
              variant="destructive"
            />
          </div>
        </div>
      </SheetContent>

      {/* Goal form dialog (with scorecard link) */}
      {pdi && (
        <PdiGoalForm
          open={goalFormOpen}
          onOpenChange={setGoalFormOpen}
          pdiId={pdi.id}
          editData={editGoalData}
          personSkills={(personSkills ?? []).map((s) => ({
            id: s.id,
            skill_name: s.skill_name,
            proficiency_level: s.proficiency_level,
          }))}
        />
      )}
    </Sheet>
  );
}

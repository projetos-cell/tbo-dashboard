"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconCalendar,
  IconCheck,
  IconSettings,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState, ErrorState } from "@/components/shared";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { OkrCycleDialog } from "@/features/okrs/components/okr-cycle-dialog";
import { RequireRole } from "@/features/auth/components/require-role";
import {
  useCycles,
  useUpdateCycle,
  useDeleteCycle,
} from "@/features/okrs/hooks/use-okrs";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/types";

type CycleRow = Database["public"]["Tables"]["okr_cycles"]["Row"];

function formatDate(date: string | null) {
  if (!date) return "—";
  return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
}

export default function OKRsConfiguracoes() {
  const { data: cycles = [], isLoading, error, refetch } = useCycles();
  const updateCycle = useUpdateCycle();
  const deleteCycle = useDeleteCycle();
  const { toast } = useToast();

  const [cycleDialog, setCycleDialog] = useState<{
    open: boolean;
    cycle?: CycleRow | null;
  }>({ open: false });
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  async function handleSetActive(cycle: CycleRow) {
    if (cycle.is_active) return;
    try {
      await updateCycle.mutateAsync({
        id: cycle.id,
        updates: { is_active: true } as never,
      });
      toast({ title: "Ciclo ativado", description: `"${cycle.name}" agora é o ciclo ativo.` });
    } catch {
      toast({ title: "Erro ao ativar ciclo", variant: "destructive" });
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteCycle.mutateAsync(pendingDelete);
      toast({ title: "Ciclo excluído" });
    } catch {
      toast({ title: "Erro ao excluir ciclo", variant: "destructive" });
    } finally {
      setPendingDelete(null);
    }
  }

  const activeCycle = cycles.find((c) => c.is_active);

  return (
    <RequireRole minRole="lider">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconSettings className="h-6 w-6 text-gray-500" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
              <p className="text-gray-500 text-sm">Gerencie os ciclos e parâmetros do módulo de OKRs.</p>
            </div>
          </div>
          <Button onClick={() => setCycleDialog({ open: true, cycle: null })}>
            <IconPlus className="mr-1.5 h-4 w-4" />
            Novo Ciclo
          </Button>
        </div>

        {/* Ciclo Ativo */}
        {activeCycle && (
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-green-600" />
                <CardTitle className="text-base text-green-800">Ciclo Ativo</CardTitle>
              </div>
              <CardDescription className="text-green-700">
                Os OKRs desta view são filtrados por este ciclo por padrão.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-900">{activeCycle.name}</p>
                  <p className="text-sm text-green-700 flex items-center gap-1 mt-1">
                    <IconCalendar className="h-3.5 w-3.5" />
                    {formatDate(activeCycle.start_date)} – {formatDate(activeCycle.end_date)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-300 text-green-800 hover:bg-green-100"
                  onClick={() => setCycleDialog({ open: true, cycle: activeCycle })}
                >
                  <IconPencil className="mr-1.5 h-3.5 w-3.5" />
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Ciclos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Todos os Ciclos</CardTitle>
            <CardDescription>
              Histórico completo de ciclos. Apenas um ciclo pode estar ativo por vez.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded" />
                ))}
              </div>
            ) : error ? (
              <ErrorState
                message="Erro ao carregar ciclos."
                onRetry={() => refetch()}
              />
            ) : cycles.length === 0 ? (
              <EmptyState
                icon={IconCalendar}
                title="Nenhum ciclo cadastrado"
                description="Crie o primeiro ciclo para organizar os objetivos e resultados-chave."
                cta={{
                  label: "Criar Ciclo",
                  onClick: () => setCycleDialog({ open: true, cycle: null }),
                }}
              />
            ) : (
              <div className="divide-y">
                {cycles.map((cycle) => (
                  <div
                    key={cycle.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{cycle.name}</span>
                          {cycle.is_active && (
                            <Badge className="bg-green-100 text-green-800 text-xs border-0">
                              Ativo
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <IconCalendar className="h-3 w-3" />
                          {formatDate(cycle.start_date)} – {formatDate(cycle.end_date)}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          Ações
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setCycleDialog({ open: true, cycle })}
                        >
                          <IconPencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        {!cycle.is_active && (
                          <DropdownMenuItem onClick={() => handleSetActive(cycle)}>
                            <IconCheck className="mr-2 h-4 w-4" />
                            Definir como ativo
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => setPendingDelete(cycle.id)}
                          disabled={cycle.is_active}
                        >
                          <IconTrash className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <OkrCycleDialog
        open={cycleDialog.open}
        cycle={cycleDialog.cycle}
        onClose={() => setCycleDialog({ open: false })}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => { if (!open) setPendingDelete(null); }}
        title="Excluir ciclo"
        description="Tem certeza que deseja excluir este ciclo? Os OKRs associados perderão a referência ao ciclo."
        confirmLabel="Excluir"
        onConfirm={handleConfirmDelete}
      />
    </RequireRole>
  );
}

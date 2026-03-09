"use client";

import { useState, useMemo } from "react";
import {
  useOneOnOnes,
  useUpcomingOneOnOnes,
  useOverdueOneOnOnes,
  usePendingOneOnOneActions,
} from "@/features/one-on-ones/hooks/use-one-on-ones";
import { useProfiles } from "@/features/people/hooks/use-people";
import { OneOnOneKPICards } from "@/features/one-on-ones/components/one-on-one-kpis";
import { PendingActionsList } from "@/features/one-on-ones/components/one-on-one-actions";
import { OneOnOneForm } from "@/features/one-on-ones/components/one-on-one-form";
import { OneOnOneDetail } from "@/features/one-on-ones/components/one-on-one-detail";
import { ErrorState, EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  computeOneOnOneKPIs,
  type OneOnOneRow,
} from "@/features/one-on-ones/services/one-on-ones";
import {
  ONE_ON_ONE_STATUS,
  STATUS_KEYS,
  getStatusBadgeProps,
  formatDateTime,
  relativeLabel,
  isOverdue,
  type OneOnOneStatusKey,
} from "@/features/one-on-ones/utils/one-on-one-utils";
import { useToggleAction } from "@/features/one-on-ones/hooks/use-one-on-ones";
import {
  Plus,
  CalendarDays,
  AlertTriangle,
  Clock,
  MessageSquare,
} from "lucide-react";

export default function Reunioes1on1Page() {
  const { data: profiles } = useProfiles();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<OneOnOneRow | null>(null);
  const [detailItem, setDetailItem] = useState<OneOnOneRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // ── Data fetching ─────────────────────────────────────────────────────
  const filters = useMemo(
    () => (statusFilter !== "all" ? { status: statusFilter } : undefined),
    [statusFilter]
  );

  const {
    data: oneOnOnes,
    isLoading,
    error,
    refetch,
  } = useOneOnOnes(filters);

  const { data: upcoming, isLoading: upcomingLoading } = useUpcomingOneOnOnes();
  const { data: overdue, isLoading: overdueLoading } = useOverdueOneOnOnes();
  const { data: pendingActions, isLoading: actionsLoading } = usePendingOneOnOneActions();
  const toggleAction = useToggleAction();

  // ── Profile map ───────────────────────────────────────────────────────
  const profileMap = useMemo(
    () => new Map((profiles ?? []).map((p) => [p.id, p.full_name ?? "Sem nome"])),
    [profiles]
  );
  function getName(id: string) {
    return profileMap.get(id) ?? "Desconhecido";
  }

  // ── KPIs ──────────────────────────────────────────────────────────────
  const allOneOnOnes = useOneOnOnes();
  const kpis = useMemo(
    () =>
      computeOneOnOneKPIs(
        allOneOnOnes.data ?? [],
        (pendingActions ?? []).length
      ),
    [allOneOnOnes.data, pendingActions]
  );

  // ── Derived lists ─────────────────────────────────────────────────────
  const scheduled = useMemo(
    () => (oneOnOnes ?? []).filter((o) => (o.status ?? "scheduled") === "scheduled"),
    [oneOnOnes]
  );
  const history = useMemo(
    () =>
      (oneOnOnes ?? []).filter(
        (o) => o.status === "completed" || o.status === "cancelled" || o.status === "no_show"
      ),
    [oneOnOnes]
  );

  // ── Handlers ──────────────────────────────────────────────────────────
  function handleOpenDetail(item: OneOnOneRow) {
    setDetailItem(item);
    setDetailOpen(true);
  }

  function handleEdit(item: OneOnOneRow) {
    setEditData(item);
    setFormOpen(true);
  }

  function handleNewOneOnOne() {
    setEditData(null);
    setFormOpen(true);
  }

  function handleToggleAction(actionId: string, oneOnOneId: string, completed: boolean) {
    toggleAction.mutate({ actionId, completed, oneOnOneId });
  }

  // ── OneOnOne Card (reusable row) ──────────────────────────────────────
  function OneOnOneCard({ item }: { item: OneOnOneRow }) {
    const badgeProps = getStatusBadgeProps(item.status);
    const overdueItem = isOverdue(item.status, item.scheduled_at);

    return (
      <div
        className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-gray-100/50 ${
          overdueItem ? "border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20" : ""
        }`}
        onClick={() => handleOpenDetail(item)}
      >
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {getName(item.leader_id)} ↔ {getName(item.collaborator_id)}
            </span>
            <Badge
              variant="default"
              className="text-[10px]"
              style={badgeProps.style}
            >
              {badgeProps.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {formatDateTime(item.scheduled_at)}
            </span>
            {overdueItem && (
              <span className="flex items-center gap-1 font-medium text-red-600">
                <AlertTriangle className="h-3 w-3" />
                Atrasada
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(item);
          }}
        >
          Editar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reuniões 1:1</h1>
          <p className="text-sm text-gray-500">
            Acompanhamento de reuniões individuais.
          </p>
        </div>
        <Button onClick={handleNewOneOnOne}>
          <Plus className="mr-1 h-4 w-4" /> Nova 1:1
        </Button>
      </div>

      {/* KPIs */}
      <OneOnOneKPICards kpis={kpis} isLoading={allOneOnOnes.isLoading} />

      {/* Overdue Banner */}
      {!overdueLoading && (overdue ?? []).length > 0 && (
        <Card className="border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              {overdue!.length} reunião(ões) atrasada(s)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdue!.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-red-100/50 dark:hover:bg-red-950/40"
                onClick={() => handleOpenDetail(item)}
              >
                <span>
                  {getName(item.leader_id)} ↔ {getName(item.collaborator_id)}
                </span>
                <span className="text-xs text-red-600 dark:text-red-400">
                  {relativeLabel(item.scheduled_at)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upcoming */}
      {!upcomingLoading && (upcoming ?? []).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-blue-600" />
              Próximas Reuniões
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming!.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-gray-100/50"
                onClick={() => handleOpenDetail(item)}
              >
                <span>
                  {getName(item.leader_id)} ↔ {getName(item.collaborator_id)}
                </span>
                <span className="text-xs text-gray-500">
                  {relativeLabel(item.scheduled_at)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="scheduled" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="scheduled">
              Agendadas
              {scheduled.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-[10px]">
                  {scheduled.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="actions">
              Ações Pendentes
              {(pendingActions ?? []).length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-[10px]">
                  {(pendingActions ?? []).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {STATUS_KEYS.map((key) => (
                <SelectItem key={key} value={key}>
                  {ONE_ON_ONE_STATUS[key].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Agendadas Tab */}
        <TabsContent value="scheduled">
          {error ? (
            <ErrorState message={error.message} onRetry={() => refetch()} />
          ) : isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg border bg-gray-100/40" />
              ))}
            </div>
          ) : scheduled.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="Nenhuma reunião agendada"
              description="Clique em 'Nova 1:1' para agendar uma reunião."
            />
          ) : (
            <div className="space-y-2">
              {scheduled.map((item) => (
                <OneOnOneCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Histórico Tab */}
        <TabsContent value="history">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg border bg-gray-100/40" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="Nenhum histórico"
              description="As reuniões concluídas ou canceladas aparecerão aqui."
            />
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <OneOnOneCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Ações Pendentes Tab */}
        <TabsContent value="actions">
          <PendingActionsList
            actions={pendingActions ?? []}
            isLoading={actionsLoading}
            getName={getName}
            onToggle={handleToggleAction}
          />
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <OneOnOneForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditData(null);
        }}
        initialData={editData}
      />

      {/* Detail Sheet */}
      <OneOnOneDetail
        oneOnOne={detailItem}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}

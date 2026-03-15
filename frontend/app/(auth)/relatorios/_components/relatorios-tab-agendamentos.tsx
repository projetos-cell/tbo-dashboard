"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconPlus,
  IconDots,
  IconPencil,
  IconTrash,
  IconFileAnalytics,
  IconSearch,
  IconCopy,
} from "@tabler/icons-react";
import { useReportSchedules, useUpdateSchedule, useDeleteSchedule, useCreateSchedule } from "@/hooks/use-reports";
import { EmptyState } from "@/components/shared";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { ScheduleFormDialog } from "./schedule-form-dialog";
import { CronLabel } from "./cron-label";
import type { Database } from "@/lib/supabase/types";
import type { Json } from "@/lib/supabase/types";

type ScheduleRow = Database["public"]["Tables"]["report_schedules"]["Row"];

function recipientCount(recipients: Json | null): number {
  if (!recipients) return 0;
  if (Array.isArray(recipients)) return recipients.length;
  return 0;
}

export function RelatoriosTabAgendamentos() {
  const { toast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleRow | null>(null);
  const [search, setSearch] = useState("");

  const { data: schedules = [], isLoading } = useReportSchedules();

  const filteredSchedules = useMemo(() => {
    if (!search.trim()) return schedules;
    const q = search.toLowerCase();
    return schedules.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.type ?? "").toLowerCase().includes(q) ||
        (s.description ?? "").toLowerCase().includes(q)
    );
  }, [schedules, search]);
  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();
  const deleteMutation = useDeleteSchedule();

  function handleToggleEnabled(id: string, current: boolean | null) {
    updateMutation.mutate(
      { id, updates: { enabled: !(current ?? true) } },
      {
        onSuccess: () => toast({ title: current ? "Agendamento desativado" : "Agendamento ativado" }),
        onError: () => toast({ title: "Erro ao alterar status", variant: "destructive" }),
      }
    );
  }

  function handleNovoAgendamento() {
    setEditingSchedule(null);
    setFormOpen(true);
  }

  function handleEditar(schedule: ScheduleRow) {
    setEditingSchedule(schedule);
    setFormOpen(true);
  }

  function handleDuplicar(schedule: ScheduleRow) {
    createMutation.mutate(
      {
        name: `${schedule.name} (copia)`,
        description: schedule.description,
        type: schedule.type,
        cron: schedule.cron,
        enabled: false,
        recipients: schedule.recipients,
        config: schedule.config,
        tenant_id: schedule.tenant_id,
      } as never,
      {
        onSuccess: () => toast({ title: "Agendamento duplicado", description: "A copia foi criada como desativada." }),
        onError: () => toast({ title: "Erro ao duplicar", variant: "destructive" }),
      }
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar agendamentos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button className="shrink-0" onClick={handleNovoAgendamento}>
          <IconPlus className="mr-1.5 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cron</TableHead>
                <TableHead>Destinatarios</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-9 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : filteredSchedules.length === 0 ? (
        <EmptyState
          icon={IconFileAnalytics}
          title={search ? "Nenhum resultado encontrado" : "Nenhum agendamento configurado"}
          description={search ? "Tente buscar com outros termos." : "Configure relatorios automaticos para sua equipe."}
        >
          {!search && (
            <Button onClick={handleNovoAgendamento} className="mt-3">
              <IconPlus className="mr-1.5 h-4 w-4" />
              Criar Primeiro Agendamento
            </Button>
          )}
        </EmptyState>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cron</TableHead>
                <TableHead>Destinatarios</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{schedule.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{schedule.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <CronLabel cron={schedule.cron} />
                  </TableCell>
                  <TableCell>
                    {recipientCount(schedule.recipients) > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {(schedule.recipients as string[]).slice(0, 2).map((email) => (
                          <Badge key={email} variant="secondary" className="text-xs font-normal">
                            {email}
                          </Badge>
                        ))}
                        {recipientCount(schedule.recipients) > 2 && (
                          <Badge variant="outline" className="text-xs font-normal">
                            +{recipientCount(schedule.recipients) - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={schedule.enabled ?? true}
                      onCheckedChange={() => handleToggleEnabled(schedule.id, schedule.enabled)}
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <IconDots className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditar(schedule)}>
                          <IconPencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicar(schedule)}>
                          <IconCopy className="mr-2 h-4 w-4" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => setPendingDelete(schedule.id)}
                        >
                          <IconTrash className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => { if (!open) setPendingDelete(null); }}
        title="Excluir agendamento"
        description="Tem certeza que deseja excluir este agendamento? Esta acao nao pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={() => {
          if (pendingDelete) {
            deleteMutation.mutate(pendingDelete, {
              onSuccess: () => toast({ title: "Agendamento excluido" }),
              onError: () => toast({ title: "Erro ao excluir", variant: "destructive" }),
            });
          }
          setPendingDelete(null);
        }}
      />

      <ScheduleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        schedule={editingSchedule}
      />
    </div>
  );
}

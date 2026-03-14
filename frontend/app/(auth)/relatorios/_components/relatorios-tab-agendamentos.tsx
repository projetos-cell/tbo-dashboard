"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "@tabler/icons-react";
import { useReportSchedules, useUpdateSchedule, useDeleteSchedule } from "@/hooks/use-reports";
import { EmptyState } from "@/components/shared";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/lib/supabase/types";

function recipientCount(recipients: Json | null): number {
  if (!recipients) return 0;
  if (Array.isArray(recipients)) return recipients.length;
  return 0;
}

export function RelatoriosTabAgendamentos() {
  const { toast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const { data: schedules = [], isLoading } = useReportSchedules();
  const updateMutation = useUpdateSchedule();
  const deleteMutation = useDeleteSchedule();

  function handleToggleEnabled(id: string, current: boolean | null) {
    updateMutation.mutate({ id, updates: { enabled: !(current ?? true) } });
  }

  function handleNovoAgendamento() {
    toast({ title: "Em breve", description: "Formulário de agendamento em desenvolvimento." });
  }

  function handleEditar() {
    toast({ title: "Em breve", description: "Edição de agendamento em desenvolvimento." });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button className="shrink-0" onClick={handleNovoAgendamento}>
          <IconPlus className="mr-1.5 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded" />
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <EmptyState
          icon={IconFileAnalytics}
          title="Nenhum agendamento configurado"
          description="Configure relatórios automáticos para sua equipe."
        />
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
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{schedule.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{schedule.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
                      {schedule.cron}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {recipientCount(schedule.recipients)}
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
                        <DropdownMenuItem onClick={handleEditar}>
                          <IconPencil className="mr-2 h-4 w-4" />
                          Editar
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
          if (pendingDelete) deleteMutation.mutate(pendingDelete);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/shared";
import { PdiGoalsSection } from "./pdi-goals-section";
import { useUpdatePdi, useDeletePdi, usePersonSkills } from "@/features/pdi/hooks/use-pdi";
import { useProfiles } from "@/features/people/hooks/use-people";
import { useToast } from "@/hooks/use-toast";
import {
  PDI_STATUS,
  PDI_STATUS_KEYS,
  getPdiStatusBadgeProps,
  formatDate,
} from "@/features/pdi/utils/pdi-utils";
import type { PdiRow } from "@/features/pdi/services/pdi";
import {
  IconTrash,
  IconUser,
  IconCalendar,
} from "@tabler/icons-react";

interface PdiDetailProps {
  pdi: PdiRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (pdi: PdiRow) => void;
}

export function PdiDetail({ pdi, open, onOpenChange, onEdit }: PdiDetailProps) {
  const { data: profiles } = useProfiles();
  const { data: personSkills } = usePersonSkills(pdi?.person_id ?? null);
  const updatePdiMutation = useUpdatePdi();
  const deletePdiMutation = useDeletePdi();
  const { toast } = useToast();

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p.full_name ?? "Sem nome"])
  );

  if (!pdi) return null;

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
              <IconUser className="h-4 w-4" />
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

          {/* Dates */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <IconCalendar className="h-4 w-4" />
            Criado em {pdi.created_at ? formatDate(pdi.created_at) : "—"}
            {pdi.last_updated_at && (
              <span>· Atualizado {formatDate(pdi.last_updated_at)}</span>
            )}
          </div>

          <Separator />

          {/* Goals section */}
          <PdiGoalsSection
            pdiId={pdi.id}
            personId={pdi.person_id}
            personSkills={personSkills ?? []}
          />

          <Separator />

          {/* Footer: edit + delete */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="sm" onClick={() => onEdit?.(pdi)}>
              Editar PDI
            </Button>
            <ConfirmDialog
              trigger={
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-500">
                  <IconTrash className="mr-1 h-3 w-3" /> Excluir
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
    </Sheet>
  );
}

"use client";

import { useState } from "react";
import { Plus, Repeat, Clock, Calendar, MoreHorizontal, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ErrorState, ConfirmDialog, EmptyState } from "@/components/shared";
import {
  useRitualTypes,
  useCreateRitualType,
  useUpdateRitualType,
  useDeleteRitualType,
  useToggleRitualTypeActive,
} from "@/features/cultura/hooks/use-ritual-types";
import { FREQUENCY_LABELS } from "@/features/cultura/services/ritual-types";
import { RitualFormDialog, type RitualFormData } from "@/features/cultura/components/ritual-form-dialog";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";

type RitualTypeRow = Database["public"]["Tables"]["ritual_types"]["Row"];

export default function RituaisPage() {
  const { user, tenantId, role } = useAuthStore();
  const canEdit = role === "founder" || role === "diretoria";

  const { data: rituals, isLoading, error, refetch } = useRitualTypes(canEdit);
  const createRitual = useCreateRitualType();
  const updateRitual = useUpdateRitualType();
  const deleteRitual = useDeleteRitualType();
  const toggleActive = useToggleRitualTypeActive();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RitualTypeRow | null>(null);
  const [deletingRitual, setDeletingRitual] = useState<RitualTypeRow | null>(null);

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (ritual: RitualTypeRow) => {
    setEditing(ritual);
    setShowForm(true);
  };

  const handleSave = async (data: RitualFormData) => {
    try {
      if (editing) {
        await updateRitual.mutateAsync({
          id: editing.id,
          updates: {
            name: data.name,
            description: data.description,
            frequency: data.frequency,
            duration_minutes: data.duration_minutes,
            default_agenda: data.default_agenda,
          },
        });
      } else {
        await createRitual.mutateAsync({
          tenant_id: tenantId!,
          name: data.name,
          description: data.description,
          frequency: data.frequency,
          duration_minutes: data.duration_minutes,
          default_agenda: data.default_agenda,
          created_by: user?.id,
          is_system: false,
          is_active: true,
        } as Database["public"]["Tables"]["ritual_types"]["Insert"]);
      }
      setShowForm(false);
    } catch {
      // handled by mutation onError
    }
  };

  const handleDelete = (ritual: RitualTypeRow) => {
    if (ritual.is_system) return;
    setDeletingRitual(ritual);
  };

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Rituais</h1>
          <p className="text-sm text-gray-500">
            Rituais e cerimonias que fortalecem a cultura do time.
          </p>
        </div>
        {canEdit && (
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4 mr-1" />
            Novo ritual
          </Button>
        )}
      </div>

      {/* Ritual cards */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="relative overflow-hidden">
              <Skeleton className="h-1 w-full rounded-none" />
              <CardContent className="p-4 pt-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (rituals ?? []).length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(rituals ?? []).map((ritual) => (
            <Card
              key={ritual.id}
              className={`relative overflow-hidden ${!ritual.is_active ? "opacity-60" : ""}`}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: ritual.color ?? "#3b82f6" }}
              />
              <CardContent className="p-4 pt-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <Repeat className="size-4 shrink-0" style={{ color: ritual.color ?? "#3b82f6" }} />
                      <h3 className="font-medium text-sm truncate">{ritual.name}</h3>
                      {ritual.is_system && (
                        <Badge variant="secondary" className="text-xs shrink-0">Sistema</Badge>
                      )}
                    </div>

                    {ritual.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {ritual.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="size-3 mr-0.5" />
                        {FREQUENCY_LABELS[ritual.frequency ?? ""] ?? ritual.frequency}
                      </Badge>
                      {ritual.duration_minutes && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="size-3 mr-0.5" />
                          {ritual.duration_minutes}min
                        </Badge>
                      )}
                      {!ritual.is_active && (
                        <Badge variant="destructive" className="text-xs">Inativo</Badge>
                      )}
                    </div>

                    {ritual.default_agenda && (
                      <p className="text-xs text-gray-500 line-clamp-2 border-l-2 pl-2 mt-1">
                        {ritual.default_agenda}
                      </p>
                    )}
                  </div>

                  {canEdit && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7">
                          <MoreHorizontal className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(ritual)}>
                          <Edit className="size-3.5 mr-1.5" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toggleActive.mutate({ id: ritual.id, isActive: !ritual.is_active })
                          }
                        >
                          {ritual.is_active ? (
                            <><ToggleLeft className="size-3.5 mr-1.5" />Desativar</>
                          ) : (
                            <><ToggleRight className="size-3.5 mr-1.5" />Ativar</>
                          )}
                        </DropdownMenuItem>
                        {!ritual.is_system && (
                          <DropdownMenuItem
                            className="text-red-500"
                            onClick={() => handleDelete(ritual)}
                          >
                            <Trash2 className="size-3.5 mr-1.5" />
                            Excluir
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Repeat}
          title="Nenhum ritual cadastrado"
          description="Crie rituais e cerimonias que fortalecem a cultura do time."
          cta={canEdit ? { label: "Novo ritual", onClick: openCreate } : undefined}
        />
      )}

      <RitualFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        editing={editing}
        onSave={handleSave}
        isSaving={createRitual.isPending || updateRitual.isPending}
      />

      <ConfirmDialog
        open={!!deletingRitual}
        onOpenChange={(open) => !open && setDeletingRitual(null)}
        title={`Excluir "${deletingRitual?.name}"?`}
        description="Esta acao nao pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={async () => {
          try {
            if (deletingRitual) await deleteRitual.mutateAsync(deletingRitual.id);
          } catch {
            // handled by mutation onError
          } finally {
            setDeletingRitual(null);
          }
        }}
      />
    </div>
  );
}

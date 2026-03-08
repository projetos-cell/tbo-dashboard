"use client";

import { useState } from "react";
import { Plus, Repeat, Clock, Users, Calendar, MoreHorizontal, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/tbo-ui/button";
import { Card, CardContent } from "@/components/tbo-ui/card";
import { Badge } from "@/components/tbo-ui/badge";
import { Skeleton } from "@/components/tbo-ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/tbo-ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/tbo-ui/dialog";
import { Input } from "@/components/tbo-ui/input";
import { Label } from "@/components/tbo-ui/label";
import { Textarea } from "@/components/tbo-ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tbo-ui/select";
import { ErrorState } from "@/components/shared";
import {
  useRitualTypes,
  useCreateRitualType,
  useUpdateRitualType,
  useDeleteRitualType,
  useToggleRitualTypeActive,
} from "@/hooks/use-ritual-types";
import { FREQUENCY_LABELS } from "@/services/ritual-types";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";

type RitualTypeRow = Database["public"]["Tables"]["ritual_types"]["Row"];

const FREQUENCY_OPTIONS = Object.entries(FREQUENCY_LABELS);

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
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    frequency: "weekly",
    duration_minutes: 60,
    default_agenda: "",
  });

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: "", description: "", frequency: "weekly", duration_minutes: 60, default_agenda: "" });
    setShowForm(true);
  };

  const openEdit = (ritual: RitualTypeRow) => {
    setEditing(ritual);
    setFormData({
      name: ritual.name ?? "",
      description: ritual.description ?? "",
      frequency: ritual.frequency ?? "weekly",
      duration_minutes: ritual.duration_minutes ?? 60,
      default_agenda: ritual.default_agenda ?? "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    if (editing) {
      await updateRitual.mutateAsync({
        id: editing.id,
        updates: {
          name: formData.name,
          description: formData.description,
          frequency: formData.frequency,
          duration_minutes: formData.duration_minutes,
          default_agenda: formData.default_agenda,
        },
      });
    } else {
      await createRitual.mutateAsync({
        tenant_id: tenantId!,
        name: formData.name,
        description: formData.description,
        frequency: formData.frequency,
        duration_minutes: formData.duration_minutes,
        default_agenda: formData.default_agenda,
        created_by: user?.id,
        is_system: false,
        is_active: true,
      } as Database["public"]["Tables"]["ritual_types"]["Insert"]);
    }
    setShowForm(false);
  };

  const handleDelete = async (ritual: RitualTypeRow) => {
    if (ritual.is_system) return;
    if (!window.confirm(`Excluir "${ritual.name}"?`)) return;
    await deleteRitual.mutateAsync(ritual.id);
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
            <Skeleton key={i} className="h-36" />
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
        <div className="text-center py-12 text-gray-500">
          <Repeat className="size-8 mx-auto mb-2 opacity-50" />
          <p>Nenhum ritual cadastrado.</p>
        </div>
      )}

      {/* Form dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Ritual" : "Novo Ritual"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Daily Standup"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Descricao</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Para que serve este ritual?"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Frequencia</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(v) => setFormData((p) => ({ ...p, frequency: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Duracao (min)</Label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, duration_minutes: parseInt(e.target.value) || 0 }))
                  }
                  min={5}
                  max={480}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Agenda padrao</Label>
              <Textarea
                value={formData.default_agenda}
                onChange={(e) => setFormData((p) => ({ ...p, default_agenda: e.target.value }))}
                placeholder="1. Check-in\n2. Atualizacoes\n3. Bloqueios\n4. Proximos passos"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.name.trim() || createRitual.isPending || updateRitual.isPending}
              >
                {createRitual.isPending || updateRitual.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

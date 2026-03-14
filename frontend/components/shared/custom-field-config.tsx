"use client";

import { useState } from "react";
import {
  IconPlus,
  IconGripVertical,
  IconPencil,
  IconTrash,
  IconLetterCase,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useFieldDefinitions,
  useCreateFieldDefinition,
  useUpdateFieldDefinition,
  useDeleteFieldDefinition,
} from "@/features/configuracoes/hooks/use-custom-fields";
import { useAuthStore } from "@/stores/auth-store";
import { CUSTOM_FIELD_TYPES, type CustomFieldTypeKey } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Database, Json } from "@/lib/supabase/types";
import { FieldDialog, FIELD_ICONS, type FieldDialogSaveData } from "./custom-field-dialog";

type FieldDefinition = Database["public"]["Tables"]["custom_field_definitions"]["Row"];

interface CustomFieldConfigProps {
  projectId: string;
  className?: string;
}

export function CustomFieldConfig({ projectId, className }: CustomFieldConfigProps) {
  const { data: definitions, isLoading } = useFieldDefinitions(projectId);
  const createField = useCreateFieldDefinition();
  const updateField = useUpdateFieldDefinition();
  const deleteField = useDeleteFieldDefinition();
  const tenantId = useAuthStore((s) => s.tenantId);

  const [showDialog, setShowDialog] = useState(false);
  const [editingField, setEditingField] = useState<FieldDefinition | null>(null);

  const handleCreate = () => {
    setEditingField(null);
    setShowDialog(true);
  };

  const handleEdit = (field: FieldDefinition) => {
    setEditingField(field);
    setShowDialog(true);
  };

  const handleDelete = async (field: FieldDefinition) => {
    await deleteField.mutateAsync({ id: field.id, projectId });
  };

  const handleSave = async (data: FieldDialogSaveData) => {
    if (editingField) {
      await updateField.mutateAsync({
        id: editingField.id,
        updates: {
          name: data.name,
          field_type: data.field_type,
          options: data.options as unknown as Json,
          is_required: data.is_required,
        },
        projectId,
      });
    } else {
      await createField.mutateAsync({
        name: data.name,
        field_type: data.field_type,
        options: data.options as unknown as Json,
        is_required: data.is_required,
        project_id: projectId,
        tenant_id: tenantId!,
        order_index: (definitions?.length || 0) + 1,
      } as Database["public"]["Tables"]["custom_field_definitions"]["Insert"]);
    }
    setShowDialog(false);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Campos personalizados</h3>
        <Button size="sm" variant="outline" onClick={handleCreate}>
          <IconPlus className="mr-1 size-3.5" />
          Novo campo
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : definitions?.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-500">Nenhum campo personalizado configurado</p>
      ) : (
        <div className="space-y-1">
          {definitions?.map((field) => {
            const typeDef = CUSTOM_FIELD_TYPES[field.field_type as CustomFieldTypeKey];
            const IconComp = typeDef ? FIELD_ICONS[typeDef.icon] || IconLetterCase : IconLetterCase;

            return (
              <div key={field.id} className="group flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <IconGripVertical className="size-4 cursor-grab text-gray-500" />
                <IconComp className="size-4 text-gray-500" />
                <span className="flex-1">{field.name}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {typeDef?.label || field.field_type}
                </Badge>
                {field.is_required && (
                  <Badge variant="outline" className="text-[10px] text-red-500">
                    Obrigatorio
                  </Badge>
                )}
                <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={() => handleEdit(field)}
                    aria-label="Editar"
                  >
                    <IconPencil className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-red-500"
                    onClick={() => handleDelete(field)}
                    aria-label="Remover"
                  >
                    <IconTrash className="size-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <FieldDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        field={editingField}
        onSave={handleSave}
      />
    </div>
  );
}

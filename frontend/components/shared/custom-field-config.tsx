"use client";

import { useState } from "react";
import {
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  X,
  Check,
  Type,
  Hash,
  Calendar,
  List,
  ListChecks,
  CheckSquare,
  Link,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useFieldDefinitions,
  useCreateFieldDefinition,
  useUpdateFieldDefinition,
  useDeleteFieldDefinition,
} from "@/hooks/use-custom-fields";
import { useAuthStore } from "@/stores/auth-store";
import { CUSTOM_FIELD_TYPES, type CustomFieldTypeKey } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Database, Json } from "@/lib/supabase/types";

type FieldDefinition =
  Database["public"]["Tables"]["custom_field_definitions"]["Row"];

const FIELD_ICONS: Record<string, React.ElementType> = {
  type: Type,
  hash: Hash,
  calendar: Calendar,
  list: List,
  "list-checks": ListChecks,
  "check-square": CheckSquare,
  link: Link,
};

interface CustomFieldConfigProps {
  projectId: string;
  className?: string;
}

export function CustomFieldConfig({
  projectId,
  className,
}: CustomFieldConfigProps) {
  const { data: definitions, isLoading } = useFieldDefinitions(projectId);
  const createField = useCreateFieldDefinition();
  const updateField = useUpdateFieldDefinition();
  const deleteField = useDeleteFieldDefinition();
  const tenantId = useAuthStore((s) => s.tenantId);

  const [showDialog, setShowDialog] = useState(false);
  const [editingField, setEditingField] = useState<FieldDefinition | null>(
    null
  );

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

  const handleSave = async (data: {
    name: string;
    field_type: string;
    options: string[];
    is_required: boolean;
  }) => {
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
          <Plus className="size-3.5 mr-1" />
          Novo campo
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : definitions?.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum campo personalizado configurado
        </p>
      ) : (
        <div className="space-y-1">
          {definitions?.map((field) => {
            const typeDef =
              CUSTOM_FIELD_TYPES[field.field_type as CustomFieldTypeKey];
            const IconComp = typeDef
              ? FIELD_ICONS[typeDef.icon] || Type
              : Type;

            return (
              <div
                key={field.id}
                className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm group"
              >
                <GripVertical className="size-4 text-muted-foreground cursor-grab" />
                <IconComp className="size-4 text-muted-foreground" />
                <span className="flex-1">{field.name}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {typeDef?.label || field.field_type}
                </Badge>
                {field.is_required && (
                  <Badge
                    variant="outline"
                    className="text-[10px] text-destructive"
                  >
                    Obrigatorio
                  </Badge>
                )}
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={() => handleEdit(field)}
                    aria-label="Editar"
                  >
                    <Pencil className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-destructive"
                    onClick={() => handleDelete(field)}
                    aria-label="Remover"
                  >
                    <Trash2 className="size-3" />
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

function FieldDialog({
  open,
  onOpenChange,
  field,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: FieldDefinition | null;
  onSave: (data: {
    name: string;
    field_type: string;
    options: string[];
    is_required: boolean;
  }) => Promise<void>;
}) {
  const [name, setName] = useState(field?.name || "");
  const [fieldType, setFieldType] = useState<string>(
    field?.field_type || "text"
  );
  const [options, setOptions] = useState<string[]>(
    (field?.options as string[]) || []
  );
  const [isRequired, setIsRequired] = useState(field?.is_required || false);
  const [newOption, setNewOption] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset state when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setName(field?.name || "");
      setFieldType(field?.field_type || "text");
      setOptions((field?.options as string[]) || []);
      setIsRequired(field?.is_required || false);
      setNewOption("");
    }
    onOpenChange(isOpen);
  };

  const showOptions = fieldType === "select" || fieldType === "multi_select";

  const addOption = () => {
    const trimmed = newOption.trim();
    if (trimmed && !options.includes(trimmed)) {
      setOptions([...options, trimmed]);
      setNewOption("");
    }
  };

  const removeOption = (opt: string) => {
    setOptions(options.filter((o) => o !== opt));
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        field_type: fieldType,
        options: showOptions ? options : [],
        is_required: isRequired,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {field ? "Editar campo" : "Novo campo personalizado"}
          </DialogTitle>
          <DialogDescription>
            Configure o campo personalizado para as tarefas deste projeto.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome do campo</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Prioridade, Sprint, Estimativa..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {(
                Object.entries(CUSTOM_FIELD_TYPES) as [
                  CustomFieldTypeKey,
                  (typeof CUSTOM_FIELD_TYPES)[CustomFieldTypeKey],
                ][]
              ).map(([key, def]) => {
                const IconComp = FIELD_ICONS[def.icon] || Type;
                return (
                  <button
                    key={key}
                    onClick={() => setFieldType(key)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-md border p-2 text-xs transition-colors",
                      fieldType === key
                        ? "border-primary bg-primary/5"
                        : "hover:bg-accent"
                    )}
                  >
                    <IconComp className="size-4" />
                    {def.label}
                  </button>
                );
              })}
            </div>
          </div>

          {showOptions && (
            <div className="space-y-1.5">
              <Label>Opcoes</Label>
              <div className="flex gap-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Nova opcao..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addOption();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={addOption}
                  aria-label="Adicionar opcao"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {options.map((opt) => (
                  <Badge key={opt} variant="secondary" className="gap-1">
                    {opt}
                    <X
                      className="size-3 cursor-pointer"
                      onClick={() => removeOption(opt)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="rounded"
            />
            Campo obrigatorio
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || saving}>
            {field ? "Salvar" : "Criar campo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

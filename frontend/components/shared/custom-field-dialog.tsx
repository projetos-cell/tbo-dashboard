"use client";

import { useState } from "react";
import {
  IconPlus,
  IconX,
  IconLetterCase,
  IconHash,
  IconCalendar,
  IconList,
  IconChecklist,
  IconSquareCheck,
  IconLink,
} from "@tabler/icons-react";
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
import { CUSTOM_FIELD_TYPES, type CustomFieldTypeKey } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type FieldDefinition = Database["public"]["Tables"]["custom_field_definitions"]["Row"];

export const FIELD_ICONS: Record<string, React.ElementType> = {
  type: IconLetterCase,
  hash: IconHash,
  calendar: IconCalendar,
  list: IconList,
  "list-checks": IconChecklist,
  "check-square": IconSquareCheck,
  link: IconLink,
};

export type FieldDialogSaveData = {
  name: string;
  field_type: string;
  options: string[];
  is_required: boolean;
};

interface FieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: FieldDefinition | null;
  onSave: (data: FieldDialogSaveData) => Promise<void>;
}

export function FieldDialog({ open, onOpenChange, field, onSave }: FieldDialogProps) {
  const [name, setName] = useState(field?.name || "");
  const [fieldType, setFieldType] = useState<string>(field?.field_type || "text");
  const [options, setOptions] = useState<string[]>((field?.options as string[]) || []);
  const [isRequired, setIsRequired] = useState(field?.is_required || false);
  const [newOption, setNewOption] = useState("");
  const [saving, setSaving] = useState(false);

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
          <DialogTitle>{field ? "Editar campo" : "Novo campo personalizado"}</DialogTitle>
          <DialogDescription>Configure o campo personalizado para as tarefas deste projeto.</DialogDescription>
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
                const IconComp = FIELD_ICONS[def.icon] || IconLetterCase;
                return (
                  <button
                    key={key}
                    onClick={() => setFieldType(key)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-md border p-2 text-xs transition-colors",
                      fieldType === key ? "border-tbo-orange bg-tbo-orange/5" : "hover:bg-gray-100",
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
                <Button type="button" size="icon" variant="outline" onClick={addOption} aria-label="Adicionar opcao">
                  <IconPlus className="size-4" />
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {options.map((opt) => (
                  <Badge key={opt} variant="secondary" className="gap-1">
                    {opt}
                    <IconX className="size-3 cursor-pointer" onClick={() => removeOption(opt)} />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <label className="flex cursor-pointer items-center gap-2 text-sm">
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

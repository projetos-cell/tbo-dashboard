"use client";

import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  FieldTypeIcon,
  FIELD_TYPE_LABELS,
} from "./custom-field-renderer";
import type { FieldType, FieldOption } from "@/schemas/custom-field";

const ALL_TYPES: FieldType[] = [
  "text",
  "number",
  "select",
  "multi_select",
  "date",
  "person",
  "checkbox",
];

export const PRESET_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899",
];

// ─── Step: Nome ──────────────────────────────────────

export function StepName({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <Label htmlFor="field-name" className="text-sm font-medium">
        Nome do campo
      </Label>
      <Input
        id="field-name"
        autoFocus
        placeholder="Ex: Prioridade cliente, URL do briefing..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={100}
        onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
      />
      <p className="text-xs text-muted-foreground">
        O nome deve ser único na organização.
      </p>
    </div>
  );
}

// ─── Step: Tipo ──────────────────────────────────────

export function StepType({
  value,
  onChange,
}: {
  value: FieldType;
  onChange: (v: FieldType) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Tipo do campo</Label>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {ALL_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm text-left transition-all",
              value === t
                ? "border-primary bg-primary/5 text-primary font-medium"
                : "border-border hover:border-border/80 hover:bg-accent/30"
            )}
          >
            <FieldTypeIcon type={t} className="h-4 w-4 shrink-0" />
            <span className="truncate">{FIELD_TYPE_LABELS[t]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step: Opções ────────────────────────────────────

export function StepOptions({
  options,
  newLabel,
  newColor,
  onNewLabelChange,
  onNewColorChange,
  onAdd,
  onRemove,
}: {
  options: FieldOption[];
  newLabel: string;
  newColor: string;
  onNewLabelChange: (v: string) => void;
  onNewColorChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Opções</Label>

      <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
        {options.length === 0 && (
          <p className="text-xs text-muted-foreground italic">
            Adicione ao menos uma opção.
          </p>
        )}
        {options.map((opt) => (
          <div
            key={opt.id}
            className="flex items-center gap-2 px-2 py-1 rounded border bg-muted/30"
          >
            <span
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: opt.color ?? "#94a3b8" }}
            />
            <span className="flex-1 text-sm truncate">{opt.label}</span>
            <button
              type="button"
              onClick={() => onRemove(opt.id)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <IconTrash className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="flex gap-1 flex-wrap w-[80px] shrink-0">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onNewColorChange(c)}
              className={cn(
                "h-4 w-4 rounded-full transition-transform",
                newColor === c ? "ring-2 ring-offset-1 ring-primary scale-110" : ""
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <Input
          placeholder="Nome da opção"
          value={newLabel}
          onChange={(e) => onNewLabelChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
          className="flex-1 h-8 text-sm"
        />
        <Button size="sm" variant="outline" onClick={onAdd} className="h-8 px-2">
          <IconPlus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Step: Obrigatório ───────────────────────────────

export function StepRequired({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-4 py-4">
      <Switch checked={value} onCheckedChange={onChange} id="is-required" />
      <div className="space-y-1">
        <Label htmlFor="is-required" className="text-sm font-medium cursor-pointer">
          Campo obrigatório
        </Label>
        <p className="text-xs text-muted-foreground">
          Quando ativado, um alerta aparece na tarefa caso o campo esteja vazio.
        </p>
      </div>
    </div>
  );
}

// ─── Step: Preview ───────────────────────────────────

export function StepPreview({
  name,
  fieldType,
  options,
  isRequired,
}: {
  name: string;
  fieldType: FieldType;
  options: FieldOption[];
  isRequired: boolean;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Preview do campo</Label>
      <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <FieldTypeIcon type={fieldType} className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{name}</span>
          {isRequired && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-600 border-amber-300">
              Obrigatório
            </Badge>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          Tipo: <span className="font-medium">{FIELD_TYPE_LABELS[fieldType]}</span>
        </div>

        {options.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Opções:</span>
            <div className="flex flex-wrap gap-1.5">
              {options.map((opt) => (
                <Badge
                  key={opt.id}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 border"
                  style={
                    opt.color
                      ? {
                          backgroundColor: opt.color + "22",
                          color: opt.color,
                          borderColor: opt.color + "44",
                        }
                      : undefined
                  }
                >
                  {opt.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

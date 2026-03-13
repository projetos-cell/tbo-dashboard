"use client";

import {
  IconTextSize,
  IconHash,
  IconSelector,
  IconChecks,
  IconCalendar,
  IconUser,
  IconToggleLeft,
} from "@tabler/icons-react";
import { CustomFieldValueEditor } from "./custom-field-value-editor";
import type { CustomFieldDefinition, FieldType } from "@/schemas/custom-field";

// ─── Props ────────────────────────────────────────────

interface CustomFieldRendererProps {
  taskId: string;
  definition: CustomFieldDefinition;
  currentValue: unknown;
  readonly?: boolean;
}

// ─── Field type icon map ─────────────────────────────

const FIELD_TYPE_ICONS: Record<FieldType, React.ElementType> = {
  text: IconTextSize,
  number: IconHash,
  select: IconSelector,
  multi_select: IconChecks,
  date: IconCalendar,
  person: IconUser,
  checkbox: IconToggleLeft,
};

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Texto",
  number: "Número",
  select: "Seleção única",
  multi_select: "Múltipla seleção",
  date: "Data",
  person: "Pessoa",
  checkbox: "Checkbox",
};

// ─── Component ────────────────────────────────────────

export function CustomFieldRenderer({
  taskId,
  definition,
  currentValue,
  readonly = false,
}: CustomFieldRendererProps) {
  return (
    <CustomFieldValueEditor
      taskId={taskId}
      definition={definition}
      currentValue={currentValue}
      readonly={readonly}
    />
  );
}

// ─── Field type icon helper ──────────────────────────

export function FieldTypeIcon({
  type,
  className = "h-3.5 w-3.5",
}: {
  type: FieldType;
  className?: string;
}) {
  const Icon = FIELD_TYPE_ICONS[type] ?? IconTextSize;
  return <Icon className={className} />;
}

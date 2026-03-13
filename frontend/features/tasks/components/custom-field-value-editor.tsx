"use client";

import { IconAlertCircle } from "@tabler/icons-react";
import { useUpsertCustomFieldValue } from "@/features/tasks/hooks/use-task-custom-fields";
import { TextEditor, NumberEditor, CheckboxEditor } from "./custom-field-simple-editors";
import { DateEditor } from "./custom-field-date-editor";
import { SelectEditor, MultiSelectEditor } from "./custom-field-select-editor";
import { PersonEditor } from "./custom-field-person-editor";
import type { CustomFieldDefinition } from "@/schemas/custom-field";

interface CustomFieldValueEditorProps {
  taskId: string;
  definition: CustomFieldDefinition;
  currentValue: unknown;
  readonly?: boolean;
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (value === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

export function CustomFieldValueEditor({
  taskId,
  definition,
  currentValue,
  readonly = false,
}: CustomFieldValueEditorProps) {
  const upsert = useUpsertCustomFieldValue();
  const hasAlert = definition.is_required && isEmpty(currentValue);

  function save(value: unknown) {
    upsert.mutate({ task_id: taskId, field_id: definition.id, value });
  }

  return (
    <div className="flex items-center gap-1.5 min-h-[22px]">
      {definition.field_type === "checkbox" ? (
        <CheckboxEditor value={currentValue} onSave={save} readonly={readonly} />
      ) : definition.field_type === "text" ? (
        <TextEditor value={currentValue} onSave={save} readonly={readonly} />
      ) : definition.field_type === "number" ? (
        <NumberEditor value={currentValue} onSave={save} readonly={readonly} />
      ) : definition.field_type === "date" ? (
        <DateEditor value={currentValue} onSave={save} readonly={readonly} />
      ) : definition.field_type === "select" ? (
        <SelectEditor
          value={currentValue}
          options={definition.options}
          onSave={save}
          readonly={readonly}
        />
      ) : definition.field_type === "multi_select" ? (
        <MultiSelectEditor
          value={currentValue}
          options={definition.options}
          onSave={save}
          readonly={readonly}
        />
      ) : definition.field_type === "person" ? (
        <PersonEditor value={currentValue} onSave={save} readonly={readonly} />
      ) : null}

      {hasAlert && (
        <IconAlertCircle
          className="h-3.5 w-3.5 text-amber-500 shrink-0"
          aria-label="Campo obrigatório"
        />
      )}
    </div>
  );
}

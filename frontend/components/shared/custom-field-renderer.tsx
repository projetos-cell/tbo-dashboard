"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Database, Json } from "@/lib/supabase/types";

type FieldDefinition =
  Database["public"]["Tables"]["custom_field_definitions"]["Row"];
type FieldValue =
  Database["public"]["Tables"]["custom_field_values"]["Row"];

interface CustomFieldRendererProps {
  definition: FieldDefinition;
  value?: FieldValue | null;
  onChange: (value: Partial<FieldValue>) => void;
  className?: string;
  readOnly?: boolean;
}

export function CustomFieldRenderer({
  definition,
  value,
  onChange,
  className,
  readOnly = false,
}: CustomFieldRendererProps) {
  const fieldType = definition.field_type;

  const handleTextChange = useCallback(
    (text: string) => {
      onChange({
        definition_id: definition.id,
        value_text: text || null,
      });
    },
    [definition.id, onChange]
  );

  const handleNumberChange = useCallback(
    (num: string) => {
      onChange({
        definition_id: definition.id,
        value_number: num ? Number(num) : null,
      });
    },
    [definition.id, onChange]
  );

  const handleDateChange = useCallback(
    (date: string) => {
      onChange({
        definition_id: definition.id,
        value_date: date ? new Date(date + "T00:00:00").toISOString() : null,
      });
    },
    [definition.id, onChange]
  );

  const handleCheckboxChange = useCallback(
    (checked: boolean) => {
      onChange({
        definition_id: definition.id,
        value_text: checked ? "true" : "false",
      });
    },
    [definition.id, onChange]
  );

  const handleSelectChange = useCallback(
    (selected: string) => {
      onChange({
        definition_id: definition.id,
        value_text: selected || null,
      });
    },
    [definition.id, onChange]
  );

  const handleMultiSelectChange = useCallback(
    (option: string) => {
      const current: string[] = value?.value_json
        ? (value.value_json as string[])
        : [];
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      onChange({
        definition_id: definition.id,
        value_json: updated as unknown as Json,
      });
    },
    [definition.id, value?.value_json, onChange]
  );

  const options = (definition.options as string[]) || [];

  return (
    <div className={cn("space-y-1", className)}>
      <label className="text-xs font-medium text-muted-foreground">
        {definition.name}
        {definition.is_required && <span className="text-destructive ml-0.5">*</span>}
      </label>

      {fieldType === "text" && (
        <TextFieldInline
          value={value?.value_text || ""}
          onChange={handleTextChange}
          readOnly={readOnly}
        />
      )}

      {fieldType === "number" && (
        <Input
          type="number"
          value={value?.value_number ?? ""}
          onChange={(e) => handleNumberChange(e.target.value)}
          className="h-8 text-sm"
          readOnly={readOnly}
        />
      )}

      {fieldType === "date" && (
        <Input
          type="date"
          value={
            value?.value_date
              ? format(new Date(value.value_date), "yyyy-MM-dd")
              : ""
          }
          onChange={(e) => handleDateChange(e.target.value)}
          className="h-8 text-sm"
          readOnly={readOnly}
        />
      )}

      {fieldType === "checkbox" && (
        <div className="flex items-center gap-2 h-8">
          <Checkbox
            checked={value?.value_text === "true"}
            onCheckedChange={(checked) =>
              handleCheckboxChange(checked === true)
            }
            disabled={readOnly}
          />
          <span className="text-sm">
            {value?.value_text === "true" ? "Sim" : "Nao"}
          </span>
        </div>
      )}

      {fieldType === "url" && (
        <Input
          type="url"
          value={value?.value_text || ""}
          onChange={(e) => handleTextChange(e.target.value)}
          className="h-8 text-sm"
          placeholder="https://..."
          readOnly={readOnly}
        />
      )}

      {fieldType === "select" && (
        <SelectField
          value={value?.value_text || ""}
          options={options}
          onChange={handleSelectChange}
          readOnly={readOnly}
        />
      )}

      {fieldType === "multi_select" && (
        <MultiSelectField
          selected={(value?.value_json as string[]) || []}
          options={options}
          onChange={handleMultiSelectChange}
          readOnly={readOnly}
        />
      )}
    </div>
  );
}

function TextFieldInline({
  value,
  onChange,
  readOnly,
}: {
  value: string;
  onChange: (v: string) => void;
  readOnly: boolean;
}) {
  const [localValue, setLocalValue] = useState(value);

  return (
    <Input
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => {
        if (localValue !== value) onChange(localValue);
      }}
      className="h-8 text-sm"
      readOnly={readOnly}
    />
  );
}

function SelectField({
  value,
  options,
  onChange,
  readOnly,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  readOnly: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={readOnly}
      className="h-8 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus:border-ring focus:ring-ring/50 focus:ring-[3px]"
    >
      <option value="">Selecionar...</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function MultiSelectField({
  selected,
  options,
  onChange,
  readOnly,
}: {
  selected: string[];
  options: string[];
  onChange: (option: string) => void;
  readOnly: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <Badge
            key={opt}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "cursor-pointer text-xs",
              readOnly && "cursor-default"
            )}
            onClick={() => {
              if (!readOnly) onChange(opt);
            }}
          >
            {opt}
          </Badge>
        );
      })}
    </div>
  );
}

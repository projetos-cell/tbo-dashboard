"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  IconAlertCircle,
  IconCheck,
  IconChevronDown,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useTeamMembers } from "@/hooks/use-team";
import { useUpsertCustomFieldValue } from "@/features/tasks/hooks/use-task-custom-fields";
import type { CustomFieldDefinition, FieldOption } from "@/schemas/custom-field";

// ─── Props ────────────────────────────────────────────

interface CustomFieldValueEditorProps {
  taskId: string;
  definition: CustomFieldDefinition;
  currentValue: unknown;
  readonly?: boolean;
}

// ─── Helpers ─────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (value === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

// ─── Root Component ──────────────────────────────────

export function CustomFieldValueEditor({
  taskId,
  definition,
  currentValue,
  readonly = false,
}: CustomFieldValueEditorProps) {
  const upsert = useUpsertCustomFieldValue();
  const isRequired = definition.is_required;
  const hasAlert = isRequired && isEmpty(currentValue);

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

// ─── Text Editor ─────────────────────────────────────

function TextEditor({
  value,
  onSave,
  readonly,
}: {
  value: unknown;
  onSave: (v: unknown) => void;
  readonly: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(String(value ?? ""));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commit() {
    setEditing(false);
    if (local !== String(value ?? "")) onSave(local || null);
  }

  if (!editing || readonly) {
    return (
      <button
        type="button"
        onClick={() => !readonly && setEditing(true)}
        className={cn(
          "text-sm text-left rounded px-1.5 py-0.5 -mx-1.5 transition-colors min-w-[80px]",
          readonly
            ? "cursor-default"
            : "hover:bg-accent/50 cursor-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        {value ? (
          <span>{String(value)}</span>
        ) : (
          <span className="text-muted-foreground italic text-xs">
            {readonly ? "—" : "Clique para editar"}
          </span>
        )}
      </button>
    );
  }

  return (
    <Input
      ref={inputRef}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
          setLocal(String(value ?? ""));
          setEditing(false);
        }
      }}
      className="h-7 text-sm px-1.5 py-0.5 -mx-1.5 w-auto max-w-[200px]"
    />
  );
}

// ─── Number Editor ───────────────────────────────────

function NumberEditor({
  value,
  onSave,
  readonly,
}: {
  value: unknown;
  onSave: (v: unknown) => void;
  readonly: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(value != null ? String(value) : "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commit() {
    setEditing(false);
    const num = local === "" ? null : parseFloat(local);
    if (num !== (value ?? null)) onSave(num);
  }

  if (!editing || readonly) {
    return (
      <button
        type="button"
        onClick={() => !readonly && setEditing(true)}
        className={cn(
          "text-sm text-left rounded px-1.5 py-0.5 -mx-1.5 transition-colors min-w-[60px]",
          readonly
            ? "cursor-default"
            : "hover:bg-accent/50 cursor-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        {value != null ? (
          <span>{String(value)}</span>
        ) : (
          <span className="text-muted-foreground italic text-xs">
            {readonly ? "—" : "Clique para editar"}
          </span>
        )}
      </button>
    );
  }

  return (
    <Input
      ref={inputRef}
      type="number"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
          setLocal(value != null ? String(value) : "");
          setEditing(false);
        }
      }}
      className="h-7 text-sm px-1.5 py-0.5 -mx-1.5 w-[100px]"
    />
  );
}

// ─── Checkbox Editor ─────────────────────────────────

function CheckboxEditor({
  value,
  onSave,
  readonly,
}: {
  value: unknown;
  onSave: (v: unknown) => void;
  readonly: boolean;
}) {
  const checked = Boolean(value);
  return (
    <Switch
      checked={checked}
      onCheckedChange={(v) => !readonly && onSave(v)}
      disabled={readonly}
      className="scale-75 origin-left"
    />
  );
}

// ─── Date Editor ─────────────────────────────────────

function DateEditor({
  value,
  onSave,
  readonly,
}: {
  value: unknown;
  onSave: (v: unknown) => void;
  readonly: boolean;
}) {
  const [open, setOpen] = useState(false);
  const dateValue = value ? new Date(String(value)) : undefined;

  function handleSelect(date: Date | undefined) {
    setOpen(false);
    onSave(date ? date.toISOString() : null);
  }

  const label = dateValue
    ? format(dateValue, "dd MMM yyyy", { locale: ptBR })
    : null;

  return (
    <Popover open={open && !readonly} onOpenChange={(o) => !readonly && setOpen(o)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "text-sm rounded px-1.5 py-0.5 -mx-1.5 transition-colors flex items-center gap-1",
            readonly
              ? "cursor-default"
              : "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          {label ? (
            <span>{label}</span>
          ) : (
            <span className="text-muted-foreground italic text-xs">
              {readonly ? "—" : "Selecionar data"}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          locale={ptBR}
        />
        {dateValue && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={() => handleSelect(undefined)}
            >
              Limpar data
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ─── Select Editor ────────────────────────────────────

function SelectEditor({
  value,
  options,
  onSave,
  readonly,
}: {
  value: unknown;
  options: FieldOption[];
  onSave: (v: unknown) => void;
  readonly: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedId = typeof value === "string" ? value : null;
  const selected = options.find((o) => o.id === selectedId) ?? null;

  return (
    <Popover open={open && !readonly} onOpenChange={(o) => !readonly && setOpen(o)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "text-sm rounded px-1.5 py-0.5 -mx-1.5 transition-colors flex items-center gap-1",
            readonly
              ? "cursor-default"
              : "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          {selected ? (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 border font-normal"
              style={
                selected.color
                  ? {
                      backgroundColor: selected.color + "22",
                      color: selected.color,
                      borderColor: selected.color + "44",
                    }
                  : undefined
              }
            >
              {selected.label}
            </Badge>
          ) : (
            <span className="text-muted-foreground italic text-xs">
              {readonly ? "—" : "Selecionar"}
            </span>
          )}
          {!readonly && <IconChevronDown className="h-3 w-3 text-muted-foreground" />}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar opção..." />
          <CommandList>
            <CommandEmpty>Nenhuma opção</CommandEmpty>
            <CommandGroup>
              {selectedId && (
                <CommandItem onSelect={() => { onSave(null); setOpen(false); }} className="text-muted-foreground text-xs">
                  Limpar seleção
                </CommandItem>
              )}
              {options.map((opt) => (
                <CommandItem
                  key={opt.id}
                  value={opt.label}
                  onSelect={() => { onSave(opt.id); setOpen(false); }}
                  className="flex items-center gap-2"
                >
                  {opt.color && (
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: opt.color }}
                    />
                  )}
                  <span className="flex-1">{opt.label}</span>
                  {opt.id === selectedId && <IconCheck className="h-3.5 w-3.5 text-primary" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Multi-Select Editor ─────────────────────────────

function MultiSelectEditor({
  value,
  options,
  onSave,
  readonly,
}: {
  value: unknown;
  options: FieldOption[];
  onSave: (v: unknown) => void;
  readonly: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedIds: string[] = Array.isArray(value) ? (value as string[]) : [];
  const selectedOptions = options.filter((o) => selectedIds.includes(o.id));

  function toggle(optId: string) {
    const next = selectedIds.includes(optId)
      ? selectedIds.filter((id) => id !== optId)
      : [...selectedIds, optId];
    onSave(next);
  }

  return (
    <Popover open={open && !readonly} onOpenChange={(o) => !readonly && setOpen(o)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "text-sm rounded px-1 py-0.5 -mx-1 transition-colors flex flex-wrap items-center gap-1",
            readonly
              ? "cursor-default"
              : "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          {selectedOptions.length > 0 ? (
            <>
              {selectedOptions.map((opt) => (
                <Badge
                  key={opt.id}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 border font-normal"
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
            </>
          ) : (
            <span className="text-muted-foreground italic text-xs">
              {readonly ? "—" : "Selecionar"}
            </span>
          )}
          {!readonly && <IconChevronDown className="h-3 w-3 text-muted-foreground" />}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar opções..." />
          <CommandList>
            <CommandEmpty>Nenhuma opção</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const isSelected = selectedIds.includes(opt.id);
                return (
                  <CommandItem
                    key={opt.id}
                    value={opt.label}
                    onSelect={() => toggle(opt.id)}
                    className="flex items-center gap-2"
                  >
                    {opt.color && (
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: opt.color }}
                      />
                    )}
                    <span className="flex-1">{opt.label}</span>
                    {isSelected && <IconCheck className="h-3.5 w-3.5 text-primary" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Person Editor ───────────────────────────────────

function PersonEditor({
  value,
  onSave,
  readonly,
}: {
  value: unknown;
  onSave: (v: unknown) => void;
  readonly: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { data: members = [] } = useTeamMembers({ is_active: true });
  const selectedId = typeof value === "string" ? value : null;
  const selected = members.find((m) => m.id === selectedId) ?? null;

  return (
    <Popover open={open && !readonly} onOpenChange={(o) => !readonly && setOpen(o)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "text-sm rounded px-1.5 py-0.5 -mx-1.5 transition-colors flex items-center gap-2",
            readonly
              ? "cursor-default"
              : "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          {selected ? (
            <>
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[9px] font-semibold bg-blue-100 text-blue-700">
                  {getInitials(selected.full_name)}
                </AvatarFallback>
              </Avatar>
              <span>{selected.full_name}</span>
            </>
          ) : (
            <span className="text-muted-foreground italic text-xs">
              {readonly ? "—" : "Selecionar pessoa"}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar membro..." />
          <CommandList>
            <CommandEmpty>Nenhum membro</CommandEmpty>
            <CommandGroup>
              {selectedId && (
                <CommandItem
                  onSelect={() => { onSave(null); setOpen(false); }}
                  className="text-muted-foreground text-xs"
                >
                  Remover seleção
                </CommandItem>
              )}
              {members.map((m) => (
                <CommandItem
                  key={m.id}
                  value={m.full_name}
                  onSelect={() => { onSave(m.id); setOpen(false); }}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarFallback className="text-[10px] font-semibold bg-muted">
                      {getInitials(m.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm truncate">{m.full_name}</span>
                  {m.id === selectedId && <IconCheck className="h-3.5 w-3.5 text-primary" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

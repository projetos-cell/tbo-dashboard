"use client";

import { useState } from "react";
import {
  IconSettings,
  IconPlus,
  IconTrash,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { hasMinRole } from "@/lib/permissions";
import {
  useFieldDefinitions,
  useDeleteFieldDefinition,
  useTaskCustomFieldValues,
} from "@/features/tasks/hooks/use-task-custom-fields";
import { CustomFieldRenderer, FieldTypeIcon } from "./custom-field-renderer";
import { CustomFieldDefinitionForm } from "./custom-field-definition-form";
import type { CustomFieldDefinition } from "@/schemas/custom-field";

// ─── Props ────────────────────────────────────────────

interface CustomFieldsSectionProps {
  taskId: string;
}

// ─── Component ────────────────────────────────────────

export function CustomFieldsSection({ taskId }: CustomFieldsSectionProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const role = useAuthStore((s) => s.role);
  const canManageDefs = hasMinRole(role, "diretoria"); // founder + diretoria
  const isFounder = role === "founder";
  const canFillValues = hasMinRole(role, "colaborador"); // todos

  const { data: definitions = [], isLoading: defsLoading } = useFieldDefinitions();
  const { data: values = [], isLoading: valuesLoading } = useTaskCustomFieldValues(taskId);
  const deleteDef = useDeleteFieldDefinition();

  const isLoading = defsLoading || valuesLoading;

  function getValueForField(fieldId: string): unknown {
    const found = values.find((v) => v.field_id === fieldId);
    return found?.value ?? null;
  }

  if (isLoading) {
    return <CustomFieldsSkeleton />;
  }

  if (definitions.length === 0) {
    return (
      <>
        <EmptyState canManage={canManageDefs} onAdd={() => setFormOpen(true)} />
        <CustomFieldDefinitionForm open={formOpen} onOpenChange={setFormOpen} />
      </>
    );
  }

  return (
    <>
      <div className="space-y-0">
        {/* Section header */}
        <div className="flex items-center justify-between py-1 -mx-0.5">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
          >
            {collapsed ? (
              <IconChevronDown className="h-3.5 w-3.5" />
            ) : (
              <IconChevronUp className="h-3.5 w-3.5" />
            )}
            Campos personalizados
            <span className="text-[10px] font-normal normal-case tracking-normal text-muted-foreground/70">
              ({definitions.length})
            </span>
          </button>

          {canManageDefs && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setFormOpen(true)}
                >
                  <IconPlus className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-xs">Novo campo</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Fields list */}
        {!collapsed && (
          <div className="divide-y divide-border/40">
            {definitions.map((def) => (
              <CustomFieldRow
                key={def.id}
                definition={def}
                taskId={taskId}
                currentValue={getValueForField(def.id)}
                readonly={!canFillValues}
                canDelete={isFounder}
                onDelete={() => deleteDef.mutate(def.id)}
              />
            ))}
          </div>
        )}
      </div>

      <CustomFieldDefinitionForm open={formOpen} onOpenChange={setFormOpen} />
    </>
  );
}

// ─── Field Row ───────────────────────────────────────

interface CustomFieldRowProps {
  definition: CustomFieldDefinition;
  taskId: string;
  currentValue: unknown;
  readonly: boolean;
  canDelete: boolean;
  onDelete: () => void;
}

function CustomFieldRow({
  definition,
  taskId,
  currentValue,
  readonly,
  canDelete,
  onDelete,
}: CustomFieldRowProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group flex items-start gap-3 py-2 min-h-[34px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Label */}
      <div className="flex items-center gap-1.5 w-[120px] shrink-0 mt-0.5">
        <span className="text-muted-foreground">
          <FieldTypeIcon type={definition.field_type} />
        </span>
        <span className="text-xs font-medium text-muted-foreground truncate">
          {definition.name}
        </span>
      </div>

      {/* Value editor */}
      <div className="flex-1 min-w-0">
        <CustomFieldRenderer
          taskId={taskId}
          definition={definition}
          currentValue={currentValue}
          readonly={readonly}
        />
      </div>

      {/* Delete action (founder only) */}
      {canDelete && hovered && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onDelete}
              className="shrink-0 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
            >
              <IconTrash className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-xs">Remover campo da org</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────

function EmptyState({
  canManage,
  onAdd,
}: {
  canManage: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="py-3 flex items-center gap-2">
      <div className="flex-1">
        <span className="text-xs text-muted-foreground">
          Nenhum campo personalizado
        </span>
      </div>
      {canManage && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs gap-1 text-muted-foreground hover:text-foreground"
          onClick={onAdd}
        >
          <IconSettings className="h-3.5 w-3.5" />
          Configurar campos
        </Button>
      )}
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────

function CustomFieldsSkeleton() {
  return (
    <div className="space-y-2 py-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 h-[34px] animate-pulse">
          <div className="w-[120px] h-3 bg-muted rounded" />
          <div className="flex-1 h-3 bg-muted rounded max-w-[160px]" />
        </div>
      ))}
    </div>
  );
}

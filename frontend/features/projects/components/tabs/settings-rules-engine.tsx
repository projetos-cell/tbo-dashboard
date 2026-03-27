"use client";

import { IconBolt, IconPower, IconTrash } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/stores/auth-store";
import {
  useProjectRules,
  useCreateProjectRule,
  useUpdateProjectRule,
  useDeleteProjectRule,
} from "@/features/projects/hooks/use-project-rules";
import { TRIGGER_TYPES, ACTION_TYPES, type TriggerType } from "@/features/projects/services/project-rules";

interface SettingsRulesEngineProps {
  projectId: string;
}

export function SettingsRulesEngine({ projectId }: SettingsRulesEngineProps) {
  const { data: rules = [] } = useProjectRules(projectId);
  const createRule = useCreateProjectRule();
  const updateRule = useUpdateProjectRule(projectId);
  const deleteRule = useDeleteProjectRule(projectId);
  const tenantId = useAuthStore((s) => s.tenantId);

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <IconBolt className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Regras de Automacao</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Automatize acoes quando eventos ocorrerem nas tarefas.
      </p>

      <div className="space-y-2">
        {rules.map((rule) => {
          const triggerLabel = TRIGGER_TYPES[rule.trigger_type as TriggerType]?.label ?? rule.trigger_type;
          const actions = (rule.actions_json ?? []) as Array<{ type: string; value: string }>;
          const actionLabels = actions
            .map((a) => ACTION_TYPES[a.type as keyof typeof ACTION_TYPES]?.label ?? a.type)
            .join(", ");

          return (
            <div
              key={rule.id}
              className="flex items-center gap-3 rounded-md border border-border/50 bg-card px-3 py-2 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{rule.name}</span>
                  {!rule.is_active && (
                    <Badge variant="secondary" className="text-[9px]">Inativa</Badge>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  Quando: {triggerLabel}
                  {actionLabels && ` \u2192 ${actionLabels}`}
                </div>
              </div>

              <button
                type="button"
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all"
                onClick={() =>
                  updateRule.mutate({
                    id: rule.id,
                    updates: { is_active: !rule.is_active } as never,
                  })
                }
                title={rule.is_active ? "Desativar" : "Ativar"}
              >
                <IconPower className="size-3.5" />
              </button>

              <button
                type="button"
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                onClick={() => deleteRule.mutate(rule.id)}
              >
                <IconTrash className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Quick-add rule */}
      <div className="flex items-center gap-2">
        <Select
          value=""
          onValueChange={(triggerType) => {
            if (!tenantId) return;
            const triggerLabel = TRIGGER_TYPES[triggerType as TriggerType]?.label ?? triggerType;
            createRule.mutate({
              project_id: projectId,
              tenant_id: tenantId,
              name: triggerLabel,
              trigger_type: triggerType,
            } as never);
          }}
        >
          <SelectTrigger className="h-8 text-xs flex-1">
            <SelectValue placeholder="Adicionar regra..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TRIGGER_TYPES).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>
                {cfg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {rules.length === 0 && (
        <p className="text-[11px] text-muted-foreground pl-1">
          Nenhuma regra configurada. Selecione um gatilho acima para criar.
        </p>
      )}
    </section>
  );
}

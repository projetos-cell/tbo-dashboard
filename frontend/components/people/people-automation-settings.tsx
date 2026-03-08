"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { isAutomationEnabled } from "@/services/people-automations";
import { useAutomationEnabled } from "@/hooks/use-people-automations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/tbo-ui/card";
import { Switch } from "@/components/tbo-ui/switch";
import { Label } from "@/components/tbo-ui/label";
import { Badge } from "@/components/tbo-ui/badge";
import { Bot, Clock, Target, TrendingDown, Flame } from "lucide-react";

// ---------------------------------------------------------------------------
// Automation rules (read-only display)
// ---------------------------------------------------------------------------

const AUTOMATION_RULES = [
  {
    icon: Clock,
    label: "1:1 atrasado (> 45 dias)",
    action: "Cria tarefa: \"Realizar 1:1 com {Nome}\"",
    owner: "Líder direto",
  },
  {
    icon: Target,
    label: "PDI desatualizado (> 120 dias)",
    action: "Cria tarefa: \"Atualizar PDI de {Nome}\"",
    owner: "Líder direto",
  },
  {
    icon: TrendingDown,
    label: "Score crítico (< 45)",
    action: "Gera alerta no painel (sem tarefa)",
    owner: "Founder/Admin",
  },
  {
    icon: Flame,
    label: "Sobrecarga (≥ 10 tarefas)",
    action: "Cria tarefa: \"Revisar carga de {Nome}\"",
    owner: "Líder direto",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PeopleAutomationSettings() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const { toggle } = useAutomationEnabled();

  const { data: enabled, isLoading } = useQuery({
    queryKey: ["people-automations-enabled", tenantId],
    queryFn: () => isAutomationEnabled(supabase, tenantId!),
    staleTime: 1000 * 60 * 10,
    enabled: !!tenantId,
  });

  const currentEnabled = enabled ?? true;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-tbo-orange" />
            <CardTitle className="text-base">Automações de Pessoas</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="automation-toggle" className="text-sm text-gray-500">
              {currentEnabled ? "Ativo" : "Desativado"}
            </Label>
            <Switch
              id="automation-toggle"
              checked={currentEnabled}
              disabled={isLoading || toggle.isPending}
              onCheckedChange={(checked) => toggle.mutate(checked)}
            />
          </div>
        </div>
        <CardDescription>
          Regras determinísticas que criam tarefas automaticamente quando condições de risco são detectadas.
          Executado ao acessar o módulo Pessoas (máx. 1x a cada 15 min).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {AUTOMATION_RULES.map((rule, i) => {
            const Icon = rule.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-medium">{rule.label}</p>
                  <p className="text-xs text-gray-500">{rule.action}</p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-xs">
                  {rule.owner}
                </Badge>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-lg bg-gray-100/50 p-3">
          <p className="text-xs text-gray-500">
            <strong>Anti-duplicação:</strong> Tarefas automáticas só são criadas se não existir uma tarefa
            aberta do mesmo tipo para a mesma pessoa. Tarefas concluídas não bloqueiam novas criações.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

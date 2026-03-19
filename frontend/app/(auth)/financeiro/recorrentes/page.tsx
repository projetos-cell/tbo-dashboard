"use client";

import { useState } from "react";
import { RBACGuard } from "@/components/rbac-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconPlus,
  IconRefresh,
  IconRepeat,
  IconCurrencyDollar,
  IconReceipt,
  IconTrash,
  IconEdit,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  useRecurringRules,
  useToggleRecurringRule,
  useDeleteRecurringRule,
  useGenerateRecurringTransactions,
} from "@/features/financeiro/hooks/use-recurring-rules";
import { RecurringRuleForm } from "@/features/financeiro/components/recurring-rule-form";
import type { RecurringRule } from "@/features/financeiro/services/finance-types";

function fmt(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function getCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function RecorrentesContent() {
  const { data, isLoading } = useRecurringRules();
  const { mutate: toggle } = useToggleRecurringRule();
  const { mutate: remove } = useDeleteRecurringRule();
  const { mutate: generate, isPending: generating } = useGenerateRecurringTransactions();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringRule | null>(null);

  function handleGenerate() {
    const month = getCurrentMonth();
    generate(month, {
      onSuccess: (r) => toast.success(`${r.created} transações geradas, ${r.skipped} já existiam.`),
      onError: (e) => toast.error(`Erro: ${e.message}`),
    });
  }

  function handleDelete(id: string, desc: string) {
    if (!confirm(`Excluir regra "${desc}"? Transações já geradas não serão removidas.`)) return;
    remove(id, {
      onSuccess: () => toast.success("Regra excluída."),
      onError: (e) => toast.error(e.message),
    });
  }

  const rules: RecurringRule[] = data?.rules ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Despesas & Receitas Recorrentes</h1>
          <p className="text-sm text-muted-foreground">
            Regras que auto-geram transações mensalmente — independente do OMIE.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating}>
            <IconRefresh className={`size-3.5 mr-1.5 ${generating ? "animate-spin" : ""}`} />
            {generating ? "Gerando…" : "Gerar Agora"}
          </Button>
          <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <IconPlus className="size-3.5 mr-1.5" />
            Nova Regra
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950">
                <IconRepeat className="size-4 text-violet-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Regras Ativas</p>
                <div className="text-lg font-bold">
                  {isLoading ? <Skeleton className="h-5 w-8" /> : data?.activeCount ?? 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950">
                <IconReceipt className="size-4 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Despesas/mês</p>
                <div className="text-lg font-bold">
                  {isLoading ? <Skeleton className="h-5 w-20" /> : fmt(data?.totalDespesaMensal ?? 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950">
                <IconCurrencyDollar className="size-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Receitas/mês</p>
                <div className="text-lg font-bold">
                  {isLoading ? <Skeleton className="h-5 w-20" /> : fmt(data?.totalReceitaMensal ?? 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Regras Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : rules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <p className="text-sm text-muted-foreground">Nenhuma regra recorrente cadastrada.</p>
              <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
                <IconPlus className="size-3.5 mr-1.5" />
                Criar primeira regra
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 font-medium">Descrição</th>
                    <th className="text-left py-2 font-medium">Tipo</th>
                    <th className="text-right py-2 font-medium">Valor</th>
                    <th className="text-center py-2 font-medium">Dia</th>
                    <th className="text-center py-2 font-medium">Início</th>
                    <th className="text-center py-2 font-medium">Fim</th>
                    <th className="text-center py-2 font-medium">Ativo</th>
                    <th className="text-right py-2 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5">
                        <span className={!rule.is_active ? "text-muted-foreground line-through" : ""}>
                          {rule.description}
                        </span>
                        {rule.counterpart && (
                          <span className="text-xs text-muted-foreground ml-2">({rule.counterpart})</span>
                        )}
                      </td>
                      <td className="py-2.5">
                        <Badge variant={rule.type === "despesa" ? "destructive" : "default"} className="text-xs">
                          {rule.type}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums">
                        {fmt(Number(rule.amount))}
                      </td>
                      <td className="py-2.5 text-center text-muted-foreground">{rule.day_of_month}</td>
                      <td className="py-2.5 text-center text-muted-foreground text-xs">{rule.start_month}</td>
                      <td className="py-2.5 text-center text-muted-foreground text-xs">
                        {rule.end_month ?? "—"}
                      </td>
                      <td className="py-2.5 text-center">
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={(v) => toggle({ id: rule.id, isActive: v })}
                          className="scale-75"
                        />
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => { setEditing(rule); setFormOpen(true); }}
                          >
                            <IconEdit className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(rule.id, rule.description)}
                          >
                            <IconTrash className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <p className="text-xs text-muted-foreground">
        Salários da equipe são gerenciados em{" "}
        <a href="/financeiro/operacional" className="underline hover:text-foreground">
          Folha de Pagamento
        </a>
        . Use regras recorrentes para assinaturas, empréstimos, serviços fixos e outras despesas previsíveis.
      </p>

      {/* Form dialog */}
      <RecurringRuleForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editingRule={editing}
      />
    </div>
  );
}

export default function RecorrentesPage() {
  return (
    <RBACGuard minRole="diretoria">
      <RecorrentesContent />
    </RBACGuard>
  );
}

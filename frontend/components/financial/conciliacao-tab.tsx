"use client";

import { useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Scale,
  FileUp,
  CheckCircle2,
  XCircle,
  Clock,
  MoreHorizontal,
  Trash2,
  Settings2,
  ArrowRightLeft,
  Loader2,
  Pencil,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  useBankTransactions,
  useBankImports,
  useReconciliationRules,
  useCreateReconciliationRule,
  useUpdateReconciliationRule,
  useDeleteReconciliationRule,
} from "@/hooks/use-financial";
import { useAuthStore } from "@/stores/auth-store";
import { formatBRL } from "@/lib/format";

// ── Types ──────────────────────────────────────────────────────

interface RuleForm {
  name: string;
  pattern: string;
  match_field: string;
  priority: number;
  auto_match: boolean;
}

const emptyRule: RuleForm = {
  name: "",
  pattern: "",
  match_field: "description",
  priority: 0,
  auto_match: true,
};

const MATCH_FIELD_OPTIONS = [
  { value: "description", label: "Descricao" },
  { value: "amount", label: "Valor" },
  { value: "date", label: "Data" },
  { value: "type", label: "Tipo" },
] as const;

const MATCH_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  matched: {
    label: "Conciliado",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    icon: CheckCircle2,
  },
  unmatched: {
    label: "Pendente",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    icon: Clock,
  },
  ignored: {
    label: "Ignorado",
    color: "#9ca3af",
    bg: "rgba(156,163,175,0.12)",
    icon: XCircle,
  },
};

// ── Component ──────────────────────────────────────────────────

export function ConciliacaoTab() {
  const tenantId = useAuthStore((s) => s.tenantId);

  const [subTab, setSubTab] = useState("transactions");
  const [selectedImportId, setSelectedImportId] = useState<string | undefined>(
    undefined
  );

  // Data hooks
  const { data: transactions = [], isLoading: loadingTx } =
    useBankTransactions({ import_id: selectedImportId });
  const { data: imports = [], isLoading: loadingImports } = useBankImports();
  const { data: rules = [], isLoading: loadingRules } =
    useReconciliationRules();

  // Mutation hooks
  const createRule = useCreateReconciliationRule();
  const updateRule = useUpdateReconciliationRule();
  const deleteRule = useDeleteReconciliationRule();

  // Rule dialog state
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [ruleEditId, setRuleEditId] = useState<string | null>(null);
  const [ruleForm, setRuleForm] = useState<RuleForm>(emptyRule);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Stats
  const matched = transactions.filter(
    (t) => t.match_status === "matched"
  ).length;
  const unmatched = transactions.filter(
    (t) => t.match_status === "unmatched" || !t.match_status
  ).length;
  const total = transactions.length;

  // ── Rule handlers ──

  const openNewRule = useCallback(() => {
    setRuleEditId(null);
    setRuleForm(emptyRule);
    setRuleDialogOpen(true);
  }, []);

  const openEditRule = useCallback(
    (rule: (typeof rules)[number]) => {
      setRuleEditId(rule.id);
      setRuleForm({
        name: rule.name,
        pattern: rule.pattern ?? "",
        match_field: rule.match_field ?? "description",
        priority: rule.priority ?? 0,
        auto_match: rule.auto_match ?? true,
      });
      setRuleDialogOpen(true);
    },
    []
  );

  const handleSaveRule = useCallback(() => {
    if (!ruleForm.name.trim() || !ruleForm.pattern.trim() || !tenantId) return;

    if (ruleEditId) {
      updateRule.mutate(
        {
          id: ruleEditId,
          updates: {
            name: ruleForm.name.trim(),
            pattern: ruleForm.pattern.trim(),
            match_field: ruleForm.match_field,
            priority: ruleForm.priority,
            auto_match: ruleForm.auto_match,
          },
        },
        { onSuccess: () => setRuleDialogOpen(false) }
      );
    } else {
      createRule.mutate(
        {
          name: ruleForm.name.trim(),
          pattern: ruleForm.pattern.trim(),
          match_field: ruleForm.match_field,
          priority: ruleForm.priority,
          auto_match: ruleForm.auto_match,
          tenant_id: tenantId,
        } as never,
        { onSuccess: () => setRuleDialogOpen(false) }
      );
    }
  }, [ruleForm, ruleEditId, tenantId, createRule, updateRule]);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteRule.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }, [deleteTarget, deleteRule]);

  const isSavingRule = createRule.isPending || updateRule.isPending;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Importe extratos bancarios e concilie com as transacoes financeiras.
      </p>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Transacoes
            </CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">
              {imports.length} importacoes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Conciliadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{matched}</div>
            <p className="text-xs text-muted-foreground">
              {total > 0 ? ((matched / total) * 100).toFixed(0) : 0}% do total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{unmatched}</div>
            <p className="text-xs text-muted-foreground">
              {rules.length} regras ativas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sub tabs */}
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList>
          <TabsTrigger value="transactions">
            <ArrowRightLeft className="mr-1.5 h-3.5 w-3.5" />
            Transacoes
          </TabsTrigger>
          <TabsTrigger value="imports">
            <FileUp className="mr-1.5 h-3.5 w-3.5" />
            Importacoes
          </TabsTrigger>
          <TabsTrigger value="rules">
            <Settings2 className="mr-1.5 h-3.5 w-3.5" />
            Regras
          </TabsTrigger>
        </TabsList>

        {/* Transactions */}
        <TabsContent value="transactions" className="space-y-3">
          {loadingTx ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Carregando...
            </p>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
              <Scale className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium">
                Nenhuma transacao bancaria
              </p>
              <p className="text-xs text-muted-foreground">
                Importe um extrato para comecar a conciliacao.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descricao</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const statusCfg =
                    MATCH_STATUS_CONFIG[tx.match_status ?? "unmatched"] ??
                    MATCH_STATUS_CONFIG.unmatched;
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm">
                        {tx.date
                          ? format(
                              new Date(tx.date + "T12:00:00"),
                              "dd MMM yyyy",
                              { locale: ptBR }
                            )
                          : "\u2014"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm">
                        {tx.description ?? "\u2014"}
                      </TableCell>
                      <TableCell
                        className={`text-right text-sm font-medium ${
                          tx.amount >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formatBRL(tx.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {tx.type ?? "outro"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor: statusCfg.bg,
                            color: statusCfg.color,
                          }}
                        >
                          {statusCfg.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        {/* Imports */}
        <TabsContent value="imports" className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Historico de importacoes de extratos bancarios.
            </p>
            <Button size="sm" variant="outline" disabled>
              <FileUp className="mr-1.5 h-3.5 w-3.5" />
              Importar Extrato
            </Button>
          </div>
          {loadingImports ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Carregando...
            </p>
          ) : imports.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
              <FileUp className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium">Nenhuma importacao</p>
              <p className="text-xs text-muted-foreground">
                Importe extratos bancarios (OFX/CSV) para conciliar.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Banco</TableHead>
                  <TableHead>Periodo</TableHead>
                  <TableHead className="text-right">Transacoes</TableHead>
                  <TableHead className="text-right">Conciliadas</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imports.map((imp) => (
                  <TableRow
                    key={imp.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedImportId(imp.id);
                      setSubTab("transactions");
                    }}
                  >
                    <TableCell className="font-medium text-sm">
                      {imp.filename}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {imp.bank_name ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {imp.period_start && imp.period_end
                        ? `${format(
                            new Date(imp.period_start + "T12:00:00"),
                            "dd/MM",
                            { locale: ptBR }
                          )} - ${format(
                            new Date(imp.period_end + "T12:00:00"),
                            "dd/MM/yy",
                            { locale: ptBR }
                          )}`
                        : "\u2014"}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {imp.transaction_count ?? 0}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {imp.matched_count ?? 0}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {imp.status ?? "pendente"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        {/* Rules */}
        <TabsContent value="rules" className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Regras de conciliacao automatica.
            </p>
            <Button size="sm" onClick={openNewRule}>
              <Settings2 className="mr-1.5 h-3.5 w-3.5" />
              Nova Regra
            </Button>
          </div>
          {loadingRules ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Carregando...
            </p>
          ) : rules.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
              <Settings2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium">
                Nenhuma regra configurada
              </p>
              <p className="text-xs text-muted-foreground">
                Crie regras para conciliar automaticamente transacoes bancarias.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Padrao</TableHead>
                  <TableHead>Campo</TableHead>
                  <TableHead className="text-center">Prioridade</TableHead>
                  <TableHead className="text-center">Auto</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium text-sm">
                      {rule.name}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {rule.pattern ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {rule.match_field ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {rule.priority ?? 0}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={rule.auto_match ? "default" : "outline"}
                        className="text-xs"
                      >
                        {rule.auto_match ? "Sim" : "Nao"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            aria-label="Acoes"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Acoes</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => openEditRule(rule)}
                            >
                              <Pencil className="size-3.5 mr-2" />
                              Editar
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() =>
                              setDeleteTarget({
                                id: rule.id,
                                name: rule.name,
                              })
                            }
                          >
                            <Trash2 className="size-3.5 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Rule Create/Edit Dialog ── */}
      <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {ruleEditId ? "Editar Regra" : "Nova Regra de Conciliacao"}
            </DialogTitle>
            <DialogDescription>
              {ruleEditId
                ? "Altere os parametros da regra."
                : "Configure uma regra para conciliacao automatica."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="rule-name">Nome *</Label>
              <Input
                id="rule-name"
                value={ruleForm.name}
                onChange={(e) =>
                  setRuleForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Ex: Pagamento fornecedor X"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rule-pattern">Padrao (regex) *</Label>
              <Input
                id="rule-pattern"
                value={ruleForm.pattern}
                onChange={(e) =>
                  setRuleForm((f) => ({ ...f, pattern: e.target.value }))
                }
                placeholder="Ex: PIX.*FORNECEDOR"
                className="font-mono text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rule-field">Campo de Comparacao</Label>
              <Select
                value={ruleForm.match_field}
                onValueChange={(v) =>
                  setRuleForm((f) => ({ ...f, match_field: v }))
                }
              >
                <SelectTrigger id="rule-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MATCH_FIELD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rule-priority">Prioridade</Label>
              <Input
                id="rule-priority"
                type="number"
                value={ruleForm.priority}
                onChange={(e) =>
                  setRuleForm((f) => ({
                    ...f,
                    priority: parseInt(e.target.value, 10) || 0,
                  }))
                }
                placeholder="0"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="rule-auto"
                checked={ruleForm.auto_match}
                onCheckedChange={(checked) =>
                  setRuleForm((f) => ({ ...f, auto_match: !!checked }))
                }
              />
              <Label htmlFor="rule-auto" className="text-sm">
                Conciliar automaticamente
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRuleDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveRule}
              disabled={
                !ruleForm.name.trim() ||
                !ruleForm.pattern.trim() ||
                isSavingRule
              }
            >
              {isSavingRule && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              {ruleEditId ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir regra?</AlertDialogTitle>
            <AlertDialogDescription>
              A regra &quot;{deleteTarget?.name}&quot; sera excluida
              permanentemente. Essa acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRule.isPending && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

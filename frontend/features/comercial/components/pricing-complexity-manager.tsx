"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  IconSettings,
  IconPlus,
  IconEdit,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useComplexityRules,
  useCreateComplexityRule,
  useUpdateComplexityRule,
  useDeleteComplexityRule,
} from "@/features/comercial/hooks/use-proposals-enhanced";
import type { ComplexityRule } from "@/features/comercial/services/pricing-complexity";

// ─── Schema ───────────────────────────────────────────────────────────────────

const ruleSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  description: z.string().optional(),
  delivery_type: z.string().optional(),
  multiplier: z.coerce.number().min(0.1, "Mínimo 0.1").max(10, "Máximo 10"),
  conditions_raw: z.string().optional(),
  is_active: z.boolean(),
});

type RuleFormValues = z.infer<typeof ruleSchema>;

// ─── Dialog ───────────────────────────────────────────────────────────────────

interface RuleDialogProps {
  open: boolean;
  onClose: () => void;
  rule?: ComplexityRule;
}

function RuleDialog({ open, onClose, rule }: RuleDialogProps) {
  const createRule = useCreateComplexityRule();
  const updateRule = useUpdateComplexityRule();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<RuleFormValues, any, RuleFormValues>({
    resolver: zodResolver(ruleSchema) as unknown as import("react-hook-form").Resolver<RuleFormValues>,
    defaultValues: {
      name: rule?.name ?? "",
      description: rule?.description ?? "",
      delivery_type: rule?.delivery_type ?? "",
      multiplier: rule?.multiplier ?? 1.0,
      conditions_raw: rule?.conditions ? JSON.stringify(rule.conditions, null, 2) : "",
      is_active: rule?.is_active ?? true,
    },
  });

  async function onSubmit(values: RuleFormValues) {
    let conditions: Record<string, unknown> | null = null;
    if (values.conditions_raw?.trim()) {
      try {
        conditions = JSON.parse(values.conditions_raw);
      } catch {
        form.setError("conditions_raw", { message: "JSON inválido" });
        return;
      }
    }

    const payload = {
      name: values.name,
      description: values.description || null,
      delivery_type: values.delivery_type || null,
      multiplier: values.multiplier,
      conditions,
      is_active: values.is_active,
    };

    if (rule) {
      await updateRule.mutateAsync({ id: rule.id, updates: payload });
    } else {
      await createRule.mutateAsync(payload);
    }
    onClose();
  }

  const isPending = createRule.isPending || updateRule.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{rule ? "Editar regra" : "Nova regra de complexidade"}</DialogTitle>
        </DialogHeader>

        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Alta Complexidade Técnica" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Descreva quando aplicar esta regra..." rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="delivery_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de entrega</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: archviz, branding" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="multiplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Multiplicador</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.05" min="0.1" max="10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="conditions_raw"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condições (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={`{"service_types": ["archviz_exterior"]}`}
                      rows={3}
                      className="font-mono text-xs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">Regra ativa</FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : rule ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PricingComplexityManager() {
  const { data: rules, isLoading } = useComplexityRules();
  const updateRule = useUpdateComplexityRule();
  const deleteRule = useDeleteComplexityRule();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRule, setEditRule] = useState<ComplexityRule | undefined>();

  function openCreate() {
    setEditRule(undefined);
    setDialogOpen(true);
  }

  function openEdit(rule: ComplexityRule) {
    setEditRule(rule);
    setDialogOpen(true);
  }

  function handleToggle(rule: ComplexityRule) {
    updateRule.mutate({ id: rule.id, updates: { is_active: !rule.is_active } });
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <IconSettings size={18} className="text-zinc-500" />
            <CardTitle className="text-base">Regras de Complexidade</CardTitle>
          </div>
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <IconPlus size={14} />
            Nova regra
          </Button>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
            </div>
          ) : !rules?.length ? (
            <div className="text-center py-8 text-zinc-400">
              <IconSettings size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhuma regra cadastrada</p>
              <Button size="sm" variant="ghost" className="mt-2" onClick={openCreate}>
                Criar primeira regra
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50 border-b">
                    <th className="text-left px-4 py-2.5 font-medium text-zinc-500">Nome</th>
                    <th className="text-left px-4 py-2.5 font-medium text-zinc-500">Tipo</th>
                    <th className="text-center px-4 py-2.5 font-medium text-zinc-500">Multiplicador</th>
                    <th className="text-center px-4 py-2.5 font-medium text-zinc-500">Ativo</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-900">{rule.name}</p>
                        {rule.description && (
                          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{rule.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {rule.delivery_type ? (
                          <Badge variant="outline" className="text-xs">
                            {rule.delivery_type}
                          </Badge>
                        ) : (
                          <span className="text-xs text-zinc-400">Global</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`font-mono font-semibold ${
                            rule.multiplier > 1 ? "text-[#E85102]" : rule.multiplier < 1 ? "text-emerald-600" : "text-zinc-400"
                          }`}
                        >
                          {rule.multiplier.toFixed(2)}x
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={() => handleToggle(rule)}
                          disabled={updateRule.isPending}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEdit(rule)}
                          >
                            <IconEdit size={14} />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600">
                                <IconTrash size={14} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover regra?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  A regra &quot;{rule.name}&quot; será removida permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => deleteRule.mutate(rule.id)}
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-zinc-300 cursor-default"
                          >
                            <IconX size={14} className="opacity-0" />
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

      <RuleDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        rule={editRule}
      />
    </>
  );
}

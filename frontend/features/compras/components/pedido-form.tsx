"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { IconCalendar } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth-store";
import {
  useCreatePedido,
  useUpdatePedido,
  useVendors,
  useVendorCategories,
} from "../hooks/use-compras";
import type { Pedido, PedidoStatus, PedidoPrioridade } from "../types";
import { STATUS_CONFIG, PRIORIDADE_CONFIG } from "../types";

const pedidoSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  vendor_id: z.string().optional().nullable(),
  categoria_id: z.string().optional().nullable(),
  prioridade: z.enum(["baixa", "media", "alta", "urgente"] as const),
  status: z.enum([
    "rascunho",
    "aguardando_aprovacao",
    "aprovado",
    "rejeitado",
    "em_andamento",
    "concluido",
    "cancelado",
  ] as const),
  valor_estimado: z.number().min(0).optional().nullable(),
  data_necessidade: z.string().optional().nullable(),
  descricao: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type PedidoFormValues = z.infer<typeof pedidoSchema>;

interface PedidoFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pedido?: Pedido | null;
}

export function PedidoForm({ open, onOpenChange, pedido }: PedidoFormProps) {
  const { toast } = useToast();
  const tenantId = useAuthStore((s) => s.tenantId);
  const user = useAuthStore((s) => s.user);
  const { data: vendors = [] } = useVendors();
  const { data: categories = [] } = useVendorCategories();
  const createPedido = useCreatePedido();
  const updatePedido = useUpdatePedido();

  const isEdit = !!pedido;

  const form = useForm<PedidoFormValues>({
    resolver: zodResolver(pedidoSchema),
    defaultValues: {
      titulo: "",
      vendor_id: null,
      categoria_id: null,
      prioridade: "media",
      status: "rascunho",
      valor_estimado: null,
      data_necessidade: null,
      descricao: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (pedido) {
      form.reset({
        titulo: pedido.titulo,
        vendor_id: pedido.vendor_id ?? null,
        categoria_id: pedido.categoria_id ?? null,
        prioridade: pedido.prioridade,
        status: pedido.status,
        valor_estimado: pedido.valor_estimado ?? null,
        data_necessidade: pedido.data_necessidade ?? null,
        descricao: pedido.descricao ?? "",
        notes: pedido.notes ?? "",
      });
    } else {
      form.reset({
        titulo: "",
        vendor_id: null,
        categoria_id: null,
        prioridade: "media",
        status: "rascunho",
        valor_estimado: null,
        data_necessidade: null,
        descricao: "",
        notes: "",
      });
    }
  }, [pedido, open, form]);

  const onSubmit = async (values: PedidoFormValues) => {
    if (!tenantId) return;

    try {
      if (isEdit && pedido) {
        await updatePedido.mutateAsync({ id: pedido.id, updates: values });
        toast({ title: "Pedido atualizado" });
      } else {
        await createPedido.mutateAsync({
          ...values,
          tenant_id: tenantId,
          data_solicitacao: new Date().toISOString(),
          data_aprovacao: null,
          aprovado_por: null,
          criado_por: user?.id ?? null,
          valor_final: null,
          sort_order: 0,
        });
        toast({ title: "Pedido criado" });
      }
      onOpenChange(false);
    } catch {
      toast({ title: "Erro ao salvar pedido", variant: "destructive" });
    }
  };

  const isPending = createPedido.isPending || updatePedido.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Editar Pedido" : "Novo Pedido"}</SheetTitle>
          <SheetDescription>
            {isEdit ? "Atualize os dados do pedido de compra." : "Registre um novo pedido de compra."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Licenças Adobe CC 2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="prioridade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(PRIORIDADE_CONFIG) as PedidoPrioridade[]).map((k) => (
                          <SelectItem key={k} value={k}>
                            {PRIORIDADE_CONFIG[k].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(STATUS_CONFIG) as PedidoStatus[]).map((k) => (
                          <SelectItem key={k} value={k}>
                            {STATUS_CONFIG[k].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="vendor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fornecedor</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(v === "_none" ? null : v)}
                    value={field.value ?? "_none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um fornecedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="_none">Sem fornecedor</SelectItem>
                      {vendors.filter((v) => v.is_active !== false).map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoria_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(v === "_none" ? null : v)}
                    value={field.value ?? "_none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="_none">Sem categoria</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="valor_estimado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Estimado (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        placeholder="0,00"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? null : parseFloat(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_necessidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Necessidade</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <IconCalendar className="mr-2 size-4" />
                            {field.value
                              ? format(parseISO(field.value), "dd/MM/yyyy", { locale: ptBR })
                              : "Selecione"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? parseISO(field.value) : undefined}
                          onSelect={(date) =>
                            field.onChange(date ? date.toISOString().split("T")[0] : null)
                          }
                          locale={ptBR}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o pedido..."
                      rows={3}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações internas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas internas..."
                      rows={2}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

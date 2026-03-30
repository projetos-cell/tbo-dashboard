"use client";

import { useForm, type ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth-store";
import { useCriarAprovacao, useUpdatePedido } from "../hooks/use-compras";
import type { DecisaoAprovacao, PedidoStatus } from "../types";
import { DECISAO_CONFIG } from "../types";

const aprovacaoSchema = z.object({
  decisao: z.enum(["aprovado", "rejeitado", "solicitado_revisao"] as const),
  comentario: z.string().optional().nullable(),
});

type AprovacaoFormValues = z.infer<typeof aprovacaoSchema>;

const DECISAO_TO_STATUS: Record<DecisaoAprovacao, PedidoStatus> = {
  aprovado: "aprovado",
  rejeitado: "rejeitado",
  solicitado_revisao: "rascunho",
};

interface AprovacaoFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pedidoId: string;
  pedidoTitulo: string;
  /** If provided, pre-selects a decision */
  initialDecisao?: DecisaoAprovacao;
}

export function AprovacaoForm({
  open,
  onOpenChange,
  pedidoId,
  pedidoTitulo,
  initialDecisao,
}: AprovacaoFormProps) {
  const { toast } = useToast();
  const tenantId = useAuthStore((s) => s.tenantId);
  const user = useAuthStore((s) => s.user);
  const criarAprovacao = useCriarAprovacao();
  const updatePedido = useUpdatePedido();

  const form = useForm<AprovacaoFormValues>({
    resolver: zodResolver(aprovacaoSchema),
    defaultValues: {
      decisao: initialDecisao ?? "aprovado",
      comentario: "",
    },
  });

  const onSubmit = async (values: AprovacaoFormValues) => {
    if (!tenantId) return;

    try {
      await criarAprovacao.mutateAsync({
        tenant_id: tenantId,
        pedido_id: pedidoId,
        aprovador: user?.id ?? null,
        decisao: values.decisao,
        comentario: values.comentario ?? null,
      });

      const newStatus = DECISAO_TO_STATUS[values.decisao];
      await updatePedido.mutateAsync({
        id: pedidoId,
        updates: {
          status: newStatus,
          ...(values.decisao === "aprovado"
            ? {
                data_aprovacao: new Date().toISOString(),
                aprovado_por: user?.id ?? null,
              }
            : {}),
        },
      });

      toast({ title: `Decisão registrada: ${DECISAO_CONFIG[values.decisao].label}` });
      form.reset();
      onOpenChange(false);
    } catch {
      toast({ title: "Erro ao registrar decisão", variant: "destructive" });
    }
  };

  const isPending = criarAprovacao.isPending || updatePedido.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Decisão de Aprovação</DialogTitle>
          <DialogDescription>
            Pedido: <strong>{pedidoTitulo}</strong>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="decisao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Decisão</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid grid-cols-1 gap-2"
                    >
                      {(Object.keys(DECISAO_CONFIG) as DecisaoAprovacao[]).map((key) => (
                        <div key={key} className="flex items-center space-x-2">
                          <RadioGroupItem value={key} id={`decisao-${key}`} />
                          <Label
                            htmlFor={`decisao-${key}`}
                            className="cursor-pointer font-normal"
                          >
                            {DECISAO_CONFIG[key].label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comentario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentário</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Justificativa ou observações..."
                      rows={3}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Registrando..." : "Confirmar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

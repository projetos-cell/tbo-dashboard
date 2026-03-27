"use client";

import { type UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BU_LIST } from "@/lib/constants";

// ── Option lists ─────────────────────────────────────────────────────────────

export const SERVICE_TYPE_OPTIONS = [
  { value: "projeto", label: "Projeto" },
  { value: "fee_mensal", label: "Fee Mensal" },
  { value: "hora", label: "Hora" },
  { value: "pacote", label: "Pacote" },
] as const;

export const SERVICE_UNIT_OPTIONS = [
  { value: "projeto", label: "Por Projeto" },
  { value: "mes", label: "Por Mês" },
  { value: "hora", label: "Por Hora" },
  { value: "pacote", label: "Por Pacote" },
  { value: "unidade", label: "Unidade" },
] as const;

export const SERVICE_STATUS_OPTIONS = [
  { value: "active", label: "Ativo" },
  { value: "draft", label: "Rascunho" },
  { value: "archived", label: "Arquivado" },
] as const;

export const COMPLEXITY_OPTIONS = [
  { value: "0.8", label: "0.8× — Simples" },
  { value: "1",   label: "1.0× — Padrão" },
  { value: "1.3", label: "1.3× — Alto" },
  { value: "1.5", label: "1.5× — Premium" },
] as const;

// ── Types ────────────────────────────────────────────────────────────────────

export interface ServiceFormValues {
  name: string;
  description?: string;
  bu?: string;
  type: "fee_mensal" | "projeto" | "hora" | "pacote";
  base_price: string;
  unit: "unidade" | "hora" | "mes" | "pacote" | "projeto";
  margin_pct?: string;
  status: "active" | "draft" | "archived";
  // Campos de precificação
  hours_estimated?: string;
  third_party_cost?: string;
  complexity_multiplier?: string;
  revisions_included?: string;
  min_price?: string;
}

// ── ServiceBasicFields ───────────────────────────────────────────────────────

export function ServiceBasicFields({
  form,
}: {
  form: UseFormReturn<ServiceFormValues>;
}) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Identidade Visual" {...field} />
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
              <Textarea placeholder="Descreva o serviço..." rows={2} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="bu"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Unit</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BU_LIST.map((bu) => (
                    <SelectItem key={bu} value={bu}>{bu}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SERVICE_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}

// ── ServicePricingFields ─────────────────────────────────────────────────────

export function ServicePricingFields({
  form,
}: {
  form: UseFormReturn<ServiceFormValues>;
}) {
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="base_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço Base (R$)</FormLabel>
              <FormControl>
                <Input type="number" min={0} step={0.01} placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidade</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SERVICE_UNIT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="margin_pct"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Margem (%)</FormLabel>
              <FormControl>
                <Input type="number" min={0} max={100} step={0.1} placeholder="30" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Parâmetros do motor de precificação */}
      <div className="border-t pt-3">
        <p className="text-xs font-medium text-muted-foreground mb-3">Parâmetros de Precificação</p>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="hours_estimated"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Horas Estimadas</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step={0.5} placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="third_party_cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Custo Terceiro (R$)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step={100} placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="min_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Preço Mínimo (R$)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step={100} placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="revisions_included"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Revisões Inclusas</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step={1} placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-3">
          <FormField
            control={form.control}
            name="complexity_multiplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Multiplicador de Complexidade</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="1.0× — Padrão" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COMPLEXITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger><SelectValue /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {SERVICE_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

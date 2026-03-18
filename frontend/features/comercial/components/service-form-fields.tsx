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
  { value: "mes", label: "Por Mes" },
  { value: "hora", label: "Por Hora" },
  { value: "pacote", label: "Por Pacote" },
  { value: "unidade", label: "Unidade" },
] as const;

export const SERVICE_STATUS_OPTIONS = [
  { value: "active", label: "Ativo" },
  { value: "draft", label: "Rascunho" },
  { value: "archived", label: "Arquivado" },
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
              <Input placeholder="Ex: Branding Completo" {...field} />
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
            <FormLabel>Descricao</FormLabel>
            <FormControl>
              <Textarea placeholder="Descreva o servico..." rows={3} {...field} />
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
              <FormLabel>Preco Base (R$)</FormLabel>
              <FormControl>
                <Input placeholder="0.00" {...field} />
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
                <Input placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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

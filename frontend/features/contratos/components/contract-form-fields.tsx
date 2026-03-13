"use client";

import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CONTRACT_STATUS,
  CONTRACT_CATEGORY,
  CONTRACT_TYPE,
} from "@/lib/constants";

// ─── Schema & types (exported for use in parent) ──────────────────────

export const contractSchema = z.object({
  title: z.string().min(1, "Titulo obrigatório"),
  description: z.string().optional(),
  type: z.string().min(1),
  category: z.string().min(1),
  status: z.string().min(1),
  person_name: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  monthly_value: z.string().optional(),
});

export type ContractFormData = z.infer<typeof contractSchema>;

export function getEmptyForm(category?: string): ContractFormData {
  return {
    title: "",
    description: "",
    type: category === "equipe" ? "freelancer" : "pj",
    category: category ?? "cliente",
    status: "active",
    person_name: "",
    start_date: "",
    end_date: "",
    monthly_value: "",
  };
}

// ─── Props ────────────────────────────────────────────────────────────

interface ContractFormFieldsProps {
  form: ContractFormData;
  errors: Partial<Record<keyof ContractFormData, string>>;
  isPending: boolean;
  onChange: (field: string, value: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────

export function ContractFormFields({
  form,
  errors,
  isPending,
  onChange,
}: ContractFormFieldsProps) {
  return (
    <>
      {/* Título / Responsável */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Título / Objeto *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="Ex: Contrato Porto Batel"
            disabled={isPending}
          />
          {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="person_name">Responsável / PO</Label>
          <Input
            id="person_name"
            value={form.person_name ?? ""}
            onChange={(e) => onChange("person_name", e.target.value)}
            placeholder="Nome do responsável"
            disabled={isPending}
          />
        </div>
      </div>

      {/* Categoria / Tipo / Status */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select
            value={form.category}
            onValueChange={(v) => onChange("category", v)}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CONTRACT_CATEGORY).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select
            value={form.type}
            onValueChange={(v) => onChange("type", v)}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CONTRACT_TYPE).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) => onChange("status", v)}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CONTRACT_STATUS).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Valor / Datas */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="monthly_value">Valor Mensal (R$)</Label>
          <Input
            id="monthly_value"
            type="number"
            step="0.01"
            value={form.monthly_value ?? ""}
            onChange={(e) => onChange("monthly_value", e.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="start_date">Data Início</Label>
          <Input
            id="start_date"
            type="date"
            value={form.start_date ?? ""}
            onChange={(e) => onChange("start_date", e.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">Data Término</Label>
          <Input
            id="end_date"
            type="date"
            value={form.end_date ?? ""}
            onChange={(e) => onChange("end_date", e.target.value)}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={form.description ?? ""}
          onChange={(e) => onChange("description", e.target.value)}
          rows={2}
          placeholder="Observações sobre o contrato..."
          disabled={isPending}
        />
      </div>
    </>
  );
}

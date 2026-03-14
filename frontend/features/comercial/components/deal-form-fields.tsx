"use client";

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
import { DEAL_STAGES, DEAL_SOURCES } from "@/lib/constants";

export interface DealFormValues {
  name: string;
  company: string;
  contact: string;
  contact_email: string;
  stage: string;
  value: string;
  probability: string;
  expected_close: string;
  owner_name: string;
  source: string;
  priority: string;
  notes: string;
}

interface DealFormFieldsProps {
  form: DealFormValues;
  errors: Partial<Record<keyof DealFormValues, string>>;
  onChange: (field: keyof DealFormValues, value: string) => void;
}

export function DealFormFields({ form, errors, onChange }: DealFormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Deal *</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          required
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company">Empresa</Label>
          <Input
            id="company"
            value={form.company}
            onChange={(e) => onChange("company", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact">Contato</Label>
          <Input
            id="contact"
            value={form.contact}
            onChange={(e) => onChange("contact", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact_email">Email Contato</Label>
          <Input
            id="contact_email"
            type="email"
            value={form.contact_email}
            onChange={(e) => onChange("contact_email", e.target.value)}
          />
          {errors.contact_email && (
            <p className="text-xs text-red-500">{errors.contact_email}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="stage">Etapa</Label>
          <Select value={form.stage} onValueChange={(v) => onChange("stage", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DEAL_STAGES).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>
                  {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="source">Origem</Label>
          <Select value={form.source} onValueChange={(v) => onChange("source", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {DEAL_SOURCES.map((src) => (
                <SelectItem key={src} value={src} className="capitalize">
                  {src.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="value">Valor (R$)</Label>
          <Input
            id="value"
            type="number"
            step="0.01"
            value={form.value}
            onChange={(e) => onChange("value", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="probability">Probabilidade (%)</Label>
          <Input
            id="probability"
            type="number"
            min="0"
            max="100"
            value={form.probability}
            onChange={(e) => onChange("probability", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expected_close">Previsão Fechamento</Label>
          <Input
            id="expected_close"
            type="date"
            value={form.expected_close}
            onChange={(e) => onChange("expected_close", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="owner_name">Responsável</Label>
          <Input
            id="owner_name"
            value={form.owner_name}
            onChange={(e) => onChange("owner_name", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select value={form.priority} onValueChange={(v) => onChange("priority", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          rows={2}
        />
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
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
import { useDealOwners, useCrmStages } from "@/features/comercial/hooks/use-commercial";

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

// ── Owner Combobox ──────────────────────────────────────────────────────────

function OwnerCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { data: owners = [] } = useDealOwners();
  const [isCustom, setIsCustom] = useState(false);

  // If the current value is not in the list, show input mode
  const showInput = isCustom || (value && !owners.includes(value));

  if (showInput) {
    return (
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nome do responsável"
          className="flex-1"
        />
        {owners.length > 0 && (
          <button
            type="button"
            onClick={() => { setIsCustom(false); onChange(""); }}
            className="text-xs text-gray-500 hover:text-gray-700 whitespace-nowrap px-2"
          >
            Escolher existente
          </button>
        )}
      </div>
    );
  }

  return (
    <Select value={value || "__empty__"} onValueChange={(v) => {
      if (v === "__new__") {
        setIsCustom(true);
        onChange("");
      } else if (v === "__empty__") {
        onChange("");
      } else {
        onChange(v);
      }
    }}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__empty__">Sem responsável</SelectItem>
        {owners.map((owner) => (
          <SelectItem key={owner} value={owner}>
            {owner}
          </SelectItem>
        ))}
        <SelectItem value="__new__" className="text-blue-600 font-medium">
          + Novo responsável
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

// ── Stage Select (dynamic from Supabase + fallback to constants) ────────────

function StageSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { data: dbStages = [] } = useCrmStages();

  // Merge: DB stages + DEAL_STAGES constants (dedup by id)
  const allStages = (() => {
    const map = new Map<string, { label: string; order: number }>();

    // Constants first (fallback)
    for (const [key, cfg] of Object.entries(DEAL_STAGES)) {
      map.set(key, { label: cfg.label, order: cfg.order });
    }

    // DB stages override
    for (const s of dbStages) {
      map.set(s.id, { label: s.label, order: s.sort_order });
    }

    return Array.from(map.entries())
      .map(([id, { label, order }]) => ({ id, label, order }))
      .sort((a, b) => a.order - b.order);
  })();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {allStages.map((stage) => (
          <SelectItem key={stage.id} value={stage.id}>
            {stage.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ── Main Form ───────────────────────────────────────────────────────────────

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
          <StageSelect value={form.stage} onChange={(v) => onChange("stage", v)} />
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
          <OwnerCombobox value={form.owner_name} onChange={(v) => onChange("owner_name", v)} />
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

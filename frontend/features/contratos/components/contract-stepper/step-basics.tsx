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
import { CONTRACT_CATEGORY, CONTRACT_TYPE } from "@/lib/constants";
import type { ContractBasicsInput } from "../../schemas/contract-schemas";

interface StepBasicsProps {
  data: ContractBasicsInput;
  onChange: (updates: Partial<ContractBasicsInput>) => void;
  errors?: Record<string, string>;
}

export function StepBasics({ data, onChange, errors }: StepBasicsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">
          Titulo <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Ex: Contrato de Branding - Cliente X"
        />
        {errors?.title && (
          <p className="text-sm text-destructive">{errors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descricao</Label>
        <Textarea
          id="description"
          value={data.description ?? ""}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Detalhes do contrato..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select
            value={data.category ?? ""}
            onValueChange={(v) => onChange({ category: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CONTRACT_CATEGORY).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>
                  {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select
            value={data.type ?? "pj"}
            onValueChange={(v) => onChange({ type: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CONTRACT_TYPE).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>
                  {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="total_value">Valor Total (R$)</Label>
          <Input
            id="total_value"
            type="number"
            min={0}
            step={0.01}
            value={data.total_value ?? 0}
            onChange={(e) =>
              onChange({ total_value: parseFloat(e.target.value) || 0 })
            }
            placeholder="0,00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_date">Inicio</Label>
          <Input
            id="start_date"
            type="date"
            value={data.start_date ?? ""}
            onChange={(e) => onChange({ start_date: e.target.value || null })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">Fim</Label>
          <Input
            id="end_date"
            type="date"
            value={data.end_date ?? ""}
            onChange={(e) => onChange({ end_date: e.target.value || null })}
          />
        </div>
      </div>
    </div>
  );
}

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
import { CLIENT_STATUS } from "@/lib/constants";
import type { z } from "zod";
import type { clientSchema } from "./client-form-dialog";

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormFieldsProps {
  form: ClientFormData & { [key: string]: string };
  errors: Partial<Record<keyof ClientFormData, string>>;
  onChange: (field: string, value: string) => void;
}

export function ClientFormFields({ form, errors, onChange }: ClientFormFieldsProps) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Razao Social *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
            required
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="trading_name">Nome Fantasia</Label>
          <Input
            id="trading_name"
            value={form.trading_name ?? ""}
            onChange={(e) => onChange("trading_name", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            value={form.cnpj ?? ""}
            onChange={(e) => onChange("cnpj", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={form.status} onValueChange={(v) => onChange("status", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CLIENT_STATUS).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>
                  {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact_name">Contato Principal</Label>
          <Input
            id="contact_name"
            value={form.contact_name ?? ""}
            onChange={(e) => onChange("contact_name", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="segment">Segmento</Label>
          <Input
            id="segment"
            value={form.segment ?? ""}
            onChange={(e) => onChange("segment", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={form.email ?? ""}
            onChange={(e) => onChange("email", e.target.value)}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={form.phone ?? ""}
            onChange={(e) => onChange("phone", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Endereço</Label>
        <Input
          id="address"
          value={form.address ?? ""}
          onChange={(e) => onChange("address", e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            value={form.city ?? ""}
            onChange={(e) => onChange("city", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            value={form.state ?? ""}
            onChange={(e) => onChange("state", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sales_owner">Responsável Comercial</Label>
        <Input
          id="sales_owner"
          value={form.sales_owner ?? ""}
          onChange={(e) => onChange("sales_owner", e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="next_action">Próxima Ação</Label>
          <Input
            id="next_action"
            value={form.next_action ?? ""}
            onChange={(e) => onChange("next_action", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="next_action_date">Data Próxima Ação</Label>
          <Input
            id="next_action_date"
            type="date"
            value={form.next_action_date ?? ""}
            onChange={(e) => onChange("next_action_date", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={form.notes ?? ""}
          onChange={(e) => onChange("notes", e.target.value)}
          rows={3}
        />
      </div>
    </>
  );
}

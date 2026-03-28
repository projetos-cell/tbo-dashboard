"use client";

import { useState } from "react";
import { IconUserPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddApproverFormValues {
  name: string;
  email: string;
  deadline: string;
}

interface D3DAddApproverFormProps {
  onSubmit: (values: AddApproverFormValues) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export function D3DAddApproverInlineForm({
  onSubmit,
  onCancel,
  isPending,
}: D3DAddApproverFormProps) {
  const [form, setForm] = useState<AddApproverFormValues>({
    name: "",
    email: "",
    deadline: "",
  });

  return (
    <div className="space-y-2 rounded-xl border border-border/60 bg-card p-4">
      <p className="text-sm font-medium">Novo aprovador</p>
      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="Nome *"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <Input
          placeholder="Email (opcional)"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">
          Prazo (opcional)
        </label>
        <Input
          type="datetime-local"
          value={form.deadline}
          onChange={(e) =>
            setForm((f) => ({ ...f, deadline: e.target.value }))
          }
          className="text-sm"
        />
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onSubmit(form)}
          disabled={!form.name.trim() || isPending}
        >
          Adicionar
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

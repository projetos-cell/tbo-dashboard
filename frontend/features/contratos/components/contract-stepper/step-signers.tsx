"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconPlus, IconTrash, IconUserPlus } from "@tabler/icons-react";
import { SIGNER_ROLE } from "../../schemas/contract-schemas";
import type { SignerInput } from "../../schemas/contract-schemas";

interface StepSignersProps {
  signers: SignerInput[];
  onChange: (signers: SignerInput[]) => void;
}

const emptySigner = (): SignerInput => ({
  name: "",
  email: "",
  cpf: "",
  role: "signer",
});

export function StepSigners({ signers, onChange }: StepSignersProps) {
  const addSigner = () => {
    onChange([...signers, emptySigner()]);
  };

  const removeSigner = (index: number) => {
    onChange(signers.filter((_, i) => i !== index));
  };

  const updateSigner = (index: number, updates: Partial<SignerInput>) => {
    onChange(
      signers.map((s, i) => (i === index ? { ...s, ...updates } : s))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {signers.length}{" "}
          {signers.length === 1 ? "signatario" : "signatarios"}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={addSigner}>
          <IconUserPlus className="h-4 w-4 mr-1" />
          Adicionar Signatario
        </Button>
      </div>

      {signers.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Nenhum signatario adicionado
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSigner}
          >
            <IconUserPlus className="h-4 w-4 mr-1" />
            Adicionar primeiro signatario
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {signers.map((signer, index) => (
          <div
            key={index}
            className="rounded-lg border bg-card p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Signatario #{index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => removeSigner(index)}
              >
                <IconTrash className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nome</Label>
                <Input
                  value={signer.name}
                  onChange={(e) =>
                    updateSigner(index, { name: e.target.value })
                  }
                  placeholder="Nome completo"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">E-mail</Label>
                <Input
                  type="email"
                  value={signer.email}
                  onChange={(e) =>
                    updateSigner(index, { email: e.target.value })
                  }
                  placeholder="email@exemplo.com"
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">CPF (opcional)</Label>
                <Input
                  value={signer.cpf ?? ""}
                  onChange={(e) =>
                    updateSigner(index, { cpf: e.target.value })
                  }
                  placeholder="000.000.000-00"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Papel</Label>
                <Select
                  value={signer.role}
                  onValueChange={(v) =>
                    updateSigner(index, {
                      role: v as SignerInput["role"],
                    })
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SIGNER_ROLE).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>
                        {cfg.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

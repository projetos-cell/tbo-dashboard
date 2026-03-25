"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconTrash,
  IconUserPlus,
  IconBuilding,
  IconUser,
  IconShieldCheck,
} from "@tabler/icons-react";
import { SIGNER_ROLE } from "../../schemas/contract-schemas";
import type { SignerInput } from "../../schemas/contract-schemas";

interface StepSignersProps {
  signers: SignerInput[];
  onChange: (signers: SignerInput[]) => void;
}

const ROLE_ICONS: Record<string, typeof IconBuilding> = {
  contractor: IconBuilding,
  contractee: IconUser,
  signer: IconUser,
  witness: IconShieldCheck,
  approver: IconShieldCheck,
};

const ROLE_COLORS: Record<string, string> = {
  contractor: "bg-blue-500/10 text-blue-700 border-blue-200",
  contractee: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  signer: "bg-gray-500/10 text-gray-700 border-gray-200",
  witness: "bg-amber-500/10 text-amber-700 border-amber-200",
  approver: "bg-purple-500/10 text-purple-700 border-purple-200",
};

function defaultSignerPair(): SignerInput[] {
  return [
    { name: "", email: "", cpf: "", role: "contractor" },
    { name: "", email: "", cpf: "", role: "contractee" },
  ];
}

export function StepSigners({ signers, onChange }: StepSignersProps) {
  // Auto-seed with Contratante + Contratado if empty
  useEffect(() => {
    if (signers.length === 0) {
      onChange(defaultSignerPair());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addSigner = (role: SignerInput["role"] = "witness") => {
    onChange([...signers, { name: "", email: "", cpf: "", role }]);
  };

  const removeSigner = (index: number) => {
    onChange(signers.filter((_, i) => i !== index));
  };

  const updateSigner = (index: number, updates: Partial<SignerInput>) => {
    onChange(
      signers.map((s, i) => (i === index ? { ...s, ...updates } : s))
    );
  };

  const hasContractor = signers.some((s) => s.role === "contractor");
  const hasContractee = signers.some((s) => s.role === "contractee");

  return (
    <div className="space-y-6">
      {/* Header with count and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {signers.length}{" "}
            {signers.length === 1 ? "parte" : "partes"}
          </p>
          {!hasContractor && (
            <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200">
              Falta Contratante
            </Badge>
          )}
          {!hasContractee && (
            <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200">
              Falta Contratado
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addSigner("witness")}
          >
            <IconUserPlus className="h-4 w-4 mr-1" />
            Testemunha
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addSigner("signer")}
          >
            <IconUserPlus className="h-4 w-4 mr-1" />
            Signatario
          </Button>
        </div>
      </div>

      {signers.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Nenhuma parte adicionada
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange(defaultSignerPair())}
          >
            <IconUserPlus className="h-4 w-4 mr-1" />
            Adicionar Contratante e Contratado
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {signers.map((signer, index) => {
          const roleConfig = SIGNER_ROLE[signer.role];
          const RoleIcon = ROLE_ICONS[signer.role] ?? IconUser;
          const colorClass = ROLE_COLORS[signer.role] ?? ROLE_COLORS.signer;
          const isParty = signer.role === "contractor" || signer.role === "contractee";

          return (
            <div
              key={index}
              className={`rounded-lg border p-4 space-y-3 ${
                isParty ? "bg-card border-l-4" : "bg-card"
              }`}
              style={
                isParty
                  ? {
                      borderLeftColor:
                        signer.role === "contractor" ? "#3b82f6" : "#10b981",
                    }
                  : undefined
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RoleIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {roleConfig.label}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${colorClass}`}
                  >
                    {roleConfig.description}
                  </Badge>
                </div>
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
                  <Label className="text-xs">
                    {isParty ? "Nome / Razao Social" : "Nome"}
                  </Label>
                  <Input
                    value={signer.name}
                    onChange={(e) =>
                      updateSigner(index, { name: e.target.value })
                    }
                    placeholder={
                      signer.role === "contractor"
                        ? "Razao social da contratante"
                        : signer.role === "contractee"
                          ? "Nome completo ou razao social"
                          : "Nome completo"
                    }
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
                  <Label className="text-xs">
                    {isParty ? "CPF / CNPJ (opcional)" : "CPF (opcional)"}
                  </Label>
                  <Input
                    value={signer.cpf ?? ""}
                    onChange={(e) =>
                      updateSigner(index, { cpf: e.target.value })
                    }
                    placeholder={isParty ? "CPF ou CNPJ" : "000.000.000-00"}
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
          );
        })}
      </div>
    </div>
  );
}

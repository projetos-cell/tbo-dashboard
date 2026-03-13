"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconBell, IconUserCircle } from "@tabler/icons-react";
import {
  SIGNER_ROLE,
  SIGNER_STATUS,
} from "../schemas/contract-schemas";
import { ContractStatusBadge } from "./contract-status-badge";

interface Signer {
  id: string;
  name: string;
  email: string;
  cpf?: string | null;
  role: string;
  sign_status: string;
  signed_at?: string | null;
}

interface SignersListProps {
  signers: Signer[];
  onNotify?: (signerId: string) => void;
  loading?: boolean;
}

export function SignersList({ signers, onNotify, loading }: SignersListProps) {
  if (signers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <IconUserCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Nenhum signatario adicionado
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border divide-y">
      {signers.map((signer) => {
        const roleConfig = SIGNER_ROLE[signer.role as keyof typeof SIGNER_ROLE];
        const isPending = signer.sign_status === "pending";

        return (
          <div
            key={signer.id}
            className="p-3 flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted shrink-0">
              <IconUserCircle className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{signer.name}</p>
                {roleConfig && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    {roleConfig.label}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {signer.email}
              </p>
              {signer.signed_at && (
                <p className="text-xs text-muted-foreground">
                  Assinado em{" "}
                  {new Date(signer.signed_at).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <ContractStatusBadge
                status={signer.sign_status}
                type="signer"
              />
              {isPending && onNotify && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onNotify(signer.id)}
                  disabled={loading}
                  title="Reenviar notificacao"
                >
                  <IconBell className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ContractStepper } from "@/features/contratos/components/contract-stepper";
import { RequireRole } from "@/features/auth/components/require-role";

export default function NovoContratoPage() {
  return (
    <RequireRole minRole="admin">
    <div className="flex flex-col gap-6 p-6 h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/contratos">
            <IconArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Novo Contrato</h1>
          <p className="text-sm text-muted-foreground">
            Preencha as informacoes do contrato passo a passo
          </p>
        </div>
      </div>

      <ContractStepper />
    </div>
    </RequireRole>
  );
}

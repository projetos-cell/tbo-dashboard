"use client";

import { RBACGuard } from "@/components/rbac-guard";
import { DreSection } from "@/features/financeiro/components/sections/dre-section";

function DreContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">DRE</h1>
        <p className="text-sm text-muted-foreground">
          Demonstrativo de Resultado do Exercício simplificado.
        </p>
      </div>

      <DreSection />
    </div>
  );
}

export default function DrePage() {
  return (
    <RBACGuard minRole="diretoria">
      <DreContent />
    </RBACGuard>
  );
}

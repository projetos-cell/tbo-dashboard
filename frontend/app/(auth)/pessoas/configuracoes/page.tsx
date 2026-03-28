"use client";

import { PeopleAutomationSettings } from "@/features/people/components/people-automation-settings";
import { RBACGuard } from "@/components/rbac-guard";

export default function PessoasConfiguracoes() {
  return (
    <RBACGuard minRole="lider">
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-gray-500">Configurações do módulo de pessoas.</p>
      </div>

      {/* Fase 6 — Automation toggle */}
      <PeopleAutomationSettings />
    </div>
    </RBACGuard>
  );
}

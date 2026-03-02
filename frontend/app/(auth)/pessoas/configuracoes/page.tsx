"use client";

import { PeopleAutomationSettings } from "@/components/people/people-automation-settings";

export default function PessoasConfiguracoes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Configurações do módulo de pessoas.</p>
      </div>

      {/* Fase 6 — Automation toggle */}
      <PeopleAutomationSettings />
    </div>
  );
}

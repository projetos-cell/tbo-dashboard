"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconShield, IconShieldCheck, IconShieldPlus } from "@tabler/icons-react";

interface KpiValues {
  total: number;
  system: number;
  custom: number;
}

interface PermissoesKpiCardsProps {
  kpis: KpiValues;
}

export function PermissoesKpiCards({ kpis }: PermissoesKpiCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Roles</CardTitle>
          <IconShield className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Roles do Sistema</CardTitle>
          <IconShieldCheck className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.system}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Roles Customizadas</CardTitle>
          <IconShieldPlus className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.custom}</div>
        </CardContent>
      </Card>
    </div>
  );
}

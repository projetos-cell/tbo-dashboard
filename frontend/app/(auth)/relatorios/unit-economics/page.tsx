"use client";

import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { IconMathFunction } from "@tabler/icons-react";
import { RequireRole } from "@/features/auth/components/require-role";
import { UnitEconomicsDashboard } from "@/features/relatorios/components/unit-economics-dashboard";

export default function UnitEconomicsPage() {
  return (
    <RequireRole module="relatorios" minRole="admin">
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/relatorios">Relatórios</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Unit Economics</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <IconMathFunction className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Unit Economics</h1>
            <p className="text-sm text-muted-foreground">
              CAC, LTV, Payback Period e métricas de eficiência por colaborador.
            </p>
          </div>
        </div>

        <UnitEconomicsDashboard />
      </div>
    </RequireRole>
  );
}

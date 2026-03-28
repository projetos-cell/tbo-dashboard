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
import { IconArrowsLeftRight } from "@tabler/icons-react";
import { RequireRole } from "@/features/auth/components/require-role";
import { YoYComparisonDashboard } from "@/features/relatorios/components/yoy-comparison-dashboard";

export default function YoYPage() {
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
              <BreadcrumbPage>Comparativo Anual</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <IconArrowsLeftRight className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Comparativo Anual (YoY)</h1>
            <p className="text-sm text-muted-foreground">
              Evolução das métricas principais comparando {new Date().getFullYear()} vs{" "}
              {new Date().getFullYear() - 1}.
            </p>
          </div>
        </div>

        <YoYComparisonDashboard />
      </div>
    </RequireRole>
  );
}

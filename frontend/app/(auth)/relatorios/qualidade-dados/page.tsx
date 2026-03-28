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
import { IconShieldCheck } from "@tabler/icons-react";
import { RequireRole } from "@/features/auth/components/require-role";
import { DataQualityDashboard } from "@/features/relatorios/components/data-quality-dashboard";

export default function QualidadeDadosPage() {
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
              <BreadcrumbPage>Qualidade de Dados</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <IconShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Qualidade de Dados</h1>
            <p className="text-sm text-muted-foreground">
              Score de completude por módulo. Identifique lacunas nos dados críticos.
            </p>
          </div>
        </div>

        <DataQualityDashboard />
      </div>
    </RequireRole>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  IconPlus,
  IconChartBar,
  IconDots,
  IconTrash,
  IconEye,
  IconShare,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { RequireRole } from "@/features/auth/components/require-role";
import { EmptyState } from "@/components/shared/empty-state";
import {
  useBIDashboards,
  useCreateBIDashboard,
  useDeleteBIDashboard,
} from "@/features/relatorios/hooks/use-reports";
import { useAuthStore } from "@/stores/auth-store";
import type { BIDashboard } from "@/features/relatorios/services/bi-dashboards";

// ── Create Dialog ─────────────────────────────────────────────────────────────

function CreateDashboardDialog({ onCreated }: { onCreated?: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const createDashboard = useCreateBIDashboard();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Informe um nome para o dashboard.");
      return;
    }

    const result = await createDashboard.mutateAsync({
      name,
      description: description || undefined,
    });

    toast.success("Dashboard criado.");
    setOpen(false);
    setName("");
    setDescription("");
    onCreated?.(result.id);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          Novo Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Dashboard BI</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Dashboard de Receita"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição (opcional)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição breve do dashboard"
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={createDashboard.isPending}
            className="w-full"
          >
            {createDashboard.isPending && (
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Criar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Dashboard Card ────────────────────────────────────────────────────────────

function DashboardCard({ dashboard }: { dashboard: BIDashboard }) {
  const deleteDashboard = useDeleteBIDashboard();

  const handleDelete = async () => {
    if (!confirm(`Deletar "${dashboard.name}"?`)) return;
    await deleteDashboard.mutateAsync(dashboard.id);
    toast.success("Dashboard removido.");
  };

  return (
    <Card className="group transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary/10 p-1.5">
              <IconChartBar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{dashboard.name}</CardTitle>
              {dashboard.is_shared && (
                <Badge variant="secondary" className="mt-0.5 text-xs">
                  Compartilhado
                </Badge>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <IconDots className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/relatorios/bi/${dashboard.id}`}>
                  <IconEye className="mr-2 h-4 w-4" />
                  Visualizar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Deletar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        {dashboard.description && (
          <p className="mb-3 text-xs text-muted-foreground line-clamp-2">
            {dashboard.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {new Date(dashboard.created_at).toLocaleDateString("pt-BR")}
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href={`/relatorios/bi/${dashboard.id}`}>
              <IconEye className="mr-1.5 h-3.5 w-3.5" />
              Abrir
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function BIDashboardsPage() {
  const { data: dashboards = [], isLoading } = useBIDashboards();

  return (
    <RequireRole module="relatorios" minRole="lider">
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
              <BreadcrumbPage>BI Dashboards</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <IconChartBar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">BI Dashboards</h1>
              <p className="text-sm text-muted-foreground">
                Crie dashboards personalizados com widgets e métricas de todos os módulos.
              </p>
            </div>
          </div>
          <CreateDashboardDialog />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="h-36 animate-pulse bg-muted" />
            ))}
          </div>
        ) : dashboards.length === 0 ? (
          <EmptyState
            title="Nenhum dashboard criado"
            description="Crie seu primeiro dashboard BI para visualizar métricas dos seus módulos."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dashboards.map((d) => (
              <DashboardCard key={d.id} dashboard={d} />
            ))}
          </div>
        )}
      </div>
    </RequireRole>
  );
}

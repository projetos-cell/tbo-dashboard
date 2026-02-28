"use client";

import { use } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  User,
  Building2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProject, useProjectDemands } from "@/hooks/use-projects";
import { useUser } from "@/hooks/use-user";
import { PROJECT_STATUS, BU_COLORS, type ProjectStatusKey } from "@/lib/constants";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // Initialize user/tenant
  useUser();

  const { data: project, isLoading, error } = useProject(id);
  const { data: demands, isLoading: demandsLoading } = useProjectDemands(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-destructive text-lg font-medium">
          Projeto nao encontrado
        </p>
        <Link href="/projetos">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        </Link>
      </div>
    );
  }

  const status = PROJECT_STATUS[project.status as ProjectStatusKey];
  const busList = parseBus(project.bus);

  return (
    <div className="space-y-6">
      {/* Back + title */}
      <div className="flex items-start gap-4">
        <Link href="/projetos">
          <Button variant="ghost" size="icon" className="mt-0.5">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight truncate">
              {project.name}
            </h1>
            {status && (
              <Badge
                style={{ backgroundColor: status.bg, color: status.color }}
              >
                {status.label}
              </Badge>
            )}
          </div>
          {project.code && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {project.code}
            </p>
          )}
        </div>
        {project.notion_url && (
          <a
            href={project.notion_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-1" />
              Notion
            </Button>
          </a>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visao Geral</TabsTrigger>
          <TabsTrigger value="demands">
            Demandas{" "}
            {demands && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({demands.length})
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Info card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informacoes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.construtora && (
                  <InfoRow
                    icon={Building2}
                    label="Construtora"
                    value={project.construtora}
                  />
                )}
                {project.owner_name && (
                  <InfoRow
                    icon={User}
                    label="Responsavel"
                    value={project.owner_name}
                  />
                )}
                {project.due_date_start && (
                  <InfoRow
                    icon={Calendar}
                    label="Inicio"
                    value={format(
                      new Date(project.due_date_start),
                      "dd MMM yyyy",
                      { locale: ptBR }
                    )}
                  />
                )}
                {project.due_date_end && (
                  <InfoRow
                    icon={Calendar}
                    label="Prazo"
                    value={format(
                      new Date(project.due_date_end),
                      "dd MMM yyyy",
                      { locale: ptBR }
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* BUs card */}
            {busList.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Business Units
                  </CardTitle>
                  <CardDescription>
                    Areas envolvidas no projeto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {busList.map((bu) => {
                      const buColor = BU_COLORS[bu];
                      return (
                        <Badge
                          key={bu}
                          variant="outline"
                          style={
                            buColor
                              ? {
                                  backgroundColor: buColor.bg,
                                  color: buColor.color,
                                  borderColor: "transparent",
                                }
                              : undefined
                          }
                        >
                          {bu}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="demands">
          {demandsLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : !demands || demands.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">
                  Nenhuma demanda vinculada a este projeto.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titulo</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Responsavel
                    </TableHead>
                    <TableHead className="hidden md:table-cell w-[110px]">
                      Prazo
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demands.map((demand) => (
                    <TableRow key={demand.id}>
                      <TableCell className="font-medium">
                        {demand.title}
                        {demand.notion_url && (
                          <a
                            href={demand.notion_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 inline-flex text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {demand.status || "Sem status"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {demand.responsible || "—"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {demand.due_date
                          ? format(
                              new Date(demand.due_date),
                              "dd MMM yyyy",
                              { locale: ptBR }
                            )
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}

function parseBus(raw: string | string[] | null): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [raw];
  } catch {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

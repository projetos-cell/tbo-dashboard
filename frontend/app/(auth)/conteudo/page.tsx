"use client";

import { useState, useMemo } from "react";
import { RequireRole } from "@/components/auth/require-role";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Search,
  Plus,
  PenLine,
  Calendar,
  Layers,
} from "lucide-react";
import { usePages, usePageStats } from "@/hooks/use-conteudo";
import { ErrorState } from "@/components/shared";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "--";
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

function ConteudoContent() {
  const [search, setSearch] = useState("");
  const { data: pages, isLoading, error, refetch } = usePages();
  const { data: stats, isLoading: statsLoading } = usePageStats();

  const filteredPages = useMemo(() => {
    if (!pages) return [];
    if (!search) return pages;
    const q = search.toLowerCase();
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.icon ?? "").toLowerCase().includes(q)
    );
  }, [pages, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Conteudo & Paginas
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie paginas e documentos do workspace.
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Nova Pagina
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Paginas</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Skeleton className="h-7 w-12" /> : stats?.total ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Blocos</CardTitle>
            <Layers className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Skeleton className="h-7 w-12" /> : stats?.withBlocks ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resultados</CardTitle>
            <Search className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-7 w-12" /> : filteredPages.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar paginas por titulo..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Pages Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="p-4">
              <ErrorState message={error.message} onRetry={() => refetch()} />
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <PenLine className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">
                {search ? "Nenhuma pagina encontrada" : "Nenhuma pagina cadastrada"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {search
                  ? "Tente buscar com outros termos."
                  : "Crie paginas para organizar o conteudo do seu workspace."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titulo</TableHead>
                  <TableHead>Espaco</TableHead>
                  <TableHead>Blocos</TableHead>
                  <TableHead>Atualizado em</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {page.icon && <span>{page.icon}</span>}
                        {page.title || "Sem titulo"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {page.space_id ? (
                        <Badge variant="outline" className="text-xs">
                          {page.space_id.substring(0, 8)}
                        </Badge>
                      ) : (
                        "--"
                      )}
                    </TableCell>
                    <TableCell>
                      {page.has_blocks ? (
                        <Badge variant="secondary">Sim</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Nao</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(page.updated_at)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(page.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConteudoPage() {
  return (
    <RequireRole module="conteudo">
      <ConteudoContent />
    </RequireRole>
  );
}

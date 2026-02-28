"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Plus,
  Search,
  BookOpen,
  CalendarDays,
  BarChart3,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RequireRole } from "@/components/auth/require-role";
import {
  useMarketResearch,
  useMarketSources,
  useDeleteResearch,
} from "@/hooks/use-mercado";
import { computeMercadoKPIs } from "@/services/mercado";
import type { Database } from "@/lib/supabase/types";

type MarketResearchRow = Database["public"]["Tables"]["market_research"]["Row"];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  rascunho: "bg-gray-100 text-gray-800",
  published: "bg-green-100 text-green-800",
  publicado: "bg-green-100 text-green-800",
  archived: "bg-yellow-100 text-yellow-800",
  arquivado: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  em_andamento: "bg-blue-100 text-blue-800",
};

const CATEGORY_COLORS: Record<string, string> = {
  competitor: "bg-red-100 text-red-800",
  concorrente: "bg-red-100 text-red-800",
  trend: "bg-purple-100 text-purple-800",
  tendencia: "bg-purple-100 text-purple-800",
  market: "bg-blue-100 text-blue-800",
  mercado: "bg-blue-100 text-blue-800",
  technology: "bg-cyan-100 text-cyan-800",
  tecnologia: "bg-cyan-100 text-cyan-800",
};

export default function MercadoPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedResearch, setSelectedResearch] =
    useState<MarketResearchRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Queries
  const { data: research = [], isLoading } = useMarketResearch({
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: search || undefined,
  });

  const { data: allResearch = [] } = useMarketResearch();
  const { data: sources = [] } = useMarketSources(
    selectedResearch?.id ?? null
  );

  // Mutations
  const deleteResearchMutation = useDeleteResearch();

  // KPIs
  const kpis = useMemo(
    () => computeMercadoKPIs(allResearch),
    [allResearch]
  );

  function handleSelectResearch(r: MarketResearchRow) {
    setSelectedResearch(r);
    setDetailOpen(true);
  }

  return (
    <RequireRole module="mercado">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Inteligencia de Mercado
          </h1>
          <p className="text-sm text-muted-foreground">
            Pesquisas, analises e fontes de inteligencia competitiva.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pesquisas</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalResearch}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.thisMonth}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Por Status</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(kpis.byStatus).map(([status, count]) => (
                  <Badge
                    key={status}
                    variant="secondary"
                    className={STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800"}
                  >
                    {status}: {count}
                  </Badge>
                ))}
                {Object.keys(kpis.byStatus).length === 0 && (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pesquisas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="competitor">Concorrente</SelectItem>
              <SelectItem value="trend">Tendencia</SelectItem>
              <SelectItem value="market">Mercado</SelectItem>
              <SelectItem value="technology">Tecnologia</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="published">Publicado</SelectItem>
              <SelectItem value="archived">Arquivado</SelectItem>
            </SelectContent>
          </Select>
          <Button className="shrink-0">
            <Plus className="mr-1.5 h-4 w-4" />
            Nova Pesquisa
          </Button>
        </div>

        {/* Research Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        ) : research.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Nenhuma pesquisa encontrada.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {research.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => handleSelectResearch(item)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    {item.category && (
                      <Badge
                        variant="secondary"
                        className={
                          CATEGORY_COLORS[item.category] ??
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {item.category}
                      </Badge>
                    )}
                    {item.status && (
                      <Badge
                        variant="secondary"
                        className={
                          STATUS_COLORS[item.status] ??
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {item.status}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base line-clamp-2">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {item.description ?? "Sem descricao"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {item.created_at
                        ? format(new Date(item.created_at), "dd/MM/yyyy", {
                            locale: ptBR,
                          })
                        : "-"}
                    </span>
                    {item.tags && item.tags.length > 0 && (
                      <span className="truncate ml-2">
                        {item.tags.slice(0, 2).join(", ")}
                        {item.tags.length > 2 && ` +${item.tags.length - 2}`}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Detail Sheet */}
        <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
          <SheetContent className="sm:max-w-lg overflow-y-auto">
            {selectedResearch && (
              <>
                <SheetHeader>
                  <SheetTitle>{selectedResearch.title}</SheetTitle>
                  <SheetDescription>
                    {selectedResearch.description ?? "Sem descricao"}
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2">
                    {selectedResearch.category && (
                      <Badge
                        variant="secondary"
                        className={
                          CATEGORY_COLORS[selectedResearch.category] ??
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {selectedResearch.category}
                      </Badge>
                    )}
                    {selectedResearch.status && (
                      <Badge
                        variant="secondary"
                        className={
                          STATUS_COLORS[selectedResearch.status] ??
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {selectedResearch.status}
                      </Badge>
                    )}
                  </div>

                  {selectedResearch.tags && selectedResearch.tags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedResearch.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    Criado em:{" "}
                    {selectedResearch.created_at
                      ? format(
                          new Date(selectedResearch.created_at),
                          "dd/MM/yyyy HH:mm",
                          { locale: ptBR }
                        )
                      : "-"}
                  </div>

                  {selectedResearch.published_at && (
                    <div className="text-sm text-muted-foreground">
                      Publicado em:{" "}
                      {format(
                        new Date(selectedResearch.published_at),
                        "dd/MM/yyyy HH:mm",
                        { locale: ptBR }
                      )}
                    </div>
                  )}

                  {/* Sources */}
                  <div>
                    <p className="text-sm font-semibold mb-2">
                      Fontes ({sources.length})
                    </p>
                    {sources.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma fonte cadastrada.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {sources.map((source) => (
                          <div
                            key={source.id}
                            className="flex items-start justify-between rounded-md border p-3"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">
                                {source.title}
                              </p>
                              {source.source_type && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {source.source_type}
                                </Badge>
                              )}
                              {source.notes && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {source.notes}
                                </p>
                              )}
                            </div>
                            {source.url && (
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 shrink-0 text-muted-foreground hover:text-foreground"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        deleteResearchMutation.mutate(selectedResearch.id, {
                          onSuccess: () => setDetailOpen(false),
                        });
                      }}
                    >
                      <Trash2 className="mr-1.5 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </RequireRole>
  );
}

"use client";

import { useState, useMemo } from "react";
import { IconTool, IconSearch, IconInfoCircle, IconCheck } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FERRAMENTAS_CATEGORIAS,
  FERRAMENTAS_BOAS_PRATICAS,
} from "@/features/cultura/data/cultura-notion-seed";

export default function FerramentasPage() {
  const [search, setSearch] = useState("");

  const filteredCategorias = useMemo(() => {
    if (!search.trim()) return FERRAMENTAS_CATEGORIAS;
    const q = search.toLowerCase();
    return FERRAMENTAS_CATEGORIAS.map((cat) => ({
      ...cat,
      tools: cat.tools.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.tools.length > 0);
  }, [search]);

  const totalTools = FERRAMENTAS_CATEGORIAS.reduce(
    (acc, cat) => acc + cat.tools.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <IconTool className="size-5" />
            Guia de Ferramentas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ferramentas oficiais e boas praticas de uso
          </p>
        </div>
        <Badge variant="secondary">{totalTools} ferramentas</Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar ferramentas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      {/* Boas Praticas */}
      {!search.trim() && (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <IconInfoCircle className="size-4 text-blue-600 dark:text-blue-400" />
              Boas Praticas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-1.5">
              {FERRAMENTAS_BOAS_PRATICAS.map((pratica, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <IconCheck className="size-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <span>{pratica}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      {filteredCategorias.length > 0 ? (
        filteredCategorias.map((cat) => (
          <section key={cat.id} className="space-y-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <span>{cat.emoji}</span>
              {cat.name}
              <Badge variant="outline" className="text-xs font-normal">
                {cat.tools.length}
              </Badge>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cat.tools.map((tool) => (
                <Card key={tool.name} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium">{tool.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tool.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <IconTool className="size-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhuma ferramenta encontrada para &ldquo;{search}&rdquo;</p>
        </div>
      )}
    </div>
  );
}

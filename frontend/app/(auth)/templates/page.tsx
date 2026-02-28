"use client";

import { useState, useMemo } from "react";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TemplatesGrid } from "@/components/templates/templates-grid";
import { TemplateDetail } from "@/components/templates/template-detail";
import { useTemplates, useDeleteTemplate } from "@/hooks/use-templates";
import { TEMPLATE_TYPES } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type TemplateRow = Database["public"]["Tables"]["dynamic_templates"]["Row"];

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateRow | null>(
    null
  );
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: templates = [], isLoading } = useTemplates();
  const deleteTemplate = useDeleteTemplate();

  const filtered = useMemo(() => {
    let result = templates;

    if (typeFilter) {
      result = result.filter((t) => t.type === typeFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q))
      );
    }

    return result;
  }, [templates, typeFilter, search]);

  function handleSelect(template: TemplateRow) {
    setSelectedTemplate(template);
    setDetailOpen(true);
  }

  function handleDelete(template: TemplateRow) {
    deleteTemplate.mutate(template.id);
  }

  function clearFilters() {
    setSearch("");
    setTypeFilter("");
  }

  const hasFilters = search !== "" || typeFilter !== "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie modelos reutilizaveis para documentos, emails e propostas.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Template
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, descricao ou categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TEMPLATE_TYPES).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      {/* Stats line */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} de {templates.length} templates
      </p>

      {/* Loading state */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-lg" />
          ))}
        </div>
      ) : (
        <TemplatesGrid
          templates={filtered}
          isLoading={false}
          onSelect={handleSelect}
          onDelete={handleDelete}
        />
      )}

      {/* Detail drawer */}
      <TemplateDetail
        template={selectedTemplate}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}

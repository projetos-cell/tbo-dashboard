"use client";

import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChangelogList } from "@/components/changelog/changelog-list";
import { ChangelogForm } from "@/components/changelog/changelog-form";
import {
  useChangelog,
  useCreateChangelog,
  useUpdateChangelog,
  useDeleteChangelog,
} from "@/hooks/use-changelog";
import {
  CHANGELOG_TAGS,
  NAV_ITEMS,
  type ChangelogTagKey,
} from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type ChangelogRow = Database["public"]["Tables"]["changelog_entries"]["Row"];

export default function ChangelogPage() {
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ChangelogRow | null>(null);

  const { data: entries = [], isLoading } = useChangelog();
  const createChangelog = useCreateChangelog();
  const updateChangelog = useUpdateChangelog();
  const deleteChangelog = useDeleteChangelog();

  const filtered = useMemo(() => {
    let result = entries;

    if (tagFilter) {
      result = result.filter((e) => e.tag === tagFilter);
    }

    if (moduleFilter) {
      result = result.filter((e) => e.module === moduleFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.version.toLowerCase().includes(q)
      );
    }

    return result;
  }, [entries, tagFilter, moduleFilter, search]);

  function handleNew() {
    setEditingEntry(null);
    setFormOpen(true);
  }

  function handleEdit(entry: ChangelogRow) {
    setEditingEntry(entry);
    setFormOpen(true);
  }

  function handleDelete(entry: ChangelogRow) {
    if (!confirm(`Excluir a entrada "${entry.title}"?`)) return;
    deleteChangelog.mutate(entry.id);
  }

  async function handleSave(data: {
    version: string;
    title: string;
    description: string;
    tag: string | null;
    module: string | null;
    published_at: string;
    author: string | null;
  }) {
    if (editingEntry) {
      await updateChangelog.mutateAsync({
        id: editingEntry.id,
        updates: data,
      });
    } else {
      await createChangelog.mutateAsync(data);
    }
  }

  // Collect unique modules present in entries for filter
  const usedModules = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      if (e.module) set.add(e.module);
    });
    return Array.from(set);
  }, [entries]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Changelog</h1>
          <p className="text-sm text-muted-foreground">
            Historico de atualizacoes e mudancas da plataforma.
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Entrada
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por titulo, versao..."
            className="pl-9"
          />
        </div>

        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todas as tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as tags</SelectItem>
            {(
              Object.entries(CHANGELOG_TAGS) as [
                ChangelogTagKey,
                (typeof CHANGELOG_TAGS)[ChangelogTagKey],
              ][]
            ).map(([key, def]) => (
              <SelectItem key={key} value={key}>
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ backgroundColor: def.color }}
                  />
                  {def.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos os modulos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os modulos</SelectItem>
            {usedModules.map((mod) => {
              const nav = NAV_ITEMS.find((n) => n.module === mod);
              return (
                <SelectItem key={mod} value={mod}>
                  {nav?.label || mod}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {(tagFilter || moduleFilter || search) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTagFilter("");
              setModuleFilter("");
              setSearch("");
            }}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Stats */}
      {!isLoading && entries.length > 0 && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            {filtered.length} de {entries.length} entradas
          </span>
          {(
            Object.entries(CHANGELOG_TAGS) as [
              ChangelogTagKey,
              (typeof CHANGELOG_TAGS)[ChangelogTagKey],
            ][]
          ).map(([key, def]) => {
            const count = entries.filter((e) => e.tag === key).length;
            if (count === 0) return null;
            return (
              <Badge
                key={key}
                variant="outline"
                className="text-[10px] cursor-pointer"
                style={{
                  backgroundColor: tagFilter === key ? def.bg : undefined,
                  color: def.color,
                  borderColor: def.color,
                }}
                onClick={() =>
                  setTagFilter(tagFilter === key ? "" : key)
                }
              >
                {def.label}: {count}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Timeline */}
      <ChangelogList
        entries={filtered}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Form dialog */}
      <ChangelogForm
        open={formOpen}
        onOpenChange={setFormOpen}
        entry={editingEntry}
        onSave={handleSave}
      />
    </div>
  );
}

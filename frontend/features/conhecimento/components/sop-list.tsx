"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconBookmark,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import { useSops } from "../hooks/use-sops";
import { SOPCard } from "./sop-card";
import {
  SOP_BU_CONFIG,
  SOP_STATUS_CONFIG,
  SOP_CATEGORY_CONFIG,
  type SOPBu,
  type SOPStatus,
  type SOPCategory,
} from "../types/sops";

interface SOPListProps {
  bu: SOPBu;
  onCreateNew?: () => void;
}

export function SOPList({ bu, onCreateNew }: SOPListProps) {
  const router = useRouter();
  const { data: sops, isLoading } = useSops(bu);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SOPStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<SOPCategory | "all">("all");

  const buConfig = SOP_BU_CONFIG[bu];

  const filtered = (sops ?? []).filter((sop) => {
    if (search) {
      const q = search.toLowerCase();
      const matchesSearch =
        sop.title.toLowerCase().includes(q) ||
        sop.description?.toLowerCase().includes(q) ||
        sop.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }
    if (statusFilter !== "all" && sop.status !== statusFilter) return false;
    if (categoryFilter !== "all" && sop.category !== categoryFilter) return false;
    return true;
  });

  const publishedCount = (sops ?? []).filter((s) => s.status === "published").length;
  const draftCount = (sops ?? []).filter((s) => s.status === "draft").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <span
              className="inline-block size-3 rounded-full"
              style={{ backgroundColor: buConfig.color }}
            />
            SOPs — {buConfig.label}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {publishedCount} publicados &middot; {draftCount} rascunhos
          </p>
        </div>
        <RequireRole minRole="lider">
          <Button size="sm" onClick={onCreateNew}>
            <IconPlus className="size-4 mr-1" />
            Novo SOP
          </Button>
        </RequireRole>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar SOPs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as SOPStatus | "all")}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            {Object.entries(SOP_STATUS_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>
                {cfg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v as SOPCategory | "all")}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {Object.entries(SOP_CATEGORY_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>
                {cfg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[140px] rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={IconBookmark}
          title={search ? "Nenhum SOP encontrado" : "Nenhum SOP cadastrado"}
          description={
            search
              ? "Tente buscar com outros termos."
              : `Comece criando o primeiro SOP de ${buConfig.label}.`
          }
          cta={
            !search && onCreateNew
              ? { label: "Criar primeiro SOP", onClick: onCreateNew }
              : undefined
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((sop) => (
            <SOPCard
              key={sop.id}
              sop={sop}
              href={`/conhecimento/sops/${bu}/${sop.slug}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

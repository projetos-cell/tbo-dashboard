"use client";

import { useState, useCallback, useMemo } from "react";
import {
  IconSearch,
  IconUsers,
  IconGitBranch,
  IconBuilding,
  IconStack,
  IconZoomIn,
  IconZoomOut,
  IconArrowsMaximize,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrgTreeNode } from "@/features/people/components/org-tree-node";
import type { OrgChartNode } from "@/features/people/services/org-chart";

// ---------------------------------------------------------------------------
// OrgChart — Main component (classic top-down tree)
// ---------------------------------------------------------------------------

interface OrgChartProps {
  tree: OrgChartNode[];
  flat: OrgChartNode[];
  onNodeClick?: (nodeId: string) => void;
}

export function OrgChart({ tree, flat, onNodeClick }: OrgChartProps) {
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const ids = new Set<string>();
    function addIds(nodes: OrgChartNode[], depth: number) {
      for (const node of nodes) {
        ids.add(node.id);
        if (depth < 2) addIds(node.children, depth + 1);
      }
    }
    addIds(tree, 0);
    return ids;
  });
  const [zoom, setZoom] = useState(1);

  // Search filter
  const matchingIds = useMemo(() => {
    if (!search.trim()) return null;
    const term = search.toLowerCase();
    const matches = new Set<string>();
    for (const node of flat) {
      if (
        node.full_name?.toLowerCase().includes(term) ||
        node.cargo?.toLowerCase().includes(term) ||
        node.bu?.toLowerCase().includes(term) ||
        node.department?.toLowerCase().includes(term)
      ) {
        matches.add(node.id);
      }
    }
    return matches;
  }, [search, flat]);

  // Auto-expand ancestors of matching nodes
  const searchExpandedIds = useMemo(() => {
    if (!matchingIds || matchingIds.size === 0) return null;
    const ids = new Set<string>();
    const parentMap = new Map<string, string>();
    for (const node of flat) {
      if (node.manager_id) parentMap.set(node.id, node.manager_id);
    }
    for (const id of matchingIds) {
      let current = id;
      while (current) {
        ids.add(current);
        const parent = parentMap.get(current);
        if (!parent) break;
        current = parent;
      }
    }
    return ids;
  }, [matchingIds, flat]);

  const effectiveExpanded = searchExpandedIds ?? expandedIds;

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedIds(new Set(flat.map((n) => n.id)));
  }, [flat]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set(tree.map((r) => r.id)));
  }, [tree]);

  const totalPeople = flat.length;
  const managers = new Set(flat.filter((n) => n.children.length > 0).map((n) => n.id)).size;
  const departments = [...new Set(flat.map((n) => n.bu).filter(Boolean))];

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={IconUsers} label="Total" value={totalPeople} />
        <StatCard icon={IconGitBranch} label="Gestores" value={managers} />
        <StatCard icon={IconBuilding} label="Áreas" value={departments.length} />
        <StatCard icon={IconStack} label="Níveis" value={getMaxDepth(tree, 0)} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, cargo ou área..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expandir tudo
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Recolher
          </Button>
        </div>
        <div className="flex items-center gap-1 border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
          >
            <IconZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-gray-500 w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
          >
            <IconZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom(1)}
          >
            <IconArrowsMaximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search results count */}
      {matchingIds && (
        <p className="text-xs text-gray-500">
          {matchingIds.size === 0
            ? "Nenhum resultado encontrado"
            : `${matchingIds.size} pessoa${matchingIds.size > 1 ? "s" : ""} encontrada${matchingIds.size > 1 ? "s" : ""}`}
        </p>
      )}

      {/* Tree */}
      <div
        className="overflow-auto rounded-lg border bg-gray-50/50 p-8"
        style={{ minHeight: 300 }}
      >
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
        >
          {tree.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <IconUsers className="h-10 w-10 mb-2" />
              <p className="text-sm">Nenhum colaborador encontrado</p>
            </div>
          ) : (
            <ul className="org-tree flex justify-center gap-0">
              {tree.map((node) => (
                <OrgTreeNode
                  key={node.id}
                  node={node}
                  expandedIds={effectiveExpanded}
                  onToggle={toggleExpand}
                  matchingIds={matchingIds}
                  onNodeClick={onNodeClick}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

    </div>
  );
}

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100">
          <Icon className="h-4 w-4 text-gray-500" />
        </div>
        <div>
          <p className="text-lg font-semibold">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getMaxDepth(nodes: OrgChartNode[], currentDepth: number): number {
  if (nodes.length === 0) return currentDepth;
  return Math.max(
    ...nodes.map((n) => getMaxDepth(n.children, currentDepth + 1))
  );
}

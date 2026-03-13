"use client";

import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PEOPLE_STATUS, BU_COLORS } from "@/lib/constants";
import { cn, getInitials } from "@/lib/utils";
import type { OrgChartNode } from "@/features/people/services/org-chart";

// ---------------------------------------------------------------------------
// OrgTreeNode — Recursive tree node
// ---------------------------------------------------------------------------

export interface OrgTreeNodeProps {
  node: OrgChartNode;
  depth: number;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  matchingIds: Set<string> | null;
  onNodeClick?: (nodeId: string) => void;
}

export function OrgTreeNode({
  node,
  depth,
  expandedIds,
  onToggle,
  matchingIds,
  onNodeClick,
}: OrgTreeNodeProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isMatch = matchingIds?.has(node.id) ?? false;
  const isDimmed = matchingIds !== null && !isMatch;
  const statusCfg = PEOPLE_STATUS[node.status as keyof typeof PEOPLE_STATUS];
  const buColor = node.bu ? BU_COLORS[node.bu] : undefined;

  return (
    <div>
      {/* Node card */}
      <div
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors",
          "hover:bg-white/80",
          onNodeClick && "cursor-pointer",
          isMatch && "bg-yellow-50 ring-1 ring-yellow-200",
          isDimmed && "opacity-40"
        )}
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
        onClick={() => onNodeClick?.(node.id)}
      >
        {/* Expand/collapse toggle */}
        <button
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded text-gray-400 hover:text-gray-600",
            !hasChildren && "invisible"
          )}
          onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
        >
          {hasChildren &&
            (isExpanded ? (
              <IconChevronDown className="h-3.5 w-3.5" />
            ) : (
              <IconChevronRight className="h-3.5 w-3.5" />
            ))}
        </button>

        {/* Avatar */}
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={node.avatar_url ?? undefined} />
          <AvatarFallback className="text-[10px] font-medium">
            {getInitials(node.full_name ?? "?")}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-gray-900">
              {node.full_name ?? "Sem nome"}
            </span>
            {hasChildren && (
              <span className="shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                {node.children.length}
              </span>
            )}
          </div>
          <p className="truncate text-xs text-gray-500">
            {node.cargo ?? "—"}
          </p>
        </div>

        {/* Badges */}
        <div className="flex shrink-0 items-center gap-1.5">
          {node.bu && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0"
              style={
                buColor
                  ? { backgroundColor: buColor.bg, color: buColor.color }
                  : undefined
              }
            >
              {node.bu}
            </Badge>
          )}
          {statusCfg && node.status !== "active" && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0"
              style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
            >
              {statusCfg.label}
            </Badge>
          )}
          {node.is_coordinator && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 bg-violet-50 text-violet-600"
            >
              Gestor
            </Badge>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="relative ml-4 border-l border-gray-200">
          {node.children.map((child) => (
            <OrgTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggle={onToggle}
              matchingIds={matchingIds}
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

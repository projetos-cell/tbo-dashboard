"use client";

import { memo } from "react";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PEOPLE_STATUS, BU_COLORS } from "@/lib/constants";
import { cn, getInitials } from "@/lib/utils";
import type { OrgChartNode } from "@/features/people/services/org-chart";

export interface OrgTreeNodeProps {
  node: OrgChartNode;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  matchingIds: Set<string> | null;
  onNodeClick?: (nodeId: string) => void;
}

export const OrgTreeNode = memo(function OrgTreeNode({
  node,
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
    <li className="flex flex-col items-center relative">
      {/* Node card */}
      <div
        className={cn(
          "relative flex flex-col items-center gap-1.5 rounded-lg border bg-white px-4 py-3 shadow-sm transition-all",
          "min-w-[160px] max-w-[200px] cursor-pointer hover:shadow-md",
          isMatch && "ring-2 ring-yellow-300 bg-yellow-50",
          isDimmed && "opacity-40"
        )}
        onClick={() => onNodeClick?.(node.id)}
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={node.avatar_url ?? undefined} />
          <AvatarFallback className="text-xs font-medium">
            {getInitials(node.full_name ?? "?")}
          </AvatarFallback>
        </Avatar>

        <div className="text-center min-w-0 w-full">
          <p className="truncate text-sm font-semibold text-gray-900">
            {node.full_name ?? "Sem nome"}
          </p>
          <p className="truncate text-xs text-gray-500">
            {node.cargo ?? "—"}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-1">
          {statusCfg && node.status !== "active" && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0"
              style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
            >
              {statusCfg.label}
            </Badge>
          )}
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
          {node.is_coordinator && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 bg-violet-50 text-violet-600"
            >
              Gestor
            </Badge>
          )}
        </div>

        {/* Expand/collapse button */}
        {hasChildren && (
          <button
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 flex h-5 w-5 items-center justify-center rounded-full border bg-white text-gray-400 shadow-sm hover:text-gray-700 hover:bg-gray-50"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
          >
            {isExpanded ? (
              <IconChevronDown className="h-3 w-3" />
            ) : (
              <IconChevronRight className="h-3 w-3" />
            )}
          </button>
        )}
      </div>

      {/* Children with connector lines */}
      {hasChildren && isExpanded && (
        <ul className="flex gap-0 pt-8 relative org-children">
          {node.children.map((child) => (
            <OrgTreeNode
              key={child.id}
              node={child}
              expandedIds={expandedIds}
              onToggle={onToggle}
              matchingIds={matchingIds}
              onNodeClick={onNodeClick}
            />
          ))}
        </ul>
      )}
    </li>
  );
});

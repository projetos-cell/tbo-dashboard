"use client";

import { useState, useMemo } from "react";
import type { NavGroup } from "@/lib/navigation";

/**
 * Filters sidebar nav groups by a search query.
 * Matches item labels (case-insensitive). Groups with no visible items are removed.
 */
export function useSidebarSearch(groups: readonly NavGroup[]) {
  const [query, setQuery] = useState("");

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;

    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.label.toLowerCase().includes(q),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, query]);

  return { query, setQuery, filteredGroups };
}

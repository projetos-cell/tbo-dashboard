import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

// ---------------------------------------------------------------------------
// Org chart node type
// ---------------------------------------------------------------------------

export interface OrgChartNode {
  id: string;
  full_name: string | null;
  cargo: string | null;
  department: string | null;
  bu: string | null;
  avatar_url: string | null;
  email: string | null;
  status: string | null;
  is_coordinator: boolean | null;
  manager_id: string | null;
  children: OrgChartNode[];
}

// ---------------------------------------------------------------------------
// Fetch all active profiles and build tree
// ---------------------------------------------------------------------------

export async function getOrgChartData(
  supabase: SupabaseClient<Database>
): Promise<{ tree: OrgChartNode[]; flat: OrgChartNode[] }> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, cargo, department, bu, avatar_url, email, status, is_coordinator, manager_id"
    )
    .eq("is_active", true)
    .order("full_name");

  if (error) throw error;

  const profiles = (data ?? []) as Pick<
    ProfileRow,
    | "id"
    | "full_name"
    | "cargo"
    | "department"
    | "bu"
    | "avatar_url"
    | "email"
    | "status"
    | "is_coordinator"
    | "manager_id"
  >[];

  // Build node map
  const nodeMap = new Map<string, OrgChartNode>();
  for (const p of profiles) {
    nodeMap.set(p.id, { ...p, children: [] });
  }

  // Build tree
  const roots: OrgChartNode[] = [];
  for (const node of nodeMap.values()) {
    if (node.manager_id && nodeMap.has(node.manager_id)) {
      nodeMap.get(node.manager_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Sort children: coordinators first, then alphabetically
  const sortNodes = (a: OrgChartNode, b: OrgChartNode) => {
    if (a.is_coordinator && !b.is_coordinator) return -1;
    if (!a.is_coordinator && b.is_coordinator) return 1;
    return (a.full_name ?? "").localeCompare(b.full_name ?? "");
  };

  function sortChildren(node: OrgChartNode) {
    node.children.sort(sortNodes);
    node.children.forEach(sortChildren);
  }
  roots.forEach(sortChildren);
  roots.sort(sortNodes);

  return { tree: roots, flat: Array.from(nodeMap.values()) };
}

// ---------------------------------------------------------------------------
// Org stats
// ---------------------------------------------------------------------------

export interface OrgStats {
  totalPeople: number;
  totalManagers: number;
  maxDepth: number;
  departments: string[];
}

export function computeOrgStats(
  tree: OrgChartNode[],
  flat: OrgChartNode[]
): OrgStats {
  const managerIds = new Set(flat.filter((n) => n.manager_id).map((n) => n.manager_id!));
  const departments = [
    ...new Set(flat.map((n) => n.bu).filter((b): b is string => !!b)),
  ].sort();

  function getDepth(nodes: OrgChartNode[], depth: number): number {
    if (nodes.length === 0) return depth;
    return Math.max(...nodes.map((n) => getDepth(n.children, depth + 1)));
  }

  return {
    totalPeople: flat.length,
    totalManagers: managerIds.size,
    maxDepth: getDepth(tree, 0),
    departments,
  };
}

import type { FinanceSupabase } from "./finance-types";
import {
  TABLE_TRANSACTIONS,
  TABLE_CATEGORIES,
  TABLE_COST_CENTERS,
  type FinanceTransaction,
  type AgingBucket,
  type FinanceAgingData,
  type OverdueEntry,
  type OverdueEntriesData,
} from "./finance-types";

// ── Bucket definitions ───────────────────────────────────────────────────────

type BucketDef = Omit<AgingBucket, "ar" | "ap" | "arCount" | "apCount">;

export const OVERDUE_BUCKETS: BucketDef[] = [
  { label: "1–30 dias", minDays: 1, maxDays: 30, direction: "past" },
  { label: "31–60 dias", minDays: 31, maxDays: 60, direction: "past" },
  { label: "61–90 dias", minDays: 61, maxDays: 90, direction: "past" },
  { label: "90+ dias", minDays: 91, maxDays: Infinity, direction: "past" },
];

export const PROJECTED_BUCKETS: BucketDef[] = [
  { label: "1–30 dias", minDays: 1, maxDays: 30, direction: "future" },
  { label: "31–60 dias", minDays: 31, maxDays: 60, direction: "future" },
  { label: "61–90 dias", minDays: 61, maxDays: 90, direction: "future" },
  { label: "3–6 meses", minDays: 91, maxDays: 180, direction: "future" },
  { label: "6–12 meses", minDays: 181, maxDays: 365, direction: "future" },
];

// ── Pure bucket classifier (extracted for testability) ───────────────────────

type AgingRow = Pick<FinanceTransaction, "type" | "status" | "amount" | "due_date">;

export function classifyIntoBuckets(
  rows: AgingRow[],
  today: Date
): FinanceAgingData {
  const overdueBuckets: AgingBucket[] = OVERDUE_BUCKETS.map((b) => ({
    ...b,
    ar: 0,
    ap: 0,
    arCount: 0,
    apCount: 0,
  }));

  const projBuckets: AgingBucket[] = PROJECTED_BUCKETS.map((b) => ({
    ...b,
    ar: 0,
    ap: 0,
    arCount: 0,
    apCount: 0,
  }));

  let totalAr = 0;
  let totalAp = 0;
  let totalArCount = 0;
  let totalApCount = 0;
  let projectedAr = 0;
  let projectedArCount = 0;

  for (const row of rows) {
    if (!row.due_date) continue;
    const dueDate = new Date(row.due_date + "T00:00:00");
    const diffDays = Math.floor(
      (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const amount = Math.abs(row.amount ?? 0);

    if (diffDays >= 1) {
      const bucket = overdueBuckets.find(
        (b) => diffDays >= b.minDays && diffDays <= b.maxDays
      );
      if (!bucket) continue;

      if (row.type === "receita") {
        bucket.ar += amount;
        bucket.arCount += 1;
        totalAr += amount;
        totalArCount += 1;
      } else if (row.type === "despesa") {
        bucket.ap += amount;
        bucket.apCount += 1;
        totalAp += amount;
        totalApCount += 1;
      }
    } else if (diffDays <= 0 && row.type === "receita") {
      const daysAhead = Math.abs(diffDays) + 1;
      const bucket = projBuckets.find(
        (b) => daysAhead >= b.minDays && daysAhead <= b.maxDays
      );
      if (!bucket) continue;

      bucket.ar += amount;
      bucket.arCount += 1;
      projectedAr += amount;
      projectedArCount += 1;
    }
  }

  return {
    buckets: [...overdueBuckets, ...projBuckets],
    totalAr,
    totalAp,
    totalArCount,
    totalApCount,
    projectedAr,
    projectedArCount,
  };
}

// ── Aging AR/AP ──────────────────────────────────────────────────────────────

export async function getFinanceAging(
  supabase: FinanceSupabase
): Promise<FinanceAgingData> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureLimit = new Date(today);
  futureLimit.setMonth(futureLimit.getMonth() + 12);
  const futureLimitStr = futureLimit.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from(TABLE_TRANSACTIONS)
    .select("type, status, amount, due_date")
    .in("status", ["previsto", "atrasado", "provisionado"])
    .not("due_date", "is", null)
    .lte("due_date", futureLimitStr);

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as AgingRow[];

  return classifyIntoBuckets(rows, today);
}

// ── Overdue Entries (Contas a Pagar / Receber em Atraso) ─────────────────────

export async function getOverdueEntries(
  supabase: FinanceSupabase,
  type: "ar" | "ap" | "all" = "all"
): Promise<OverdueEntriesData> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const futureLimit = new Date(today);
  futureLimit.setMonth(futureLimit.getMonth() + 12);
  const futureLimitStr = futureLimit.toISOString().split("T")[0];

  const upperBound = type === "ap" ? todayStr : futureLimitStr;

  let query = supabase
    .from(TABLE_TRANSACTIONS)
    .select("id, type, status, description, counterpart, amount, due_date, category_id, cost_center_id")
    .in("status", ["previsto", "atrasado", "provisionado"])
    .not("due_date", "is", null)
    .lte("due_date", upperBound)
    .order("due_date", { ascending: true });

  if (type === "ar") query = query.eq("type", "receita");
  else if (type === "ap") query = query.eq("type", "despesa");

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Array<{
    id: string;
    type: "receita" | "despesa";
    status: string;
    description: string;
    counterpart: string | null;
    amount: number;
    due_date: string;
    category_id: string | null;
    cost_center_id: string | null;
  }>;

  // Fetch category names
  const catIds = [...new Set(rows.filter((r) => r.category_id).map((r) => r.category_id!))];
  const catLookup = new Map<string, string>();
  if (catIds.length > 0) {
    const { data: cats } = await supabase
      .from(TABLE_CATEGORIES)
      .select("id, name")
      .in("id", catIds.slice(0, 50));
    for (const c of (cats ?? []) as Array<{ id: string; name: string }>) {
      catLookup.set(c.id, c.name);
    }
  }

  // Fetch cost center names
  const ccIds = [...new Set(rows.filter((r) => r.cost_center_id).map((r) => r.cost_center_id!))];
  const ccLookup = new Map<string, string>();
  if (ccIds.length > 0) {
    const { data: ccs } = await supabase
      .from(TABLE_COST_CENTERS)
      .select("id, name")
      .in("id", ccIds.slice(0, 50));
    for (const c of (ccs ?? []) as Array<{ id: string; name: string }>) {
      ccLookup.set(c.id, c.name);
    }
  }

  let totalAr = 0;
  let totalAp = 0;
  let totalArCount = 0;
  let totalApCount = 0;
  let projectedAr = 0;
  let projectedArCount = 0;

  const entries: OverdueEntry[] = [];
  const projectedEntries: OverdueEntry[] = [];

  for (const row of rows) {
    const dueDate = new Date(row.due_date + "T00:00:00");
    const diffDays = Math.floor(
      (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const amount = Math.abs(row.amount ?? 0);
    const isProjected = diffDays < 1 && row.type === "receita";

    const entry: OverdueEntry = {
      id: row.id,
      type: row.type,
      status: row.status,
      description: row.description,
      counterpart: row.counterpart,
      amount,
      due_date: row.due_date,
      days_overdue: diffDays,
      category_name: row.category_id ? catLookup.get(row.category_id) ?? null : null,
      cost_center_name: row.cost_center_id ? ccLookup.get(row.cost_center_id) ?? null : null,
      isProjected,
    };

    if (isProjected) {
      projectedAr += amount;
      projectedArCount += 1;
      projectedEntries.push(entry);
    } else {
      if (row.type === "receita") {
        totalAr += amount;
        totalArCount += 1;
      } else {
        totalAp += amount;
        totalApCount += 1;
      }
      entries.push(entry);
    }
  }

  return {
    entries,
    projectedEntries,
    totalAr,
    totalAp,
    totalArCount,
    totalApCount,
    projectedAr,
    projectedArCount,
  };
}

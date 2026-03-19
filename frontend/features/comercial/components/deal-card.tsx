"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { IconUser, IconCalendar } from "@tabler/icons-react";
import { formatCurrency } from "@/features/comercial/lib/format-currency";
import { DEAL_STAGES, type DealStageKey } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

interface DealCardProps {
  deal: DealRow;
  onClick: (deal: DealRow) => void;
  showAgingIndicator?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (dealId: string, selected: boolean) => void;
  onQuickUpdate?: (dealId: string, field: string, value: unknown) => void;
}

/** Days since last update — used for aging dot */
function getDaysInStage(deal: DealRow): number {
  const ref = deal.updated_at ?? deal.created_at;
  if (!ref) return 0;
  return Math.floor((Date.now() - new Date(ref).getTime()) / 86_400_000);
}

function getAgingColor(days: number): string {
  if (days <= 7) return "bg-green-500";
  if (days <= 30) return "bg-amber-400";
  return "bg-red-500";
}

export function DealCard({
  deal,
  onClick,
  showAgingIndicator = true,
  selectable,
  selected,
  onSelect,
  onQuickUpdate,
}: DealCardProps) {
  const stageConfig = DEAL_STAGES[deal.stage as DealStageKey];
  const stageColor = stageConfig?.color ?? "#6b7280";
  const stageLabel = stageConfig?.label ?? deal.stage;
  const days = getDaysInStage(deal);

  // ── Inline value edit ─────────────────────────────────────────────
  const [editingValue, setEditingValue] = useState(false);
  const [tempValue, setTempValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingValue && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingValue]);

  function handleValueDoubleClick(e: React.MouseEvent) {
    if (!onQuickUpdate) return;
    e.stopPropagation();
    setTempValue(String(deal.value ?? 0));
    setEditingValue(true);
  }

  function commitValue() {
    const num = parseFloat(tempValue.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
    if (num !== deal.value) {
      onQuickUpdate?.(deal.id, "value", num);
    }
    setEditingValue(false);
  }

  function handleStageChange(newStage: DealStageKey) {
    if (newStage !== deal.stage) {
      onQuickUpdate?.(deal.id, "stage", newStage);
    }
  }

  return (
    <div
      className={`cursor-pointer rounded-lg border bg-white shadow-sm transition-all hover:shadow-md relative overflow-hidden group ${selected ? "ring-2 ring-tbo-orange/40 border-tbo-orange/30" : ""}`}
      onClick={() => onClick(deal)}
    >
      {/* Stage color accent — left border */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
        style={{ backgroundColor: stageColor }}
      />

      <div className="p-3 pl-3.5">
        {/* Row 1: Checkbox + Name + aging dot */}
        <div className="flex items-center gap-1.5">
          {selectable && (
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect?.(deal.id, e.target.checked);
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-3.5 w-3.5 rounded border-gray-300 text-tbo-orange focus:ring-tbo-orange/30 shrink-0"
            />
          )}
          <p className="font-medium text-sm leading-tight truncate flex-1">{deal.name}</p>
          {showAgingIndicator && deal.stage !== "fechado_ganho" && deal.stage !== "fechado_perdido" && (
            <div
              className={`h-2 w-2 rounded-full shrink-0 ${getAgingColor(days)}`}
              title={`${days}d neste stage`}
            />
          )}
        </div>

        {/* Row 2: Company */}
        {deal.company && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{deal.company}</p>
        )}

        {/* Row 3: Value (hero, double-click to edit) + probability badge */}
        <div className="flex items-center gap-1.5 mt-2">
          {editingValue ? (
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={commitValue}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitValue();
                if (e.key === "Escape") setEditingValue(false);
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-6 w-24 rounded border border-gray-300 px-1.5 text-sm font-semibold tabular-nums focus:ring-1 focus:ring-tbo-orange/40 focus:border-tbo-orange/40 outline-none"
            />
          ) : deal.value != null && deal.value > 0 ? (
            <span
              className="text-sm font-semibold tabular-nums hover:bg-gray-100 rounded px-0.5 -mx-0.5 transition-colors"
              onDoubleClick={handleValueDoubleClick}
              title={onQuickUpdate ? "Duplo clique para editar" : undefined}
            >
              {formatCurrency(deal.value)}
            </span>
          ) : onQuickUpdate ? (
            <span
              className="text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded px-0.5 -mx-0.5 cursor-text transition-colors"
              onDoubleClick={handleValueDoubleClick}
              title="Duplo clique para definir valor"
            >
              Sem valor
            </span>
          ) : null}
          {deal.probability != null && !editingValue && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 tabular-nums font-medium border-gray-200"
            >
              {Math.round(deal.probability)}%
            </Badge>
          )}
        </div>

        {/* Row 4: Probability bar */}
        {deal.probability != null && (
          <div className="h-1 w-full rounded-full bg-gray-100 overflow-hidden mt-1.5">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(deal.probability, 100)}%`,
                backgroundColor: stageColor,
                opacity: 0.6,
              }}
            />
          </div>
        )}

        {/* Row 5: Stage badge (click to change) + meta */}
        <div className="flex items-center gap-2 mt-2">
          {onQuickUpdate ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: stageConfig?.bg ?? "rgba(107,114,128,0.12)",
                    color: stageColor,
                  }}
                >
                  {stageLabel}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                {(Object.entries(DEAL_STAGES) as [DealStageKey, typeof DEAL_STAGES[DealStageKey]][]).map(
                  ([key, cfg]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => handleStageChange(key)}
                      className={deal.stage === key ? "font-semibold" : ""}
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full mr-2 shrink-0"
                        style={{ backgroundColor: cfg.color }}
                      />
                      {cfg.label}
                    </DropdownMenuItem>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span
              className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: stageConfig?.bg ?? "rgba(107,114,128,0.12)",
                color: stageColor,
              }}
            >
              {stageLabel}
            </span>
          )}

          <div className="flex items-center gap-3 ml-auto">
            {deal.owner_name && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <IconUser className="h-3 w-3" />
                <span className="truncate max-w-[60px]">{deal.owner_name}</span>
              </div>
            )}
            {deal.expected_close && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <IconCalendar className="h-3 w-3" />
                <span>
                  {new Date(deal.expected_close).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

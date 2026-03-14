"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconFilter, IconCurrencyDollar } from "@tabler/icons-react";
import { CONTRACT_DYNAMIC_STATUS, type ContractDynamicStatusKey } from "@/lib/constants";
import type { ContractFilters } from "@/features/contratos/services/contracts";
import { FilterChip, FilterSection, toggleInArray } from "./contract-filter-helpers";

interface ContractAdvancedFiltersProps {
  valueMin: number | undefined;
  valueMax: number | undefined;
  dynamicStatuses: ContractFilters["dynamicStatuses"];
  onUpdate: (partial: Partial<ContractFilters>) => void;
}

export function ContractAdvancedFilters({
  valueMin,
  valueMax,
  dynamicStatuses,
  onUpdate,
}: ContractAdvancedFiltersProps) {
  return (
    <>
      {/* Financial range */}
      <FilterSection icon={IconCurrencyDollar} title="Faixa de Valor (mensal)">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Mínimo</Label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
              <Input
                type="number"
                min={0}
                step={100}
                placeholder="0"
                value={valueMin ?? ""}
                onChange={(e) =>
                  onUpdate({ valueMin: e.target.value ? Number(e.target.value) : undefined })
                }
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Máximo</Label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
              <Input
                type="number"
                min={0}
                step={100}
                placeholder="∞"
                value={valueMax ?? ""}
                onChange={(e) =>
                  onUpdate({ valueMax: e.target.value ? Number(e.target.value) : undefined })
                }
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Dynamic status */}
      <FilterSection icon={IconFilter} title="Status Dinâmicos">
        <div className="flex flex-wrap gap-1.5">
          {(Object.entries(CONTRACT_DYNAMIC_STATUS) as [ContractDynamicStatusKey, (typeof CONTRACT_DYNAMIC_STATUS)[ContractDynamicStatusKey]][]).map(
            ([key, cfg]) => (
              <FilterChip
                key={key}
                label={cfg.label}
                color={cfg.color}
                bg={cfg.bg}
                active={dynamicStatuses?.includes(key) ?? false}
                onClick={() =>
                  onUpdate({ dynamicStatuses: toggleInArray(dynamicStatuses, key) })
                }
              />
            ),
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Filtros computados com base em status + arquivos anexados.
        </p>
      </FilterSection>
    </>
  );
}

"use client";

import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/lib/supabase/types";

type CycleRow = Database["public"]["Tables"]["okr_cycles"]["Row"];

interface OkrCycleSelectorProps {
  cycles: CycleRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function OkrCycleSelector({
  cycles,
  selectedId,
  onSelect,
}: OkrCycleSelectorProps) {
  if (cycles.length === 0) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Calendar className="h-4 w-4" />
        Nenhum ciclo cadastrado
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Calendar className="text-muted-foreground h-4 w-4" />
      <Select value={selectedId ?? undefined} onValueChange={onSelect}>
        <SelectTrigger className="w-[260px]">
          <SelectValue placeholder="Selecione um ciclo" />
        </SelectTrigger>
        <SelectContent>
          {cycles.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              <span className="flex items-center gap-2">
                {c.name}
                {c.is_active && (
                  <Badge variant="secondary" className="text-xs">
                    Ativo
                  </Badge>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

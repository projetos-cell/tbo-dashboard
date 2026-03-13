"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IconCheck } from "@tabler/icons-react";

export interface InlineSelectOption {
  value: string;
  label: string;
  color: string;
  bg: string;
}

interface InlineSelectProps {
  value: string | null;
  options: InlineSelectOption[];
  onSave: (value: string) => void;
  fallbackLabel?: string;
  disabled?: boolean;
  className?: string;
}

export function InlineSelect({
  value,
  options,
  onSave,
  fallbackLabel = "—",
  disabled = false,
  className,
}: InlineSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [flashing, setFlashing] = React.useState(false);

  const current = options.find((o) => o.value === value);

  const handleSelect = (optionValue: string) => {
    if (optionValue !== value) {
      onSave(optionValue);
      // Flash feedback
      setFlashing(true);
      setTimeout(() => setFlashing(false), 800);
    }
    setOpen(false);
  };

  const stopProp = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={stopProp}
      onPointerDown={stopProp}
      className={className}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <button
            type="button"
            className={cn(
              "rounded-md transition-all",
              flashing && "animate-save-flash",
            )}
          >
            {current ? (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 cursor-pointer transition-all hover:ring-1 hover:ring-ring/30"
                style={{ backgroundColor: current.bg, color: current.color }}
              >
                {current.label}
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                {fallbackLabel}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-1" align="start" sideOffset={4}>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={cn(
                "flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm",
                "hover:bg-muted/60 transition-colors",
                opt.value === value && "bg-muted/40",
              )}
            >
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: opt.color }}
              />
              <span className="flex-1 text-left">{opt.label}</span>
              {opt.value === value && (
                <IconCheck className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}

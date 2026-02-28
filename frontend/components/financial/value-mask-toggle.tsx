"use client";

import { Switch } from "@/components/ui/switch";
import { EyeOff } from "lucide-react";

interface ValueMaskToggleProps {
  masked: boolean;
  onToggle: (masked: boolean) => void;
}

export function ValueMaskToggle({ masked, onToggle }: ValueMaskToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Ocultar</span>
      <Switch
        checked={masked}
        onCheckedChange={onToggle}
        aria-label="Ocultar valores financeiros"
      />
    </div>
  );
}

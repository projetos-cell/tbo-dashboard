"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { IconX } from "@tabler/icons-react";

export interface BulkAction {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline";
}

interface BulkActionBarProps {
  count: number;
  actions: BulkAction[];
  onClear: () => void;
}

export function BulkActionBar({ count, actions, onClear }: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit items-center gap-3 rounded-xl border bg-background/95 px-4 py-2.5 shadow-lg backdrop-blur-sm"
        >
          <span className="text-sm font-medium text-muted-foreground">
            {count} {count === 1 ? "item selecionado" : "itens selecionados"}
          </span>

          <div className="h-4 w-px bg-border" />

          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant ?? "outline"}
              size="sm"
              onClick={action.onClick}
              className="gap-1.5"
            >
              <action.icon className="size-3.5" />
              {action.label}
            </Button>
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="ml-1 h-7 w-7 p-0"
            aria-label="Limpar seleção"
          >
            <IconX className="size-3.5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

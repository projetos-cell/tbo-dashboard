"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  IconX,
  IconArchive,
  IconTrash,
  IconTag,
  IconUserPlus,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_STATUS } from "@/lib/constants";

interface BulkActionsBarProps {
  selectedCount: number;
  onClear: () => void;
  onStatusChange?: (status: string) => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onClear,
  onStatusChange,
  onArchive,
  onDelete,
}: BulkActionsBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.15 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 shadow-lg"
        >
          <span className="text-sm font-medium tabular-nums mr-1">
            {selectedCount} selecionado{selectedCount > 1 ? "s" : ""}
          </span>

          <div className="h-4 w-px bg-border" />

          {onStatusChange && (
            <Select onValueChange={onStatusChange}>
              <SelectTrigger className="h-8 w-auto text-xs gap-1.5">
                <IconTag className="size-3.5" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROJECT_STATUS).map(([key, def]) => (
                  <SelectItem key={key} value={key}>
                    {def.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {onArchive && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={onArchive}
            >
              <IconArchive className="size-3.5 mr-1" />
              Arquivar
            </Button>
          )}

          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs text-destructive hover:bg-destructive/10"
              onClick={onDelete}
            >
              <IconTrash className="size-3.5 mr-1" />
              Excluir
            </Button>
          )}

          <div className="h-4 w-px bg-border" />

          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onClear}
          >
            <IconX className="size-3.5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

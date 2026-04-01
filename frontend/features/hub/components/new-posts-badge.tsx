"use client";

import { motion, AnimatePresence } from "framer-motion";
import { IconArrowUp } from "@tabler/icons-react";

interface NewPostsBadgeProps {
  count: number;
  onLoad: () => void;
}

export function NewPostsBadge({ count, onLoad }: NewPostsBadgeProps) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.button
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          onClick={onLoad}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition-colors"
          style={{
            background: "#c45a1a",
            boxShadow: "0 4px 16px rgba(196,90,26,0.25)",
          }}
        >
          <IconArrowUp className="size-3.5" />
          {count} {count === 1 ? "novo post" : "novos posts"}
        </motion.button>
      )}
    </AnimatePresence>
  );
}

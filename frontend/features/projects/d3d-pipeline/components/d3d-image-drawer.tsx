"use client";

import { useEffect, useCallback } from "react";
import { IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface D3DImageDrawerProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string | null;
  stageLabel: string;
  stageSubtitle: string;
  stageIndex: number;
}

export function D3DImageDrawer({
  open,
  onClose,
  imageUrl,
  stageLabel,
  stageSubtitle,
  stageIndex,
}: D3DImageDrawerProps) {
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, handleEsc]);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[200] bg-black/0 transition-all duration-300",
          open ? "visible bg-black/50" : "invisible"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed bottom-0 right-0 top-0 z-[201] flex w-[min(560px,90vw)] flex-col border-l border-zinc-200 bg-white shadow-2xl transition-transform duration-400",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-zinc-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 bg-zinc-100 text-xs font-medium text-zinc-600">
              {String(stageIndex).padStart(2, "0")}
            </div>
            <div>
              <h3 className="text-base font-medium tracking-tight text-zinc-900">
                {stageLabel}
              </h3>
              <p className="text-xs text-zinc-400">{stageSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white transition-colors hover:bg-zinc-100"
          >
            <IconX className="h-4 w-4 text-zinc-600" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 items-center justify-center overflow-y-auto bg-zinc-50 p-6">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={stageLabel}
              className="max-h-full max-w-full rounded-xl object-contain shadow-lg"
            />
          ) : (
            <p className="text-sm text-zinc-400">Nenhuma imagem disponível</p>
          )}
        </div>
      </div>
    </>
  );
}

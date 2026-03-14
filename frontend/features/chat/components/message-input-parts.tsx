"use client";

import type { DragEvent } from "react";
import { IconFile, IconX, IconUpload } from "@tabler/icons-react";
import type { PendingFile } from "./message-input";

// ─── Drag overlay ─────────────────────────────────────────────────────────────

export function DragOverlay() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/5">
      <div className="flex items-center gap-2 text-sm font-medium text-primary">
        <IconUpload size={20} />
        Solte arquivos aqui
      </div>
    </div>
  );
}

// ─── Pending files list ───────────────────────────────────────────────────────

interface PendingFilesListProps {
  files: PendingFile[];
  onRemove: (index: number) => void;
}

export function PendingFilesList({ files, onRemove }: PendingFilesListProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex gap-2 mb-2 flex-wrap px-1">
      {files.map((pf, i) => (
        <div
          key={`${pf.file.name}-${i}`}
          className="relative group/file rounded-lg border bg-muted/50 overflow-hidden"
        >
          {pf.previewUrl ? (
            <img
              src={pf.previewUrl}
              alt={pf.file.name}
              className="h-16 w-16 object-cover"
            />
          ) : (
            <div className="h-16 w-16 flex flex-col items-center justify-center gap-1 px-1">
              <IconFile size={20} className="text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                {pf.file.name.length > 10
                  ? `${pf.file.name.slice(0, 8)}...`
                  : pf.file.name}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="absolute top-0.5 right-0.5 rounded-full bg-background/80 p-0.5 opacity-0 group-hover/file:opacity-100 transition-opacity"
          >
            <IconX size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Drag & drop hook ─────────────────────────────────────────────────────────

import { useState, useRef } from "react";

interface UseDragDropResult {
  isDragOver: boolean;
  dragHandlers: {
    onDragEnter: (e: DragEvent) => void;
    onDragLeave: (e: DragEvent) => void;
    onDragOver: (e: DragEvent) => void;
    onDrop: (e: DragEvent) => void;
  };
}

export function useDragDrop(onFiles: (files: File[]) => void): UseDragDropResult {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);

  function handleDragEnter(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragOver(true);
    }
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) onFiles(files);
  }

  return {
    isDragOver,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
}

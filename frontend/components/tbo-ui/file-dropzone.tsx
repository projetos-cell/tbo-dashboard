"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
}

export function FileDropzone({ onUpload, accept, multiple = true, className, disabled }: FileDropzoneProps) {
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onUpload(Array.from(files));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
        dragging
          ? "border-tbo-orange bg-tbo-orange/5 text-tbo-orange"
          : "border-gray-200 bg-gray-100/20 text-gray-500 hover:border-tbo-orange/50 hover:bg-tbo-orange/5",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <svg
        className="mb-3 h-10 w-10 opacity-50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      <p className="text-sm font-medium">
        {dragging ? "Solte os arquivos aqui" : "Arraste arquivos ou clique para selecionar"}
      </p>
      <p className="mt-1 text-xs opacity-70">
        {accept ? `Formatos aceitos: ${accept}` : "Todos os formatos aceitos"}
      </p>
    </div>
  );
}

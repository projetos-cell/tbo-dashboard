"use client";

import { FileUploader } from "@/components/file-uploader";

interface FileDropzoneProps {
  onUpload: (files: File[]) => Promise<void>;
  disabled?: boolean;
}

export function FileDropzone({ onUpload, disabled }: FileDropzoneProps) {
  return (
    <FileUploader
      onUpload={onUpload}
      accept={{ "*/*": [] }}
      maxFiles={Infinity}
      multiple
      disabled={disabled}
    />
  );
}

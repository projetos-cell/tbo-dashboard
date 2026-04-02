"use client";

import {
  IconFile,
  IconFileTypePdf,
  IconFileTypeDoc,
  IconExternalLink,
} from "@tabler/icons-react";
import type { PortalFile } from "./portal-files-tab";

interface PortalLatestDocsProps {
  files: PortalFile[];
  maxItems?: number;
}

function getDocIcon(mime: string | null) {
  if (!mime) return IconFile;
  if (mime.includes("pdf")) return IconFileTypePdf;
  if (mime.includes("document") || mime.includes("word") || mime.includes("doc")) return IconFileTypeDoc;
  return IconFile;
}

export function PortalLatestDocs({ files, maxItems = 5 }: PortalLatestDocsProps) {
  const sorted = [...files]
    .sort((a, b) => {
      const da = a.updated_at ?? a.created_at ?? "";
      const db = b.updated_at ?? b.created_at ?? "";
      return db.localeCompare(da);
    })
    .slice(0, maxItems);

  if (sorted.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-zinc-900">Ultimos Docs</h3>
      <div className="space-y-2">
        {sorted.map((file) => {
          const DocIcon = getDocIcon(file.mime_type);
          return (
            <a
              key={file.id}
              href={file.web_view_link ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border bg-white p-3 transition-colors hover:bg-zinc-50"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                <DocIcon className="h-4 w-4 text-zinc-500" />
              </div>
              <span className="min-w-0 flex-1 truncate text-sm text-zinc-700">
                {file.name}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  IconFile,
  IconFileTypePdf,
  IconFileTypeDoc,
  IconFileTypePpt,
  IconPhoto,
  IconVideo,
  IconDownload,
  IconExternalLink,
  IconSearch,
  IconFolder,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface PortalFile {
  id: string;
  name: string;
  mime_type: string | null;
  size_bytes: number | null;
  web_view_link: string | null;
  web_content_link: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface PortalFilesTabProps {
  files: PortalFile[];
}

function getFileIcon(mime: string | null) {
  if (!mime) return IconFile;
  if (mime.includes("pdf")) return IconFileTypePdf;
  if (mime.includes("document") || mime.includes("word") || mime.includes("doc")) return IconFileTypeDoc;
  if (mime.includes("presentation") || mime.includes("ppt")) return IconFileTypePpt;
  if (mime.includes("image")) return IconPhoto;
  if (mime.includes("video")) return IconVideo;
  return IconFile;
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileCategory(mime: string | null): string {
  if (!mime) return "Outros";
  if (mime.includes("image")) return "Imagens";
  if (mime.includes("video")) return "Videos";
  if (mime.includes("pdf")) return "PDFs";
  if (mime.includes("document") || mime.includes("word")) return "Documentos";
  if (mime.includes("presentation") || mime.includes("ppt")) return "Apresentacoes";
  return "Outros";
}

export function PortalFilesTab({ files }: PortalFilesTabProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = useMemo(() => {
    const cats = new Set(files.map((f) => getFileCategory(f.mime_type)));
    return ["all", ...Array.from(cats).sort()];
  }, [files]);

  const filtered = useMemo(() => {
    let list = files;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((f) => f.name.toLowerCase().includes(q));
    }
    if (categoryFilter !== "all") {
      list = list.filter((f) => getFileCategory(f.mime_type) === categoryFilter);
    }
    return list.sort((a, b) => {
      const da = a.updated_at ?? a.created_at ?? "";
      const db = b.updated_at ?? b.created_at ?? "";
      return db.localeCompare(da);
    });
  }, [files, search, categoryFilter]);

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <IconFolder className="h-12 w-12 text-zinc-200" />
        <h3 className="mt-4 text-sm font-medium text-zinc-600">Nenhum arquivo ainda</h3>
        <p className="mt-1 text-xs text-zinc-400">
          Os arquivos do projeto aparecerão aqui quando forem adicionados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar arquivos..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                categoryFilter === cat
                  ? "bg-orange-100 text-orange-700"
                  : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
              )}
            >
              {cat === "all" ? "Todos" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* File List */}
      <div className="divide-y rounded-xl border bg-white">
        {filtered.map((file) => {
          const FileIcon = getFileIcon(file.mime_type);
          return (
            <div
              key={file.id}
              className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-zinc-50"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                <FileIcon className="h-5 w-5 text-zinc-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900">{file.name}</p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-400">
                  {file.size_bytes && <span>{formatSize(file.size_bytes)}</span>}
                  {(file.updated_at ?? file.created_at) && (
                    <span>
                      {formatDistanceToNow(new Date(file.updated_at ?? file.created_at!), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {file.web_view_link && (
                  <a
                    href={file.web_view_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                  >
                    <IconExternalLink className="h-4 w-4" />
                  </a>
                )}
                {file.web_content_link && (
                  <a
                    href={file.web_content_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                  >
                    <IconDownload className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-zinc-400">
        {filtered.length} de {files.length} arquivo{files.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

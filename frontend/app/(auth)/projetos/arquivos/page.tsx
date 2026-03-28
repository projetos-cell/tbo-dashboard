"use client";

import { useState, useMemo } from "react";
import { RequireRole } from "@/features/auth/components/require-role";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconFiles,
  IconSearch,
  IconExternalLink,
  IconPhoto,
  IconVideo,
  IconFileText,
  IconFile,
  IconFileZip,
  IconFilter,
  IconLayoutGrid,
  IconList,
} from "@tabler/icons-react";
import { useCrossProjectFiles } from "@/features/projects/hooks/use-task-advanced";
import type { CrossProjectFile } from "@/features/projects/hooks/use-task-advanced";

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function getFileIcon(fileType: string | null) {
  if (!fileType) return IconFile;
  if (fileType.startsWith("image/")) return IconPhoto;
  if (fileType.startsWith("video/")) return IconVideo;
  if (fileType.includes("pdf") || fileType.includes("document") || fileType.includes("text"))
    return IconFileText;
  if (fileType.includes("zip") || fileType.includes("tar")) return IconFileZip;
  return IconFile;
}

function getFileTypeLabel(fileType: string | null): string {
  if (!fileType) return "Outro";
  if (fileType.startsWith("image/")) return "Imagem";
  if (fileType.startsWith("video/")) return "Vídeo";
  if (fileType.includes("pdf")) return "PDF";
  if (fileType.includes("document") || fileType.includes("word")) return "Documento";
  if (fileType.includes("sheet") || fileType.includes("excel")) return "Planilha";
  if (fileType.includes("presentation")) return "Apresentação";
  if (fileType.includes("zip") || fileType.includes("tar")) return "Comprimido";
  return fileType.split("/")[0] ?? "Outro";
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function FileGridCard({ file }: { file: CrossProjectFile }) {
  const FileIcon = getFileIcon(file.file_type);
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <FileIcon size={20} className="text-muted-foreground" />
            </div>
            <a
              href={file.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all"
              aria-label="Abrir arquivo"
            >
              <IconExternalLink size={15} />
            </a>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium" title={file.file_name}>
              {file.file_name}
            </p>
            {file.project_name && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {file.project_name}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-[10px]">
              {getFileTypeLabel(file.file_type)}
            </Badge>
            {file.file_size && (
              <span className="text-[10px] text-muted-foreground">
                {formatFileSize(file.file_size)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FileListRow({ file }: { file: CrossProjectFile }) {
  const FileIcon = getFileIcon(file.file_type);
  return (
    <div className="group flex items-center gap-3 rounded-lg border bg-card px-4 py-3 hover:bg-muted/40 transition-colors">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted shrink-0">
        <FileIcon size={16} className="text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{file.file_name}</p>
        <p className="text-xs text-muted-foreground">
          {file.project_name ?? "Sem projeto"} •{" "}
          {new Date(file.created_at).toLocaleDateString("pt-BR")}
        </p>
      </div>
      <Badge variant="outline" className="shrink-0 text-[10px]">
        {getFileTypeLabel(file.file_type)}
      </Badge>
      {file.file_size && (
        <span className="shrink-0 text-xs text-muted-foreground">
          {formatFileSize(file.file_size)}
        </span>
      )}
      <a
        href={file.file_url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all"
        aria-label="Abrir arquivo"
      >
        <IconExternalLink size={14} />
      </a>
    </div>
  );
}

export default function ProjetosArquivos() {
  const { data: files, isLoading } = useCrossProjectFiles();
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const projects = useMemo(() => {
    const map = new Map<string, string>();
    (files ?? []).forEach((f) => {
      if (f.project_id && f.project_name) map.set(f.project_id, f.project_name);
    });
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [files]);

  const types = useMemo(() => {
    const set = new Set<string>();
    (files ?? []).forEach((f) => set.add(getFileTypeLabel(f.file_type)));
    return Array.from(set).sort();
  }, [files]);

  const stats = useMemo(() => {
    const all = files ?? [];
    const totalSize = all.reduce((s, f) => s + (f.file_size ?? 0), 0);
    return {
      total: all.length,
      totalSizeLabel: formatFileSize(totalSize) || "0B",
      byProject: projects.length,
    };
  }, [files, projects]);

  const filtered = useMemo(() => {
    return (files ?? []).filter((f) => {
      if (search && !f.file_name.toLowerCase().includes(search.toLowerCase())) return false;
      if (projectFilter !== "all" && f.project_id !== projectFilter) return false;
      if (typeFilter !== "all" && getFileTypeLabel(f.file_type) !== typeFilter) return false;
      return true;
    });
  }, [files, search, projectFilter, typeFilter]);

  const hasFilters = search || projectFilter !== "all" || typeFilter !== "all";

  return (
    <RequireRole module="projetos">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Hub de Arquivos</h1>
            <p className="text-sm text-muted-foreground">
              Todos os arquivos e anexos dos projetos em um só lugar
            </p>
          </div>
        </div>

        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total de arquivos" value={stats.total} />
            <StatCard label="Tamanho total" value={stats.totalSizeLabel} />
            <StatCard label="Projetos com arquivos" value={stats.byProject} />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <IconSearch
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar arquivos..."
              className="h-9 pl-8 text-sm"
            />
          </div>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="h-9 w-48 text-sm">
              <IconFilter size={13} className="mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Projeto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os projetos</SelectItem>
              {projects.map(([id, name]) => (
                <SelectItem key={id} value={id} className="text-sm">
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9 w-40 text-sm">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {types.map((t) => (
                <SelectItem key={t} value={t} className="text-sm">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-r-none"
              onClick={() => setViewMode("grid")}
            >
              <IconLayoutGrid size={15} />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-l-none"
              onClick={() => setViewMode("list")}
            >
              <IconList size={15} />
            </Button>
          </div>
        </div>

        {!isLoading && (
          <p className="text-xs text-muted-foreground">
            {filtered.length} arquivo{filtered.length !== 1 ? "s" : ""}
            {hasFilters && " encontrado(s)"}
          </p>
        )}

        {/* File grid/list */}
        {isLoading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-36" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          )
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
            <IconFiles size={32} className="text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              {hasFilters ? "Nenhum arquivo encontrado" : "Nenhum arquivo ainda"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {hasFilters
                ? "Tente ajustar os filtros"
                : "Anexe arquivos nas tarefas para vê-los aqui"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((file: CrossProjectFile) => (
              <FileGridCard key={`${file.source}-${file.id}`} file={file} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((file: CrossProjectFile) => (
              <FileListRow key={`${file.source}-${file.id}`} file={file} />
            ))}
          </div>
        )}
      </div>
    </RequireRole>
  );
}

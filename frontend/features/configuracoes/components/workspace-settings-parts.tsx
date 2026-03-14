"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  IconCamera,
  IconLoader2,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";

// ── Types ───────────────────────────────────────────────────────────────────

export interface WorkspacePrefs {
  name: string;
  tagline: string;
  website: string;
  timezone: string;
  logo_url: string;
}

export const DEFAULT_WORKSPACE: WorkspacePrefs = {
  name: "TBO Agência",
  tagline: "",
  website: "",
  timezone: "America/Sao_Paulo",
  logo_url: "",
};

export const TIMEZONES = [
  { value: "America/Sao_Paulo", label: "São Paulo (GMT-3)" },
  { value: "America/Manaus", label: "Manaus (GMT-4)" },
  { value: "America/Belem", label: "Belém (GMT-3)" },
  { value: "America/Fortaleza", label: "Fortaleza (GMT-3)" },
  { value: "America/Recife", label: "Recife (GMT-3)" },
  { value: "America/Bahia", label: "Salvador (GMT-3)" },
  { value: "America/Cuiaba", label: "Cuiabá (GMT-4)" },
  { value: "America/Porto_Velho", label: "Porto Velho (GMT-4)" },
  { value: "America/Rio_Branco", label: "Rio Branco (GMT-5)" },
  { value: "America/Noronha", label: "Fernando de Noronha (GMT-2)" },
  { value: "America/New_York", label: "New York (GMT-5)" },
  { value: "Europe/London", label: "Londres (GMT+0)" },
  { value: "Europe/Lisbon", label: "Lisboa (GMT+0)" },
  { value: "Europe/Paris", label: "Paris (GMT+1)" },
];

// ── WorkspaceSkeleton ────────────────────────────────────────────────────────

export function WorkspaceSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── WorkspaceLogoUpload ──────────────────────────────────────────────────────

interface WorkspaceLogoUploadProps {
  logoUrl: string;
  logoInitials: string;
  uploading: boolean;
  uploadError: string | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function WorkspaceLogoUpload({
  logoUrl,
  logoInitials,
  uploading,
  uploadError,
  onUpload,
}: WorkspaceLogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="h-16 w-16">
          <AvatarImage src={logoUrl || undefined} alt="Logo" />
          <AvatarFallback className="text-sm font-bold bg-tbo-orange/10 text-tbo-orange">
            {logoInitials}
          </AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-1 -right-1 rounded-full bg-background border p-1 shadow-sm hover:bg-muted transition-colors disabled:opacity-50"
          aria-label="Alterar logo"
        >
          {uploading ? (
            <IconLoader2 size={12} className="animate-spin" />
          ) : (
            <IconCamera size={12} />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          onChange={onUpload}
          className="hidden"
        />
      </div>
      <div>
        <p className="text-sm font-medium">Logo da agência</p>
        <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WebP ou SVG · Máx 2 MB</p>
        {uploadError && (
          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
            <IconAlertCircle size={12} />
            {uploadError}
          </p>
        )}
      </div>
    </div>
  );
}

// ── WorkspaceSaveBar ─────────────────────────────────────────────────────────

interface WorkspaceSaveBarProps {
  dirty: boolean;
  saveSuccess: boolean;
  isPending: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export function WorkspaceSaveBar({
  dirty,
  saveSuccess,
  isPending,
  onSave,
  onDiscard,
}: WorkspaceSaveBarProps) {
  if (!dirty && !saveSuccess) return null;

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 shadow-sm">
      {saveSuccess ? (
        <p className="text-sm text-emerald-600 flex items-center gap-2">
          <IconCheck size={16} />
          Configurações salvas
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Você tem alterações não salvas.</p>
      )}
      {dirty && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onDiscard}>
            Descartar
          </Button>
          <Button size="sm" onClick={onSave} disabled={isPending}>
            {isPending && <IconLoader2 size={14} className="mr-2 animate-spin" />}
            Salvar
          </Button>
        </div>
      )}
    </div>
  );
}

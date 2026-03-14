"use client";

import type { RefObject } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IconCamera, IconLoader2, IconCheck } from "@tabler/icons-react";

// ── Role display config ──────────────────────────────

export const ROLE_LABELS: Record<string, string> = {
  founder: "Founder",
  diretoria: "Diretoria",
  lider: "Líder",
  colaborador: "Colaborador",
};

export const ROLE_COLORS: Record<string, string> = {
  founder: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  diretoria: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  lider: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  colaborador: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

// ── Loading skeleton ─────────────────────────────────

export function ProfileFormSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
          <div className="sm:col-span-2 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Avatar card ──────────────────────────────────────

type AvatarCardProps = {
  avatarUrl?: string | null;
  fullName?: string | null;
  email?: string | null;
  department?: string | null;
  currentRole: string;
  initials: string;
  isUploading: boolean;
  fileRef: RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function ProfileAvatarCard({
  avatarUrl,
  fullName,
  email,
  department,
  currentRole,
  initials,
  isUploading,
  fileRef,
  onFileChange,
}: AvatarCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Foto de perfil</CardTitle>
        <CardDescription>JPG, PNG ou GIF — máx. 5MB. Clique para alterar.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-5">
        <button
          type="button"
          className="relative group shrink-0"
          onClick={() => fileRef.current?.click()}
          disabled={isUploading}
        >
          <Avatar className="h-20 w-20 ring-2 ring-border ring-offset-2">
            <AvatarImage src={avatarUrl ?? undefined} />
            <AvatarFallback className="text-lg font-semibold bg-tbo-orange/10 text-tbo-orange">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            {isUploading ? (
              <IconLoader2 size={20} className="animate-spin text-white" />
            ) : (
              <IconCamera size={20} className="text-white" />
            )}
          </div>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">{fullName ?? "Usuário"}</p>
          <p className="text-sm text-muted-foreground truncate">{email}</p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[currentRole] ?? ROLE_COLORS.colaborador}`}
            >
              {ROLE_LABELS[currentRole] ?? currentRole}
            </span>
            {department && (
              <Badge variant="outline" className="text-xs">{department}</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Save bar ─────────────────────────────────────────

type SaveBarProps = {
  dirty: boolean;
  saveSuccess: boolean;
  isSaving: boolean;
  onDiscard: () => void;
  onSave: () => void;
};

export function ProfileSaveBar({ dirty, saveSuccess, isSaving, onDiscard, onSave }: SaveBarProps) {
  if (!dirty && !saveSuccess) return null;

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 shadow-sm">
      {saveSuccess ? (
        <p className="text-sm text-emerald-600 flex items-center gap-2">
          <IconCheck size={16} />
          Alterações salvas com sucesso
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Você tem alterações não salvas.</p>
      )}
      {dirty && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onDiscard}>
            Descartar
          </Button>
          <Button size="sm" onClick={onSave} disabled={isSaving}>
            {isSaving && <IconLoader2 size={14} className="mr-2 animate-spin" />}
            Salvar alterações
          </Button>
        </div>
      )}
    </div>
  );
}

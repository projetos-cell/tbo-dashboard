"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconBuilding,
  IconCamera,
  IconLoader2,
  IconCheck,
  IconAlertCircle,
  IconClock,
  IconWorld,
} from "@tabler/icons-react";
import { useProfile, useUpdateProfile } from "@/features/configuracoes/hooks/use-settings";
import { createClient } from "@/lib/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────────

interface WorkspacePrefs {
  name: string;
  tagline: string;
  website: string;
  timezone: string;
  logo_url: string;
}

const DEFAULT_WORKSPACE: WorkspacePrefs = {
  name: "TBO Agência",
  tagline: "",
  website: "",
  timezone: "America/Sao_Paulo",
  logo_url: "",
};

const TIMEZONES = [
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

// ── Skeleton ───────────────────────────────────────────────────────────────

function WorkspaceSkeleton() {
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

// ── Main component ─────────────────────────────────────────────────────────

export function WorkspaceSettings() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const supabase = createClient();

  const [dirty, setDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);

  const storedWorkspace = ((profile as Record<string, unknown>)?.preferences as Record<string, unknown> | null)
    ?.workspace as Partial<WorkspacePrefs> | undefined;

  const [workspace, setWorkspace] = useState<WorkspacePrefs>(() => ({
    ...DEFAULT_WORKSPACE,
    ...storedWorkspace,
  }));

  // Initialize once when profile loads
  if (profile && !initialized.current) {
    const stored = ((profile as Record<string, unknown>)?.preferences as Record<string, unknown> | null)
      ?.workspace as Partial<WorkspacePrefs> | undefined;
    if (stored) setWorkspace({ ...DEFAULT_WORKSPACE, ...stored });
    initialized.current = true;
  }

  const set = useCallback((key: keyof WorkspacePrefs, value: string) => {
    setWorkspace((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    setSaveSuccess(false);
    setUploadError(null);
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Formato inválido. Use JPG, PNG, WebP ou SVG.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Arquivo muito grande. Máximo 2 MB.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const path = `workspace/logo.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      set("logo_url", data.publicUrl + `?t=${Date.now()}`);
    } catch {
      setUploadError("Erro ao fazer upload da logo. Tente novamente.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    const currentPrefs = ((profile as Record<string, unknown>)?.preferences as Record<string, unknown>) ?? {};
    updateProfile.mutate(
      { preferences: { ...currentPrefs, workspace } } as never,
      {
        onSuccess: () => {
          setDirty(false);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        },
      },
    );
  };

  const handleDiscard = () => {
    const stored = ((profile as Record<string, unknown>)?.preferences as Record<string, unknown> | null)
      ?.workspace as Partial<WorkspacePrefs> | undefined;
    setWorkspace({ ...DEFAULT_WORKSPACE, ...(stored ?? {}) });
    setDirty(false);
    setUploadError(null);
  };

  if (isLoading) return <WorkspaceSkeleton />;

  const logoInitials = (workspace.name || "TBO")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <IconBuilding size={16} className="text-muted-foreground" />
            Identidade do Workspace
          </CardTitle>
          <CardDescription>
            Nome, logo e informações públicas da agência no TBO OS.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={workspace.logo_url || undefined} alt="Logo" />
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
                onChange={handleLogoUpload}
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

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ws_name">Nome da agência</Label>
              <Input
                id="ws_name"
                value={workspace.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ex: TBO Agência"
                maxLength={80}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ws_tagline">Tagline</Label>
              <Input
                id="ws_tagline"
                value={workspace.tagline}
                onChange={(e) => set("tagline", e.target.value)}
                placeholder="Ex: Construindo marcas que importam"
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ws_website" className="flex items-center gap-1.5">
                <IconWorld size={12} className="text-muted-foreground" />
                Website
              </Label>
              <Input
                id="ws_website"
                value={workspace.website}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://agenciatbo.com.br"
                type="url"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ws_timezone" className="flex items-center gap-1.5">
                <IconClock size={12} className="text-muted-foreground" />
                Fuso horário
              </Label>
              <Select
                value={workspace.timezone}
                onValueChange={(v) => set("timezone", v)}
              >
                <SelectTrigger id="ws_timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save bar */}
      {(dirty || saveSuccess) && (
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
              <Button variant="outline" size="sm" onClick={handleDiscard}>
                Descartar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={updateProfile.isPending}>
                {updateProfile.isPending && (
                  <IconLoader2 size={14} className="mr-2 animate-spin" />
                )}
                Salvar
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

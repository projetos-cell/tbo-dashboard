"use client";

import { useState, useRef } from "react";
import { z } from "zod";
import { useProfile, useUpdateProfile, useUploadAvatar } from "@/features/configuracoes/hooks/use-settings";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { IconCamera, IconLoader2, IconCheck, IconAlertCircle } from "@tabler/icons-react";

const profileSchema = z.object({
  full_name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().optional(),
  department: z.string().optional(),
  bio: z.string().max(200, "Máximo 200 caracteres").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ROLE_LABELS: Record<string, string> = {
  founder: "Founder",
  diretoria: "Diretoria",
  lider: "Líder",
  colaborador: "Colaborador",
};

const ROLE_COLORS: Record<string, string> = {
  founder: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  diretoria: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  lider: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  colaborador: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

function ProfileFormSkeleton() {
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

export function ProfileForm() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const role = useAuthStore((s) => s.role);
  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [bio, setBio] = useState("");
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const populated = useRef(false);
  if (profile && !populated.current) {
    setFullName(profile.full_name ?? "");
    setPhone(profile.phone ?? "");
    setDepartment(profile.department ?? "");
    setBio((profile as Record<string, unknown>).bio as string ?? "");
    populated.current = true;
  }

  function handleSave() {
    const result = profileSchema.safeParse({ full_name: fullName, phone, department, bio });
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ProfileFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ProfileFormData;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    updateProfile.mutate(
      { full_name: fullName, phone, department },
      {
        onSuccess: () => {
          setDirty(false);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        },
      },
    );
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Arquivo muito grande (máx. 5MB)");
      return;
    }
    uploadAvatar.mutate(file);
  }

  function markDirty() {
    setDirty(true);
    setSaveSuccess(false);
  }

  if (isLoading) return <ProfileFormSkeleton />;

  const initials = (profile?.full_name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const currentRole = role ?? (profile?.role as string) ?? "colaborador";

  return (
    <div className="space-y-6">
      {/* Avatar + identidade */}
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
            disabled={uploadAvatar.isPending}
          >
            <Avatar className="h-20 w-20 ring-2 ring-border ring-offset-2">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="text-lg font-semibold bg-tbo-orange/10 text-tbo-orange">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              {uploadAvatar.isPending ? (
                <IconLoader2 size={20} className="animate-spin text-white" />
              ) : (
                <IconCamera size={20} className="text-white" />
              )}
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{profile?.full_name ?? "Usuário"}</p>
            <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[currentRole] ?? ROLE_COLORS.colaborador}`}
              >
                {ROLE_LABELS[currentRole] ?? currentRole}
              </span>
              {profile?.department && (
                <Badge variant="outline" className="text-xs">
                  {profile.department}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações pessoais</CardTitle>
          <CardDescription>Visível para outros membros da equipe.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Nome completo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  markDirty();
                  setErrors((prev) => ({ ...prev, full_name: undefined }));
                }}
                className={errors.full_name ? "border-destructive" : ""}
              />
              {errors.full_name && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <IconAlertCircle size={12} />
                  {errors.full_name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value={profile?.email ?? ""} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">E-mail não pode ser alterado aqui.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone / WhatsApp</Label>
              <Input
                id="phone"
                placeholder="(00) 90000-0000"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); markDirty(); }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departamento / BU</Label>
              <Input
                id="department"
                placeholder="Ex: Branding, Marketing..."
                value={department}
                onChange={(e) => { setDepartment(e.target.value); markDirty(); }}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={3}
              placeholder="Conte um pouco sobre você, sua área de atuação..."
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                markDirty();
                setErrors((prev) => ({ ...prev, bio: undefined }));
              }}
              className={errors.bio ? "border-destructive" : ""}
            />
            <div className="flex items-center justify-between">
              {errors.bio ? (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <IconAlertCircle size={12} />
                  {errors.bio}
                </p>
              ) : (
                <span />
              )}
              <p className="text-xs text-muted-foreground ml-auto">{bio.length}/200</p>
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
              Alterações salvas com sucesso
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Você tem alterações não salvas.</p>
          )}
          {dirty && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  populated.current = false;
                  setDirty(false);
                  setErrors({});
                }}
              >
                Descartar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={updateProfile.isPending}>
                {updateProfile.isPending && <IconLoader2 size={14} className="mr-2 animate-spin" />}
                Salvar alterações
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

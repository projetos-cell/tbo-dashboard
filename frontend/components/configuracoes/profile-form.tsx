"use client";

import { useState, useRef } from "react";
import { useProfile, useUpdateProfile, useUploadAvatar } from "@/hooks/use-settings";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Loader2 } from "lucide-react";

export function ProfileForm() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const role = useAuthStore((s) => s.role);
  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [dirty, setDirty] = useState(false);

  // Populate form when profile loads
  const populated = useRef(false);
  if (profile && !populated.current) {
    setFullName(profile.full_name ?? "");
    setPhone(profile.phone ?? "");
    setDepartment(profile.department ?? "");
    populated.current = true;
  }

  function handleSave() {
    updateProfile.mutate(
      { full_name: fullName, phone, department },
      { onSuccess: () => setDirty(false) },
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

  if (isLoading) return null;

  const initials = (profile?.full_name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Foto de perfil</CardTitle>
          <CardDescription>Clique na foto para alterar</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <button
            type="button"
            className="relative group"
            onClick={() => fileRef.current?.click()}
          >
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              {uploadAvatar.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </div>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <div>
            <p className="font-medium">{profile?.full_name ?? "Usuário"}</p>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
            <span className="inline-block mt-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
              {role ?? profile?.role ?? "member"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações pessoais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome completo</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setDirty(true); }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" value={profile?.email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setDirty(true); }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Departamento</Label>
            <Input
              id="department"
              value={department}
              onChange={(e) => { setDepartment(e.target.value); setDirty(true); }}
            />
          </div>
        </CardContent>
      </Card>

      {dirty && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={updateProfile.isPending}>
            {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar alterações
          </Button>
        </div>
      )}
    </div>
  );
}

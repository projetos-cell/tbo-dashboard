"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";

interface StepProfileProps {
  fullName: string;
  cargo: string;
  avatarFile: File | null;
  avatarPreview: string | null;
  onFullNameChange: (v: string) => void;
  onCargoChange: (v: string) => void;
  onAvatarChange: (file: File, preview: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isLoading: boolean;
}

export function StepProfile({
  fullName,
  cargo,
  avatarFile,
  avatarPreview,
  onFullNameChange,
  onCargoChange,
  onAvatarChange,
  onNext,
  onBack,
  onSkip,
  isLoading,
}: StepProfileProps) {
  const user = useAuthStore((s) => s.user);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = (fullName || user?.email || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onAvatarChange(file, url);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Complete seu perfil</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Essas informações aparecem para o seu time.
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatarPreview ?? undefined} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent transition-colors"
          >
            <Camera className="h-3 w-3" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Foto de perfil</p>
          <p className="text-xs">JPG, PNG ou GIF</p>
        </div>
      </div>

      {/* Fields */}
      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="fullName">Nome completo</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            placeholder={user?.email ?? "Seu nome"}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="cargo">Cargo</Label>
          <Input
            id="cargo"
            value={cargo}
            onChange={(e) => onCargoChange(e.target.value)}
            placeholder="Ex: Líder de Projetos"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={isLoading}>
          ← Voltar
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onSkip} disabled={isLoading}>
            Pular por agora
          </Button>
          <Button onClick={onNext} disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar e seguir →"}
          </Button>
        </div>
      </div>
    </div>
  );
}

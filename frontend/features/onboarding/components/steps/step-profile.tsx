"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconCamera } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/auth-store";
import {
  profileStepSchema,
  type ProfileStepValues,
} from "../../schemas/onboarding-schemas";

const DEPARTMENTS = [
  "Criacao",
  "3D / Archviz",
  "Design",
  "Video / Motion",
  "Atendimento / CS",
  "Comercial",
  "Marketing",
  "Financeiro",
  "Tecnologia",
  "Gestao / Diretoria",
  "Outro",
];

interface StepProfileProps {
  defaultValues: ProfileStepValues;
  avatarPreview: string | null;
  onAvatarChange: (file: File, preview: string) => void;
  onSubmit: (values: ProfileStepValues) => void;
  onBack: () => void;
  isLoading: boolean;
}

export function StepProfile({
  defaultValues,
  avatarPreview,
  onAvatarChange,
  onSubmit,
  onBack,
  isLoading,
}: StepProfileProps) {
  const user = useAuthStore((s) => s.user);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileStepValues>({
    resolver: zodResolver(profileStepSchema),
    defaultValues,
  });

  const fullName = watch("fullName");
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Complete seu perfil
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Essas informacoes aparecem para o seu time.
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
            <IconCamera className="h-3 w-3" />
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
          <p className="text-xs">JPG, PNG ou GIF — opcional</p>
        </div>
      </div>

      {/* Fields */}
      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="fullName">
            Nome completo <span className="text-destructive">*</span>
          </Label>
          <Input
            id="fullName"
            {...register("fullName")}
            placeholder={user?.email ?? "Seu nome completo"}
          />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="cargo">
            Cargo <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cargo"
            {...register("cargo")}
            placeholder="Ex: Lider de Projetos"
          />
          {errors.cargo && (
            <p className="text-xs text-destructive">{errors.cargo.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="department">Departamento</Label>
            <Select
              value={watch("department") ?? ""}
              onValueChange={(v) => setValue("department", v)}
            >
              <SelectTrigger id="department">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="(41) 99999-0000"
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={isLoading}
        >
          Voltar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Continuar"}
        </Button>
      </div>
    </form>
  );
}

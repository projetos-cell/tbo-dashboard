"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconDeviceFloppy,
  IconCamera,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  UpdateUserSchema,
  type UpdateUserInput,
  type TeamMember,
} from "@/schemas/team";
import { useUpdateTeamMember } from "@/hooks/use-team";
import { ROLE_CONFIG } from "./team-ui";
import {
  type RoleSlug,
  ROLE_HIERARCHY,
} from "@/lib/permissions";
import { createClient } from "@/lib/supabase/client";

type EditUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  currentUserRole: RoleSlug;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function EditUserDialog({
  open,
  onOpenChange,
  member,
  currentUserRole,
}: EditUserDialogProps) {
  const update = useUpdateTeamMember();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
      id: "",
      full_name: "",
      role: "colaborador",
      department: "",
      is_active: true,
      phone: "",
      cargo: "",
      bio: "",
      avatar_url: null,
    },
  });

  useEffect(() => {
    if (member) {
      const raw = member as Record<string, unknown>;
      form.reset({
        id: member.id,
        full_name: member.full_name,
        role: member.role,
        department: member.department ?? "",
        is_active: member.is_active,
        phone: (raw.phone as string) ?? "",
        cargo: (raw.cargo as string) ?? "",
        bio: (raw.bio as string) ?? "",
        avatar_url: member.avatar_url ?? null,
      });
      setAvatarPreview(member.avatar_url ?? null);
    }
  }, [member, form]);

  const handleAvatarUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !member) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Selecione uma imagem valida.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Imagem deve ter no maximo 2MB.");
        return;
      }

      setUploading(true);
      try {
        const supabase = createClient();
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `avatars/${member.id}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(path);

        const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
        setAvatarPreview(publicUrl);
        form.setValue("avatar_url", publicUrl);
        toast.success("Avatar atualizado!");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Erro ao fazer upload."
        );
      } finally {
        setUploading(false);
      }
    },
    [member, form]
  );

  const assignableRoles = (
    ["founder", "diretoria", "lider", "colaborador"] as const
  ).filter((role) => {
    if (currentUserRole === "founder") return true;
    return ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[role];
  });

  const canEdit =
    currentUserRole === "founder" ||
    (member
      ? ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[member.role]
      : false);

  async function onSubmit(data: UpdateUserInput) {
    try {
      const cleaned: UpdateUserInput = { id: data.id };
      if (data.full_name) cleaned.full_name = data.full_name;
      if (data.role) cleaned.role = data.role;
      if (data.department !== undefined)
        cleaned.department = data.department || null;
      if (data.is_active !== undefined) cleaned.is_active = data.is_active;
      if (data.phone !== undefined) cleaned.phone = data.phone || null;
      if (data.cargo !== undefined) cleaned.cargo = data.cargo || null;
      if (data.bio !== undefined) cleaned.bio = data.bio || null;
      if (data.avatar_url !== undefined) cleaned.avatar_url = data.avatar_url;

      await update.mutateAsync(cleaned);
      toast.success("Perfil atualizado com sucesso!");
      onOpenChange(false);
    } catch {
      // Error handling via toast/boundary
    }
  }

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>
            {canEdit
              ? `Atualize as informacoes de ${member.full_name}`
              : "Voce nao tem permissao para editar este membro"}
          </DialogDescription>
        </DialogHeader>

        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Tabs defaultValue="perfil" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="perfil">Perfil</TabsTrigger>
              <TabsTrigger value="acesso">Acesso</TabsTrigger>
            </TabsList>

            <TabsContent value="perfil" className="mt-4 space-y-4">
              {/* Avatar upload */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    {avatarPreview && <AvatarImage src={avatarPreview} />}
                    <AvatarFallback className="text-lg">
                      {getInitials(member.full_name || "")}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                  >
                    {uploading ? (
                      <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <IconCamera className="h-3.5 w-3.5" />
                    )}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={!canEdit || uploading}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Foto de perfil</p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG ou WebP. Max 2MB.
                  </p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!canEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="cargo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Ex: Designer Senior"
                          disabled={!canEdit}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          disabled={!canEdit}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="(11) 99999-9999"
                        disabled={!canEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Conte um pouco sobre voce..."
                        rows={3}
                        className="resize-none"
                        disabled={!canEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="acesso" className="mt-4 space-y-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel de acesso</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!canEdit}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assignableRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            <span className="font-medium">
                              {ROLE_CONFIG[role].label}
                            </span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {ROLE_CONFIG[role].description}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Conta ativa</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Desativar impede o acesso ao sistema sem excluir o
                        usuario.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!canEdit}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!canEdit || update.isPending}
            >
              {update.isPending ? (
                "Salvando..."
              ) : (
                <>
                  <IconDeviceFloppy size={16} className="mr-1" />
                  Salvar alteracoes
                </>
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

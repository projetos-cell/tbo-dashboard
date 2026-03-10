"use client";

import { useEffect } from "react";
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
import { IconDeviceFloppy } from "@tabler/icons-react";
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

type EditUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  currentUserRole: RoleSlug;
};

export function EditUserDialog({
  open,
  onOpenChange,
  member,
  currentUserRole,
}: EditUserDialogProps) {
  const update = useUpdateTeamMember();

  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
      id: "",
      full_name: "",
      role: "colaborador",
      department: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (member) {
      form.reset({
        id: member.id,
        full_name: member.full_name,
        role: member.role,
        department: member.department ?? "",
        is_active: member.is_active,
      });
    }
  }, [member, form]);

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
      await update.mutateAsync(data);
      onOpenChange(false);
    } catch {
      // Error handling via toast/boundary
    }
  }

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Editar membro</DialogTitle>
          <DialogDescription>
            {canEdit
              ? `Atualize as informacoes de ${member.full_name}`
              : "Voce nao tem permissao para editar este membro"}
          </DialogDescription>
        </DialogHeader>

        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivel de acesso</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
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

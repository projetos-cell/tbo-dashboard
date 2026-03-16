"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconSend } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InviteUserSchema, type InviteUserInput } from "@/schemas/team";
import { useInviteTeamMember } from "@/hooks/use-team";
import { ROLE_HIERARCHY, type RoleSlug } from "@/lib/permissions";
import { ROLE_CONFIG } from "./team-ui";

type InviteUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserRole: RoleSlug;
};

export function InviteUserDialog({
  open,
  onOpenChange,
  currentUserRole,
}: InviteUserDialogProps) {
  const invite = useInviteTeamMember();

  const form = useForm<InviteUserInput>({
    resolver: zodResolver(InviteUserSchema),
    defaultValues: { email: "", role: "colaborador" },
  });

  const assignableRoles = (
    ["founder", "diretoria", "lider", "colaborador"] as const
  ).filter((role) =>
    currentUserRole === "founder" ? true : ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[role],
  );

  function handleClose() {
    form.reset();
    onOpenChange(false);
  }

  async function onSubmit(data: InviteUserInput) {
    try {
      // Derive full_name from email prefix if not provided
      const emailPrefix = data.email.split("@")[0].replace(/[._-]/g, " ");
      const fullName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

      await invite.mutateAsync({
        ...data,
        full_name: fullName,
      });
      handleClose();
    } catch {
      // Toast de erro tratado pelo mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Adicionar usuário</DialogTitle>
          <DialogDescription>
            O convite será enviado por e-mail. O novo membro preenche o perfil no primeiro acesso.
          </DialogDescription>
        </DialogHeader>

        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="nome@agenciatbo.com.br"
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Um magic link será enviado para este e-mail.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nível de acesso</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {assignableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">{ROLE_CONFIG[role].label}</span>
                          <span className="text-xs text-muted-foreground">
                            {ROLE_CONFIG[role].description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={invite.isPending}>
              {invite.isPending ? (
                "Enviando..."
              ) : (
                <>
                  <IconSend size={16} className="mr-1" />
                  Enviar convite
                </>
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

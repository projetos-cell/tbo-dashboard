"use client";

import { useState } from "react";
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
  FormDescription,
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
import {
  IconArrowLeft,
  IconArrowRight,
  IconSend,
} from "@tabler/icons-react";
import { InviteUserSchema, type InviteUserInput } from "@/schemas/team";
import { useInviteTeamMember } from "@/hooks/use-team";
import { ROLE_CONFIG, RoleBadge } from "./team-ui";
import {
  type RoleSlug,
  ROLE_HIERARCHY,
} from "@/lib/permissions";

// ────────────────────────────────────────────────────
// Stepper steps
// ────────────────────────────────────────────────────

const STEPS = [
  {
    id: "info",
    title: "Informacoes",
    description: "Nome e e-mail do novo membro",
  },
  {
    id: "role",
    title: "Permissoes",
    description: "Nivel de acesso no TBO OS",
  },
  {
    id: "confirm",
    title: "Confirmar",
    description: "Revise antes de enviar o convite",
  },
] as const;

// ────────────────────────────────────────────────────
// Props
// ────────────────────────────────────────────────────

type InviteUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserRole: RoleSlug;
};

// ────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────

export function InviteUserDialog({
  open,
  onOpenChange,
  currentUserRole,
}: InviteUserDialogProps) {
  const [step, setStep] = useState(0);
  const invite = useInviteTeamMember();

  const form = useForm<InviteUserInput>({
    resolver: zodResolver(InviteUserSchema),
    defaultValues: {
      email: "",
      full_name: "",
      role: "colaborador",
      department: "",
    },
  });

  const assignableRoles = (
    ["founder", "diretoria", "lider", "colaborador"] as const
  ).filter((role) => {
    if (currentUserRole === "founder") return true;
    return ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[role];
  });

  function handleClose() {
    form.reset();
    setStep(0);
    onOpenChange(false);
  }

  async function handleNext() {
    if (step === 0) {
      const valid = await form.trigger(["full_name", "email"]);
      if (!valid) return;
    }
    if (step === 1) {
      const valid = await form.trigger(["role"]);
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(data: InviteUserInput) {
    try {
      await invite.mutateAsync(data);
      handleClose();
    } catch {
      // Toast de erro tratado pelo mutation
    }
  }

  const values = form.watch();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Convidar membro</DialogTitle>
          <DialogDescription>
            Passo {step + 1} de {STEPS.length} — {STEPS[step].description}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex gap-2 py-2">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-brand" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Step 1: Info */}
            {step === 0 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Mariane Nogueira"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="membro@tbo.com.br"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        O convite sera enviado para este e-mail.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Departamento{" "}
                        <span className="text-muted-foreground">
                          (opcional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Digital 3D, Branding, Marketing"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 2: Role */}
            {step === 1 && (
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel de acesso</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nivel de acesso" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assignableRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium">
                                {ROLE_CONFIG[role].label}
                              </span>
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
            )}

            {/* Step 3: Confirm */}
            {step === 2 && (
              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Resumo do convite
                </h4>
                <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                  <span className="text-muted-foreground">Nome</span>
                  <span className="font-medium">{values.full_name}</span>

                  <span className="text-muted-foreground">E-mail</span>
                  <span className="font-medium">{values.email}</span>

                  <span className="text-muted-foreground">Acesso</span>
                  <RoleBadge role={values.role as RoleSlug} />

                  {values.department && (
                    <>
                      <span className="text-muted-foreground">Depto.</span>
                      <span className="font-medium">
                        {values.department}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <DialogFooter className="gap-2 sm:gap-0">
              {step > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                >
                  <IconArrowLeft size={16} className="mr-1" />
                  Voltar
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={handleNext}>
                  Proximo
                  <IconArrowRight size={16} className="ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={invite.isPending}
                  onClick={form.handleSubmit(onSubmit)}
                >
                  {invite.isPending ? (
                    "Enviando..."
                  ) : (
                    <>
                      <IconSend size={16} className="mr-1" />
                      Enviar convite
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

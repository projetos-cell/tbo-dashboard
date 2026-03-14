"use client";

import type { Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
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
import type { InviteUserInput } from "@/schemas/team";
import { ROLE_CONFIG, RoleBadge } from "./team-ui";
import type { RoleSlug } from "@/lib/permissions";

// ── Step 0: Basic info ───────────────────────────────

export function InviteStepInfo({ control }: { control: Control<InviteUserInput> }) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="full_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome completo</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Mariane Nogueira" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>E-mail</FormLabel>
            <FormControl>
              <Input type="email" placeholder="membro@tbo.com.br" {...field} />
            </FormControl>
            <FormDescription>O convite sera enviado para este e-mail.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="department"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Departamento{" "}
              <span className="text-muted-foreground">(opcional)</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="Ex: Digital 3D, Branding, Marketing" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

// ── Step 1: Role selection ───────────────────────────

export function InviteStepRole({
  control,
  assignableRoles,
}: {
  control: Control<InviteUserInput>;
  assignableRoles: readonly RoleSlug[];
}) {
  return (
    <FormField
      control={control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nivel de acesso</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nivel de acesso" />
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
  );
}

// ── Step 2: Confirmation summary ─────────────────────

export function InviteStepConfirm({ values }: { values: InviteUserInput }) {
  return (
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
            <span className="font-medium">{values.department}</span>
          </>
        )}
      </div>
    </div>
  );
}

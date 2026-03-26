"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import {
  IconSun,
  IconMoon,
  IconDeviceDesktop,
  IconBell,
  IconBellOff,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  preferencesStepSchema,
  type PreferencesStepValues,
} from "../../schemas/onboarding-schemas";

const THEME_OPTIONS = [
  {
    value: "light" as const,
    label: "Claro",
    icon: IconSun,
    description: "Ideal para ambientes bem iluminados",
  },
  {
    value: "dark" as const,
    label: "Escuro",
    icon: IconMoon,
    description: "Menos cansaco visual, ideal para longas sessoes",
  },
  {
    value: "system" as const,
    label: "Sistema",
    icon: IconDeviceDesktop,
    description: "Acompanha a configuracao do seu dispositivo",
  },
];

interface StepPreferencesProps {
  defaultValues: PreferencesStepValues;
  onSubmit: (values: PreferencesStepValues) => void;
  onBack: () => void;
  isLoading: boolean;
}

export function StepPreferences({
  defaultValues,
  onSubmit,
  onBack,
  isLoading,
}: StepPreferencesProps) {
  const { setTheme } = useTheme();

  const { handleSubmit, watch, setValue, control } =
    useForm<PreferencesStepValues>({
      resolver: zodResolver(preferencesStepSchema),
      defaultValues,
    });

  const selectedTheme = watch("theme");

  function handleThemeSelect(theme: PreferencesStepValues["theme"]) {
    setValue("theme", theme);
    setTheme(theme); // Apply immediately for preview
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Preferencias</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Configure o visual e notificacoes do seu ambiente.
        </p>
      </div>

      {/* Theme */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Tema</Label>
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map(({ value, label, icon: Icon, description }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleThemeSelect(value)}
              className={`relative flex flex-col items-center gap-2 rounded-lg border p-4 transition-all hover:bg-accent/50 ${
                selectedTheme === value
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border"
              }`}
            >
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">{label}</span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                {description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-lg border p-4 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
            {watch("notificationsEnabled") ? (
              <IconBell className="h-4 w-4 text-foreground" />
            ) : (
              <IconBellOff className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">Notificacoes</p>
            <p className="text-xs text-muted-foreground">
              Receber alertas de tarefas, mencoes e atualizacoes do sistema
            </p>
          </div>
        </div>
        <Controller
          control={control}
          name="notificationsEnabled"
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
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
          Continuar
        </Button>
      </div>
    </form>
  );
}

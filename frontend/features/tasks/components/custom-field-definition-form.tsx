"use client";

import { useState } from "react";
import { IconChevronLeft, IconChevronRight, IconCheck } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateFieldDefinition } from "@/features/tasks/hooks/use-task-custom-fields";
import { StepIndicator, STEPS } from "./custom-field-step-indicator";
import {
  StepName,
  StepType,
  StepOptions,
  StepRequired,
  StepPreview,
  PRESET_COLORS,
} from "./custom-field-definition-steps";
import type { FieldType, FieldOption } from "@/schemas/custom-field";

interface CustomFieldDefinitionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomFieldDefinitionForm({
  open,
  onOpenChange,
}: CustomFieldDefinitionFormProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("text");
  const [options, setOptions] = useState<FieldOption[]>([]);
  const [isRequired, setIsRequired] = useState(false);
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [newOptionColor, setNewOptionColor] = useState(PRESET_COLORS[0]);

  const createDef = useCreateFieldDefinition();

  const currentStep = STEPS[step];
  const needsOptions = fieldType === "select" || fieldType === "multi_select";

  function reset() {
    setStep(0);
    setName("");
    setFieldType("text");
    setOptions([]);
    setIsRequired(false);
    setNewOptionLabel("");
    setNewOptionColor(PRESET_COLORS[0]);
  }

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  function canAdvance(): boolean {
    if (step === 0) return name.trim().length >= 1;
    if (step === 1) return true;
    if (step === 2) return !needsOptions || options.length > 0;
    return true;
  }

  function next() {
    if (!canAdvance()) return;
    if (step === 1 && !needsOptions) {
      setStep(3);
    } else {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  }

  function prev() {
    if (step === 3 && !needsOptions) {
      setStep(1);
    } else {
      setStep((s) => Math.max(s - 1, 0));
    }
  }

  function addOption() {
    if (!newOptionLabel.trim()) return;
    setOptions((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: newOptionLabel.trim(), color: newOptionColor },
    ]);
    setNewOptionLabel("");
  }

  function removeOption(id: string) {
    setOptions((prev) => prev.filter((o) => o.id !== id));
  }

  async function handleConfirm() {
    await createDef.mutateAsync({
      name: name.trim(),
      field_type: fieldType,
      options: needsOptions ? options : [],
      is_required: isRequired,
    });
    handleClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-base">Novo campo personalizado</DialogTitle>
        </DialogHeader>

        <StepIndicator steps={STEPS} currentStep={step} needsOptions={needsOptions} />

        <div className="min-h-[180px] py-2">
          {currentStep === "Nome" && (
            <StepName value={name} onChange={setName} />
          )}
          {currentStep === "Tipo" && (
            <StepType value={fieldType} onChange={setFieldType} />
          )}
          {currentStep === "Opções" && (
            <StepOptions
              options={options}
              newLabel={newOptionLabel}
              newColor={newOptionColor}
              onNewLabelChange={setNewOptionLabel}
              onNewColorChange={setNewOptionColor}
              onAdd={addOption}
              onRemove={removeOption}
            />
          )}
          {currentStep === "Obrigatório?" && (
            <StepRequired value={isRequired} onChange={setIsRequired} />
          )}
          {currentStep === "Confirmar" && (
            <StepPreview
              name={name}
              fieldType={fieldType}
              options={options}
              isRequired={isRequired}
            />
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={prev}
            disabled={step === 0}
            className="gap-1"
          >
            <IconChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              size="sm"
              onClick={next}
              disabled={!canAdvance()}
              className="gap-1"
            >
              Próximo
              <IconChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={createDef.isPending}
              className="gap-1"
            >
              <IconCheck className="h-4 w-4" />
              {createDef.isPending ? "Salvando..." : "Criar campo"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

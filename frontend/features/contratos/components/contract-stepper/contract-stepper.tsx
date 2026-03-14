"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  IconArrowLeft,
  IconArrowRight,
  IconLoader2,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { StepperHeader } from "./stepper-header";
import { StepBasics } from "./step-basics";
import { StepScope } from "./step-scope";
import { StepSigners } from "./step-signers";
import { StepDocument } from "./step-document";
import { StepReview } from "./step-review";
import { STEPS, useContractStepper } from "./use-contract-stepper";

export function ContractStepper() {
  const {
    currentStep,
    isSubmitting,
    basics,
    scopeItems,
    signers,
    file,
    errors,
    updateBasics,
    setScopeItems,
    setSigners,
    setFile,
    next,
    back,
    handleSubmit,
    isLastStep,
  } = useContractStepper();

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <StepperHeader steps={STEPS} currentStep={currentStep} />

      <ScrollArea className="flex-1 px-1">
        <div className="pb-6">
          {currentStep === 0 && (
            <StepBasics data={basics} onChange={updateBasics} errors={errors} />
          )}
          {currentStep === 1 && (
            <StepScope items={scopeItems} onChange={setScopeItems} />
          )}
          {currentStep === 2 && (
            <StepSigners signers={signers} onChange={setSigners} />
          )}
          {currentStep === 3 && (
            <StepDocument file={file} onChange={setFile} />
          )}
          {currentStep === 4 && (
            <StepReview
              basics={basics}
              scopeItems={scopeItems}
              signers={signers}
              file={file}
            />
          )}
        </div>
      </ScrollArea>

      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={back}
          disabled={currentStep === 0 || isSubmitting}
        >
          <IconArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>

        <div className="flex items-center gap-2">
          {isLastStep ? (
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <IconLoader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <IconDeviceFloppy className="h-4 w-4 mr-1" />
              )}
              Criar Contrato
            </Button>
          ) : (
            <Button type="button" onClick={next}>
              Proximo
              <IconArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  IconCheck,
  IconGlobe,
  IconLink,
  IconPrinter,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUpdateProject } from "@/features/projects/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectShareSheetProps {
  project: ProjectRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectShareSheet({
  project,
  open,
  onOpenChange,
}: ProjectShareSheetProps) {
  const updateProject = useUpdateProject();
  const { toast } = useToast();
  const [linkCopied, setLinkCopied] = useState(false);
  const [portalLinkCopied, setPortalLinkCopied] = useState(false);
  const [generatingPortal, setGeneratingPortal] = useState(false);

  const portalToken = (project as Record<string, unknown>).portal_token as string | null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/projetos/${project.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const handleCopyPortalLink = () => {
    if (!portalToken) return;
    const url = `${window.location.origin}/portal/projeto/${portalToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setPortalLinkCopied(true);
      setTimeout(() => setPortalLinkCopied(false), 2000);
    });
  };

  const handleGeneratePortalToken = () => {
    setGeneratingPortal(true);
    const token = crypto.randomUUID();
    updateProject.mutate(
      { id: project.id, updates: { portal_token: token } as never },
      {
        onSuccess: () => {
          toast({ title: "Link do portal gerado com sucesso" });
          setGeneratingPortal(false);
        },
        onError: () => {
          toast({ title: "Erro ao gerar link", variant: "destructive" });
          setGeneratingPortal(false);
        },
      }
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[380px]">
        <SheetHeader>
          <SheetTitle>Compartilhar projeto</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          {/* Copy link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Link do projeto</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 truncate rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/projetos/${project.id}`
                  : `/projetos/${project.id}`}
              </div>
              <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={handleCopyLink}>
                {linkCopied ? <IconCheck className="size-3.5 text-green-500" /> : <IconLink className="size-3.5" />}
                {linkCopied ? "Copiado" : "Copiar"}
              </Button>
            </div>
          </div>

          {/* Portal link */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <IconGlobe className="size-3.5" />
              Link do Portal do Cliente
            </label>
            {portalToken ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 truncate rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/portal/projeto/${portalToken}`
                    : `/portal/projeto/${portalToken}`}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 shrink-0"
                  onClick={handleCopyPortalLink}
                >
                  {portalLinkCopied ? (
                    <IconCheck className="size-3.5 text-green-500" />
                  ) : (
                    <IconLink className="size-3.5" />
                  )}
                  {portalLinkCopied ? "Copiado" : "Copiar"}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={handleGeneratePortalToken}
                disabled={generatingPortal}
              >
                <IconGlobe className="size-3.5" />
                {generatingPortal ? "Gerando..." : "Gerar link público"}
              </Button>
            )}
            <p className="text-[11px] text-muted-foreground">
              O cliente pode acompanhar o progresso e aprovar entregas por esse link.
            </p>
          </div>

          {/* Print */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Exportar</label>
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={handlePrint}>
              <IconPrinter className="size-3.5" />
              Imprimir / Salvar como PDF
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  IconPencil,
  IconTrash,
  IconDownload,
} from "@tabler/icons-react";
import type { Database } from "@/lib/supabase/types";
import { ContractDetailHeader } from "./contract-detail-header";
import { ContractDetailBody } from "./contract-detail-body";

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"];

interface ContractDetailDialogProps {
  contract: ContractRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (contract: ContractRow) => void;
  onDelete?: (contract: ContractRow) => void;
}

/** Resolve a downloadable URL — tries file_url first, then source_path */
function getFileUrl(contract: ContractRow): string | null {
  if (contract.file_url) return contract.file_url;
  if (contract.source_path && contract.source_path.startsWith("http"))
    return contract.source_path;
  return null;
}

export function ContractDetailDialog({
  contract,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: ContractDetailDialogProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!contract) return null;

  const downloadUrl = getFileUrl(contract);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex flex-col overflow-y-auto sm:max-w-md p-0">
          {/* ── Header ──────────────────────────────────────────── */}
          <ContractDetailHeader contract={contract} />

          {/* ── Body ─────────────────────────────────────────────── */}
          <ContractDetailBody contract={contract} downloadUrl={downloadUrl} />

          {/* ── Footer Actions ───────────────────────────────────── */}
          <div className="border-t border-border/50 px-6 py-4 space-y-2 bg-background">
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  className="flex-1 bg-[#f97316] hover:bg-[#ea580c] text-white gap-2"
                  onClick={() => onEdit(contract)}
                >
                  <IconPencil className="h-4 w-4" />
                  Editar
                </Button>
              )}
              {downloadUrl && (
                <Button variant="outline" className="gap-2" asChild>
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconDownload className="h-4 w-4" />
                    PDF
                  </a>
                </Button>
              )}
            </div>
            {onDelete && (
              <Button
                variant="ghost"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 gap-2"
                onClick={() => setDeleteOpen(true)}
              >
                <IconTrash className="h-4 w-4" />
                Excluir contrato
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir contrato</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir{" "}
              <strong>{contract.title}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                onDelete?.(contract);
                setDeleteOpen(false);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

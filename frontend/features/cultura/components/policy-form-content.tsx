"use client";

import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TiptapEditor = dynamic(
  () =>
    import("@/components/editor/tiptap-editor").then((m) => ({
      default: m.TiptapEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
    ),
  }
);

interface PolicyFormContentProps {
  contentMd: string;
  onContentMdChange: (value: string) => void;
  effectiveDate: string;
  onEffectiveDateChange: (value: string) => void;
  reviewCycleDays: string;
  onReviewCycleDaysChange: (value: string) => void;
  changeNote: string;
  onChangeNoteChange: (value: string) => void;
  isEditing: boolean;
}

export function PolicyFormContent({
  contentMd,
  onContentMdChange,
  effectiveDate,
  onEffectiveDateChange,
  reviewCycleDays,
  onReviewCycleDaysChange,
  changeNote,
  onChangeNoteChange,
  isEditing,
}: PolicyFormContentProps) {
  return (
    <div className="space-y-4">
      {/* Content editor */}
      <div className="space-y-1.5">
        <Label>Conteudo da politica</Label>
        <TiptapEditor
          content={contentMd}
          onChange={onContentMdChange}
          placeholder="Escreva o conteudo completo da politica..."
          minHeight="min-h-[250px]"
        />
      </div>

      {/* Governance fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Data de vigencia</Label>
          <Input
            type="date"
            value={effectiveDate}
            onChange={(e) => onEffectiveDateChange(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Ciclo de revisao (dias)</Label>
          <Select
            value={reviewCycleDays || "none"}
            onValueChange={(val) =>
              onReviewCycleDaysChange(val === "none" ? "" : val)
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Sem ciclo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem ciclo</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
              <SelectItem value="180">180 dias</SelectItem>
              <SelectItem value="365">365 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Change note (editing only) */}
      {isEditing && (
        <div className="space-y-1.5">
          <Label>Nota da revisao</Label>
          <Input
            value={changeNote}
            onChange={(e) => onChangeNoteChange(e.target.value)}
            placeholder="O que mudou nesta versao?"
          />
        </div>
      )}
    </div>
  );
}

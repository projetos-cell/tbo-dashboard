import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  POLICY_CATEGORIES,
  type PolicyCategoryKey,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PolicyFormIdentityProps {
  title: string;
  onTitleChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  summary: string;
  onSummaryChange: (value: string) => void;
  imageUrl: string;
  onImageUrlChange: (value: string) => void;
  errors: Record<string, string>;
}

export function PolicyFormIdentity({
  title,
  onTitleChange,
  category,
  onCategoryChange,
  summary,
  onSummaryChange,
  imageUrl,
  onImageUrlChange,
  errors,
}: PolicyFormIdentityProps) {
  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-1.5">
        <Label>Titulo *</Label>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Ex.: Politica Antiassedio"
        />
        {errors.title && (
          <p className="text-xs text-red-500">{errors.title}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label>Categoria *</Label>
        <div className="flex flex-wrap gap-1.5">
          {(
            Object.entries(POLICY_CATEGORIES) as [
              PolicyCategoryKey,
              (typeof POLICY_CATEGORIES)[PolicyCategoryKey],
            ][]
          ).map(([key, def]) => (
            <Badge
              key={key}
              variant={category === key ? "default" : "outline"}
              className="cursor-pointer text-xs"
              style={
                category === key
                  ? { backgroundColor: def.color, color: "#fff" }
                  : {}
              }
              onClick={() => onCategoryChange(key)}
            >
              {def.label}
            </Badge>
          ))}
        </div>
        {errors.category && (
          <p className="text-xs text-red-500">{errors.category}</p>
        )}
      </div>

      {/* Image URL */}
      <div className="space-y-1.5">
        <Label>Imagem do card (URL)</Label>
        <Input
          value={imageUrl}
          onChange={(e) => onImageUrlChange(e.target.value)}
          placeholder="https://exemplo.com/imagem.jpg"
        />
        <p className="text-xs text-gray-500">
          Opcional. Se vazio, sera usado um placeholder.
        </p>
      </div>

      {/* Summary */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>Resumo *</Label>
          <span
            className={cn(
              "text-xs",
              summary.length > 320 ? "text-red-500" : "text-gray-500"
            )}
          >
            {summary.length}/320
          </span>
        </div>
        <Textarea
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          placeholder="Resumo que aparecera no card (240-320 caracteres recomendados)"
          rows={3}
        />
        {errors.summary && (
          <p className="text-xs text-red-500">{errors.summary}</p>
        )}
      </div>
    </div>
  );
}

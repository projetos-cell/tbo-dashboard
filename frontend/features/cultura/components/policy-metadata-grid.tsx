import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";

interface PolicyMetadataGridProps {
  policy: {
    status: string;
    category: string;
    version: number;
    review_cycle_days?: number | null;
    effective_date?: string | null;
    next_review_at?: string | null;
    created_at: string;
  };
  statusDef?: { label: string; color: string };
  catDef?: { label: string; color: string };
  isOverdue: boolean;
}

function DetailField({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className="font-medium" style={color ? { color } : undefined}>
        {value}
      </p>
    </div>
  );
}

export function PolicyMetadataGrid({
  policy,
  statusDef,
  catDef,
  isOverdue,
}: PolicyMetadataGridProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
          <DetailField
            label="Status"
            value={statusDef?.label || policy.status}
            color={statusDef?.color}
          />
          <DetailField
            label="Categoria"
            value={catDef?.label || policy.category}
            color={catDef?.color}
          />
          <DetailField label="Versao" value={String(policy.version)} />
          <DetailField
            label="Ciclo de revisao"
            value={
              policy.review_cycle_days
                ? `${policy.review_cycle_days} dias`
                : "Nao definido"
            }
          />
          {policy.effective_date && (
            <DetailField
              label="Data de vigencia"
              value={format(
                new Date(policy.effective_date),
                "dd/MM/yyyy"
              )}
            />
          )}
          {policy.next_review_at && (
            <DetailField
              label="Proxima revisao"
              value={`${format(
                new Date(policy.next_review_at),
                "dd/MM/yyyy"
              )}${isOverdue ? " (atrasada)" : ""}`}
              color={isOverdue ? "hsl(var(--destructive))" : undefined}
            />
          )}
          <DetailField
            label="Criado em"
            value={format(
              new Date(policy.created_at),
              "dd/MM/yyyy HH:mm",
              { locale: ptBR }
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

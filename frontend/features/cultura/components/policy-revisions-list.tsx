import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { IconHistory } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Revision {
  id: string;
  version: number;
  change_note?: string | null;
  updated_at?: string | null;
}

interface PolicyRevisionsListProps {
  revisions: Revision[] | undefined;
}

export function PolicyRevisionsList({ revisions }: PolicyRevisionsListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <IconHistory className="size-4" />
          Historico de versoes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {revisions && revisions.length > 0 ? (
          <div className="space-y-0">
            {revisions.map((rev) => (
              <div
                key={rev.id}
                className="flex items-start gap-3 py-3 border-b last:border-0"
              >
                <div className="flex items-center justify-center size-7 rounded-full bg-gray-100 text-xs font-semibold shrink-0 mt-0.5">
                  v{rev.version}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Versao {rev.version}</p>
                  {rev.change_note && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {rev.change_note}
                    </p>
                  )}
                </div>
                <span className="text-[11px] text-gray-500 shrink-0">
                  {rev.updated_at &&
                    format(
                      new Date(rev.updated_at),
                      "dd MMM yyyy 'as' HH:mm",
                      { locale: ptBR }
                    )}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 py-4 text-center">
            Nenhuma revisao registrada.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

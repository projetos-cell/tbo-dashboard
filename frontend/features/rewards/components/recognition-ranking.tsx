import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecognitionRankingProps {
  topRecognized: { user_id: string; count: number }[];
  byValue: { value_id: string; value_name: string; value_emoji: string; count: number }[];
  userMap: Map<string, string>;
}

export function RecognitionRanking({ topRecognized, byValue, userMap }: RecognitionRankingProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Top Reconhecidos</CardTitle>
        </CardHeader>
        <CardContent>
          {topRecognized.length > 0 ? (
            <div className="space-y-2">
              {topRecognized.map((item, idx) => (
                <div
                  key={item.user_id}
                  className="flex items-center justify-between text-sm py-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-4">{idx + 1}.</span>
                    <span className="font-medium">
                      {userMap.get(item.user_id) ?? item.user_id.slice(0, 8)}
                    </span>
                  </div>
                  <Badge variant="secondary">{item.count} reconhecimentos</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nenhum dado ainda.</p>
          )}
        </CardContent>
      </Card>

      {byValue.length > 0 && (
        <Card className="mt-3">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Por Valor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {byValue.map((v) => (
                <div
                  key={v.value_id}
                  className="flex items-center justify-between text-sm py-1"
                >
                  <span>
                    {v.value_emoji} {v.value_name}
                  </span>
                  <Badge variant="outline">{v.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

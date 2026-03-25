import { NextResponse } from "next/server";
import { listEnvelopes } from "@/services/clicksign/envelopes";

export const maxDuration = 10;
export const dynamic = "force-dynamic";

interface HealthCheckResult {
  status: "connected" | "error" | "not_configured";
  environment: "production" | "sandbox" | "unknown";
  message: string;
  latencyMs?: number;
}

export async function GET() {
  const apiKey = process.env.CLICKSIGN_API_KEY;
  const apiUrl = process.env.CLICKSIGN_API_URL ?? "";

  // 1. Check if API key is configured
  if (!apiKey || apiKey.trim() === "") {
    const result: HealthCheckResult = {
      status: "not_configured",
      environment: "unknown",
      message: "CLICKSIGN_API_KEY nao configurada. Configure nas variaveis de ambiente.",
    };
    return NextResponse.json(result);
  }

  // 2. Determine environment
  const environment: HealthCheckResult["environment"] = apiUrl.includes("sandbox")
    ? "sandbox"
    : apiUrl.includes("clicksign.com")
      ? "production"
      : "unknown";

  // 3. Test actual connectivity with a lightweight API call
  const start = Date.now();
  try {
    await listEnvelopes({ pageSize: 1 });
    const latencyMs = Date.now() - start;

    const result: HealthCheckResult = {
      status: "connected",
      environment,
      message: `Conectado ao Clicksign (${environment})`,
      latencyMs,
    };
    return NextResponse.json(result);
  } catch (err) {
    const latencyMs = Date.now() - start;
    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";

    const result: HealthCheckResult = {
      status: "error",
      environment,
      message: `Falha na conexao: ${errorMessage}`,
      latencyMs,
    };
    return NextResponse.json(result, { status: 200 }); // 200 because the health endpoint itself works
  }
}

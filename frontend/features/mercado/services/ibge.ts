// ---------------------------------------------------------------------------
// IBGE SIDRA + Localidades API — Service Layer
// ---------------------------------------------------------------------------

const SIDRA_BASE = "https://apisidra.ibge.gov.br/values";
const LOCALIDADES_BASE = "https://servicodados.ibge.gov.br/api/v1/localidades";
const PROJECOES_BASE = "https://servicodados.ibge.gov.br/api/v1/projecoes";

const FETCH_TIMEOUT_MS = 30_000;

// ---------------------------------------------------------------------------
// Types — SIDRA raw response
// ---------------------------------------------------------------------------

/** SIDRA returns an array of string-keyed records. Row 0 is the header. */
interface SidraRawRow {
  /** Código do nível territorial */
  NC: string;
  /** Código da unidade territorial */
  NN: string;
  /** Sigla da UF (quando aplicável) */
  MN: string;
  /** Variável código */
  V: string;
  /** Valor da variável */
  D1C: string;
  D1N: string;
  D2C: string;
  D2N: string;
  D3C: string;
  D3N: string;
  D4C: string;
  D4N: string;
  [key: string]: string;
}

// ---------------------------------------------------------------------------
// Types — Domain models
// ---------------------------------------------------------------------------

export interface MunicipioCenso {
  codigoMunicipio: string;
  nomeMunicipio: string;
  populacao: number;
  ano: string;
}

export interface MunicipioIBGE {
  id: number;
  nome: string;
  microrregiao: {
    id: number;
    nome: string;
    mesorregiao: {
      id: number;
      nome: string;
      UF: {
        id: number;
        sigla: string;
        nome: string;
        regiao: {
          id: number;
          sigla: string;
          nome: string;
        };
      };
    };
  };
}

export interface ProjecaoPopulacao {
  localidade: string;
  horario: string;
  projecao: {
    populacao: number;
    periodoMedio: {
      nascpisPeriodo: number;
      obitosPeriodo: number;
      nascimento: string;
      obito: string;
    };
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchWithTimeout(
  url: string,
  timeoutMs = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(
        `IBGE API respondeu com status ${res.status}: ${res.statusText}`,
      );
    }
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// 1. População do PR por município (Censo 2022 — tabela 9514)
// ---------------------------------------------------------------------------

/**
 * Busca população residente por município do Paraná (Censo 2022).
 *
 * Endpoint SIDRA:
 *   /values/t/9514/n6/in%20n3%2041/v/93/p/2022
 *
 * - t/9514  = Tabela 9514 (Censo 2022)
 * - n6      = Nível município
 * - n3 41   = Dentro do PR
 * - v/93    = Variável 93 (população residente)
 * - p/2022  = Período 2022
 */
export async function fetchPopulacaoPR(): Promise<MunicipioCenso[]> {
  const url = `${SIDRA_BASE}/t/9514/n6/in%20n3%2041/v/93/p/2022`;
  const res = await fetchWithTimeout(url);
  const raw: SidraRawRow[] = await res.json();

  // A primeira linha é o header — pular
  const dataRows = raw.slice(1);

  return dataRows.map((row) => ({
    codigoMunicipio: row.D3C,
    nomeMunicipio: row.D3N,
    populacao: Number(row.V) || 0,
    ano: row.D2C,
  }));
}

// ---------------------------------------------------------------------------
// 2. Lista de municípios do PR (Localidades API)
// ---------------------------------------------------------------------------

/**
 * Busca a lista completa de municípios do Paraná via API de Localidades.
 *
 * Endpoint: /api/v1/localidades/estados/41/municipios
 */
export async function fetchMunicipiosPR(): Promise<MunicipioIBGE[]> {
  const url = `${LOCALIDADES_BASE}/estados/41/municipios?orderBy=nome`;
  const res = await fetchWithTimeout(url);
  const data: MunicipioIBGE[] = await res.json();
  return data;
}

// ---------------------------------------------------------------------------
// 3. Projeção populacional do PR (tempo real)
// ---------------------------------------------------------------------------

/**
 * Busca a projeção populacional em tempo real para o Paraná.
 *
 * Endpoint: /api/v1/projecoes/populacao/41
 */
export async function fetchProjecaoPR(): Promise<ProjecaoPopulacao> {
  const url = `${PROJECOES_BASE}/populacao/41`;
  const res = await fetchWithTimeout(url);
  const data: ProjecaoPopulacao = await res.json();
  return data;
}

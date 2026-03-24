// ── Historical Climate Survey Data ──
// Pre-computed from Google Forms CSVs (1ª, 2ª, 3ª Pesquisa de Clima)
// Questions were slightly different (yes/no/maybe instead of 1-5 scales for some)
// Sim=5, Talvez=3, Não=1 conversion used for leadership/communication composites

export interface HistoricalEdition {
  edition: number;
  label: string;
  date: string;
  totalResponses: number;
  teamSize: number;
  // Scale metrics (1-5)
  felicidade: number;
  overallScore: number;
  culturaClareza: number;
  confortoEquipe: number;
  diaAgradavel: number;
  workLifeBalance: number;
  satisfacaoFuncoes: number;
  planoCarreira: number;
  homeOffice: number;
  workloadScore: number;
  leadershipScore: number;
  communicationScore: number;
  careerClarityScore: number;
  // Yes percentages
  pertencimento: number;
  orgulho: number;
  crescimento: number;
  satisfRemuneracao: number;
  salarioJusto: number;
  // Distributions (1-5) for key scale questions
  distributions: {
    felicidade: number[];
    culturaClareza: number[];
    confortoEquipe: number[];
    satisfacaoFuncoes: number[];
    planoCarreira: number[];
    workLifeBalance: number[];
  };
  // Open responses highlights
  openResponses: {
    sugestoesDiretoria: string[];
    pontosAtencao: string[];
    futuroTBO: string[];
    beneficiosFalta: string[];
    cargosAlvo: string[];
  };
}

export const HISTORICAL_EDITIONS: HistoricalEdition[] = [
  {
    edition: 1,
    label: "1ª Pesquisa",
    date: "Jul 2022",
    totalResponses: 7,
    teamSize: 7,
    felicidade: 4.0,
    overallScore: 4.0,
    culturaClareza: 4.0,
    confortoEquipe: 4.1,
    diaAgradavel: 3.9,
    workLifeBalance: 3.7,
    satisfacaoFuncoes: 3.7,
    planoCarreira: 3.6,
    homeOffice: 4.7,
    workloadScore: 3.4,
    leadershipScore: 4.4,
    communicationScore: 4.4,
    careerClarityScore: 3.6,
    pertencimento: 86,
    orgulho: 86,
    crescimento: 71,
    satisfRemuneracao: 29,
    salarioJusto: 29,
    distributions: {
      felicidade: [0, 0, 3, 1, 3],
      culturaClareza: [0, 0, 3, 1, 3],
      confortoEquipe: [0, 1, 0, 3, 3],
      satisfacaoFuncoes: [0, 1, 2, 2, 2],
      planoCarreira: [1, 1, 1, 1, 3],
      workLifeBalance: [0, 1, 2, 2, 2],
    },
    openResponses: {
      sugestoesDiretoria: [
        "Gostaria de saber, de um jeito claro, outras formas e trabalhos que podem ser feitos para continuar assegurando o crescimento exponencial da empresa.",
        "Bonificações confusas quando projeto passa por toda a equipe — divisão precisa ser mais clara.",
      ],
      pontosAtencao: [],
      futuroTBO: [
        "Bem posicionada no mercado, não apenas do Paraná, mas do Brasil.",
        "Maior remuneração e possível enquadramento na categoria de CLT.",
        "Referência na área, com equipe maior e bem estruturada.",
      ],
      beneficiosFalta: [
        "Reconhecimento por horas extras",
        "Vale alimentação pré-determinado",
      ],
      cargosAlvo: [
        "Artista 3D Senior",
        "Líder de Equipe",
        "Gerente de Produção",
        "Product Owner",
      ],
    },
  },
  {
    edition: 2,
    label: "2ª Pesquisa",
    date: "Dez 2023",
    totalResponses: 10,
    teamSize: 10,
    felicidade: 4.3,
    overallScore: 4.0,
    culturaClareza: 4.2,
    confortoEquipe: 4.2,
    diaAgradavel: 4.1,
    workLifeBalance: 4.0,
    satisfacaoFuncoes: 4.1,
    planoCarreira: 2.6,
    homeOffice: 4.7,
    workloadScore: 2.3,
    leadershipScore: 4.0,
    communicationScore: 4.2,
    careerClarityScore: 2.6,
    pertencimento: 70,
    orgulho: 89,
    crescimento: 40,
    satisfRemuneracao: 30,
    salarioJusto: 40,
    distributions: {
      felicidade: [0, 0, 1, 5, 4],
      culturaClareza: [0, 1, 1, 3, 5],
      confortoEquipe: [0, 0, 1, 6, 3],
      satisfacaoFuncoes: [0, 1, 0, 6, 3],
      planoCarreira: [4, 2, 0, 2, 2],
      workLifeBalance: [1, 0, 2, 2, 5],
    },
    openResponses: {
      sugestoesDiretoria: [
        "Direção de arte mais estruturada com referências claras desde o início do projeto.",
        "Elaboração de plano de carreira dentro da empresa.",
        "Indicadores para acompanhar desenvolvimento da empresa.",
        "Integração de equipe mesmo de forma remota.",
      ],
      pontosAtencao: [
        "Cumprimento de horários das reuniões.",
        "Qualidade e nível das imagens precisa subir.",
        "Organização de pastas e arquivos confusa — falta estrutura.",
        "Revisões internas antes de entregas para clientes.",
        "Branding sem liderança clara.",
      ],
      futuroTBO: [
        "Imagens de alto nível, processos estáveis e clientes internacionais.",
        "Entre as maiores empresas de archviz do mercado.",
        "Vários setores com muitas pessoas trabalhando neles.",
      ],
      beneficiosFalta: [
        "Plano de saúde",
        "Férias remuneradas e 13º",
        "Auxílio internet",
        "Auxílio para melhoria de equipamento",
      ],
      cargosAlvo: [
        "Product Owner",
        "Gerente de Produção",
        "Líder de Equipe",
        "Artista 3D Senior",
      ],
    },
  },
  {
    edition: 3,
    label: "3ª Pesquisa",
    date: "Out 2024",
    totalResponses: 13,
    teamSize: 13,
    felicidade: 4.5,
    overallScore: 4.4,
    culturaClareza: 4.2,
    confortoEquipe: 4.7,
    diaAgradavel: 4.4,
    workLifeBalance: 4.2,
    satisfacaoFuncoes: 4.4,
    planoCarreira: 4.2,
    homeOffice: 4.5,
    workloadScore: 2.5,
    leadershipScore: 4.7,
    communicationScore: 4.8,
    careerClarityScore: 4.2,
    pertencimento: 100,
    orgulho: 92,
    crescimento: 85,
    satisfRemuneracao: 23,
    salarioJusto: 38,
    distributions: {
      felicidade: [0, 0, 0, 7, 6],
      culturaClareza: [0, 0, 2, 6, 5],
      confortoEquipe: [0, 0, 0, 4, 9],
      satisfacaoFuncoes: [0, 0, 1, 6, 6],
      planoCarreira: [0, 0, 3, 5, 5],
      workLifeBalance: [0, 0, 2, 7, 4],
    },
    openResponses: {
      sugestoesDiretoria: [
        "Melhorar Instagram e marketing — transformar em vitrine de luxo.",
        "Assinatura de bancos de imagem pagos (Freepik, Shutterstock, Envato).",
        "Investir em ações culturais e transparência sobre momento atual.",
        "Mais rituais de integração: workshops, minicursos, troca de conhecimentos.",
      ],
      pontosAtencao: [
        "Setor audiovisual precisa de formalização.",
        "Pontualidade em reuniões.",
        "Velocidade na comunicação.",
      ],
      futuroTBO: [
        "Referência no mercado com frente internacional e premiações.",
        "Triplicando valor por imagem com BUs novas estruturadas.",
        "Líder no Paraná e entre os maiores do sul.",
        "A nova Elephant Skin.",
      ],
      beneficiosFalta: [
        "Plano de saúde",
        "Gympass",
        "Vale alimentação",
        "Férias remuneradas (1 mês)",
        "Décimo terceiro",
        "Incentivo para cursos online",
      ],
      cargosAlvo: [
        "Diretora Audiovisual",
        "Artista 3D Senior",
        "Gerente de Produção",
        "Líder de Equipe",
        "Product Owner",
      ],
    },
  },
];

// ── Metrics that can be compared across all editions ──
export interface TrendMetric {
  key: string;
  label: string;
  format: "scale" | "percent";
  max: number;
  description: string;
  category: "clima" | "lideranca" | "carreira" | "remuneracao";
}

export const TREND_METRICS: TrendMetric[] = [
  { key: "felicidade", label: "Felicidade", format: "scale", max: 5, description: "Quão feliz na empresa", category: "clima" },
  { key: "overallScore", label: "Score Geral", format: "scale", max: 5, description: "Média de todas as escalas", category: "clima" },
  { key: "confortoEquipe", label: "Conforto c/ equipe", format: "scale", max: 5, description: "Conforto com colegas de trabalho", category: "clima" },
  { key: "workLifeBalance", label: "Equilíbrio vida-trabalho", format: "scale", max: 5, description: "Impacto do trabalho na vida pessoal", category: "clima" },
  { key: "leadershipScore", label: "Liderança", format: "scale", max: 5, description: "Gestão, delegação, incentivo", category: "lideranca" },
  { key: "communicationScore", label: "Comunicação", format: "scale", max: 5, description: "Transparência e valorização", category: "lideranca" },
  { key: "careerClarityScore", label: "Clareza de carreira", format: "scale", max: 5, description: "Plano de carreira definido", category: "carreira" },
  { key: "workloadScore", label: "Carga de trabalho", format: "scale", max: 5, description: "Equilíbrio de demandas (5=bom)", category: "clima" },
  { key: "pertencimento", label: "Pertencimento", format: "percent", max: 100, description: "% que se sente pertencente", category: "clima" },
  { key: "orgulho", label: "Orgulho", format: "percent", max: 100, description: "% que tem orgulho de trabalhar na TBO", category: "clima" },
  { key: "crescimento", label: "Vê crescimento", format: "percent", max: 100, description: "% que enxerga crescimento na empresa", category: "carreira" },
  { key: "satisfRemuneracao", label: "Satisf. remuneração", format: "percent", max: 100, description: "% satisfeito com remuneração", category: "remuneracao" },
];

// ── Helper: get trend data for a metric across editions ──
export function getMetricTrend(
  metricKey: string,
  editions: HistoricalEdition[],
): Array<{ edition: number; label: string; date: string; value: number }> {
  return editions.map((e) => ({
    edition: e.edition,
    label: e.label,
    date: e.date,
    value: (e as unknown as Record<string, number>)[metricKey],
  }));
}

// ── Helper: compute delta between two editions ──
export function computeDelta(current: number, previous: number): {
  value: number;
  direction: "up" | "down" | "stable";
  label: string;
} {
  const delta = Math.round((current - previous) * 10) / 10;
  return {
    value: Math.abs(delta),
    direction: delta > 0.1 ? "up" : delta < -0.1 ? "down" : "stable",
    label: delta > 0 ? `+${delta}` : `${delta}`,
  };
}

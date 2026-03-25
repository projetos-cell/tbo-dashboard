export interface DiagnosticQuestion {
  text: string
  weight: number
  tip: string
}

export interface DiagnosticEtapa {
  title: string
  sub: string
  qs: DiagnosticQuestion[]
  max: number
}

export interface Trail {
  name: string
  desc: string
  modules: string[]
  etapas: number[]
  threshold: number
}

export const ETAPAS: DiagnosticEtapa[] = [
  {
    title: "Visão Estratégica",
    sub: "Você entende POR QUE o marketing existe no seu lançamento?",
    qs: [
      { text: "Sei calcular quanto investir em marketing para um lançamento (% do VGV).", weight: 1.2, tip: "Não é \"o que a agência cobrar\". É saber dimensionar investimento proporcionalmente ao porte do empreendimento." },
      { text: "Entendo como o marketing impacta diretamente a velocidade de vendas no lançamento.", weight: 1.5, tip: "Marketing não é custo — é alavanca de velocidade. Se você não vê assim, está subutilizando." },
      { text: "Sei a diferença entre marketing de produto e marketing de marca da incorporadora.", weight: 1.0, tip: "Vender o Residencial X é diferente de construir a marca da incorporadora. São investimentos distintos com retornos distintos." },
      { text: "Consigo definir posicionamento de produto antes de aprovar projeto arquitetônico.", weight: 1.3, tip: "O programa do empreendimento deveria nascer DO posicionamento, não o contrário." },
      { text: "Sei quando um empreendimento precisa de branding forte vs. quando preço resolve sozinho.", weight: 1.0, tip: "Nem todo produto precisa do mesmo nível de investimento em marca. Saber diferenciar é estratégia." },
      { text: "Tenho clareza de que o marketing começa antes do terreno, não depois da aprovação.", weight: 1.2, tip: "Estudo de mercado, análise de concorrência e posicionamento são decisões de marketing que antecedem o projeto." },
    ],
    max: 0,
  },
  {
    title: "Conhecimento do Comprador",
    sub: "Você sabe QUEM compra, POR QUE compra e O QUE teme?",
    qs: [
      { text: "Sei construir uma persona de comprador com dados reais, não achismo.", weight: 1.3, tip: "\"Classe B, 30-50 anos\" não é persona. Persona tem nome, motivação, medo, canal, momento de vida." },
      { text: "Entendo a jornada completa de decisão de compra de um imóvel.", weight: 1.2, tip: "Da primeira pesquisa no Google até a assinatura do contrato — você sabe cada etapa e o que influencia cada uma?" },
      { text: "Sei mapear objeções reais e criar argumentos que as neutralizam.", weight: 1.0, tip: "\"Caro demais\", \"não conheço a construtora\", \"vai atrasar\" — você tem respostas estruturadas pra cada uma?" },
      { text: "Conheço os canais que realmente influenciam decisão de compra na minha praça.", weight: 1.2, tip: "Instagram? Google? Indicação? Portal? O mix muda por cidade, por ticket, por público. Você sabe o seu?" },
      { text: "Sei a diferença entre lead qualificado e lead frio — e como isso muda a régua de relacionamento.", weight: 1.0, tip: "Tratar todo lead igual é queimar dinheiro. Qualificação muda abordagem, timing e canal." },
      { text: "Entendo que o comprador decide emocionalmente e justifica racionalmente.", weight: 1.0, tip: "Se seu marketing só fala de metragem e preço, está falando com o cérebro errado." },
      { text: "Consigo criar briefing de campanha que fala COM o comprador, não SOBRE o produto.", weight: 1.3, tip: "A diferença entre \"apartamento de 3 quartos com varanda gourmet\" e \"o espaço que sua família merece ocupar\"." },
    ],
    max: 0,
  },
  {
    title: "Domínio do Processo",
    sub: "Você sabe COMO um lançamento funciona de ponta a ponta?",
    qs: [
      { text: "Conheço as fases de um lançamento (teaser → pré → lançamento → sustentação → pós).", weight: 1.2, tip: "Cada fase tem objetivo, entrega e métrica própria. Misturar fases é desperdiçar investimento." },
      { text: "Sei o timing ideal de cada entrega (quando briefar naming, quando ter renders, quando começar mídia).", weight: 1.5, tip: "Se o render fica pronto 1 semana antes do lançamento, você perdeu meses de pré-venda." },
      { text: "Entendo as dependências entre entregas (o que precisa estar pronto antes do quê).", weight: 1.0, tip: "Sem naming não tem identidade. Sem identidade não tem material. Sem material não tem campanha. Você mapeia isso?" },
      { text: "Sei montar um cronograma reverso a partir do Dia D.", weight: 1.3, tip: "O Dia D é fixo. Tudo se planeja de trás pra frente. Se você planeja de frente pra trás, sempre atrasa." },
      { text: "Sei dimensionar investimento por fase (quanto gastar em cada momento).", weight: 1.0, tip: "80% do budget no lançamento e 0% no teaser é erro clássico. A distribuição importa tanto quanto o total." },
      { text: "Entendo como medir se o marketing está funcionando em cada fase.", weight: 1.2, tip: "KPIs mudam por fase: awareness no teaser, leads qualificados no pré, conversão no lançamento. Você mede certo?" },
    ],
    max: 0,
  },
  {
    title: "Capacidade de Avaliação",
    sub: "Você consegue JULGAR qualidade sem depender de terceiros?",
    qs: [
      { text: "Sei avaliar se um render/imagem 3D está bom tecnicamente e estrategicamente.", weight: 1.2, tip: "Bom render não é só bonito. É o que comunica o diferencial certo pro público certo no ângulo certo." },
      { text: "Consigo avaliar se uma campanha digital está performando bem ou mal.", weight: 1.3, tip: "CTR, CPC, CPL, taxa de conversão — você lê esses números e sabe se precisa agir?" },
      { text: "Sei se estou pagando preço justo por cada serviço de marketing.", weight: 1.0, tip: "Não é o mais barato. É saber o que está incluído, o que é padrão de mercado e o que é abuso." },
      { text: "Consigo briefar fornecedores com clareza suficiente pra evitar refações.", weight: 1.5, tip: "Cada rodada de refação é custo e tempo. Briefing claro elimina 60-70% das refações." },
      { text: "Sei quando um material está \"bom o suficiente\" vs. quando precisa de mais rodada.", weight: 1.0, tip: "Perfeccionismo mata prazo. Relaxo demais mata qualidade. Você calibra isso?" },
      { text: "Consigo fazer QA (controle de qualidade) do meu próprio marketing.", weight: 1.2, tip: "Revisar peças, checar consistência de marca, validar textos — você faz isso ou só aprova o que chega?" },
    ],
    max: 0,
  },
  {
    title: "Autonomia Decisória",
    sub: "Você DECIDE ou só DELEGA e REZA?",
    qs: [
      { text: "Tomo decisões de marketing com a mesma segurança que decisões de obra.", weight: 1.5, tip: "Se na obra você decide rápido e no marketing trava, o problema não é o marketing — é falta de repertório." },
      { text: "Sei o que cobrar de uma agência ou fornecedor (prazo, qualidade, processo).", weight: 1.3, tip: "Você sabe o que é razoável exigir? Ou aceita o que entregam porque não tem parâmetro?" },
      { text: "Consigo ler relatórios de performance e tomar decisão sem precisar de tradutor.", weight: 1.2, tip: "Se você precisa que a agência \"explique o relatório\", você está refém da interpretação deles." },
      { text: "Não preciso que a agência valide minhas intuições — sei quando estou certo.", weight: 1.0, tip: "Intuição + repertório = decisão boa. Intuição sem repertório = achismo perigoso." },
      { text: "Sei quando estou sendo enrolado por fornecedor.", weight: 1.0, tip: "Prazo \"estourou\", \"ficou mais caro que o previsto\", \"precisa de mais uma rodada\" — você sabe quando é real e quando é desculpa?" },
      { text: "Consigo conduzir uma reunião de alinhamento de marketing sem depender da agência liderar.", weight: 1.2, tip: "Quem lidera a reunião controla a narrativa. Se a agência sempre lidera, ela define as prioridades — não você." },
    ],
    max: 0,
  },
]

// Calculate max scores
ETAPAS.forEach((e) => {
  e.max = Math.round(e.qs.reduce((acc, q) => acc + 5 * q.weight, 0))
})

export const TRAILS: Trail[] = [
  {
    name: "Estratégia de Marketing Imobiliário",
    desc: "Do zero ao domínio: como pensar marketing antes de pensar produto.",
    modules: ["Posicionamento de produto", "Budget & VGV", "Timing estratégico", "Análise de concorrência"],
    etapas: [0],
    threshold: 0.55,
  },
  {
    name: "Inteligência de Comprador",
    desc: "Construa personas reais, mapeie jornadas e crie argumentos que vendem.",
    modules: ["Persona com dados", "Jornada de compra", "Objeções & argumentos", "Canais de influência"],
    etapas: [1],
    threshold: 0.55,
  },
  {
    name: "Masterclass da Esteira de Lançamento",
    desc: "Cada fase, cada entrega, cada dependência. O GPS do lançamento.",
    modules: ["Fases do lançamento", "Cronograma reverso", "Budget por fase", "KPIs por etapa"],
    etapas: [2],
    threshold: 0.55,
  },
  {
    name: "Olho Clínico: Avaliação de Qualidade",
    desc: "Aprenda a julgar renders, campanhas, fornecedores e resultados.",
    modules: ["QA de materiais", "Leitura de métricas", "Briefing eficaz", "Preço justo"],
    etapas: [3],
    threshold: 0.55,
  },
  {
    name: "Autonomia do Incorporador",
    desc: "Pare de depender da agência. Lidere seu marketing.",
    modules: ["Tomada de decisão", "Gestão de fornecedores", "Leitura de relatórios", "Governança de marketing"],
    etapas: [4],
    threshold: 0.55,
  },
]

export type LevelKey = "cego" | "miope" | "enxerga" | "domina"

export interface Level {
  name: string
  cls: LevelKey
  idx: number
}

export function getLevel(pct: number): Level {
  if (pct < 0.35) return { name: "Cego", cls: "cego", idx: 0 }
  if (pct < 0.55) return { name: "Míope", cls: "miope", idx: 1 }
  if (pct < 0.75) return { name: "Enxerga", cls: "enxerga", idx: 2 }
  return { name: "Domina", cls: "domina", idx: 3 }
}

export function getInsight(etapaIdx: number, pct: number): string {
  const insights = [
    [
      "Você não tem clareza sobre o papel do marketing na viabilidade do empreendimento. Isso significa que decisões de milhões estão sendo tomadas sem o input certo.",
      "Você tem noção de que marketing importa, mas não domina as alavancas. Provavelmente aceita o que a agência propõe sem questionar.",
      "Você entende a lógica mas ainda não conecta marketing com decisão de produto. O gap está na aplicação prática.",
      "Visão estratégica sólida. Você pensa marketing como investimento, não como custo. Isso te coloca à frente de 90% do mercado.",
    ],
    [
      "Você não conhece quem compra de você. Seu marketing fala com todo mundo — e por isso não convence ninguém.",
      "Tem uma ideia superficial do comprador mas não mapeia jornada, objeções ou canais com profundidade. Suas campanhas são genéricas.",
      "Conhece o comprador mas ainda não traduz esse conhecimento em comunicação que vende. O diagnóstico está feito, falta a prescrição.",
      "Domínio forte do comprador. Você consegue briefar uma campanha que fala com a pessoa certa, no momento certo, com o argumento certo.",
    ],
    [
      "Você não domina a esteira de lançamento. Cada projeto reinventa a roda, e atrasos são a norma — não a exceção.",
      "Conhece as fases mas não controla timing e dependências. Entregas atrasam porque a sequência não está clara.",
      "Processo está mapeado mas a execução ainda depende de terceiros ditando o ritmo. Você segue, mas não lidera.",
      "Processo dominado. Você monta cronograma reverso, dimensiona budget por fase e cobra com propriedade. Raro no mercado.",
    ],
    [
      "Você não consegue julgar qualidade. Aprova o que chega porque não tem parâmetro. Isso te torna refém do fornecedor.",
      "Avalia por intuição, não por critério. Às vezes acerta, às vezes aceita algo medíocre sem perceber.",
      "Tem olho treinado pra algumas entregas mas ainda depende de opinião externa em outras. O gap é inconsistência.",
      "QA sólido. Você sabe o que é bom, o que é aceitável e o que precisa refazer. Fornecedores respeitam quem sabe cobrar.",
    ],
    [
      "Você delega e reza. Não sabe o que cobrar, não sabe quando estão te enrolando, não consegue liderar uma reunião de marketing.",
      "Toma algumas decisões mas ainda precisa de validação externa pra se sentir seguro. A agência lidera a narrativa.",
      "Decidindo com mais segurança mas ainda inseguro em momentos críticos. O repertório está crescendo, falta consistência.",
      "Autonomia plena. Você lidera reuniões, lê relatórios, cobra resultados e toma decisão rápida. A agência trabalha PRA você, não no lugar de você.",
    ],
  ]
  const idx = pct < 0.35 ? 0 : pct < 0.55 ? 1 : pct < 0.75 ? 2 : 3
  return insights[etapaIdx][idx]
}

export const CTA_MESSAGES: Record<LevelKey, { title: string; sub: string }> = {
  cego: {
    title: "Você está no escuro.",
    sub: "E o pior: está pagando caro por isso. Cada lançamento sem repertório é dinheiro queimado.",
  },
  miope: {
    title: "Você enxerga, mas embaçado.",
    sub: "Sabe que marketing importa mas não domina as alavancas. A distância entre \"saber que existe\" e \"saber usar\" custa milhões.",
  },
  enxerga: {
    title: "Você está quase lá.",
    sub: "Tem base, tem intuição, mas ainda depende demais de terceiros. A TBO Academy fecha os gaps que te separam da autonomia.",
  },
  domina: {
    title: "Você é raro no mercado.",
    sub: "Poucos incorporadores têm esse nível de domínio. A TBO Academy pode ser seu espaço de troca com quem pensa como você.",
  },
}

export const STAGE_OPTIONS = [
  { value: "nunca", icon: "building-2", title: "Nunca lancei", desc: "Tenho ou quero ter terreno, mas nunca fiz um lançamento imobiliário" },
  { value: "pouco", icon: "package", title: "1 a 3 lançamentos", desc: "Já lancei, mas ainda estou aprendendo como o marketing funciona" },
  { value: "medio", icon: "chart-bar", title: "4 a 10 lançamentos", desc: "Tenho algum repertório mas sinto que poderia extrair mais" },
  { value: "senior", icon: "building", title: "10+ lançamentos", desc: "Tenho experiência mas quero profissionalizar o olhar de marketing" },
] as const

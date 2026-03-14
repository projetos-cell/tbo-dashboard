// ─── Dados extraídos do Manual de Cultura TBO (Notion) ───
// Fonte: https://www.notion.so/Manual-de-Cultura-2193782e356143e5b41756c78e230cec
// Última extração: 2026-03-14
// IMPORTANTE: Supabase é a fonte única de verdade. Este arquivo serve como seed inicial.

export interface CulturaSeedSection {
  id: string;
  category: "sobre" | "missao" | "visao" | "valores" | "estrategia" | "comunicacao" | "cultura" | "lideres" | "politica" | "regras" | "raci" | "cargos" | "bau-criativo" | "ferramentas" | "recrutamento" | "trabalho" | "lideranca" | "readme" | "limites" | "etica" | "antiassedio";
  title: string;
  emoji: string;
  summary: string;
  content: string;
  order: number;
  tags: string[];
}

export interface TBOValue {
  id: string;
  name: string;
  emoji: string;
  description: string;
  howToApply: string;
}

export interface TBOLeader {
  id: string;
  name: string;
  role: string;
  area: string;
  responsibilities: string[];
}

export interface TBOToolCredential {
  label: string;
  email: string;
  password?: string;
  url?: string;
  notes?: string;
  method: "google" | "email" | "corporativo";
}

export interface TBOTool {
  id: string;
  name: string;
  category: string;
  description: string;
  credentials?: TBOToolCredential[];
  accessNotes?: string;
}

export interface BauCriativoCategory {
  id: string;
  name: string;
  emoji: string;
  subcategories: { id: string; name: string; description: string }[];
}

// ─── Mensagem dos Fundadores ───
export const FOUNDERS_MESSAGE = {
  title: "Mensagem dos Fundadores",
  content: `Somos uma plataforma criativa aplicada ao mercado imobiliário e atuamos como parceiro estratégico para incorporadoras que exigem mais do que entregas gráficas, mas buscam posicionamento, diferenciação e resultado real.

Colocamos a experiência do comprador no centro de tudo o que fazemos. Unimos branding, renderizações, filmes publicitários e soluções interativas para gerar desejo com inteligência e sensibilidade estética.

Nosso trabalho começa com diagnóstico, passa pela construção de marca e se materializa em campanhas integradas que vendem com consistência.

Na TBO, criatividade é a ferramenta única, e tecnologia é meio, não fim.

Nosso compromisso é com a excelência, a sensibilidade e a construção de narrativas que conectam pessoas, produtos e cidades.`,
  quote: "Seja bem-vindo à TBO, onde a criatividade e a excelência se unem para moldar o futuro do mercado imobiliário.",
};

// ─── Sobre a TBO ───
export const SOBRE_TBO = {
  title: "Sobre a TBO",
  founding: "Desde 2019",
  description: "Somos uma plataforma de inteligência estratégica especializada no mercado imobiliário.",
  mission_short: "Ajudar nossos clientes a vender seus produtos centralizando todas as soluções em apenas um lugar.",
  manifesto: {
    title: "Manifesto da Marca",
    subtitle: "Pensar com profundidade. Construir com intenção. Pertencer com valor.",
    content: `Somos uma estrutura de pensamento estratégico e execução criativa dedicada exclusivamente ao setor imobiliário. O que entregamos vai além de comunicação. Entregamos visão, método e impacto.

Atuamos na intersecção entre a razão e o desejo: traduzimos os seus dados de mercado em experiências de marca que vendem. Nosso trabalho não começa com a estética, começa com pensamento.

Antes de qualquer campanha, pensamos.
Depois, construímos.
Por fim, entregamos pertencimento.

Porque no fim, marcas fortes não competem por atenção. Elas ocupam lugar na mente e no mercado.
E é isso que fazemos: posicionamos empreendimentos com inteligência, estética e intenção.`,
  },
  method: {
    name: "Think | Build | Own",
    steps: [
      { key: "Think", description: "Estratégia, diagnóstico, posicionamento e diferenciação." },
      { key: "Build", description: "Construção de marca, campanha, imagens, narrativas e materiais." },
      { key: "Own", description: "Pertencimento, conexão emocional, desejo de compra e ativação." },
    ],
  },
  numbers: [
    { label: "Escritórios físicos", value: "0", detail: "Somos totalmente remotos" },
    { label: "Time distribuído", value: "15+", detail: "Profissionais atuando remotamente" },
    { label: "Projetos lançados", value: "+120", detail: "+30 projetos simultâneos em média" },
    { label: "Imagens renderizadas", value: "+3.000", detail: "Produção histórica estimada" },
    { label: "Marcas desenvolvidas", value: "+20", detail: "Todas com alto padrão de branding" },
    { label: "Filmes publicitários", value: "+10", detail: "Narrativa e linguagem cinematográfica" },
  ],
};

// ─── Missão ───
export const MISSAO = {
  title: "Missão",
  statement: "Transformar empreendimentos imobiliários em marcas desejadas, memoráveis e lucrativas.",
  howWeDoIt: "Unimos pensamento estratégico, criatividade autoral e excelência técnica para criar narrativas de marca que conectam pessoas, produtos e cidades.",
  principles: [
    {
      title: "Pensar com profundidade",
      description: "Tudo começa com o diagnóstico. Antes de qualquer entrega visual, mergulhamos no produto, no território, nos concorrentes, no comportamento de compra e nos atributos de valor. Branding sem estratégia é ruído. Posicionamento sem dados é palpite.",
    },
    {
      title: "Construir com intenção",
      description: "A partir do diagnóstico, criamos com precisão e propósito. Naming, identidade, 3D, filmes, campanhas e planos de ativação são pensados como um sistema narrativo unificado.",
    },
    {
      title: "Entregar pertencimento com valor",
      description: "Nosso objetivo não é apenas vender unidades. É fazer o comprador se enxergar no produto. É criar marcas que não competem por atenção, mas ocupam lugar na mente e no mercado.",
    },
  ],
  requirements: [
    "Sermos rígidos e ao mesmo tempo sensíveis na criação",
    "Trabalhar com profundidade estratégica e critério estético em todas as entregas",
    "Ter uma visão holística da jornada de compra e da experiência do usuário",
    "Manter uma cultura de qualidade inegociável, aprendizado contínuo e crescimento coletivo",
    "Antecipar tendências, entender o contexto urbano e propor soluções criativas com consistência",
  ],
};

// ─── Visão ───
export const VISAO = {
  title: "Visão",
  statement: "Ser a principal plataforma global de soluções tecnológico-publicitárias para lançamentos imobiliários.",
  whatItMeans: [
    "Plataforma global: estrutura modular e escalável, com processos replicáveis, tecnologia proprietária e capacidade de operar lançamentos em qualquer lugar do mundo.",
    "Tecnologia + publicidade: soluções que integram inteligência de dados, comportamento do consumidor, automação e storytelling.",
    "Especialização total no mercado imobiliário: foco absoluto. Entendemos todas as nuances desse setor.",
  ],
  futureGoals: [
    "Presença em diferentes regiões do Brasil e operações em mercados internacionais de alto padrão.",
    "Plataforma digital própria, que organiza fluxos, otimiza entregas e permite escalar sem perder sofisticação.",
    "Núcleos criativos especializados, capazes de atender desde empreendimentos residenciais premium até projetos multiuso.",
    "Portfólio de projetos icônicos, reconhecidos não apenas pelo resultado comercial, mas pela beleza, inovação e impacto cultural.",
  ],
};

// ─── Estratégia ───
export const ESTRATEGIA = {
  title: "Estratégia",
  pillars: [
    {
      title: "Foco 100% em lançamentos imobiliários",
      description: "Não atendemos outros segmentos. Toda a nossa estrutura é pensada para os ciclos, dores e dinâmicas desse mercado.",
    },
    {
      title: "Integração vertical de soluções",
      description: "Centralizamos todas as frentes: diagnóstico, naming, branding, 3D, audiovisual, interiores, marketing e performance.",
    },
    {
      title: "Criatividade com metodologia",
      description: "Criatividade nasce de diagnóstico, posicionamento e estratégia. Cada narrativa, imagem, nome e cor tem um motivo emocional.",
    },
    {
      title: "Tecnologia como estrutura invisível",
      description: "Ferramentas internas e produtos digitais que organizam fluxos, aumentam produtividade e criam inteligência.",
    },
    {
      title: "Escala sem perder a curadoria",
      description: "Não aceitamos crescer às custas de mediocridade. Sistemas, equipes e processos que garantam qualidade inegociável.",
    },
  ],
};

// ─── Comunicação ───
export const COMUNICACAO = {
  title: "Diretrizes de Comunicação",
  goldenRules: [
    { icon: "✨", title: "Parta sempre da intenção positiva", description: "Comece qualquer troca acreditando que o outro está tentando acertar." },
    { icon: "💚", title: "Gentileza importa, especialmente no digital", description: "Se não falaria algo pessoalmente, não escreva." },
    { icon: "🎯", title: "Seja claro, responsável e inclusivo", description: "Expresse seus pontos com propriedade, mas com empatia." },
    { icon: "⚖️", title: "Assuma o que você comunica", description: "Se algo que disse gerou desconforto, olhe pelo ponto de vista do outro." },
  ],
  tools: [
    { name: "Notion", use: "Documentação de tudo. Base de conhecimento." },
    { name: "Google Chat", use: "Comunicação diária, checkpoints, avisos urgentes." },
    { name: "Google Meet", use: "Reuniões com pauta clara e decisões registradas." },
    { name: "Google Drive", use: "Entregas, pastas de projeto, arquivos finais." },
    { name: "E-mail", use: "Comunicação externa ou formal." },
    { name: "WhatsApp", use: "Comunicações rápidas com clientes." },
  ],
  toneOfVoice: [
    { trait: "Sofisticado", description: "Pensamos de forma assertiva e com elegância. Sensíveis ao detalhe." },
    { trait: "Empático", description: "Nos colocamos no lugar do incorporador e das pessoas da empresa." },
    { trait: "Transparente", description: "Frases curtas, diretas e assertivas. Comportamento vítreo." },
    { trait: "Tecnológico", description: "Somos uma marca tecnológica, mas não hi-tech." },
    { trait: "Consultivo", description: "Especialistas e conhecedores do mercado imobiliário." },
    { trait: "Adaptável", description: "Resiliência e flexibilidade para cada cliente e projeto." },
  ],
  rituals: [
    "Checkpoints diários (Google Chat): status, bloqueios e prioridades",
    "1:1 mensais: feedback, escuta ativa e alinhamento individual",
    "Reuniões de time: revisão de entregas e aprendizados",
    "Revisões criativas: curadoria e refinamento estético/conceitual",
    "Onboarding estruturado: diretrizes de comunicação nos primeiros dias",
    "Debriefs pós-entrega: o que funcionou, o que não, o que aprendemos",
  ],
};

// ─── Cultura (Vida na TBO) ───
export const CULTURA_VIDA = {
  title: "Vida na TBO",
  description: "Na TBO, nossa missão é clara: posicionar empreendimentos com inteligência, estética e intenção.",
  behaviors: [
    {
      emoji: "🎯",
      title: "Autonomia com Responsabilidade",
      points: [
        "Você não espera ser cobrado para entregar",
        "Sabe suas prioridades e organiza sua agenda",
        "Comunica bloqueios antes que virem problemas",
        "Toma decisões dentro do seu escopo com segurança",
      ],
    },
    {
      emoji: "✨",
      title: "Excelência sem Perfeccionismo",
      points: [
        "Buscamos qualidade excepcional, mas sabemos quando 'ótimo' é suficiente",
        "Iteramos rápido em vez de travar em busca do perfeito",
        "Feedback construtivo é ferramenta, não ataque",
      ],
    },
    {
      emoji: "🤝",
      title: "Colaboração Real",
      points: [
        "'Seu sucesso é meu sucesso' não é chavão, é prática",
        "Compartilhamos conhecimento abertamente",
        "Pedimos ajuda sem receio",
      ],
    },
    {
      emoji: "📚",
      title: "Aprendizado Contínuo",
      points: [
        "Erros são oportunidades de aprender",
        "Buscamos feedback ativamente",
        "Estudamos por conta própria",
      ],
    },
    {
      emoji: "🚀",
      title: "Mentalidade de Dono",
      points: [
        "Pensa no negócio, não só na sua tarefa",
        "Cuida dos recursos como se fossem seus",
        "Propõe melhorias proativamente",
      ],
    },
  ],
  antiPatterns: [
    "Hierarquia rígida — todos podem questionar e propor",
    "Trabalhar 'só pelo salário' — se não se importa com o resultado, não vai prosperar",
    "Guardar informação para ter poder — conhecimento concentrado enfraquece o time",
    "Fazer 'corpo mole' — autonomia exige máximo de cada um",
    "Evitar feedback — se não aceita ser desafiado, vai sofrer aqui",
    "Perfeccionismo paralisante — 'feito é melhor que perfeito' quando o contexto pede",
    "Drama e política — problemas se resolvem com conversa direta",
    "'Não é minha função' — todos ajudam onde necessário",
  ],
  alignmentChecklist: [
    "Eu me sinto confortável tomando decisões sem precisar perguntar tudo?",
    "Eu busco feedback ativamente, mesmo quando dói?",
    "Eu comunico problemas assim que percebo, não quando explodem?",
    "Eu ajudo colegas mesmo quando não 'ganho nada' com isso?",
    "Eu penso no impacto do meu trabalho no cliente e no negócio?",
    "Eu documento e compartilho o que aprendo?",
    "Eu questiono processos de forma construtiva?",
  ],
};

// ─── Líderes ───
export const LIDERES: TBOLeader[] = [
  {
    id: "marco",
    name: "Marco Andolfato",
    role: "COO / Diretor de Operações, Arte e Criação",
    area: "Criação, Operações, Qualidade, Cultura, Processos",
    responsibilities: [
      "Direção de arte, criação e supervisão estética",
      "Planejamento e integração de fluxos entre áreas",
      "Garantia de qualidade e padrão visual TBO",
      "Desenvolvimento e acompanhamento dos Product Owners",
    ],
  },
  {
    id: "ruy",
    name: "Ruy Lima",
    role: "CEO / Diretor Geral e Comercial",
    area: "Comercial, Financeiro, Posicionamento de Mercado, Crescimento",
    responsibilities: [
      "Gestão geral e posicionamento de mercado",
      "Prospecção e fechamento de novos negócios",
      "Direção comercial e relacionamento com incorporadoras",
      "Alinhamento estratégico entre operação e resultados",
    ],
  },
  {
    id: "nelson",
    name: "Nelson Mozart",
    role: "Product Owner de Branding",
    area: "Branding, Identidade Visual, Naming",
    responsibilities: [
      "Diagnóstico e condução de processos de branding",
      "Desenvolvimento de naming, identidade e diretrizes visuais",
      "Supervisão de apresentações e livros de marca",
    ],
  },
  {
    id: "nathalia",
    name: "Nathália Runge",
    role: "Product Owner de Digital 3D",
    area: "Renderizações, Animações, Vídeos 3D",
    responsibilities: [
      "Direção técnica e criativa de imagens e vídeos 3D",
      "Gestão do pipeline de produção 3D",
      "Coordenação da equipe de artistas e animadores",
    ],
  },
  {
    id: "rafaela",
    name: "Rafaela Oltramari",
    role: "Product Owner de Marketing",
    area: "Campanhas, Performance, Posicionamento Digital",
    responsibilities: [
      "Planejar e executar campanhas de mídia e conteúdo",
      "Gerenciar performance e análise de resultados",
      "Integrar campanhas com branding e audiovisual",
    ],
  },
  {
    id: "carolina",
    name: "Carolina Lima",
    role: "Coordenadora de Atendimento",
    area: "Gestão de Projetos, Comunicação com Cliente",
    responsibilities: [
      "Gerenciar demandas e comunicações com clientes",
      "Coordenar cronogramas e prazos de entregas",
      "Facilitar feedbacks e alinhamentos entre áreas",
    ],
  },
];

// ─── Políticas ───
export const POLITICAS_RESUMO = [
  {
    id: "etica-moral",
    title: "Política Ética e Moral",
    emoji: "⚖️",
    category: "compliance",
    summary: "Princípios de integridade, responsabilidade e respeito que guiam todas as atividades da TBO.",
    keyPoints: [
      "Integridade: agir com honestidade em todas as circunstâncias",
      "Evitar conflitos de interesse — comunicar imediatamente à diretoria",
      "Responsabilidade: decisões considerando impacto sobre todos os stakeholders",
      "Respeito: ambiente inclusivo independente de raça, gênero, religião etc.",
      "Tolerância zero a assédio de qualquer tipo",
    ],
  },
  {
    id: "antiassedio",
    title: "Política Antiassédio",
    emoji: "🛡️",
    category: "compliance",
    summary: "Tolerância zero a qualquer forma de assédio, discriminação ou intimidação.",
    keyPoints: [
      "Assédio inclui: comentários ofensivos, piadas constrangedoras, pressão psicológica",
      "Discriminação por qualquer característica é inaceitável",
      "Bullying e violência no trabalho não são tolerados",
      "Retaliação contra denunciantes é violação grave",
      "Canais de denúncia: compliance@tbo.com.br ou diretoria",
      "Medidas: Nível 1 (suspensão) → Nível 4 (encerramento + autoridades)",
    ],
  },
  {
    id: "compliance",
    title: "Política de Compliance",
    emoji: "📋",
    category: "compliance",
    summary: "Normas e práticas para conformidade com leis, regulamentos e padrões éticos.",
    keyPoints: [
      "Conformidade legal obrigatória: LGPD, propriedade intelectual, legislação fiscal",
      "Práticas anticorrupção: proibido suborno, favorecimento, fraude",
      "Confidencialidade: proteger dados de clientes e processos internos",
    ],
  },
  {
    id: "governanca",
    title: "Governança Corporativa",
    emoji: "🏛️",
    category: "compliance",
    summary: "Estrutura de governança que assegura transparência e responsabilidade.",
    keyPoints: [
      "Decisões estratégicas documentadas — não ficam apenas no verbal",
      "RACI definido para cada decisão/entrega",
      "Status semanal obrigatório com atualização real",
    ],
  },
  {
    id: "horarios",
    title: "Política de Horários de Trabalho",
    emoji: "🕐",
    category: "trabalho",
    summary: "Regulação de horários, flexibilidade e práticas diárias.",
    keyPoints: ["Atendimento: segunda a sexta, 9h às 18h", "Flexibilidade respeitando os rituais do time"],
  },
  {
    id: "hibrido",
    title: "Política de Trabalho Híbrido",
    emoji: "🏠",
    category: "trabalho",
    summary: "Diretrizes para trabalho remoto e híbrido.",
    keyPoints: ["Empresa 100% remota", "Comunicação assíncrona como padrão", "Registro de tudo que importa"],
  },
  {
    id: "conduta",
    title: "Política de Código de Conduta",
    emoji: "📜",
    category: "trabalho",
    summary: "Normas de conduta e comportamento profissional esperado.",
    keyPoints: ["Comportamento exemplar dentro e fora da empresa", "Ética não tem horário comercial"],
  },
  {
    id: "ferias",
    title: "Política de Férias",
    emoji: "🏖️",
    category: "trabalho",
    summary: "Diretrizes para período de descanso e licenças.",
    keyPoints: ["Planejamento antecipado", "Comunicação clara com o time"],
  },
  {
    id: "sick-day",
    title: "Política de Sick Day",
    emoji: "🤒",
    category: "trabalho",
    summary: "Diretrizes para dias de afastamento por saúde.",
    keyPoints: ["Comunicar o quanto antes", "Sem necessidade de justificar com documentação para dias pontuais"],
  },
  {
    id: "vendas",
    title: "Políticas de Vendas",
    emoji: "💰",
    category: "comercial",
    summary: "Diretrizes para atividades de vendas e relacionamento com clientes.",
    keyPoints: ["Transparência com clientes", "Processo de qualificação de leads"],
  },
  {
    id: "contratos",
    title: "Gestão de Contratos",
    emoji: "📄",
    category: "comercial",
    summary: "Diretrizes para gestão de contratos e aditivos.",
    keyPoints: ["Nenhum trabalho começa sem contrato assinado", "Aditivos aprovados pelo Comercial"],
  },
  {
    id: "precificacao",
    title: "Política de Precificação e Descontos",
    emoji: "🏷️",
    category: "comercial",
    summary: "Diretrizes para precificação e política de descontos.",
    keyPoints: ["Preços baseados em valor entregue", "Descontos com aprovação da diretoria"],
  },
];

// ─── Regras de Negócio ───
export const REGRAS_NEGOCIO = [
  { id: "entrada", title: "Entrada de Projetos", summary: "Lead qualificado → CRM → pré-briefing → diagnóstico → contrato → produção" },
  { id: "onboarding", title: "Onboarding e Comunicação", summary: "Reunião + página Notion personalizada. Nenhum alinhamento via WhatsApp." },
  { id: "kickoff", title: "Kickoff e Início de Produção", summary: "Diagnóstico aprovado → cronograma + checklist + estrutura Drive + timeline Notion" },
  { id: "entregas", title: "Entregas e Gestão do Fluxo", summary: "Entrega apenas por e-mail, registro no Notion, QA interno obrigatório." },
  { id: "revisoes", title: "Revisões, Ajustes e Limites", summary: "Rodadas definidas no escopo. Mudanças estruturais = nova fase/novo orçamento." },
  { id: "interno", title: "Organização Interna", summary: "Templates oficiais, QA, conceito-mãe validado, handoffs no Notion." },
  { id: "financeiro", title: "Financeiro e Contratos", summary: "Contrato + pagamento antes de iniciar. Aditivos com aprovação." },
  { id: "protecao", title: "Proteção da Equipe", summary: "PO protege o time. Atendimento filtra demandas. Reuniões com 24h de antecedência." },
];

// ─── Limites e Regras (Cliente x TBO) ───
export const LIMITES_REGRAS = {
  principios: [
    { title: "Parceria, não subordinação", description: "A TBO atua como parceira estratégica. Não operamos sob lógica de subordinação." },
    { title: "Comunicação profissional", description: "Interações pelos canais oficiais seguindo fluxo definido." },
    { title: "Qualidade acima de urgência", description: "Nenhuma entrega é acelerada de forma que comprometa o resultado." },
    { title: "Respeito ao escopo contratado", description: "Solicitações fora do escopo exigem alinhamento prévio." },
    { title: "Autonomia técnica", description: "TBO possui autonomia completa em direção criativa, estratégia e qualidade." },
  ],
  nivelDemandas: [
    { nivel: 1, titulo: "Ajustes leves", prazo: "48-72h", exemplos: "Revisão de textos, trocas de imagens, correções menores" },
    { nivel: 2, titulo: "Novas peças/criações", prazo: "5-10 dias úteis", exemplos: "Novos layouts, peças para redes, artes inéditas" },
    { nivel: 3, titulo: "Estratégia/Branding/CGI", prazo: "Personalizado", exemplos: "Key Visual, direção criativa, book de vendas, CGI, campanhas" },
  ],
};

// ─── Baú Criativo ───
export const BAU_CRIATIVO: BauCriativoCategory[] = [
  {
    id: "branding",
    name: "Branding",
    emoji: "🎨",
    subcategories: [
      { id: "cores", name: "Cores", description: "Paletas e referências de cores para projetos" },
      { id: "icones", name: "Ícones", description: "Bibliotecas e referências de iconografia" },
      { id: "inspiracoes", name: "Inspirações e Referências", description: "Referências visuais de branding" },
      { id: "motion", name: "Motion", description: "Referências de animação e motion design" },
      { id: "fotografias", name: "Fotografias", description: "Banco de referências fotográficas" },
      { id: "fontes", name: "Fontes", description: "Tipografias e diretrizes de uso" },
      { id: "ferramentas-branding", name: "Ferramentas", description: "Ferramentas específicas para branding" },
    ],
  },
  {
    id: "digital-3d",
    name: "Digital 3D",
    emoji: "🌟",
    subcategories: [
      { id: "fotografia-3d", name: "Fotografia", description: "Referências de composição e iluminação" },
      { id: "modelagem", name: "Modelagem 3D", description: "Assets e referências de modelagem" },
      { id: "arquitetura", name: "Páginas de Arquitetura", description: "Referências arquitetônicas" },
      { id: "tutoriais", name: "Tutoriais", description: "Tutoriais e guias técnicos 3D" },
    ],
  },
];

// ─── Guia de Ferramentas (com credenciais extraídas do Notion) ───
export interface FerramentaCategoria {
  id: string;
  name: string;
  emoji: string;
  tools: FerramentaTool[];
}

export interface FerramentaTool {
  name: string;
  description: string;
  credentials?: TBOToolCredential[];
  accessNotes?: string;
}

export const FERRAMENTAS_CATEGORIAS: FerramentaCategoria[] = [
  {
    id: "comunicacao",
    name: "Comunicação e E-mail",
    emoji: "💬",
    tools: [
      {
        name: "Google Gmail",
        description: "E-mail institucional da TBO (domínio @agenciatbo). Comunicação formal com clientes, fornecedores e parceiros.",
        credentials: [{ label: "Corporativo", email: "seu-nome@agenciatbo.com.br", method: "corporativo", notes: "Cada colaborador usa seu e-mail corporativo pessoal" }],
      },
      {
        name: "Google Chat",
        description: "Canal principal de comunicação interna. Troca rápida de informações, acompanhamento de pautas e avisos operacionais.",
        credentials: [{ label: "Corporativo", email: "seu-nome@agenciatbo.com.br", method: "corporativo", notes: "Comunicação objetiva, sempre com contexto e follow-up" }],
      },
      {
        name: "Notion",
        description: "Plataforma central de gestão e conhecimento. Manuais, guias, fluxos, pautas, status de projetos e histórico.",
        credentials: [{ label: "Corporativo", email: "seu-nome@agenciatbo.com.br", method: "corporativo" }],
      },
      {
        name: "Google Drive",
        description: "Repositório oficial de arquivos. Entregas com clientes e materiais internos organizados por pastas e equipes.",
        credentials: [{ label: "Corporativo", email: "seu-nome@agenciatbo.com.br", method: "corporativo" }],
      },
      {
        name: "Google Calendar",
        description: "Agenda compartilhada para reuniões, eventos e deadlines da equipe.",
        credentials: [{ label: "Corporativo", email: "seu-nome@agenciatbo.com.br", method: "corporativo" }],
      },
      {
        name: "Fireflies.ai",
        description: "Gravação e transcrição automática de reuniões. Registro e acessibilidade de informações discutidas em calls.",
        credentials: [{ label: "Corporativo", email: "seu-nome@agenciatbo.com.br", method: "corporativo" }],
      },
    ],
  },
  {
    id: "design",
    name: "Design e Produção Visual",
    emoji: "🎨",
    tools: [
      {
        name: "Pacote Adobe",
        description: "Photoshop, Illustrator, InDesign, Premiere, After Effects — diagramação, books de venda, apresentações e materiais editoriais.",
        credentials: [
          {
            label: "Login Principal (Padrão TBO)",
            email: "contato@agenciatbo.com.br",
            password: "U/La8?NjwA_Nfe6",
            url: "https://account.adobe.com/",
            method: "email",
            notes: "Usar SEMPRE este como padrão. Após logar: Plans → confirmar assinatura; Apps → baixar softwares.",
          },
          {
            label: "Login Secundário (Backup)",
            email: "marcoandolfatocs@gmail.com",
            password: "Macs19933",
            url: "https://account.adobe.com/",
            method: "email",
            notes: "Usar APENAS se o principal não funcionar e mediante autorização da direção.",
          },
        ],
        accessNotes: "Não alterar e-mails ou senhas sem comunicar a direção. Não criar novas contas. Se licença excedida: Sign out of other devices.",
      },
      {
        name: "Figma",
        description: "Design de interfaces, prototipagem colaborativa e design systems.",
        credentials: [{ label: "Corporativo", email: "seu-nome@agenciatbo.com.br", method: "corporativo" }],
      },
      {
        name: "Canva",
        description: "Produções rápidas — posts de redes sociais e materiais internos com templates padronizados.",
        credentials: [{
          label: "Conta Compartilhada",
          email: "projetos@agenciatbo.com.br",
          url: "https://www.canva.com/",
          method: "google",
          notes: "EXCLUSIVO via projetos@. Não usar conta pessoal. Não criar novos times.",
        }],
        accessNotes: "No futuro, poderá ser migrado para e-mails corporativos pessoais — isso será avisado.",
      },
      {
        name: "Miro",
        description: "Brainstorms, fluxos de projeto, jornadas do cliente e apresentações estratégicas.",
        credentials: [{
          label: "Conta Compartilhada",
          email: "projetos@agenciatbo.com.br",
          url: "https://miro.com/",
          method: "google",
          notes: "Priorizar sempre este login para manter boards centralizados. Não criar nova equipe.",
        }],
      },
      {
        name: "Envato Elements",
        description: "Mockups, templates, fontes, vídeos, áudios e gráficos em geral.",
        credentials: [{
          label: "Conta Compartilhada",
          email: "projetos@agenciatbo.com.br",
          url: "https://elements.envato.com/",
          method: "google",
          notes: "Acesso exclusivo via projetos@. Não usar conta pessoal. Organizar downloads no Drive do projeto.",
        }],
      },
    ],
  },
  {
    id: "3d",
    name: "Renderização e Visualização 3D",
    emoji: "🏗️",
    tools: [
      {
        name: "3ds Max (Autodesk)",
        description: "Base para modelagem tridimensional de ambientes, produtos e cenas arquitetônicas.",
        credentials: [{
          label: "Conta Autodesk",
          email: "marcoandolfatocs@gmail.com",
          password: "Macs19933",
          url: "https://manage.autodesk.com/",
          method: "email",
          notes: "Após logar: All Products and Services → 3ds Max → Download. Usar mesmo login para ativar o software.",
        }],
      },
      {
        name: "Corona Renderer",
        description: "Motor de renderização voltado para realismo fotográfico. Imagens finais de interiores e exteriores.",
        credentials: [{
          label: "Conta Chaos",
          email: "marcoandolfatocs@gmail.com",
          password: "M@acs19933_ag",
          url: "https://www.chaos.com/",
          method: "email",
          notes: "Após logar: My Account → Products → Corona Renderer → Downloads/License. Mesmo login dentro do 3ds Max/SketchUp.",
        }],
      },
      {
        name: "D5 Render",
        description: "Renderização em tempo real, ideal para vídeos e pré-visualizações com alta qualidade e agilidade.",
        credentials: [{ label: "Corporativo", email: "seu-nome@agenciatbo.com.br", method: "corporativo" }],
      },
    ],
  },
  {
    id: "ia",
    name: "Inteligência Artificial e Geração de Conteúdo",
    emoji: "🤖",
    tools: [
      {
        name: "Krea.ai",
        description: "Geração de imagens e composições criativas. Moodboards, experimentações visuais e testes conceituais.",
        credentials: [{
          label: "Conta Compartilhada",
          email: "projetos@agenciatbo.com.br",
          url: "https://www.krea.ai/",
          method: "google",
          notes: "Continue with Google → projetos@agenciatbo.com.br",
        }],
      },
      {
        name: "ChatGPT / Claude",
        description: "Assistentes de IA para texto, estratégia e produção de conteúdo.",
        credentials: [{ label: "Corporativo", email: "seu-nome@agenciatbo.com.br", method: "corporativo" }],
      },
      {
        name: "Midjourney",
        description: "Geração de imagens por IA via Discord.",
        credentials: [{ label: "Corporativo", email: "seu-nome@agenciatbo.com.br", method: "corporativo" }],
      },
      {
        name: "Runway",
        description: "Edição e geração de vídeo com IA.",
        credentials: [{ label: "Corporativo", email: "seu-nome@agenciatbo.com.br", method: "corporativo" }],
      },
    ],
  },
  {
    id: "marketing",
    name: "Marketing, Relatórios e Influenciadores",
    emoji: "📊",
    tools: [
      {
        name: "Reportei",
        description: "Centraliza dados de campanhas digitais e redes sociais em relatórios automáticos. Análise de desempenho mensal.",
        credentials: [{
          label: "Corporativo (Google)",
          email: "e-mail corporativo da agência",
          url: "https://reportei.com/",
          method: "google",
          notes: "Entrar com Google → e-mail corporativo correto. Painel de Projetos → escolher relatório por plataforma.",
        }],
      },
      {
        name: "Modash",
        description: "Identificação e análise de influenciadores. Seleção de criadores de conteúdo alinhados a campanhas.",
        credentials: [{ label: "Corporativo", email: "seu-nome@agenciatbo.com.br", method: "corporativo" }],
      },
      {
        name: "RD Station",
        description: "CRM e automação de marketing.",
        credentials: [{ label: "Corporativo", email: "seu-nome@agenciatbo.com.br", method: "corporativo" }],
      },
      {
        name: "Google Analytics",
        description: "Análise de tráfego e comportamento.",
        credentials: [{ label: "Corporativo", email: "seu-nome@agenciatbo.com.br", method: "corporativo" }],
      },
      {
        name: "Meta Business Suite",
        description: "Gestão de anúncios e redes sociais.",
        credentials: [{ label: "Corporativo", email: "seu-nome@agenciatbo.com.br", method: "corporativo" }],
      },
    ],
  },
];

export const FERRAMENTAS_BOAS_PRATICAS = [
  "Cada colaborador é responsável por armazenar e nomear corretamente seus arquivos.",
  "Senhas e logins não devem ser compartilhados fora do time autorizado.",
  "Notion, Drive e Google Chat são fontes oficiais — qualquer documento fora deles não é válido.",
  "Ferramentas devem ser usadas dentro da filosofia Think | Build | Own.",
  "Usar login corporativo ou projetos@agenciatbo.com.br para ferramentas compartilhadas.",
];

// ─── Estrutura de Cargos ───
export const ESTRUTURA_CARGOS = {
  camadas: [
    { nivel: 1, nome: "Direção", descricao: "Ruy + Marco — Visão, estratégia, cultura", pessoas: 2 },
    { nivel: 2, nome: "Product Owners + Coord.", descricao: "Nelson, Nath, Rafa + Carol — Gestão de núcleos", pessoas: 4 },
    { nivel: 3, nome: "Especialistas", descricao: "Execução técnica de excelência", pessoas: 8 },
    { nivel: 4, nome: "Suporte", descricao: "Comercial e Financeiro", pessoas: 3 },
  ],
  principios: [
    "Autonomia Descentralizada: P.O.s decidem 'como', Direção decide 'o quê' e 'por quê'",
    "Colaboração Horizontal: P.O.s colaboram diretamente, times compartilham conhecimento",
    "Meritocracia Técnica: crescimento por excelência, contribuição > hierarquia",
    "Estrutura Enxuta: apenas 3 camadas hierárquicas, comunicação rápida",
    "Escala com Qualidade: P.O.s garantem padrão, processos documentados",
  ],
  totalPessoas: 17,
};

// ─── TBO Academy (Trilha de Aprendizado Cultural) ───
export interface AcademyModule {
  id: string;
  order: number;
  title: string;
  emoji: string;
  description: string;
  estimatedMinutes: number;
  sections: { id: string; title: string; type: "read" | "quiz" | "reflection" | "action" }[];
  requiredForOnboarding: boolean;
}

export const TBO_ACADEMY_MODULES: AcademyModule[] = [
  {
    id: "mod-01-boas-vindas",
    order: 1,
    title: "Boas-vindas à TBO",
    emoji: "👋",
    description: "Conheça quem somos, nossa história, manifesto e método Think | Build | Own.",
    estimatedMinutes: 15,
    requiredForOnboarding: true,
    sections: [
      { id: "s01-mensagem-fundadores", title: "Mensagem dos Fundadores", type: "read" },
      { id: "s01-sobre-tbo", title: "Sobre a TBO", type: "read" },
      { id: "s01-manifesto", title: "Manifesto da Marca", type: "read" },
      { id: "s01-metodo", title: "Método Think | Build | Own", type: "read" },
      { id: "s01-quiz", title: "Quiz: Você conhece a TBO?", type: "quiz" },
    ],
  },
  {
    id: "mod-02-missao-visao",
    order: 2,
    title: "Missão, Visão e Estratégia",
    emoji: "🎯",
    description: "Entenda por que existimos, onde queremos chegar e como faremos isso.",
    estimatedMinutes: 20,
    requiredForOnboarding: true,
    sections: [
      { id: "s02-missao", title: "Nossa Missão", type: "read" },
      { id: "s02-visao", title: "Nossa Visão", type: "read" },
      { id: "s02-estrategia", title: "Os 5 Pilares Estratégicos", type: "read" },
      { id: "s02-reflexao", title: "Como meu trabalho contribui para a missão?", type: "reflection" },
    ],
  },
  {
    id: "mod-03-valores",
    order: 3,
    title: "Nossos Valores",
    emoji: "💎",
    description: "Os princípios inegociáveis que guiam cada decisão na TBO.",
    estimatedMinutes: 20,
    requiredForOnboarding: true,
    sections: [
      { id: "s03-valores", title: "Valores da TBO", type: "read" },
      { id: "s03-como-usar", title: "Como usar valores no dia a dia", type: "read" },
      { id: "s03-quiz", title: "Quiz: Valores na Prática", type: "quiz" },
      { id: "s03-acao", title: "Ação: Reconheça um colega por um valor", type: "action" },
    ],
  },
  {
    id: "mod-04-cultura",
    order: 4,
    title: "Vida na TBO",
    emoji: "🌟",
    description: "Comportamentos que vivemos, o que define e o que NÃO é nossa cultura.",
    estimatedMinutes: 25,
    requiredForOnboarding: true,
    sections: [
      { id: "s04-cultura", title: "O que define nossa cultura", type: "read" },
      { id: "s04-comportamentos", title: "Comportamentos do dia a dia", type: "read" },
      { id: "s04-antipatterns", title: "O que NÃO é nossa cultura", type: "read" },
      { id: "s04-checklist", title: "Checklist de Alinhamento Cultural", type: "reflection" },
    ],
  },
  {
    id: "mod-05-comunicacao",
    order: 5,
    title: "Comunicação na TBO",
    emoji: "💬",
    description: "Regras de ouro, ferramentas, tom de voz e rituais de comunicação.",
    estimatedMinutes: 20,
    requiredForOnboarding: true,
    sections: [
      { id: "s05-regras-ouro", title: "4 Regras de Ouro", type: "read" },
      { id: "s05-ferramentas", title: "Ferramentas e Canais Oficiais", type: "read" },
      { id: "s05-tom-voz", title: "Tom de Voz TBO", type: "read" },
      { id: "s05-rituais", title: "Rituais de Comunicação", type: "read" },
      { id: "s05-quiz", title: "Quiz: Comunicação Profissional", type: "quiz" },
    ],
  },
  {
    id: "mod-06-lideranca",
    order: 6,
    title: "Liderança e Estrutura",
    emoji: "🏛️",
    description: "Conheça os líderes, a estrutura de cargos e como funciona a tomada de decisão.",
    estimatedMinutes: 15,
    requiredForOnboarding: true,
    sections: [
      { id: "s06-lideres", title: "Nossos Líderes", type: "read" },
      { id: "s06-estrutura", title: "Estrutura de Cargos e Funções", type: "read" },
      { id: "s06-raci", title: "RACI: Quem decide o quê", type: "read" },
      { id: "s06-reflexao", title: "Quem é meu líder e como acessá-lo?", type: "reflection" },
    ],
  },
  {
    id: "mod-07-politicas",
    order: 7,
    title: "Políticas e Compliance",
    emoji: "📋",
    description: "Ética, antiassédio, compliance e todas as políticas que regem nosso trabalho.",
    estimatedMinutes: 30,
    requiredForOnboarding: true,
    sections: [
      { id: "s07-etica", title: "Política Ética e Moral", type: "read" },
      { id: "s07-antiassedio", title: "Política Antiassédio", type: "read" },
      { id: "s07-compliance", title: "Compliance e Governança", type: "read" },
      { id: "s07-trabalho", title: "Políticas de Trabalho", type: "read" },
      { id: "s07-quiz", title: "Quiz: Políticas Essenciais", type: "quiz" },
    ],
  },
  {
    id: "mod-08-regras-negocio",
    order: 8,
    title: "Regras de Negócio",
    emoji: "⚙️",
    description: "Como projetos entram, como são conduzidos e como são entregues na TBO.",
    estimatedMinutes: 20,
    requiredForOnboarding: false,
    sections: [
      { id: "s08-entrada", title: "Entrada de Projetos", type: "read" },
      { id: "s08-fluxo", title: "Fluxo de Entregas", type: "read" },
      { id: "s08-limites", title: "Limites e Regras Cliente x TBO", type: "read" },
      { id: "s08-quiz", title: "Quiz: Processo TBO", type: "quiz" },
    ],
  },
  {
    id: "mod-09-ferramentas",
    order: 9,
    title: "Ferramentas e Baú Criativo",
    emoji: "🧰",
    description: "Conheça as ferramentas oficiais e o repositório de referências criativas.",
    estimatedMinutes: 15,
    requiredForOnboarding: false,
    sections: [
      { id: "s09-ferramentas", title: "Guia de Ferramentas", type: "read" },
      { id: "s09-bau", title: "O Baú Criativo", type: "read" },
      { id: "s09-boas-praticas", title: "Boas Práticas de Uso", type: "read" },
      { id: "s09-acao", title: "Ação: Contribua com uma referência ao Baú", type: "action" },
    ],
  },
  {
    id: "mod-10-reconhecimentos",
    order: 10,
    title: "Reconhecimentos e Recompensas",
    emoji: "🏆",
    description: "Como funciona o sistema de reconhecimento por valores e o programa TBO Rewards.",
    estimatedMinutes: 10,
    requiredForOnboarding: false,
    sections: [
      { id: "s10-como-funciona", title: "Como Funciona o Sistema", type: "read" },
      { id: "s10-valores-pratica", title: "Reconhecendo Valores na Prática", type: "read" },
      { id: "s10-rewards", title: "TBO Rewards: Catálogo de Recompensas", type: "read" },
      { id: "s10-acao", title: "Ação: Faça seu primeiro reconhecimento!", type: "action" },
    ],
  },
];

// ─── Liderança: Princípios ───
export const LIDERANCA_PRINCIPIOS = [
  "Contexto, não controle — líderes fornecem direção, não microgerenciam",
  "Liderança pelo exemplo — fazemos o que pedimos",
  "Feedback como ferramenta — constante e nos dois sentidos",
  "Desenvolvimento contínuo — investir no crescimento de cada pessoa",
  "Colaboração horizontal — decisões envolvem múltiplas perspectivas",
];

// ============================================================================
// TBO OS — Onboarding Checklist Constants
// 5-day self-service journey — 32 tasks + 40 quiz questions
// ============================================================================

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  action?: "internal" | "confirm";
  internalRoute?: string;
}

export interface OnboardingDay {
  day: number;
  title: string;
  subtitle: string;
  icon: string;
  tasks: OnboardingTask[];
}

export const ONBOARDING_DAYS: OnboardingDay[] = [
  {
    day: 1,
    title: "Chegada",
    subtitle: "Conheça a TBO por dentro",
    icon: "🚀",
    tasks: [
      {
        id: "d1_perfil",
        title: "Preencher seu perfil completo no TBO OS",
        description: "Nome, cargo, foto de perfil e setor — todos os campos obrigatórios",
        action: "internal",
        internalRoute: "/configuracoes",
      },
      {
        id: "d1_cultura",
        title: "Ler o Manual de Cultura inteiro",
        description: "Missão, visão, valores, manifesto e mensagem dos fundadores",
        action: "internal",
        internalRoute: "/cultura/manual",
      },
      {
        id: "d1_cargos",
        title: "Estudar a Estrutura de Cargos e Funções",
        description: "Identifique as 4 camadas, seu P.O. e as áreas que se conectam à sua",
        action: "internal",
        internalRoute: "/pessoas/organograma",
      },
      {
        id: "d1_ferramentas",
        title: "Acessar o Guia de Ferramentas",
        description: "Leia TODAS as categorias — comunicação, design, 3D, IA e marketing",
        action: "internal",
        internalRoute: "/cultura/ferramentas",
      },
      {
        id: "d1_manifesto",
        title: "Ler o Manifesto da Marca TBO",
        description: "Entenda o posicionamento: 'Pensar com profundidade. Construir com intenção. Pertencer com valor.'",
        action: "internal",
        internalRoute: "/cultura/manual",
      },
      {
        id: "d1_lideres",
        title: "Identificar os líderes e suas áreas",
        description: "Marco (COO/Criação), Ruy (CEO/Comercial), Nelson (Branding), Nathália (3D), Rafaela (Marketing), Carolina (Atendimento)",
        action: "internal",
        internalRoute: "/pessoas",
      },
    ],
  },
  {
    day: 2,
    title: "Ferramentas & Processos",
    subtitle: "Configure e domine seu ambiente de trabalho",
    icon: "🛠️",
    tasks: [
      {
        id: "d2_email",
        title: "Configurar e-mail corporativo com assinatura padrão",
        description: "Acesse seu @agenciatbo.com.br — configure foto, cargo e assinatura TBO",
        action: "confirm",
      },
      {
        id: "d2_ferramentas_setor",
        title: "Instalar e testar ferramentas do seu setor",
        description: "Figma, Adobe, 3ds Max, D5, ou o que seu P.O. indicar — confirme que tudo funciona",
        action: "confirm",
      },
      {
        id: "d2_notion",
        title: "Navegar pelo Notion da TBO",
        description: "Localize: Manual de Cultura, espaço do seu setor, e template de projeto",
        action: "confirm",
      },
      {
        id: "d2_drive",
        title: "Entender a estrutura do Google Drive",
        description: "Localize: pasta de clientes, pasta do seu setor, pasta de templates",
        action: "confirm",
      },
      {
        id: "d2_chat",
        title: "Enviar sua primeira mensagem no Chat TBO OS",
        description: "Entre no canal geral e se apresente para o time",
        action: "internal",
        internalRoute: "/chat",
      },
      {
        id: "d2_calendar",
        title: "Sincronizar Google Calendar e verificar rituais",
        description: "Confirme que vê os checkpoints diários e reuniões do time na agenda",
        action: "confirm",
      },
      {
        id: "d2_login_compartilhado",
        title: "Testar acesso às ferramentas compartilhadas",
        description: "Acesse Canva, Miro e Envato usando projetos@agenciatbo.com.br",
        action: "confirm",
      },
    ],
  },
  {
    day: 3,
    title: "Contexto & Cultura",
    subtitle: "Entenda como pensamos, criamos e nos relacionamos",
    icon: "🧠",
    tasks: [
      {
        id: "d3_missao",
        title: "Estudar Missão, Visão e Valores em profundidade",
        description: "Não apenas leia — reflita sobre como cada valor se aplica ao seu trabalho diário",
        action: "internal",
        internalRoute: "/cultura/valores",
      },
      {
        id: "d3_politicas",
        title: "Ler TODAS as Políticas da TBO",
        description: "Ética, antiassédio, compliance, horários, trabalho híbrido, conduta, férias e sick day",
        action: "internal",
        internalRoute: "/cultura/politicas",
      },
      {
        id: "d3_regras_negocio",
        title: "Entender as Regras de Negócio completas",
        description: "Entrada de projetos, onboarding de cliente, kickoff, entregas, revisões, financeiro e proteção da equipe",
        action: "internal",
        internalRoute: "/cultura/pilares",
      },
      {
        id: "d3_limites",
        title: "Ler Limites e Regras TBO x Cliente",
        description: "Parceria vs subordinação, autonomia técnica, prazos por nível de demanda",
        action: "internal",
        internalRoute: "/cultura/politicas",
      },
      {
        id: "d3_comunicacao",
        title: "Estudar Diretrizes de Comunicação",
        description: "Tom de voz (sofisticado, empático, transparente), regras de ouro e rituais de comunicação",
        action: "internal",
        internalRoute: "/cultura/manual",
      },
      {
        id: "d3_antipadroes",
        title: "Revisar os Anti-Padrões de Cultura",
        description: "O que NÃO fazemos: hierarquia rígida, guardar informação, drama, 'não é minha função'",
        action: "internal",
        internalRoute: "/cultura/manual",
      },
    ],
  },
  {
    day: 4,
    title: "Seu Papel",
    subtitle: "Encontre seu lugar e comece a construir relações",
    icon: "🎯",
    tasks: [
      {
        id: "d4_cargo_escopo",
        title: "Confirmar escopo detalhado do seu cargo com P.O.",
        description: "Responsabilidades, entregas esperadas, métricas de sucesso e com quem você interage",
        action: "confirm",
      },
      {
        id: "d4_conhecer_time",
        title: "Mapear seu time e áreas conectadas",
        description: "Identifique seu P.O., colegas de área e quem das outras áreas você vai interagir",
        action: "internal",
        internalRoute: "/pessoas",
      },
      {
        id: "d4_agendar_1on1",
        title: "Realizar 1:1 de alinhamento com seu P.O.",
        description: "Pauta: expectativas dos primeiros 30 dias, primeiras entregas e como pedir ajuda",
        action: "confirm",
      },
      {
        id: "d4_readme",
        title: "Criar seu ReadMe individual",
        description: "Como você trabalha melhor, preferências de comunicação, horários e o que te motiva",
        action: "internal",
        internalRoute: "/configuracoes",
      },
      {
        id: "d4_raci",
        title: "Entender o modelo RACI do seu setor",
        description: "Quem é Responsável, Aprovador, Consultado e Informado nas entregas do seu time",
        action: "confirm",
      },
      {
        id: "d4_checkpoint",
        title: "Participar do seu primeiro checkpoint diário",
        description: "Google Chat: compartilhe status, bloqueios e prioridades do dia",
        action: "confirm",
      },
    ],
  },
  {
    day: 5,
    title: "Autonomia",
    subtitle: "Prove que está pronto para criar com a TBO",
    icon: "⚡",
    tasks: [
      {
        id: "d5_projetos",
        title: "Conhecer seus projetos atribuídos em detalhe",
        description: "Cliente, escopo, cronograma, status atual e quem mais está envolvido",
        action: "internal",
        internalRoute: "/projetos",
      },
      {
        id: "d5_tarefas",
        title: "Criar e completar sua primeira tarefa no TBO OS",
        description: "Crie uma tarefa real do seu trabalho com prazo, prioridade e seção correta",
        action: "internal",
        internalRoute: "/tarefas",
      },
      {
        id: "d5_modulos",
        title: "Navegar por todos os módulos do TBO OS",
        description: "Dashboard, Projetos, Tarefas, Agenda, Chat, Pessoas, Cultura — explore cada um",
        action: "internal",
        internalRoute: "/dashboard",
      },
      {
        id: "d5_bau_criativo",
        title: "Explorar o Baú Criativo e salvar 3 referências",
        description: "Navegue pelas categorias de branding e 3D — encontre referências relevantes para seu trabalho",
        action: "internal",
        internalRoute: "/cultura/bau-criativo",
      },
      {
        id: "d5_agenda",
        title: "Verificar sua agenda da próxima semana",
        description: "Confirme que checkpoints, reuniões e deadlines estão visíveis no calendário",
        action: "internal",
        internalRoute: "/agenda",
      },
      {
        id: "d5_reconhecimento",
        title: "Enviar seu primeiro reconhecimento a um colega",
        description: "Reconheça alguém que te ajudou durante o onboarding — a cultura começa com você",
        action: "internal",
        internalRoute: "/cultura/reconhecimentos",
      },
      {
        id: "d5_checklist_alignment",
        title: "Validar com P.O. que onboarding está completo",
        description: "Confirme com seu P.O. que você está alinhado e pronto para operar com autonomia",
        action: "confirm",
      },
      {
        id: "d5_conclusao",
        title: "Confirmar conclusão oficial do onboarding",
        description: "Marque esta tarefa para oficializar sua entrada na equipe TBO!",
        action: "confirm",
      },
    ],
  },
];

export const TOTAL_TASKS = ONBOARDING_DAYS.reduce(
  (acc, day) => acc + day.tasks.length,
  0,
);

// ============================================================================
// Quiz — 1 quiz por dia, 8 perguntas cada, cenários reais + pegadinhas
// Mínimo para passar: 6/8 (dias 1-4), 7/8 (dia 5)
// ============================================================================

export interface QuizOption {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
}

export interface DayQuiz {
  day: number;
  title: string;
  description: string;
  passingScore: number;
  questions: QuizQuestion[];
}

export const ONBOARDING_QUIZZES: DayQuiz[] = [
  {
    day: 1,
    title: "Quiz — Chegada",
    description: "Teste o que você aprendeu sobre a TBO no Dia 1.",
    passingScore: 6,
    questions: [
      {
        id: "q1_1",
        question: "Qual é a metodologia central da TBO e o que cada etapa significa?",
        options: [
          { id: "a", label: "Plan | Execute | Deliver — Planejar, executar e entregar" },
          { id: "b", label: "Think | Build | Own — Pensar com profundidade, construir com intenção, entregar pertencimento" },
          { id: "c", label: "Think | Build | Own — Pensar rápido, construir barato, ser dono do resultado" },
          { id: "d", label: "Design | Develop | Deploy — Desenhar, desenvolver e publicar" },
        ],
        correctOptionId: "b",
        explanation:
          "Think | Build | Own: Pensar com profundidade (diagnóstico), Construir com intenção (execução com propósito), Entregar pertencimento (conexão emocional). A opção C tem as palavras certas mas o significado errado.",
      },
      {
        id: "q1_2",
        question: "A TBO se define como uma 'agência de publicidade imobiliária'. Verdadeiro ou falso?",
        options: [
          { id: "a", label: "Verdadeiro — é uma agência especializada em imobiliário" },
          { id: "b", label: "Falso — é uma plataforma de inteligência estratégica especializada no mercado imobiliário" },
          { id: "c", label: "Verdadeiro — mas com foco em tecnologia" },
          { id: "d", label: "Falso — é uma incorporadora que faz marketing" },
        ],
        correctOptionId: "b",
        explanation:
          "A TBO não é uma agência. É uma plataforma de inteligência estratégica. A diferença é fundamental: não entregamos peças, entregamos visão, método e impacto.",
      },
      {
        id: "q1_3",
        question: "Quantas camadas hierárquicas tem a TBO e quais são?",
        options: [
          { id: "a", label: "3: Direção, Líderes, Especialistas" },
          { id: "b", label: "4: Direção, P.O.s + Coordenação, Especialistas, Suporte" },
          { id: "c", label: "5: C-Level, Gerentes, Coordenadores, Analistas, Estagiários" },
          { id: "d", label: "2: Fundadores e todos os demais" },
        ],
        correctOptionId: "b",
        explanation:
          "4 camadas: Direção (Ruy + Marco), P.O.s + Coordenação (Nelson, Nathália, Rafaela, Carolina), Especialistas (execução técnica), Suporte (comercial e financeiro).",
      },
      {
        id: "q1_4",
        question: "Na TBO, o trabalho criativo começa com:",
        options: [
          { id: "a", label: "Um briefing visual do cliente" },
          { id: "b", label: "Uma referência de design no Pinterest" },
          { id: "c", label: "Diagnóstico, posicionamento e estratégia — pensamento antes da estética" },
          { id: "d", label: "O software de design aberto" },
        ],
        correctOptionId: "c",
        explanation:
          "Manifesto: 'Nosso trabalho não começa com a estética, começa com pensamento.' Diagnóstico → Posicionamento → Estratégia → Criação.",
      },
      {
        id: "q1_5",
        question: "Quem é o COO da TBO e quais são suas responsabilidades principais?",
        options: [
          { id: "a", label: "Ruy Lima — gestão comercial e financeira" },
          { id: "b", label: "Marco Andolfato — direção de arte, criação, operações, qualidade e cultura" },
          { id: "c", label: "Nelson Mozart — branding e identidade visual" },
          { id: "d", label: "Carolina Lima — gestão de projetos e atendimento" },
        ],
        correctOptionId: "b",
        explanation:
          "Marco Andolfato é COO (Diretor de Operações, Arte e Criação): responsável por criação, operações, qualidade, cultura e processos. Ruy é o CEO.",
      },
      {
        id: "q1_6",
        question: "A TBO possui escritórios em quais cidades?",
        options: [
          { id: "a", label: "São Paulo e Curitiba" },
          { id: "b", label: "Nenhuma — somos 100% remotos com 0 escritórios físicos" },
          { id: "c", label: "São Paulo, com planos de expandir" },
          { id: "d", label: "Trabalhamos em coworkings nas capitais" },
        ],
        correctOptionId: "b",
        explanation:
          "Zero escritórios físicos. Time 100% remoto e distribuído, com 15+ profissionais. Comunicação assíncrona como padrão.",
      },
      {
        id: "q1_7",
        question: "Qual é a diferença entre os papéis de P.O. e Direção na TBO?",
        options: [
          { id: "a", label: "P.O.s fazem a gestão de pessoas, Direção faz a gestão financeira" },
          { id: "b", label: "P.O.s decidem 'como' executar, Direção decide 'o quê' fazer e 'por quê'" },
          { id: "c", label: "Não há diferença — todos decidem juntos" },
          { id: "d", label: "P.O.s atendem clientes, Direção fica no estratégico sem envolvimento operacional" },
        ],
        correctOptionId: "b",
        explanation:
          "Autonomia Descentralizada: P.O.s têm autonomia para decidir 'como' executar dentro dos seus núcleos. A Direção define 'o quê' precisa ser feito e 'por quê'.",
      },
      {
        id: "q1_8",
        question: "A TBO já produziu aproximadamente quantas imagens renderizadas ao longo da história?",
        options: [
          { id: "a", label: "+500" },
          { id: "b", label: "+1.000" },
          { id: "c", label: "+3.000" },
          { id: "d", label: "+10.000" },
        ],
        correctOptionId: "c",
        explanation:
          "Produção histórica estimada: +3.000 imagens renderizadas, +120 projetos lançados, +20 marcas desenvolvidas, +10 filmes publicitários.",
      },
    ],
  },
  {
    day: 2,
    title: "Quiz — Ferramentas & Processos",
    description: "Cenários reais sobre ferramentas e fluxos do dia a dia.",
    passingScore: 6,
    questions: [
      {
        id: "q2_1",
        question:
          "Você precisa alinhar algo urgente com um colega. Qual canal você usa?",
        options: [
          { id: "a", label: "WhatsApp pessoal dele" },
          { id: "b", label: "Google Chat — canal principal de comunicação interna" },
          { id: "c", label: "E-mail corporativo" },
          { id: "d", label: "Ligar no celular" },
        ],
        correctOptionId: "b",
        explanation:
          "Google Chat é o canal para comunicação interna diária. WhatsApp é apenas para comunicação rápida com clientes. E-mail é para comunicação externa ou formal.",
      },
      {
        id: "q2_2",
        question:
          "Você precisa criar um post rápido no Canva. Com qual conta você loga?",
        options: [
          { id: "a", label: "Sua conta pessoal do Canva" },
          { id: "b", label: "contato@agenciatbo.com.br" },
          { id: "c", label: "projetos@agenciatbo.com.br (via Google)" },
          { id: "d", label: "Criar uma conta nova com seu e-mail corporativo" },
        ],
        correctOptionId: "c",
        explanation:
          "Canva, Miro, Envato e Krea.ai — todas usam projetos@agenciatbo.com.br via login Google. NUNCA usar conta pessoal. NUNCA criar novo time.",
      },
      {
        id: "q2_3",
        question: "Qual é a plataforma central para documentação, guias, fluxos e status de projetos?",
        options: [
          { id: "a", label: "Google Docs" },
          { id: "b", label: "Confluence" },
          { id: "c", label: "Notion" },
          { id: "d", label: "TBO OS" },
        ],
        correctOptionId: "c",
        explanation:
          "Notion é a plataforma central de gestão e conhecimento. TBO OS é o sistema operacional, mas a documentação vive no Notion.",
      },
      {
        id: "q2_4",
        question: "Você participou de uma reunião importante mas esqueceu de anotar os action items. Como recupera?",
        options: [
          { id: "a", label: "Pede para o colega reenviar por e-mail" },
          { id: "b", label: "Acessa a transcrição no Fireflies.ai" },
          { id: "c", label: "Procura no Google Chat" },
          { id: "d", label: "Agenda uma nova reunião para revisar" },
        ],
        correctOptionId: "b",
        explanation:
          "Fireflies.ai grava e transcreve automaticamente todas as reuniões. Basta acessar para revisar a transcrição completa e os action items.",
      },
      {
        id: "q2_5",
        question: "Você terminou um arquivo final para o cliente. Onde salva?",
        options: [
          { id: "a", label: "Na área de trabalho do seu computador" },
          { id: "b", label: "No Google Drive — pasta do projeto, organizada por estrutura padrão" },
          { id: "c", label: "Envia direto por WeTransfer ao cliente" },
          { id: "d", label: "Upload no Notion do projeto" },
        ],
        correctOptionId: "b",
        explanation:
          "Google Drive é o repositório oficial. Arquivos salvos localmente ou enviados fora do fluxo oficial não contam. Entregas seguem via e-mail com registro no Notion.",
      },
      {
        id: "q2_6",
        question: "Você precisa usar o Pacote Adobe. Qual é o login padrão?",
        options: [
          { id: "a", label: "Seu e-mail corporativo @agenciatbo.com.br" },
          { id: "b", label: "contato@agenciatbo.com.br com senha padrão TBO" },
          { id: "c", label: "projetos@agenciatbo.com.br" },
          { id: "d", label: "Criar sua própria conta Adobe" },
        ],
        correctOptionId: "b",
        explanation:
          "O Adobe usa contato@agenciatbo.com.br como login principal padrão. NUNCA alterar e-mails ou senhas sem comunicar a direção. O secundário só é usado com autorização.",
      },
      {
        id: "q2_7",
        question: "Quais são os 3 rituais de comunicação citados pela TBO?",
        options: [
          { id: "a", label: "Standup diário, sprint review, retrospectiva" },
          { id: "b", label: "Checkpoints diários, 1:1s mensais, reuniões de time" },
          { id: "c", label: "E-mail semanal, reunião quinzenal, relatório mensal" },
          { id: "d", label: "Daily no Slack, weekly no Zoom, monthly report" },
        ],
        correctOptionId: "b",
        explanation:
          "Rituais: Checkpoints diários (Google Chat), 1:1s mensais (feedback e alinhamento), Reuniões de time (revisão de entregas). Também há revisões criativas e debriefs pós-entrega.",
      },
      {
        id: "q2_8",
        question: "Na licença do Adobe, aparece 'This license is being used on another device'. O que fazer?",
        options: [
          { id: "a", label: "Criar uma conta pessoal nova" },
          { id: "b", label: "Usar o login secundário sem perguntar" },
          { id: "c", label: "Sign out of other devices — e se persistir, comunicar à direção" },
          { id: "d", label: "Baixar uma versão pirata temporária" },
        ],
        correctOptionId: "c",
        explanation:
          "Primeiro: 'Sign out of other devices'. Se o problema persistir, comunicar a direção. O login secundário só com autorização expressa. Jamais pirataria.",
      },
    ],
  },
  {
    day: 3,
    title: "Quiz — Contexto & Cultura",
    description: "Cenários e situações reais sobre cultura, políticas e valores.",
    passingScore: 6,
    questions: [
      {
        id: "q3_1",
        question: "Qual frase NÃO faz parte da missão da TBO?",
        options: [
          { id: "a", label: "Transformar empreendimentos em marcas desejadas" },
          { id: "b", label: "Ser a maior agência do mercado imobiliário brasileiro" },
          { id: "c", label: "Criar narrativas que conectam pessoas, produtos e cidades" },
          { id: "d", label: "Unir pensamento estratégico e criatividade autoral" },
        ],
        correctOptionId: "b",
        explanation:
          "A TBO não busca ser 'a maior'. A missão é transformar empreendimentos em marcas desejadas, memoráveis e lucrativas. Tamanho ≠ excelência.",
      },
      {
        id: "q3_2",
        question:
          "Um colega entregou um trabalho com erros. Você discorda da abordagem dele. Qual é a postura correta?",
        options: [
          { id: "a", label: "Refazer o trabalho sozinho e avisar depois" },
          { id: "b", label: "Comentar no grupo geral que está errado" },
          { id: "c", label: "Partir da intenção positiva, oferecer feedback direto e construtivo, privadamente" },
          { id: "d", label: "Não falar nada para evitar conflito" },
        ],
        correctOptionId: "c",
        explanation:
          "Regra de ouro: intenção positiva + feedback construtivo + conversa direta. Evitar conflito não é opção — drama e política se resolvem com conversa direta.",
      },
      {
        id: "q3_3",
        question: "Um colega faz piadas que constrangem outro membro da equipe. Qual a resposta correta?",
        options: [
          { id: "a", label: "É só humor, não precisa levar a sério" },
          { id: "b", label: "Tolerância zero — assédio inclui piadas constrangedoras. Denunciar à diretoria ou compliance@tbo.com.br" },
          { id: "c", label: "Falar com o colega diretamente e resolver entre vocês" },
          { id: "d", label: "Esperar a próxima reunião de time para levantar o assunto" },
        ],
        correctOptionId: "b",
        explanation:
          "Política Antiassédio: tolerância zero. Piadas constrangedoras SÃO assédio. Canais: compliance@tbo.com.br ou diretoria. Retaliação contra denunciantes é violação grave.",
      },
      {
        id: "q3_4",
        question:
          "O cliente pede 5 rodadas extras de revisão que não estão no escopo. O que você faz?",
        options: [
          { id: "a", label: "Faz todas para manter o relacionamento" },
          { id: "b", label: "Recusa e diz que não é possível" },
          { id: "c", label: "Alinha com P.O./Atendimento — mudanças fora do escopo exigem acordo formal e possível novo orçamento" },
          { id: "d", label: "Faz as revisões e cobra depois" },
        ],
        correctOptionId: "c",
        explanation:
          "Respeito ao escopo contratado. Rodadas definidas no contrato. Mudanças estruturais = nova fase/novo orçamento. Sempre alinhar com P.O./Atendimento primeiro.",
      },
      {
        id: "q3_5",
        question: "Qual é a visão da TBO?",
        options: [
          { id: "a", label: "Ser a maior agência de publicidade do Brasil" },
          { id: "b", label: "Ser a principal plataforma global de soluções tecnológico-publicitárias para lançamentos imobiliários" },
          { id: "c", label: "Abrir franquias em todas as capitais brasileiras" },
          { id: "d", label: "Criar um software SaaS para incorporadoras" },
        ],
        correctOptionId: "b",
        explanation:
          "Visão: plataforma global, tecnologia + publicidade, especialização total no mercado imobiliário. Foco em estrutura modular e escalável.",
      },
      {
        id: "q3_6",
        question: "O que significa 'Excelência sem Perfeccionismo' na cultura TBO?",
        options: [
          { id: "a", label: "Entregar qualquer coisa, rápido" },
          { id: "b", label: "Buscar qualidade excepcional, mas saber quando 'ótimo' é suficiente e iterar rápido" },
          { id: "c", label: "Sempre entregar perfeito, não importa o prazo" },
          { id: "d", label: "Bom é o inimigo do ótimo" },
        ],
        correctOptionId: "b",
        explanation:
          "Buscamos qualidade excepcional, mas sabemos quando 'ótimo' é suficiente. Iteramos rápido em vez de travar em busca do perfeito. Perfeccionismo paralisante é um anti-padrão.",
      },
      {
        id: "q3_7",
        question: "Na TBO, qual dessas frases é um anti-padrão de cultura?",
        options: [
          { id: "a", label: "'Posso te ajudar com isso?'" },
          { id: "b", label: "'Isso não é minha função'" },
          { id: "c", label: "'Tenho uma sugestão de melhoria'" },
          { id: "d", label: "'Errei aqui, aprendi isso'" },
        ],
        correctOptionId: "b",
        explanation:
          "Anti-padrão explícito: 'Não é minha função' — todos ajudam onde necessário. Colaboração real: 'Seu sucesso é meu sucesso' não é chavão, é prática.",
      },
      {
        id: "q3_8",
        question: "Qual é o tom de voz da TBO na comunicação?",
        options: [
          { id: "a", label: "Informal, jovem e descolado" },
          { id: "b", label: "Sofisticado, empático, transparente, consultivo e adaptável" },
          { id: "c", label: "Corporativo, formal e distante" },
          { id: "d", label: "Técnico, objetivo e sem emoção" },
        ],
        correctOptionId: "b",
        explanation:
          "Tom de voz TBO: Sofisticado (assertivo com elegância), Empático (nos colocamos no lugar do outro), Transparente (frases diretas), Consultivo (especialistas), Adaptável (flexível por projeto).",
      },
    ],
  },
  {
    day: 4,
    title: "Quiz — Seu Papel",
    description: "Cenários sobre seu papel, relacionamento com time e operação.",
    passingScore: 6,
    questions: [
      {
        id: "q4_1",
        question: "Quem são os P.O.s da TBO e suas respectivas áreas?",
        options: [
          { id: "a", label: "Nelson (Marketing), Nathália (Branding), Rafaela (3D)" },
          { id: "b", label: "Nelson (Branding), Nathália (Digital 3D), Rafaela (Marketing)" },
          { id: "c", label: "Nelson (3D), Nathália (Marketing), Rafaela (Branding)" },
          { id: "d", label: "Marco (Branding), Ruy (3D), Nelson (Marketing)" },
        ],
        correctOptionId: "b",
        explanation:
          "Nelson Mozart = P.O. de Branding. Nathália Runge = P.O. de Digital 3D. Rafaela Oltramari = P.O. de Marketing. Carolina Lima = Coordenadora de Atendimento.",
      },
      {
        id: "q4_2",
        question: "Você percebeu um problema no processo do seu setor. O que é esperado?",
        options: [
          { id: "a", label: "Ignorar — não é seu nível hierárquico para mudar processos" },
          { id: "b", label: "Questionar construtivamente e propor melhoria proativamente — Mentalidade de Dono" },
          { id: "c", label: "Reclamar no grupo geral" },
          { id: "d", label: "Esperar que a direção perceba e resolva" },
        ],
        correctOptionId: "b",
        explanation:
          "Mentalidade de Dono: propõe melhorias proativamente. Hierarquia rígida é anti-padrão — todos podem questionar e propor.",
      },
      {
        id: "q4_3",
        question: "No checkpoint diário, o que você deve compartilhar?",
        options: [
          { id: "a", label: "Apenas se tiver algo importante" },
          { id: "b", label: "Status, bloqueios e prioridades do dia" },
          { id: "c", label: "Um resumo do dia anterior apenas" },
          { id: "d", label: "Só se o P.O. pedir" },
        ],
        correctOptionId: "b",
        explanation:
          "Checkpoints diários (Google Chat): status das entregas, bloqueios que precisam de ajuda, prioridades do dia. Comunicar problemas ANTES que virem problemas maiores.",
      },
      {
        id: "q4_4",
        question: "O que é o ReadMe individual e por que ele é importante?",
        options: [
          { id: "a", label: "Um arquivo README.md do repositório de código" },
          { id: "b", label: "Um documento onde você registra como trabalha melhor, para que o time saiba como colaborar com você" },
          { id: "c", label: "Uma lista de suas tarefas diárias" },
          { id: "d", label: "Seu currículo interno na empresa" },
        ],
        correctOptionId: "b",
        explanation:
          "O ReadMe individual registra: como você trabalha melhor, preferências de comunicação, horários produtivos, o que te motiva. Facilita a colaboração com o time.",
      },
      {
        id: "q4_5",
        question:
          "Você está bloqueado em uma tarefa e não sabe como resolver. O que faz?",
        options: [
          { id: "a", label: "Tenta resolver sozinho por dias até conseguir" },
          { id: "b", label: "Comunica o bloqueio no checkpoint e pede ajuda ao P.O. ou colega — sem receio" },
          { id: "c", label: "Espera a próxima reunião para falar" },
          { id: "d", label: "Marca como concluída e segue adiante" },
        ],
        correctOptionId: "b",
        explanation:
          "Cultura TBO: pedimos ajuda sem receio. Comunicar bloqueios ANTES que virem problemas. Autonomia com responsabilidade: saber quando pedir ajuda é maturidade.",
      },
      {
        id: "q4_6",
        question: "Qual é a frequência e formato dos 1:1s na TBO?",
        options: [
          { id: "a", label: "Semanais, 15 minutos, status rápido" },
          { id: "b", label: "Mensais — feedback, escuta ativa e alinhamento individual" },
          { id: "c", label: "Trimestrais — avaliação de performance" },
          { id: "d", label: "Apenas quando há problema" },
        ],
        correctOptionId: "b",
        explanation:
          "1:1s mensais com foco em feedback, escuta ativa e alinhamento individual. Não é avaliação — é conversa de desenvolvimento.",
      },
      {
        id: "q4_7",
        question: "O que significa RACI e por que importa na TBO?",
        options: [
          { id: "a", label: "Um tipo de reunião" },
          { id: "b", label: "Responsável, Aprovador, Consultado, Informado — define quem faz o quê em cada decisão/entrega" },
          { id: "c", label: "Um método de precificação" },
          { id: "d", label: "Uma ferramenta de design" },
        ],
        correctOptionId: "b",
        explanation:
          "RACI define papéis claros: quem é Responsável pela execução, quem Aprova, quem é Consultado e quem deve ser Informado. Decisões estratégicas devem ser documentadas.",
      },
      {
        id: "q4_8",
        question: "A TBO tem crescimento baseado em:",
        options: [
          { id: "a", label: "Tempo de casa — quem está há mais tempo sobe" },
          { id: "b", label: "Meritocracia técnica — excelência e contribuição > hierarquia e antiguidade" },
          { id: "c", label: "Indicação dos fundadores" },
          { id: "d", label: "Não há progressão de carreira" },
        ],
        correctOptionId: "b",
        explanation:
          "Meritocracia Técnica: crescimento por excelência. Contribuição pesa mais que hierarquia ou tempo de casa.",
      },
    ],
  },
  {
    day: 5,
    title: "Quiz — Autonomia",
    description: "Prove que está pronto para operar com autonomia na TBO.",
    passingScore: 7,
    questions: [
      {
        id: "q5_1",
        question:
          "Um lead chega pelo Instagram pedindo orçamento. Qual é o fluxo correto?",
        options: [
          { id: "a", label: "Responde com preço direto para fechar rápido" },
          { id: "b", label: "Lead qualificado → CRM → pré-briefing → diagnóstico → contrato → produção" },
          { id: "c", label: "Agenda reunião imediatamente e começa a produzir" },
          { id: "d", label: "Encaminha para o WhatsApp do comercial" },
        ],
        correctOptionId: "b",
        explanation:
          "Fluxo obrigatório. Nada começa sem contrato assinado e diagnóstico aprovado. Pré-briefing valida se o lead é qualificado antes de investir tempo.",
      },
      {
        id: "q5_2",
        question: "O cliente precisa de um Key Visual novo. Qual é o prazo esperado?",
        options: [
          { id: "a", label: "48-72 horas — é uma demanda simples" },
          { id: "b", label: "5-10 dias úteis — é uma nova peça/criação" },
          { id: "c", label: "Personalizado — Key Visual é Nível 3 (estratégia/branding/CGI)" },
          { id: "d", label: "Não há prazo definido" },
        ],
        correctOptionId: "c",
        explanation:
          "Key Visual é Nível 3 (Estratégia/Branding/CGI) = prazo personalizado. Nível 1 (ajustes leves) = 48-72h. Nível 2 (novas peças) = 5-10 dias úteis.",
      },
      {
        id: "q5_3",
        question:
          "Você terminou uma entrega. Qual é o fluxo correto para enviar ao cliente?",
        options: [
          { id: "a", label: "Enviar por WhatsApp para agilizar" },
          { id: "b", label: "QA interno → registro no Notion → envio por e-mail ao cliente" },
          { id: "c", label: "Upload no Drive e avisar o cliente por Chat" },
          { id: "d", label: "Enviar pelo canal que o cliente preferir" },
        ],
        correctOptionId: "b",
        explanation:
          "Fluxo: QA interno obrigatório → registro no Notion → entrega por e-mail. Nenhum alinhamento via WhatsApp. Tudo documentado.",
      },
      {
        id: "q5_4",
        question: "O cliente liga pedindo urgência e quer entrega em 24h de algo que normalmente leva 10 dias. Como responder?",
        options: [
          { id: "a", label: "Aceita e vira a noite para entregar" },
          { id: "b", label: "Qualidade acima de urgência — alinha expectativa realista, propõe cronograma viável com o P.O." },
          { id: "c", label: "Recusa e diz que não é possível" },
          { id: "d", label: "Entrega parcial sem QA para atender o prazo" },
        ],
        correctOptionId: "b",
        explanation:
          "Qualidade acima de urgência. P.O. protege o time. Atendimento filtra demandas. Propor cronograma viável — nunca comprometer a qualidade por pressão.",
      },
      {
        id: "q5_5",
        question: "Qual é a relação TBO x Cliente?",
        options: [
          { id: "a", label: "O cliente manda, a TBO executa" },
          { id: "b", label: "Parceria estratégica — a TBO tem autonomia técnica e criativa completa" },
          { id: "c", label: "O cliente aprova tudo antes da TBO começar" },
          { id: "d", label: "A TBO trabalha de forma independente sem input do cliente" },
        ],
        correctOptionId: "b",
        explanation:
          "Parceria, não subordinação. A TBO possui autonomia completa em direção criativa, estratégia e qualidade. O cliente participa, mas não subordina.",
      },
      {
        id: "q5_6",
        question: "Você vê um colega segurando informação do projeto para si mesmo. Qual é o problema?",
        options: [
          { id: "a", label: "Não é problema se ele entrega no prazo" },
          { id: "b", label: "Anti-padrão grave: guardar informação para ter poder enfraquece o time. Conhecimento deve ser compartilhado abertamente" },
          { id: "c", label: "É problema apenas se a diretoria reclamar" },
          { id: "d", label: "Normal — cada um cuida da sua parte" },
        ],
        correctOptionId: "b",
        explanation:
          "Anti-padrão explícito: 'Guardar informação para ter poder — conhecimento concentrado enfraquece o time.' Compartilhar é valor, não favor.",
      },
      {
        id: "q5_7",
        question: "A reunião com o cliente deve ter antecedência mínima de:",
        options: [
          { id: "a", label: "Pode ser marcada na hora" },
          { id: "b", label: "12 horas" },
          { id: "c", label: "24 horas de antecedência" },
          { id: "d", label: "48 horas" },
        ],
        correctOptionId: "c",
        explanation:
          "Regra de proteção da equipe: reuniões com 24h de antecedência mínima. P.O. protege o time. Atendimento filtra demandas.",
      },
      {
        id: "q5_8",
        question: "O que a TBO entrega além de comunicação visual?",
        options: [
          { id: "a", label: "Apenas design e branding" },
          { id: "b", label: "Apenas campanhas publicitárias" },
          { id: "c", label: "Visão, método e impacto — diagnóstico, posicionamento, marca, campanha e ativação como sistema narrativo unificado" },
          { id: "d", label: "Software para incorporadoras" },
        ],
        correctOptionId: "c",
        explanation:
          "Manifesto: 'O que entregamos vai além de comunicação. Entregamos visão, método e impacto.' Naming, identidade, 3D, filmes, campanhas são um sistema narrativo unificado, não peças soltas.",
      },
    ],
  },
];

export const TOTAL_QUIZ_QUESTIONS = ONBOARDING_QUIZZES.reduce(
  (acc, quiz) => acc + quiz.questions.length,
  0,
);

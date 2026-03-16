// ============================================================================
// TBO OS — Onboarding Checklist Constants
// 5-day self-service journey based on Notion Onboarding page
// ============================================================================

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  notionUrl?: string;
  action?: "link" | "internal" | "confirm";
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
        title: "Preencher seu perfil no TBO OS",
        description: "Nome, cargo e foto de perfil",
        action: "internal",
        internalRoute: "/configuracoes",
      },
      {
        id: "d1_cultura",
        title: "Ler o Manual de Cultura",
        description: "Missão, visão, valores e como a TBO funciona",
        notionUrl: "https://www.notion.so/2193782e356143e5b41756c78e230cec",
        action: "link",
      },
      {
        id: "d1_cargos",
        title: "Conhecer Estrutura de Cargos e Funções",
        description: "Entenda quem faz o quê e onde você se encaixa",
        notionUrl: "https://www.notion.so/28fb27ff29e3804984d7c89ae1f21598",
        action: "link",
      },
      {
        id: "d1_ferramentas",
        title: "Acessar o Guia de Ferramentas",
        description: "Ferramentas oficiais e boas práticas de uso",
        notionUrl: "https://www.notion.so/2a0b27ff29e3802896badaf2e744977c",
        action: "link",
      },
    ],
  },
  {
    day: 2,
    title: "Ferramentas & Processos",
    subtitle: "Configure seu ambiente de trabalho",
    icon: "🛠️",
    tasks: [
      {
        id: "d2_email",
        title: "Configurar e-mail corporativo",
        description: "Acesse seu @agenciatbo.com.br e configure assinatura",
        action: "confirm",
      },
      {
        id: "d2_ferramentas_setor",
        title: "Acessar ferramentas do seu setor",
        description: "Figma, Adobe, Cinema 4D, ou o que seu P.O. indicar",
        action: "confirm",
      },
      {
        id: "d2_notion",
        title: "Acessar o Notion da TBO",
        description: "Fonte oficial de informação — conheça os espaços de trabalho",
        action: "confirm",
      },
      {
        id: "d2_drive",
        title: "Acessar o Google Drive compartilhado",
        description: "Entenda a estrutura de pastas e onde salvar seus arquivos",
        action: "confirm",
      },
    ],
  },
  {
    day: 3,
    title: "Contexto & Cultura",
    subtitle: "Entenda como pensamos e criamos",
    icon: "🧠",
    tasks: [
      {
        id: "d3_missao",
        title: "Ler sobre Missão, Visão e Valores",
        description: "Os pilares que guiam cada decisão na TBO",
        notionUrl: "https://www.notion.so/228b27ff29e381a39b09f1eae45058f7",
        action: "link",
      },
      {
        id: "d3_politicas",
        title: "Conhecer Políticas da TBO",
        description: "Ética, antiassédio e regras de convivência",
        notionUrl: "https://www.notion.so/228b27ff29e380b79942c372e7435b82",
        action: "link",
      },
      {
        id: "d3_regras_negocio",
        title: "Entender Regras de Negócio",
        description: "Como funciona nossa operação e tomada de decisão",
        notionUrl: "https://www.notion.so/2b9b27ff29e380088adbc9c01e117278",
        action: "link",
      },
      {
        id: "d3_limites",
        title: "Ler Limites e Regras TBO",
        description: "O que esperamos e os limites que respeitamos",
        notionUrl: "https://www.notion.so/2a0b27ff29e380caabbff7a0154ba129",
        action: "link",
      },
    ],
  },
  {
    day: 4,
    title: "Seu Papel",
    subtitle: "Encontre seu lugar no time",
    icon: "🎯",
    tasks: [
      {
        id: "d4_cargo_escopo",
        title: "Revisar escopo do seu cargo",
        description: "Confirme suas responsabilidades com seu P.O.",
        action: "confirm",
      },
      {
        id: "d4_conhecer_time",
        title: "Conhecer seu P.O., líder e time",
        description: "Saiba quem são seus colegas de área e como colaborar",
        action: "internal",
        internalRoute: "/pessoas",
      },
      {
        id: "d4_agendar_1on1",
        title: "Agendar 1:1 de alinhamento",
        description: "Marque com seu P.O. para alinhar expectativas e primeiras entregas",
        action: "confirm",
      },
      {
        id: "d4_readme",
        title: "Criar seu ReadMe individual",
        description: "Compartilhe como você trabalha melhor com o time",
        notionUrl: "https://www.notion.so/228b27ff29e380b9808bf341b185d60e",
        action: "link",
      },
    ],
  },
  {
    day: 5,
    title: "Autonomia",
    subtitle: "Comece a criar com a TBO",
    icon: "⚡",
    tasks: [
      {
        id: "d5_projetos",
        title: "Conhecer seus primeiros projetos",
        description: "Acesse o módulo Projetos e veja o que está em andamento",
        action: "internal",
        internalRoute: "/projetos",
      },
      {
        id: "d5_modulos",
        title: "Explorar módulos do TBO OS",
        description: "Dashboard, Tarefas, Agenda — navegue pelo sistema",
        action: "internal",
        internalRoute: "/dashboard",
      },
      {
        id: "d5_bau_criativo",
        title: "Explorar o Baú Criativo",
        description: "Referências visuais e criativas da TBO",
        notionUrl: "https://www.notion.so/a87e84f6b18141faa5dfc5aba0ba567e",
        action: "link",
      },
      {
        id: "d5_conclusao",
        title: "Confirmar conclusão do onboarding",
        description: "Marque esta tarefa para oficializar sua entrada na equipe!",
        action: "confirm",
      },
    ],
  },
];

export const TOTAL_TASKS = ONBOARDING_DAYS.reduce(
  (acc, day) => acc + day.tasks.length,
  0,
);

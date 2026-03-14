import type { Course, CourseModule, LearningPath, LeaderboardEntry } from "../types"

export const MOCK_COURSES: Course[] = [
  {
    id: "c1",
    title: "Design de Identidade Visual",
    description:
      "Aprenda a criar identidades visuais memoraveis, do briefing ao manual de marca.",
    category: "Design",
    instructor: "Ana Beatriz Souza",
    thumbnail: "design",
    duration: "12h 30min",
    totalModules: 8,
    completedModules: 5,
    progress: 62,
    rating: 4.8,
    students: 42,
    level: "intermediario",
    status: "em_andamento",
    tags: ["branding", "identidade visual", "design"],
  },
  {
    id: "c2",
    title: "Branding Estrategico",
    description:
      "Construa marcas com proposito: posicionamento, arquitetura de marca e storytelling.",
    category: "Branding",
    instructor: "Carlos Mendes",
    thumbnail: "branding",
    duration: "10h 15min",
    totalModules: 7,
    completedModules: 7,
    progress: 100,
    rating: 4.9,
    students: 38,
    level: "avancado",
    status: "concluido",
    tags: ["branding", "estrategia", "posicionamento"],
  },
  {
    id: "c3",
    title: "Marketing Digital para Agencias",
    description:
      "Domine trafego pago, SEO, inbound e growth hacking para entregar resultados reais.",
    category: "Marketing Digital",
    instructor: "Fernanda Lima",
    thumbnail: "marketing",
    duration: "15h 45min",
    totalModules: 8,
    completedModules: 3,
    progress: 37,
    rating: 4.7,
    students: 56,
    level: "intermediario",
    status: "em_andamento",
    tags: ["marketing", "trafego pago", "SEO"],
  },
  {
    id: "c4",
    title: "Copywriting Persuasivo",
    description:
      "Tecnicas de escrita persuasiva para anuncios, landing pages e conteudo que converte.",
    category: "Copywriting",
    instructor: "Rafael Torres",
    thumbnail: "copy",
    duration: "8h 20min",
    totalModules: 6,
    completedModules: 0,
    progress: 0,
    rating: 4.6,
    students: 31,
    level: "iniciante",
    status: "nao_iniciado",
    tags: ["copywriting", "persuasao", "conteudo"],
  },
  {
    id: "c5",
    title: "Motion Graphics com After Effects",
    description:
      "Crie animacoes impactantes para redes sociais, apresentacoes e video marketing.",
    category: "Motion Graphics",
    instructor: "Lucas Oliveira",
    thumbnail: "motion",
    duration: "18h 00min",
    totalModules: 8,
    completedModules: 2,
    progress: 25,
    rating: 4.8,
    students: 27,
    level: "avancado",
    status: "em_andamento",
    tags: ["motion", "after effects", "animacao"],
  },
  {
    id: "c6",
    title: "UI/UX Design para Produtos Digitais",
    description:
      "Do wireframe ao prototipo: pesquisa, design system, usabilidade e testes.",
    category: "UI/UX",
    instructor: "Mariana Costa",
    thumbnail: "uiux",
    duration: "14h 10min",
    totalModules: 7,
    completedModules: 0,
    progress: 0,
    rating: 4.9,
    students: 45,
    level: "intermediario",
    status: "nao_iniciado",
    tags: ["UI", "UX", "produto digital"],
  },
  {
    id: "c7",
    title: "Social Media Strategy",
    description:
      "Planejamento, calendário editorial, metricas e gestao de comunidades.",
    category: "Social Media",
    instructor: "Julia Andrade",
    thumbnail: "social",
    duration: "9h 50min",
    totalModules: 6,
    completedModules: 6,
    progress: 100,
    rating: 4.5,
    students: 62,
    level: "iniciante",
    status: "concluido",
    tags: ["social media", "conteudo", "engajamento"],
  },
  {
    id: "c8",
    title: "Gestao de Projetos Criativos",
    description:
      "Metodologias ageis adaptadas para agencias: Scrum, Kanban e gestao de prazos.",
    category: "Gestao",
    instructor: "Pedro Henrique Dias",
    thumbnail: "gestao",
    duration: "11h 00min",
    totalModules: 5,
    completedModules: 1,
    progress: 20,
    rating: 4.7,
    students: 34,
    level: "iniciante",
    status: "em_andamento",
    tags: ["gestao", "agile", "projetos"],
  },
]

export const MOCK_MODULES: CourseModule[] = [
  // Design de Identidade Visual
  { id: "m1-1", courseId: "c1", title: "Fundamentos de Design", duration: "1h 30min", order: 1, status: "completed" },
  { id: "m1-2", courseId: "c1", title: "Pesquisa e Briefing", duration: "1h 45min", order: 2, status: "completed" },
  { id: "m1-3", courseId: "c1", title: "Tipografia e Cores", duration: "2h 00min", order: 3, status: "completed" },
  { id: "m1-4", courseId: "c1", title: "Criacao de Logotipo", duration: "1h 30min", order: 4, status: "completed" },
  { id: "m1-5", courseId: "c1", title: "Papelaria e Aplicacoes", duration: "1h 15min", order: 5, status: "completed" },
  { id: "m1-6", courseId: "c1", title: "Manual de Marca", duration: "1h 30min", order: 6, status: "in_progress" },
  { id: "m1-7", courseId: "c1", title: "Apresentacao ao Cliente", duration: "1h 30min", order: 7, status: "locked" },
  { id: "m1-8", courseId: "c1", title: "Projeto Final", duration: "1h 30min", order: 8, status: "locked" },

  // Branding Estrategico
  { id: "m2-1", courseId: "c2", title: "O que e Branding", duration: "1h 15min", order: 1, status: "completed" },
  { id: "m2-2", courseId: "c2", title: "Pesquisa de Mercado", duration: "1h 30min", order: 2, status: "completed" },
  { id: "m2-3", courseId: "c2", title: "Posicionamento de Marca", duration: "1h 45min", order: 3, status: "completed" },
  { id: "m2-4", courseId: "c2", title: "Arquitetura de Marca", duration: "1h 30min", order: 4, status: "completed" },
  { id: "m2-5", courseId: "c2", title: "Brand Storytelling", duration: "1h 15min", order: 5, status: "completed" },
  { id: "m2-6", courseId: "c2", title: "Brand Experience", duration: "1h 30min", order: 6, status: "completed" },
  { id: "m2-7", courseId: "c2", title: "Metricas de Marca", duration: "1h 30min", order: 7, status: "completed" },

  // Marketing Digital
  { id: "m3-1", courseId: "c3", title: "Fundamentos de Marketing Digital", duration: "2h 00min", order: 1, status: "completed" },
  { id: "m3-2", courseId: "c3", title: "SEO e Conteudo", duration: "2h 00min", order: 2, status: "completed" },
  { id: "m3-3", courseId: "c3", title: "Google Ads", duration: "2h 15min", order: 3, status: "completed" },
  { id: "m3-4", courseId: "c3", title: "Meta Ads", duration: "2h 00min", order: 4, status: "in_progress" },
  { id: "m3-5", courseId: "c3", title: "Inbound Marketing", duration: "1h 45min", order: 5, status: "locked" },
  { id: "m3-6", courseId: "c3", title: "Email Marketing", duration: "1h 45min", order: 6, status: "locked" },
  { id: "m3-7", courseId: "c3", title: "Growth Hacking", duration: "2h 00min", order: 7, status: "locked" },
  { id: "m3-8", courseId: "c3", title: "Analytics e Relatorios", duration: "2h 00min", order: 8, status: "locked" },

  // Copywriting
  { id: "m4-1", courseId: "c4", title: "Principios da Persuasao", duration: "1h 20min", order: 1, status: "locked" },
  { id: "m4-2", courseId: "c4", title: "Headlines que Convertem", duration: "1h 30min", order: 2, status: "locked" },
  { id: "m4-3", courseId: "c4", title: "Copy para Anuncios", duration: "1h 20min", order: 3, status: "locked" },
  { id: "m4-4", courseId: "c4", title: "Landing Pages", duration: "1h 30min", order: 4, status: "locked" },
  { id: "m4-5", courseId: "c4", title: "Email Copywriting", duration: "1h 20min", order: 5, status: "locked" },
  { id: "m4-6", courseId: "c4", title: "Storytelling em Copy", duration: "1h 20min", order: 6, status: "locked" },

  // Motion Graphics
  { id: "m5-1", courseId: "c5", title: "Interface do After Effects", duration: "2h 00min", order: 1, status: "completed" },
  { id: "m5-2", courseId: "c5", title: "Keyframes e Timing", duration: "2h 30min", order: 2, status: "completed" },
  { id: "m5-3", courseId: "c5", title: "Shape Layers", duration: "2h 15min", order: 3, status: "in_progress" },
  { id: "m5-4", courseId: "c5", title: "Textos Animados", duration: "2h 00min", order: 4, status: "locked" },
  { id: "m5-5", courseId: "c5", title: "Transicoes e Efeitos", duration: "2h 15min", order: 5, status: "locked" },
  { id: "m5-6", courseId: "c5", title: "Expressions Basicas", duration: "2h 30min", order: 6, status: "locked" },
  { id: "m5-7", courseId: "c5", title: "Render e Exportacao", duration: "2h 00min", order: 7, status: "locked" },
  { id: "m5-8", courseId: "c5", title: "Projeto Final", duration: "2h 30min", order: 8, status: "locked" },

  // UI/UX
  { id: "m6-1", courseId: "c6", title: "Pesquisa de Usuario", duration: "2h 00min", order: 1, status: "locked" },
  { id: "m6-2", courseId: "c6", title: "Information Architecture", duration: "2h 00min", order: 2, status: "locked" },
  { id: "m6-3", courseId: "c6", title: "Wireframing", duration: "2h 00min", order: 3, status: "locked" },
  { id: "m6-4", courseId: "c6", title: "Design System", duration: "2h 10min", order: 4, status: "locked" },
  { id: "m6-5", courseId: "c6", title: "Prototipagem no Figma", duration: "2h 00min", order: 5, status: "locked" },
  { id: "m6-6", courseId: "c6", title: "Testes de Usabilidade", duration: "2h 00min", order: 6, status: "locked" },
  { id: "m6-7", courseId: "c6", title: "Handoff para Devs", duration: "2h 00min", order: 7, status: "locked" },

  // Social Media
  { id: "m7-1", courseId: "c7", title: "Planejamento Estrategico", duration: "1h 40min", order: 1, status: "completed" },
  { id: "m7-2", courseId: "c7", title: "Calendario Editorial", duration: "1h 30min", order: 2, status: "completed" },
  { id: "m7-3", courseId: "c7", title: "Criacao de Conteudo", duration: "1h 50min", order: 3, status: "completed" },
  { id: "m7-4", courseId: "c7", title: "Engajamento e Comunidade", duration: "1h 30min", order: 4, status: "completed" },
  { id: "m7-5", courseId: "c7", title: "Metricas e KPIs", duration: "1h 40min", order: 5, status: "completed" },
  { id: "m7-6", courseId: "c7", title: "Relatorios para Clientes", duration: "1h 40min", order: 6, status: "completed" },

  // Gestao de Projetos
  { id: "m8-1", courseId: "c8", title: "Metodologias Ageis", duration: "2h 00min", order: 1, status: "completed" },
  { id: "m8-2", courseId: "c8", title: "Scrum para Agencias", duration: "2h 15min", order: 2, status: "in_progress" },
  { id: "m8-3", courseId: "c8", title: "Kanban na Pratica", duration: "2h 15min", order: 3, status: "locked" },
  { id: "m8-4", courseId: "c8", title: "Gestao de Prazos", duration: "2h 15min", order: 4, status: "locked" },
  { id: "m8-5", courseId: "c8", title: "Retrospectivas e Melhoria", duration: "2h 15min", order: 5, status: "locked" },
]

export const MOCK_LEARNING_PATHS: LearningPath[] = [
  {
    id: "lp1",
    title: "Trilha Criativa",
    description:
      "Domine as habilidades essenciais de design, motion e UI/UX para se tornar um criativo completo.",
    totalCourses: 4,
    completedCourses: 1,
    progress: 47,
  },
  {
    id: "lp2",
    title: "Trilha Estrategica",
    description:
      "Desenvolva visao estrategica com branding, marketing digital, gestao e social media.",
    totalCourses: 4,
    completedCourses: 2,
    progress: 64,
  },
]

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: "u1", name: "Ana Beatriz", avatar: "AB", points: 2450, rank: 1 },
  { id: "u2", name: "Lucas Oliveira", avatar: "LO", points: 2120, rank: 2 },
  { id: "u3", name: "Mariana Costa", avatar: "MC", points: 1890, rank: 3 },
  { id: "u4", name: "Rafael Torres", avatar: "RT", points: 1650, rank: 4 },
  { id: "u5", name: "Julia Andrade", avatar: "JA", points: 1420, rank: 5 },
]

export const COURSE_CATEGORIES = [
  "Design",
  "Branding",
  "Marketing Digital",
  "Copywriting",
  "Motion Graphics",
  "UI/UX",
  "Social Media",
  "Gestao",
] as const

export type CourseCategory = (typeof COURSE_CATEGORIES)[number]

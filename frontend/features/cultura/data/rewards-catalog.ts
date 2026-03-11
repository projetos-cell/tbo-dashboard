// ─── TBO Rewards Catalog ─── Catálogo oficial de recompensas por nível

export interface CatalogReward {
  id: string;
  name: string;
  description: string;
  points: number;
  category: RewardCategory;
}

export type RewardCategory =
  | "digital"
  | "bem-estar"
  | "aprendizado"
  | "experiencia"
  | "gastronomia"
  | "lifestyle"
  | "liberdade"
  | "produto"
  | "saude"
  | "lazer"
  | "branding"
  | "utilidade"
  | "cultura"
  | "mimo";

export interface RewardTier {
  id: string;
  name: string;
  icon: string;
  subtitle: string;
  pointRange: string;
  gradient: string;
  accentColor: string;
  borderColor: string;
  rewards: CatalogReward[];
}

export const REWARD_CATEGORIES: Record<
  RewardCategory,
  { label: string; color: string; bg: string }
> = {
  digital: { label: "Digital", color: "#8b5cf6", bg: "rgba(139,92,246,0.10)" },
  "bem-estar": { label: "Bem-estar", color: "#ec4899", bg: "rgba(236,72,153,0.10)" },
  aprendizado: { label: "Aprendizado", color: "#f59e0b", bg: "rgba(245,158,11,0.10)" },
  experiencia: { label: "Experiência", color: "#6366f1", bg: "rgba(99,102,241,0.10)" },
  gastronomia: { label: "Gastronomia", color: "#ef4444", bg: "rgba(239,68,68,0.10)" },
  lifestyle: { label: "Lifestyle", color: "#d946ef", bg: "rgba(217,70,239,0.10)" },
  liberdade: { label: "Liberdade", color: "#22c55e", bg: "rgba(34,197,94,0.10)" },
  produto: { label: "Produto", color: "#3b82f6", bg: "rgba(59,130,246,0.10)" },
  saude: { label: "Saúde", color: "#14b8a6", bg: "rgba(20,184,166,0.10)" },
  lazer: { label: "Lazer", color: "#f97316", bg: "rgba(249,115,22,0.10)" },
  branding: { label: "Branding", color: "#0ea5e9", bg: "rgba(14,165,233,0.10)" },
  utilidade: { label: "Utilidade", color: "#64748b", bg: "rgba(100,116,139,0.10)" },
  cultura: { label: "Cultura", color: "#a855f7", bg: "rgba(168,85,247,0.10)" },
  mimo: { label: "Mimo", color: "#fb923c", bg: "rgba(251,146,60,0.10)" },
};

export const REWARDS_CATALOG: RewardTier[] = [
  // ─── 💎 Alta Performance (Acima de 30 pts) ───
  {
    id: "alta-performance",
    name: "Alta Performance",
    icon: "💎",
    subtitle: "Recompensas premium para quem se destaca",
    pointRange: "Acima de 30 pts",
    gradient: "from-violet-500/10 via-purple-500/5 to-transparent",
    accentColor: "#8b5cf6",
    borderColor: "rgba(139,92,246,0.25)",
    rewards: [
      {
        id: "ap-staycation",
        name: "Staycation Curitiba",
        description: "Crédito para uma diária em hotel boutique parceiro.",
        points: 50,
        category: "experiencia",
      },
      {
        id: "ap-streaming",
        name: "Assinatura Streaming",
        description:
          "12 meses de acesso premium (Netflix, Spotify ou Disney+).",
        points: 40,
        category: "digital",
      },
      {
        id: "ap-spa",
        name: "Day Spa Relaxante",
        description: "Massagem corporal completa com óleos essenciais (60 min).",
        points: 35,
        category: "bem-estar",
      },
      {
        id: "ap-barista",
        name: "Workshop de Barista",
        description: "Aula prática de métodos de preparo e latte art.",
        points: 30,
        category: "aprendizado",
      },
    ],
  },

  // ─── 🥇 Intermediário (20 a 30 pts) ───
  {
    id: "intermediario",
    name: "Intermediário",
    icon: "🥇",
    subtitle: "Experiências e produtos de destaque",
    pointRange: "20 a 30 pts",
    gradient: "from-amber-500/10 via-yellow-500/5 to-transparent",
    accentColor: "#f59e0b",
    borderColor: "rgba(245,158,11,0.25)",
    rewards: [
      {
        id: "int-cafe",
        name: "Assinatura Café",
        description: "3 meses de envio mensal de grãos selecionados (250g).",
        points: 25,
        category: "gastronomia",
      },
      {
        id: "int-pintura",
        name: "Pintura e Vinho",
        description: "Noite de arte guiada com tela, tintas e degustação.",
        points: 25,
        category: "lifestyle",
      },
      {
        id: "int-dayoff",
        name: "Day Off Remunerado",
        description: "Um dia de folga para aproveitar como quiser.",
        points: 25,
        category: "liberdade",
      },
      {
        id: "int-sommelier",
        name: "Kit Sommelier",
        description: "Vinho tinto reserva + saca-rolhas profissional em estojo.",
        points: 20,
        category: "produto",
      },
      {
        id: "int-restaurante",
        name: "Voucher Restaurante",
        description: "Jantar ou almoço premium no valor de R$ 200.",
        points: 20,
        category: "gastronomia",
      },
    ],
  },

  // ─── 🥈 Ativo (10 a 19 pts) ───
  {
    id: "ativo",
    name: "Ativo",
    icon: "🥈",
    subtitle: "Recompensas acessíveis para quem participa",
    pointRange: "10 a 19 pts",
    gradient: "from-slate-400/10 via-gray-300/5 to-transparent",
    accentColor: "#64748b",
    borderColor: "rgba(100,116,139,0.25)",
    rewards: [
      {
        id: "at-velocity",
        name: "Voucher Velocity",
        description: "Pacote de 3 aulas de spinning intenso ou funcional.",
        points: 18,
        category: "saude",
      },
      {
        id: "at-tech",
        name: "Kit Tech Escritório",
        description: "Mouse sem fio ergonômico + Mousepad de couro.",
        points: 18,
        category: "produto",
      },
      {
        id: "at-cervejas",
        name: "Cervejas Artesanais",
        description: "Kit com 4 rótulos premiados + guia de harmonização.",
        points: 15,
        category: "lazer",
      },
      {
        id: "at-moleskine",
        name: "Moleskine TBO",
        description: "Caderno premium personalizado com capa dura.",
        points: 15,
        category: "branding",
      },
      {
        id: "at-combustivel",
        name: "Vale Combustível",
        description: "Crédito de R$ 150 para abastecimento.",
        points: 15,
        category: "utilidade",
      },
      {
        id: "at-cinema-vip",
        name: "Cinema VIP (Par)",
        description: "2 ingressos para sala VIP com serviço de garçom.",
        points: 12,
        category: "lazer",
      },
      {
        id: "at-delivery",
        name: "Gift Card Delivery",
        description: "Crédito de R$ 100 para pedidos no iFood ou Rappi.",
        points: 10,
        category: "utilidade",
      },
      {
        id: "at-livraria",
        name: "Voucher Livraria",
        description: "Cartão presente de R$ 100 para livros ou papelaria.",
        points: 10,
        category: "cultura",
      },
    ],
  },

  // ─── 🥉 Entrada (Abaixo de 10 pts) ───
  {
    id: "entrada",
    name: "Entrada",
    icon: "🥉",
    subtitle: "Primeiras conquistas — todo ponto conta",
    pointRange: "Abaixo de 10 pts",
    gradient: "from-orange-500/10 via-amber-500/5 to-transparent",
    accentColor: "#cd7f32",
    borderColor: "rgba(205,127,50,0.25)",
    rewards: [
      {
        id: "en-meditacao",
        name: "App de Meditação",
        description: "1 mês de assinatura premium (Calm/Headspace).",
        points: 8,
        category: "bem-estar",
      },
      {
        id: "en-cafe-doce",
        name: "Café e Doce",
        description: "Voucher para um combo em cafeteria parceira.",
        points: 5,
        category: "mimo",
      },
      {
        id: "en-cinema",
        name: "Ingresso Cinema",
        description: "1 ingresso convencional para qualquer filme.",
        points: 5,
        category: "lazer",
      },
    ],
  },
];

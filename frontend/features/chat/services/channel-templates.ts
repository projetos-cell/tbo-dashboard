/**
 * #33 — Canal Templates
 * Pre-configured channel templates with default name, description, type, and settings.
 */

export interface ChannelTemplate {
  id: string;
  label: string;
  emoji: string;
  description: string;
  channelName: string;
  channelDescription: string;
  type: "channel" | "private";
  isReadOnly?: boolean;
}

export const CHANNEL_TEMPLATES: ChannelTemplate[] = [
  {
    id: "geral",
    label: "Geral",
    emoji: "💬",
    description: "Canal padrão de comunicação da equipe",
    channelName: "geral",
    channelDescription: "Canal geral da equipe. Conversas do dia a dia.",
    type: "channel",
  },
  {
    id: "anuncios",
    label: "Anúncios",
    emoji: "📢",
    description: "Comunicados oficiais — somente leitura para membros",
    channelName: "anuncios",
    channelDescription: "Comunicados e anúncios oficiais da empresa.",
    type: "channel",
    isReadOnly: true,
  },
  {
    id: "marketing",
    label: "Marketing",
    emoji: "🎯",
    description: "Campanhas, conteúdo e estratégia de marketing",
    channelName: "marketing",
    channelDescription: "Discussões de campanhas, conteúdo e estratégia.",
    type: "channel",
  },
  {
    id: "dev",
    label: "Dev & Tech",
    emoji: "💻",
    description: "Desenvolvimento, infraestrutura e tecnologia",
    channelName: "dev",
    channelDescription: "Discussões técnicas, code reviews e infra.",
    type: "private",
  },
  {
    id: "projetos",
    label: "Projetos",
    emoji: "🗂️",
    description: "Atualizações e acompanhamento de projetos",
    channelName: "projetos",
    channelDescription: "Atualizações de status, entregas e kickoffs.",
    type: "channel",
  },
  {
    id: "clientes",
    label: "Clientes",
    emoji: "🤝",
    description: "Discussões sobre contas e relacionamento com clientes",
    channelName: "clientes",
    channelDescription: "Contas ativas, feedback de clientes e reuniões.",
    type: "private",
  },
  {
    id: "financeiro",
    label: "Financeiro",
    emoji: "💰",
    description: "Finanças, faturamento e fluxo de caixa — acesso restrito",
    channelName: "financeiro",
    channelDescription: "Discussões financeiras internas.",
    type: "private",
  },
  {
    id: "cultura",
    label: "Cultura & RH",
    emoji: "🌱",
    description: "Cultura organizacional, reconhecimentos e onboarding",
    channelName: "cultura-rh",
    channelDescription: "Reconhecimentos, onboarding e clima organizacional.",
    type: "channel",
  },
  {
    id: "random",
    label: "Informal",
    emoji: "🎉",
    description: "Conversa informal, memes e off-topic",
    channelName: "random",
    channelDescription: "Off-topic, memes e conversa informal.",
    type: "channel",
  },
];

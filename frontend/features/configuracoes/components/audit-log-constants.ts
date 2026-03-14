export const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  create: {
    label: "Criação",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  update: {
    label: "Atualização",
    color:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  delete: {
    label: "Exclusão",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  login: {
    label: "Login",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  logout: {
    label: "Logout",
    color:
      "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  },
};

export const ENTITY_LABELS: Record<string, string> = {
  profiles: "Perfil",
  projects: "Projeto",
  tasks: "Tarefa",
  crm_deals: "Deal CRM",
  meetings: "Reunião",
  clients: "Cliente",
  contracts: "Contrato",
  finance_transactions: "Transação",
  okrs: "OKR",
};

export const ALL_ACTIONS = Object.keys(ACTION_LABELS);
export const ALL_ENTITIES = Object.keys(ENTITY_LABELS);

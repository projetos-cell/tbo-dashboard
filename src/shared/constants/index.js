/**
 * TBO OS — Constantes compartilhadas
 *
 * Valores usados em múltiplos domínios.
 * Não colocar lógica aqui — apenas valores constantes.
 */

const TBO_CONSTANTS = {
  // Status de projeto
  PROJECT_STATUS: {
    ACTIVE: 'active',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    ARCHIVED: 'archived'
  },

  // Status de tarefa
  TASK_STATUS: {
    TODO: 'todo',
    IN_PROGRESS: 'in_progress',
    REVIEW: 'review',
    DONE: 'done'
  },

  // Prioridades
  PRIORITY: {
    NONE: 0,
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    URGENT: 4
  },

  PRIORITY_LABELS: {
    0: 'Nenhuma',
    1: 'Baixa',
    2: 'Média',
    3: 'Alta',
    4: 'Urgente'
  },

  // Tipos financeiros
  FINANCE_TYPE: {
    INCOME: 'income',
    EXPENSE: 'expense'
  },

  // Roles (RBAC v2.5)
  ROLES: {
    FOUNDER: 'founder',
    ADMIN: 'admin',
    PROJECT_OWNER: 'project_owner',
    MANAGER: 'manager',
    SENIOR: 'senior',
    PLENO: 'pleno',
    JUNIOR: 'junior',
    ARTIST: 'artist',
    VIEWER: 'viewer',
    COMERCIAL: 'comercial',
    FINANCE: 'finance',
    HR: 'hr',
    INTERN: 'intern'
  },

  // Módulos do sistema
  MODULES: {
    DASHBOARD: 'dashboard',
    PROJECTS: 'projetos',
    TASKS: 'tarefas',
    FINANCE: 'financeiro',
    CRM: 'comercial',
    HR: 'rh',
    CHAT: 'chat',
    ADMIN: 'admin-portal',
    SETTINGS: 'configuracoes'
  },

  // Limites
  LIMITS: {
    MAX_FILE_SIZE_MB: 50,
    MAX_CHAT_MESSAGE_LENGTH: 10000,
    MAX_PROJECT_NAME_LENGTH: 200,
    MAX_TASK_TITLE_LENGTH: 500,
    PAGINATION_DEFAULT: 50,
    SEARCH_DEBOUNCE_MS: 300,
    TOAST_DURATION_MS: 4000
  }
};

if (typeof window !== 'undefined') {
  window.TBO_CONSTANTS = TBO_CONSTANTS;
}

/**
 * TBO OS — Route Registry (centralizado)
 *
 * Define TODOS os mapeamentos de rotas em um único lugar.
 * O TBO_ROUTER existente continua funcionando — este arquivo
 * é a fonte da verdade para configuração.
 */

const TBO_ROUTE_REGISTRY = (() => {
  // Mapeamento: hash route → module key
  const MODULE_ROUTES = {
    'dashboard':              'dashboard',
    'tarefas':                'tarefas',
    'financeiro':             'financeiro',
    'pagar':                  'pagar',
    'receber':                'receber',
    'margens':                'margens',
    'conciliacao':            'conciliacao',
    'conciliacao-bancaria':   'conciliacao-bancaria',
    'comercial':              'comercial',
    'pipeline':               'pipeline',
    'clientes':               'clientes',
    'contratos':              'contratos',
    'rh':                     'rh',
    'chat':                   'chat',
    'alerts':                 'alerts',
    'inbox':                  'inbox',
    'database-notion':        'database-notion',
    'conteudo':               'conteudo',
    'mercado':                'mercado',
    'reunioes':               'reunioes',
    'agenda':                 'agenda',
    'integracoes':            'integracoes',
    'configuracoes':          'configuracoes',
    'admin':                  'admin-portal',
    'admin-portal':           'admin-portal',
    'entregas':               'entregas',
    'revisoes':               'revisoes',
    // Removidos em v2.2 (módulos desativados — manter comentado para referência):
    // 'timesheets':          'timesheets',
    // 'timeline':            'timeline',
    // 'capacidade':          'capacidade',
    // 'carga-trabalho':      'carga-trabalho',
    'templates':              'templates',
    'decisoes':               'decisoes',
    'cultura':                'cultura',
    'changelog':              'changelog',
    'biblioteca':             'biblioteca',
    'inteligencia':           'inteligencia',
    'inteligencia-imobiliaria': 'inteligencia-imobiliaria',
    'portal-cliente':         'portal-cliente',
    'relatorios':             'relatorios',
    'rsm':                    'rsm',
    'permissoes-config':      'permissoes-config',
    'system-health':          'system-health'
  };

  // Aliases: rotas antigas → module key
  const ALIASES = {
    'propostas':              'comercial',
    'conteudo-redacao':       'conteudo',
    'inteligencia-mercado':   'mercado',
    'reunioes-contexto':      'reunioes',
    'equipe':                 'rh',
    'command-center':         'dashboard',
    'home':                   'dashboard',
    'workspace':              'dashboard',
    // Aliases para rotas referenciadas na sidebar que nao existiam
    'crm':                    'clientes',
    'pessoas':                'rh',
    'ia-tbo':                 'inteligencia'
  };

  // Rotas parametrizadas: prefixo → { module, permissionModule }
  const PARAM_ROUTES = {
    'people': {
      module: 'people-profile',
      permissionModule: 'rh'
    },
    'page': {
      module: 'page-editor',
      permissionModule: null  // RLS cuida do acesso — sem restrição por módulo
    },
    'notion-embed': {
      module: 'notion-embed',
      permissionModule: null  // Acesso controlado via sidebar RBAC (allowed_roles nos children)
    },
    'projeto': {
      module: 'project-detail',
      permissionModule: null  // RLS cuida do acesso
    },
  };

  // Metadados por módulo — H2: fonte da verdade (migrado de app.js _moduleLabels/_moduleIcons)
  const MODULE_META = {
    // Inicio
    'dashboard':              { label: 'Dashboard',              icon: 'layout-dashboard',   group: 'inicio',       color: '#E85102' },
    'alerts':                 { label: 'Alertas',                icon: 'alert-triangle',     group: 'inicio',       color: '#EF4444' },
    'inbox':                  { label: 'Caixa de Entrada',       icon: 'inbox',              group: 'inicio',       color: '#3B82F6' },
    'database-notion':        { label: 'Database',               icon: 'database',           group: 'execucao',     color: '#6366F1' },
    'chat':                   { label: 'Chat',                   icon: 'message-circle',     group: 'inicio',       color: '#6366F1' },
    // Execução
    'tarefas':                { label: 'Tarefas',                icon: 'list-checks',        group: 'execucao',     color: '#22C55E' },
    'reunioes':               { label: 'Calendário',             icon: 'calendar',           group: 'execucao',     color: '#0EA5E9' },
    'agenda':                 { label: 'Agenda',                 icon: 'calendar-days',      group: 'execucao',     color: '#0EA5E9' },
    'biblioteca':             { label: 'Arquivos',               icon: 'files',              group: 'execucao',     color: '#64748B' },
    // Produção
    'entregas':               { label: 'QA / Aprovações',        icon: 'check-circle-2',     group: 'producao',     color: '#10B981' },
    'revisoes':               { label: 'Revisões',               icon: 'git-pull-request',   group: 'producao',     color: '#F97316' },
    'portal-cliente':         { label: 'Portal do Cliente',      icon: 'monitor-smartphone', group: 'producao',     color: '#6366F1' },
    // Pessoas
    'rh':                     { label: 'Equipe',                 icon: 'users',              group: 'pessoas',      color: '#EC4899' },
    'admin-onboarding':       { label: 'Gestão de Onboarding',   icon: 'user-plus',          group: 'pessoas',      color: '#F43F5E' },
    'trilha-aprendizagem':    { label: 'Trilha de Aprendizagem', icon: 'graduation-cap',     group: 'pessoas',      color: '#A855F7' },
    'cultura':                { label: 'Manual de Cultura',      icon: 'book-open-text',     group: 'pessoas',      color: '#F59E0B' },
    'pessoas-avancado':       { label: 'Pessoas Avançado',       icon: 'heart-pulse',        group: 'pessoas',      color: '#EC4899' },
    // Financeiro
    'financeiro':             { label: 'Dashboard Financeiro',   icon: 'coins',              group: 'financeiro',   color: '#F59E0B' },
    'pagar':                  { label: 'Contas a Pagar',         icon: 'credit-card',        group: 'financeiro',   color: '#EF4444' },
    'receber':                { label: 'Contas a Receber',       icon: 'receipt',            group: 'financeiro',   color: '#22C55E' },
    'margens':                { label: 'DRE / Margem',           icon: 'trending-up',        group: 'financeiro',   color: '#F59E0B' },
    'conciliacao':            { label: 'Conciliação',            icon: 'scale',              group: 'financeiro',   color: '#64748B' },
    'conciliacao-bancaria':   { label: 'Conciliação Bancária',   icon: 'scale',              group: 'financeiro',   color: '#64748B' },
    // Fornecedores
    'contratos':              { label: 'Contratos',              icon: 'file-signature',     group: 'fornecedores', color: '#8B5CF6' },
    // Comercial
    'pipeline':               { label: 'Pipeline',               icon: 'filter',             group: 'comercial',    color: '#8B5CF6' },
    'comercial':              { label: 'Propostas',              icon: 'file-text',          group: 'comercial',    color: '#8B5CF6' },
    'clientes':               { label: 'Clientes / Contas',      icon: 'building-2',         group: 'comercial',    color: '#0EA5E9' },
    'inteligencia':           { label: 'Inteligência BI',        icon: 'brain',              group: 'comercial',    color: '#6366F1' },
    'inteligencia-imobiliaria': { label: 'Intel. Imobiliária',   icon: 'building',           group: 'comercial',    color: '#6366F1' },
    'mercado':                { label: 'Intel. de Mercado',      icon: 'bar-chart-3',        group: 'comercial',    color: '#64748B' },
    // Gestão
    'relatorios':             { label: 'Relatórios',             icon: 'file-bar-chart',     group: 'gestao',       color: '#8B5CF6' },
    // Desativados v2.2:
    // 'timesheets':          { label: 'Timesheets', icon: 'clock', group: 'gestao', color: '#64748B' },
    // 'timeline':            { label: 'Timeline', icon: 'gantt-chart', group: 'gestao', color: '#3B82F6' },
    // 'capacidade':          { label: 'Capacidade', icon: 'bar-chart-2', group: 'gestao', color: '#F59E0B' },
    // 'carga-trabalho':      { label: 'Carga de Trabalho', icon: 'activity', group: 'gestao', color: '#EF4444' },
    // Admin / Sistema
    'admin-portal':           { label: 'Admin Portal',           icon: 'shield',             group: 'sistema',      color: '#DC2626' },
    'permissoes-config':      { label: 'Segurança',              icon: 'lock',               group: 'sistema',      color: '#DC2626' },
    'integracoes':            { label: 'Integrações',            icon: 'plug-zap',           group: 'sistema',      color: '#64748B' },
    'configuracoes':          { label: 'Configurações',          icon: 'settings',           group: 'sistema',      color: '#64748B' },
    'changelog':              { label: 'Changelog',              icon: 'file-clock',         group: 'sistema',      color: '#64748B' },
    // Outros
    'conteudo':               { label: 'Conteúdo & Redação',     icon: 'pen-tool',           group: 'outros',       color: '#64748B' },
    'decisoes':               { label: 'Decisões',               icon: 'gavel',              group: 'outros',       color: '#64748B' },
    'templates':              { label: 'Templates',              icon: 'layout-template',    group: 'outros',       color: '#64748B' },
    // Marketing
    'rsm':                    { label: 'Social Media',            icon: 'share-2',            group: 'outros',       color: '#EC4899' },
    // Pages (editor Notion-style)
    'page-editor':            { label: 'Página',                 icon: 'file-text',          group: 'outros',       color: '#E85102' },
    // Notion Embed (inline iframe)
    'notion-embed':           { label: 'Notion',                 icon: 'layout-dashboard',   group: 'outros',       color: '#000000' },
    // System Health (production readiness)
    'system-health':          { label: 'System Health',          icon: 'heart-pulse',        group: 'sistema',      color: '#22C55E' },
    // Project Detail (parametric)
    'project-detail':         { label: 'Projeto',                icon: 'folder-open',        group: 'outros',       color: '#3B82F6' }
  };

  return {
    getModuleRoutes()  { return { ...MODULE_ROUTES }; },
    getAliases()       { return { ...ALIASES }; },
    getParamRoutes()   { return { ...PARAM_ROUTES }; },
    getModuleMeta()    { return { ...MODULE_META }; },

    /**
     * Resolve qualquer rota para module key
     * @param {string} route - Hash sem #
     * @returns {string|null} Module key
     */
    resolve(route) {
      const name = route.split('/')[0];
      return ALIASES[name] || MODULE_ROUTES[name] || null;
    },

    /**
     * Verifica se é rota parametrizada
     */
    isParamRoute(route) {
      const prefix = route.split('/')[0];
      return !!PARAM_ROUTES[prefix];
    },

    /**
     * Retorna metadata de um módulo
     */
    getMeta(moduleKey) {
      return MODULE_META[moduleKey] || null;
    },

    /**
     * Aplica registry no TBO_ROUTER existente
     */
    applyToRouter(router) {
      if (!router) return;

      // Atualizar aliases
      router._aliases = { ...ALIASES };

      // Atualizar param routes (preservando permissionModule)
      const paramRoutes = {};
      for (const [prefix, config] of Object.entries(PARAM_ROUTES)) {
        paramRoutes[prefix] = config.module;
      }
      router._paramRoutes = paramRoutes;

      // Armazenar mapa de permissionModule para uso pelo RBAC
      router._paramPermissions = {};
      for (const [prefix, config] of Object.entries(PARAM_ROUTES)) {
        if (config.permissionModule) {
          router._paramPermissions[prefix] = config.permissionModule;
        }
      }
    }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_ROUTE_REGISTRY = TBO_ROUTE_REGISTRY;
}

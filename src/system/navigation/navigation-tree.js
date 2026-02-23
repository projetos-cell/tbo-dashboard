/**
 * TBO OS — Navigation Tree (Notion-style)
 *
 * Estrutura hierárquica: Espaço → Páginas → Subpáginas
 * Usa rotas existentes do TBO_ROUTE_REGISTRY como fonte de verdade.
 * Não altera router, RBAC, repos ou bootstrap.
 */

const TBO_NAV_TREE = (() => {
  'use strict';

  /**
   * Árvore de navegação completa.
   * Cada espaço tem: id, label, icon, children[].
   * Cada página tem: id, label, icon, route (hash sem #), badge? (chave para contadores).
   * route referencia rotas existentes em TBO_ROUTE_REGISTRY.
   */
  const TREE = [
    {
      id: 'home',
      label: 'Home',
      icon: 'home',
      children: [
        { id: 'home-inicio',     label: 'Página Inicial',    icon: 'layout-dashboard',   route: 'dashboard' },
        { id: 'home-inbox',      label: 'Caixa de Entrada',  icon: 'inbox',              route: 'alerts',         badge: 'alerts' },
        { id: 'home-activity',   label: 'Atividade',         icon: 'activity',            route: null,             action: 'activity-feed' },
        { id: 'home-agenda',     label: 'Agenda',            icon: 'calendar-days',       route: 'agenda' }
      ]
    },
    {
      id: 'operacao',
      label: 'Operação',
      icon: 'play-circle',
      children: [
        { id: 'op-quadro',      label: 'Quadro Geral',      icon: 'layout-dashboard',   route: 'dashboard' },
        { id: 'op-projetos',    label: 'Projetos',           icon: 'folder-kanban',      route: 'projetos' },
        { id: 'op-quadro-projetos', label: 'Quadro de Projetos', icon: 'layout-dashboard', route: 'quadro-projetos' },
        { id: 'op-tarefas',     label: 'Tarefas',            icon: 'list-checks',        route: 'tarefas',        badge: 'tarefas' },
        { id: 'op-entregas',    label: 'Entregas',           icon: 'check-circle-2',     route: 'entregas' },
        { id: 'op-revisoes',    label: 'Revisões',           icon: 'git-pull-request',   route: 'revisoes' }
      ]
    },
    {
      id: 'organizacao',
      label: 'Organização',
      icon: 'building-2',
      children: [
        { id: 'org-equipe',      label: 'Equipe',            icon: 'users',              route: 'rh' },
        { id: 'org-clientes',    label: 'Clientes',          icon: 'building-2',         route: 'clientes' },
        { id: 'org-fornecedores',label: 'Fornecedores',      icon: 'file-signature',     route: 'contratos' },
        { id: 'org-permissoes',  label: 'Permissões',        icon: 'lock',               route: 'permissoes-config' }
      ]
    },
    {
      id: 'negocio',
      label: 'Negócio',
      icon: 'briefcase',
      children: [
        { id: 'neg-financeiro',  label: 'Financeiro',        icon: 'coins',              route: 'financeiro' },
        { id: 'neg-pagar',       label: 'Contas a Pagar',    icon: 'credit-card',        route: 'pagar' },
        { id: 'neg-receber',     label: 'Contas a Receber',  icon: 'receipt',             route: 'receber' },
        { id: 'neg-contratos',   label: 'Contratos',         icon: 'file-signature',     route: 'contratos' },
        { id: 'neg-negocios',    label: 'Pipeline',          icon: 'filter',             route: 'pipeline' },
        { id: 'neg-propostas',   label: 'Propostas',         icon: 'file-text',          route: 'comercial' }
      ]
    },
    {
      id: 'conhecimento',
      label: 'Conhecimento',
      icon: 'book-open',
      children: [
        { id: 'con-documentos',  label: 'Documentos',        icon: 'files',              route: 'biblioteca' },
        { id: 'con-templates',   label: 'Templates',         icon: 'layout-template',    route: 'templates' },
        { id: 'con-cultura',     label: 'Manual de Cultura', icon: 'book-open-text',     route: 'cultura' },
        { id: 'con-conteudo',    label: 'Conteúdo',          icon: 'pen-tool',           route: 'conteudo' }
      ]
    },
    {
      id: 'especialidades',
      label: 'Especialidades',
      icon: 'sparkles',
      children: [
        { id: 'esp-inteligencia',label: 'Inteligência BI',   icon: 'brain',              route: 'inteligencia' },
        { id: 'esp-imobiliaria', label: 'Intel. Imobiliária',icon: 'building',           route: 'inteligencia-imobiliaria' },
        { id: 'esp-mercado',     label: 'Intel. de Mercado', icon: 'bar-chart-3',        route: 'mercado' },
        { id: 'esp-comercial',   label: 'Comercial',         icon: 'trending-up',        route: 'comercial' },
        { id: 'esp-portal',      label: 'Portal do Cliente', icon: 'monitor-smartphone', route: 'portal-cliente' }
      ]
    },
    {
      id: 'sistema',
      label: 'Sistema',
      icon: 'settings',
      children: [
        { id: 'sys-admin',       label: 'Admin Portal',      icon: 'shield',             route: 'admin' },
        { id: 'sys-permissoes',  label: 'Segurança',         icon: 'lock',               route: 'permissoes-config' },
        { id: 'sys-auditoria',   label: 'Auditoria',         icon: 'scroll-text',        route: 'admin' },
        { id: 'sys-integracoes', label: 'Integrações',       icon: 'plug-zap',           route: 'integracoes' },
        { id: 'sys-config',      label: 'Configurações',     icon: 'settings',           route: 'configuracoes' },
        { id: 'sys-changelog',   label: 'Changelog',         icon: 'file-clock',         route: 'changelog' }
      ]
    }
  ];

  return {
    /**
     * Retorna a árvore completa de navegação
     * @returns {Array}
     */
    getTree() {
      return TREE;
    },

    /**
     * Retorna um espaço pelo id
     * @param {string} spaceId
     * @returns {object|null}
     */
    getSpace(spaceId) {
      return TREE.find(s => s.id === spaceId) || null;
    },

    /**
     * Encontra a página/item que corresponde a uma rota
     * @param {string} route - Hash sem #
     * @returns {{ space: object, page: object }|null}
     */
    findByRoute(route) {
      const name = route.split('/')[0];
      for (const space of TREE) {
        for (const page of space.children) {
          if (page.route === name) {
            return { space, page };
          }
        }
      }
      return null;
    },

    /**
     * Retorna todas as rotas definidas na árvore
     * @returns {string[]}
     */
    getAllRoutes() {
      const routes = [];
      for (const space of TREE) {
        for (const page of space.children) {
          if (page.route) routes.push(page.route);
        }
      }
      return [...new Set(routes)];
    },

    /**
     * Retorna IDs de todos os espaços
     * @returns {string[]}
     */
    getSpaceIds() {
      return TREE.map(s => s.id);
    }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_NAV_TREE = TBO_NAV_TREE;
}

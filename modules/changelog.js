// TBO OS — Module: Changelog
// Displays version history with features, fixes, and improvements

const TBO_CHANGELOG = {
  _versions: [
    {
      version: '2.1.0',
      date: '2026-02-19',
      title: 'Integracoes v2 — Omie, Calendar, RD Unilateral',
      type: 'major',
      changes: [
        { type: 'feature', text: 'Integracao Omie ERP: conector REST para contas a pagar/receber, clientes, categorias (sync Omie → TBO)' },
        { type: 'feature', text: 'Integracao Google Calendar: sincronizacao de eventos via Google OAuth (somente leitura)' },
        { type: 'feature', text: 'Proxy Vercel para Omie API (/api/omie-proxy) — evita CORS' },
        { type: 'feature', text: 'Tela de configuracao completa para Omie (App Key/Secret, teste, sync manual)' },
        { type: 'feature', text: 'Tela de configuracao para Google Calendar (sync, teste, auto-sync)' },
        { type: 'feature', text: 'Cards de status para Omie e Google Calendar no modulo Integracoes' },
        { type: 'improvement', text: 'RD Station convertido para sync unilateral (RD → TBO) — RD e fonte unica de verdade' },
        { type: 'improvement', text: 'Push de deals para RD Station desativado (nenhum dado e enviado ao CRM)' },
        { type: 'improvement', text: 'Pipeline de loadAll() agora inclui Omie (etapa 8) e Google Calendar (etapa 9)' },
        { type: 'improvement', text: 'Fireflies.ai verificado e confirmado funcional (sem alteracoes necessarias)' }
      ]
    },
    {
      version: '2.0.0',
      date: '2026-02-19',
      title: 'TBO OS v2 — Multi-tenant',
      type: 'major',
      changes: [
        { type: 'feature', text: 'Arquitetura multi-empresa: suporte a TBO e TBO Academy (e N empresas futuras)' },
        { type: 'feature', text: 'Workspace Selector: tela de selecao de empresa ao entrar no sistema' },
        { type: 'feature', text: 'RBAC no Supabase: roles e permissoes por modulo armazenados no banco (nao mais hardcoded)' },
        { type: 'feature', text: 'Magic Link: login sem senha via e-mail (Supabase OTP)' },
        { type: 'feature', text: 'Changelog retroativo: historico completo de versoes persistido no Supabase' },
        { type: 'feature', text: 'Migration SQL v3: tabelas tenants, roles, role_permissions, tenant_members, integration_configs, sync_logs, culture_pages, collaborator_history, changelog_entries' },
        { type: 'fix', text: 'Flash do login ao recarregar pagina: unificado controle do overlay em metodo centralizado' },
        { type: 'fix', text: 'First page sempre e o Dashboard: rota padrao forcada para #command-center' },
        { type: 'fix', text: 'Removido botao "+" duplicado na tela de tarefas (mantido apenas FAB global)' },
        { type: 'fix', text: 'Removido filtro de periodo no dashboard' },
        { type: 'improvement', text: 'Preparacao para integracoes Omie, Google Calendar e conciliacao bancaria' }
      ]
    },
    {
      version: '1.9.0',
      date: '2026-02-17',
      title: 'Modulos Financeiros',
      type: 'major',
      changes: [
        { type: 'feature', text: 'Modulo Contas a Pagar: fluxo mensal de despesas, categorias, folha de pagamento e custos por projeto' },
        { type: 'feature', text: 'Modulo Contas a Receber: receita mensal, aging de recebiveis, receita por projeto e deals fechados' },
        { type: 'feature', text: 'Modulo Margens: margem por projeto e BU, analise de risco de concentracao de clientes' },
        { type: 'feature', text: 'Modulo Conciliacao: fluxo mensal realizado vs projetado, acumulado e variancia orcamentaria' },
        { type: 'improvement', text: '4 rotas placeholder financeiras convertidas em modulos completos' },
        { type: 'improvement', text: 'Placeholders restantes reduzidos de 10 para 6' }
      ]
    },
    {
      version: '1.8.0',
      date: '2026-02-17',
      title: 'Modulos Operacionais',
      type: 'major',
      changes: [
        { type: 'feature', text: 'Modulo Tarefas Globais: visao cross-projeto com board Kanban, filtros, criacao e transicoes de status' },
        { type: 'feature', text: 'Modulo Entregas: gestao global de entregaveis com pipeline de status e versionamento' },
        { type: 'feature', text: 'Modulo Revisoes: fila de revisao com alertas de entregaveis atrasados (>3 dias) e workflow de aprovacao' },
        { type: 'feature', text: 'Modulo Decisoes: registro de decisoes de reunioes com criacao de tarefas vinculadas' },
        { type: 'feature', text: 'Modulo Timesheets: lancamento de horas semanal com timer, entradas manuais e navegacao por semana' },
        { type: 'feature', text: 'Modulo Carga de Trabalho: utilizacao do time, forecast de 8 semanas e alertas de sobre-alocacao' },
        { type: 'improvement', text: '6 rotas placeholder convertidas em modulos operacionais completos' },
        { type: 'improvement', text: 'Placeholders restantes reduzidos de 16 para 10' }
      ]
    },
    {
      version: '1.7.0',
      date: '2026-02-17',
      title: 'Fundacao & Resiliencia',
      type: 'major',
      changes: [
        { type: 'feature', text: 'Autenticacao segura com hash de senhas (SHA-256) e session tokens com expiracao de 8h' },
        { type: 'feature', text: 'Sistema de backup automatico com rotacao de 7 dias, export/import JSON' },
        { type: 'feature', text: 'Error handling global com captura de erros nao tratados e log persistente' },
        { type: 'feature', text: 'Modulo de Changelog com historico de versoes e badge de novidades' },
        { type: 'feature', text: 'Audit Log UI no modulo Configuracoes com filtros e visualizacao' },
        { type: 'improvement', text: 'Senhas nao sao mais armazenadas em texto puro no codigo' },
        { type: 'improvement', text: 'Sessao expira automaticamente e redireciona para login' },
        { type: 'improvement', text: 'Painel de status do storage com uso de espaco e backups' }
      ]
    },
    {
      version: '1.6.0',
      date: '2026-02-10',
      title: 'ERP & Workload Engine',
      type: 'major',
      changes: [
        { type: 'feature', text: 'State machines completas para projetos, propostas, entregaveis, tarefas e reunioes' },
        { type: 'feature', text: 'Timer global com tracking de horas por projeto e tarefa' },
        { type: 'feature', text: 'Timesheet semanal com grid projeto x dia e alertas de dias sem apontamento' },
        { type: 'feature', text: 'Capacidade do time com utilizacao, forecast de 8 semanas e custo por projeto' },
        { type: 'feature', text: 'Gantt chart com 4 escalas (dia/semana/mes/quarter) e dependencias' },
        { type: 'feature', text: 'Playbooks para 4 tipos de projeto (3D, Branding, Marketing, Lancamento)' },
        { type: 'feature', text: 'Health score automatico (0-100) baseado em 8 criterios' },
        { type: 'feature', text: 'Alertas inteligentes com 8 tipos de deteccao automatica' }
      ]
    },
    {
      version: '1.5.0',
      date: '2026-01-28',
      title: 'Modulo de Pessoas (RH)',
      type: 'major',
      changes: [
        { type: 'feature', text: 'Modulo RH com 20 colaboradores e estrutura organizacional completa' },
        { type: 'feature', text: 'Avaliacoes de desempenho semestrais com 10 competencias' },
        { type: 'feature', text: 'Radar de 6 competencias com visualizacao grafica' },
        { type: 'feature', text: '9-Box grid de potencial vs desempenho' },
        { type: 'feature', text: 'Sistema de feedbacks e elogios entre pares' },
        { type: 'feature', text: 'Registro de 1:1s com historico e action items' }
      ]
    },
    {
      version: '1.4.0',
      date: '2026-01-15',
      title: 'Pipeline & Comercial',
      type: 'major',
      changes: [
        { type: 'feature', text: 'Pipeline CRM com drag-and-drop e 5 estagios' },
        { type: 'feature', text: 'Gerador de propostas com IA (Claude/OpenAI)' },
        { type: 'feature', text: 'Framework Sexy Canvas para prospeccao estrategica' },
        { type: 'feature', text: 'Importacao CSV com mapeamento de campos e deduplicacao' },
        { type: 'feature', text: 'Cases de sucesso por projeto com geracao IA' },
        { type: 'improvement', text: 'Deal aging com badges visuais (7d warning, 14d critical)' }
      ]
    },
    {
      version: '1.3.0',
      date: '2025-12-20',
      title: 'Inteligencia & Mercado',
      type: 'major',
      changes: [
        { type: 'feature', text: 'Business Intelligence com 20+ metricas automaticas (LTV, CAC, churn, pipeline velocity)' },
        { type: 'feature', text: 'Modulo de Mercado com indicadores Curitiba e analise de concorrencia' },
        { type: 'feature', text: 'Gerador de conteudo IA para 5 canais (LinkedIn, Instagram, Email, Institucional, Academy)' },
        { type: 'feature', text: 'Reunioes com integracao Fireflies — action items e decisoes' }
      ]
    },
    {
      version: '1.2.0',
      date: '2025-12-01',
      title: 'Dashboard & Navegacao',
      type: 'major',
      changes: [
        { type: 'feature', text: 'Command Center com 4 variantes por role (founders, POs, artistas, financeiro)' },
        { type: 'feature', text: 'Busca global com Cmd+K e filtros por categoria' },
        { type: 'feature', text: 'RBAC com 4 roles e controle de acesso por modulo' },
        { type: 'feature', text: 'Dark/Light theme com deteccao automatica do sistema' },
        { type: 'feature', text: 'Tour guiado para novos usuarios' }
      ]
    },
    {
      version: '1.1.0',
      date: '2025-11-15',
      title: 'Financeiro & Contratos',
      type: 'major',
      changes: [
        { type: 'feature', text: 'Dashboard financeiro com fluxo de caixa 2026 (receita, despesa, resultado)' },
        { type: 'feature', text: 'Break-even analysis com meta mensal e attainment' },
        { type: 'feature', text: 'Simulador de cenarios financeiros com IA' },
        { type: 'feature', text: 'Gestao de 82 contratos reais com filtros e detail view' },
        { type: 'feature', text: 'Base de clientes editavel com CRUD completo' }
      ]
    },
    {
      version: '1.0.0',
      date: '2025-10-01',
      title: 'Lancamento',
      type: 'major',
      changes: [
        { type: 'feature', text: 'TBO OS — primeira versao do sistema operacional interno' },
        { type: 'feature', text: 'Login com selecao de usuario e senha' },
        { type: 'feature', text: 'Sidebar de navegacao com modulos por dominio' },
        { type: 'feature', text: 'Integracao com Claude API e OpenAI para geracao de conteudo' }
      ]
    }
  ],

  // Track which version user has seen
  _seenKey: 'tbo_changelog_seen',

  hasNewChanges() {
    const seen = localStorage.getItem(this._seenKey);
    if (!seen) return true;
    const latest = this._versions[0]?.version;
    return seen !== latest;
  },

  markAsSeen() {
    const latest = this._versions[0]?.version;
    if (latest) localStorage.setItem(this._seenKey, latest);
  },

  render() {
    this.markAsSeen();

    const typeIcons = {
      feature: '<span style="color:#22c55e;">+</span>',
      improvement: '<span style="color:#3b82f6;">~</span>',
      fix: '<span style="color:#ef4444;">!</span>'
    };

    const typeLabels = {
      feature: 'Novo',
      improvement: 'Melhoria',
      fix: 'Correcao'
    };

    const typeBadgeClass = {
      feature: 'gold',
      improvement: '',
      fix: ''
    };

    return `
      <div class="changelog-module">
        <!-- Banner v2 -->
        <div style="background:linear-gradient(135deg, #E85102 0%, #ff7b3a 100%);color:#fff;padding:16px 24px;border-radius:var(--radius-lg, 12px);margin-bottom:24px;display:flex;align-items:center;gap:16px;">
          <i data-lucide="rocket" style="width:28px;height:28px;flex-shrink:0;"></i>
          <div>
            <div style="font-family:var(--font-display);font-size:1.1rem;font-weight:700;">Voce esta na v2.1</div>
            <div style="font-size:0.82rem;opacity:0.9;">Integracoes v2: Omie ERP, Google Calendar, RD Station unilateral e Fireflies verificado.</div>
          </div>
        </div>

        <div class="module-header" style="margin-bottom:24px;">
          <div>
            <h2 class="module-title" style="margin:0;">Changelog</h2>
            <p style="color:var(--text-tertiary);font-size:0.82rem;margin-top:4px;">Historico de versoes e atualizacoes do TBO OS</p>
          </div>
          <div style="display:flex;gap:8px;">
            <span class="tag gold">${this._versions.length} versoes</span>
            <span class="tag">v${this._versions[0]?.version || '?'} atual</span>
          </div>
        </div>

        <div class="changelog-timeline">
          ${this._versions.map((v, idx) => `
            <div class="card changelog-entry ${idx === 0 ? 'changelog-entry--latest' : ''}" style="margin-bottom:16px;">
              <div class="card-header" style="align-items:flex-start;">
                <div>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <h3 style="margin:0;font-size:1rem;">v${v.version}</h3>
                    <span class="tag ${idx === 0 ? 'gold' : ''}" style="font-size:0.68rem;">${v.title}</span>
                    ${idx === 0 ? '<span class="tag gold" style="font-size:0.65rem;">ATUAL</span>' : ''}
                  </div>
                  <div style="font-size:0.75rem;color:var(--text-tertiary);margin-top:4px;">
                    ${new Date(v.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <div style="padding:0 4px;">
                ${v.changes.map(c => `
                  <div style="display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px solid var(--border-subtle);font-size:0.82rem;">
                    <span style="font-size:0.7rem;min-width:58px;" class="tag ${typeBadgeClass[c.type] || ''}">${typeLabels[c.type] || c.type}</span>
                    <span style="color:var(--text-secondary);line-height:1.4;">${c.text}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  init() {
    // No event bindings needed for changelog
  }
};

// TBO OS — Module: Comercial & Propostas + Pipeline CRM
const TBO_COMERCIAL = {
  // Active filters state
  _filters: { owner: '', service: '', search: '' },

  // BU list constant
  _BUS: ['Digital 3D','Audiovisual','Branding','Marketing','Interiores','Gamificacao'],

  // Team members for owner select
  _getTeamMembers() {
    if (typeof TBO_RH !== 'undefined' && TBO_RH._team) {
      return TBO_RH._team.filter(m => m.status !== 'saindo').map(m => m.nome);
    }
    return ['Marco','Ruy','Nathalia','Nelson','Danniel','Felipe','Lucas F.','Carol'];
  },

  render() {
    const context = TBO_STORAGE.get('context');
    const clients = typeof TBO_SEARCH !== 'undefined' ? TBO_SEARCH.getClientList() : [];
    const projects = typeof TBO_SEARCH !== 'undefined' ? TBO_SEARCH.getProjectList() : [];

    // Init CRM defaults + auto-seed
    TBO_STORAGE.initCrmDefaults();
    this._autoSeedPipeline(context);

    // Dynamic KPI data
    const crm = TBO_STORAGE.getCrmData();
    const deals = TBO_STORAGE.getCrmDeals();
    const stages = (crm.stages || []).sort((a, b) => a.order - b.order);
    const dc26 = context.dados_comerciais?.['2026'] || {};
    const fc = dc26.fluxo_caixa || {};

    // Compute live KPIs
    const activeDeals = deals.filter(d => !['fechado_ganho','fechado_perdido'].includes(d.stage));
    const pipelineTotal = activeDeals.reduce((s, d) => s + (d.value || 0), 0);
    const metaMensal = fc.meta_vendas_mensal || 180000;
    const forecast = activeDeals.reduce((s, d) => s + ((d.value || 0) * (d.probability || 0) / 100), 0);
    const wonDeals = deals.filter(d => d.stage === 'fechado_ganho');
    const lostDeals = deals.filter(d => d.stage === 'fechado_perdido');
    const totalClosed = wonDeals.length + lostDeals.length;
    const convRate = totalClosed > 0 ? ((wonDeals.length / totalClosed) * 100).toFixed(1) + '%' : '\u2014';

    return `
      <div class="comercial-module">
        <!-- Dynamic KPIs -->
        <section class="section">
          <div class="grid-4">
            <div class="kpi-card">
              <div class="kpi-label">Pipeline Ativo</div>
              <div class="kpi-value">${TBO_FORMATTER.currency(pipelineTotal)}</div>
              <div class="kpi-change">${activeDeals.length} deals abertos</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Meta Mensal 2026</div>
              <div class="kpi-value">${TBO_FORMATTER.currency(metaMensal)}</div>
              <div class="kpi-change">alvo p/ fechar/m\u00eas</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Forecast Ponderado</div>
              <div class="kpi-value">${TBO_FORMATTER.currency(forecast)}</div>
              <div class="kpi-change">${forecast >= metaMensal ? '<span class="positive">acima da meta</span>' : '<span class="negative">abaixo da meta</span>'}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Conversao</div>
              <div class="kpi-value">${convRate}</div>
              <div class="kpi-change">${totalClosed} encerrados</div>
            </div>
          </div>
        </section>

        <!-- Mini-Funnel -->
        ${this._renderMiniFunnel(deals, stages)}

        <!-- Tabs -->
        <div class="tabs">
          <button class="tab active" data-tab="cm-pipeline">Pipeline CRM</button>
          <button class="tab" data-tab="cm-propostas">Propostas</button>
          <button class="tab" data-tab="cm-proposta">Gerador de Proposta</button>
          <button class="tab" data-tab="cm-prospecao">Prospecao (Sexy Canvas)</button>
          <button class="tab" data-tab="cm-cases">Cases de Sucesso</button>
          <button class="tab" data-tab="cm-calculator">Calculadora</button>
        </div>

        <!-- Pipeline CRM Tab -->
        <div class="tab-panel" id="tab-cm-pipeline">
          ${this._renderPipelineTab()}
        </div>

        <!-- Propostas ERP Tab -->
        <div class="tab-panel" id="tab-cm-propostas" style="display:none;">
          ${this._renderPropostasTab()}
        </div>

        <!-- Proposta Generator -->
        <div class="tab-panel" id="tab-cm-proposta" style="display:none;">
          <div class="grid-2" style="gap:24px;">
            <div class="card">
              <div class="card-header"><h3 class="card-title">Gerar Proposta Comercial</h3></div>
              <div class="form-group">
                <label class="form-label">Cliente / Construtora</label>
                <input type="text" class="form-input" id="cmCliente" placeholder="Nome da construtora" list="cmClienteList">
                <datalist id="cmClienteList">
                  ${clients.map(c => `<option value="${c.value}">`).join('')}
                </datalist>
              </div>
              <div class="form-group">
                <label class="form-label">Nome do Empreendimento</label>
                <input type="text" class="form-input" id="cmEmpreendimento" placeholder="Nome do projeto">
              </div>
              <div class="form-group">
                <label class="form-label">Servicos Solicitados</label>
                <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:4px;">
                  ${this._BUS.map(bu => `
                    <label style="display:flex; align-items:center; gap:4px; font-size:0.8rem; cursor:pointer;">
                      <input type="checkbox" class="cm-bu-check" value="${bu}"> ${bu}
                    </label>
                  `).join('')}
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Contexto / Briefing</label>
                <textarea class="form-input" id="cmBriefing" rows="4" placeholder="Descreva o projeto, necessidades especificas, orcamento mencionado..."></textarea>
              </div>
              <button class="btn btn-primary" id="cmGerarProposta" style="width:100%;">Gerar Proposta</button>
            </div>
            <div>
              <div id="cmPropostaOutput" class="ai-response" style="min-height:300px;">
                <div class="empty-state">
                  <div class="empty-state-icon">\u{1F4BC}</div>
                  <div class="empty-state-text">Preencha os dados e gere a proposta</div>
                </div>
              </div>
              <div class="gen-actions" style="margin-top:8px;">
                <button class="btn btn-sm btn-secondary" onclick="navigator.clipboard.writeText(document.getElementById('cmPropostaOutput').textContent); TBO_TOAST.success('Copiado!');">Copiar</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Prospecao Sexy Canvas -->
        <div class="tab-panel" id="tab-cm-prospecao" style="display:none;">
          <div class="card" style="margin-bottom:16px;">
            <div class="card-header"><h3 class="card-title">Prospecao com Sexy Canvas</h3></div>
            <p style="color:var(--text-secondary); font-size:0.82rem; margin-bottom:16px;">
              Use o framework Sexy Canvas para montar uma abordagem de prospecao personalizada.
            </p>
            <div class="form-group">
              <label class="form-label">Construtora / Incorporadora alvo</label>
              <input type="text" class="form-input" id="cmProspAlvo" placeholder="Nome da empresa">
            </div>
            <div class="form-group">
              <label class="form-label">O que sabemos sobre esta empresa?</label>
              <textarea class="form-input" id="cmProspInfo" rows="3" placeholder="Projetos conhecidos, contatos, historico..."></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Blocos do Sexy Canvas a enfatizar</label>
              <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:4px;">
                ${['Luxuria','Gula','Ganancia','Vaidade','Inveja','Preguica','Ira','Diversao','Pertencimento','Liberdade'].map(b => `
                  <label style="display:flex; align-items:center; gap:4px; font-size:0.78rem; cursor:pointer;">
                    <input type="checkbox" class="cm-canvas-check" value="${b}"> ${b}
                  </label>
                `).join('')}
              </div>
            </div>
            <button class="btn btn-primary" id="cmGerarProspecao" style="width:100%;">Montar Abordagem</button>
          </div>
          <div id="cmProspecaoOutput" class="ai-response" style="min-height:200px;">
            <div class="empty-state"><div class="empty-state-text">Resultado aparecera aqui</div></div>
          </div>
        </div>

        <!-- Cases -->
        <div class="tab-panel" id="tab-cm-cases" style="display:none;">
          <div class="card">
            <div class="card-header"><h3 class="card-title">Gerador de Cases de Sucesso</h3></div>
            <div class="form-group">
              <label class="form-label">Projeto</label>
              <select class="form-input" id="cmCaseProjeto">
                <option value="">Selecione um projeto</option>
                ${projects.map(p => `<option value="${p.value}">${p.label}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Formato</label>
              <select class="form-input" id="cmCaseFormato">
                <option value="resumo">Resumo executivo (1 pagina)</option>
                <option value="detalhado">Case detalhado</option>
                <option value="apresentacao">Slides de apresentacao</option>
              </select>
            </div>
            <button class="btn btn-primary" id="cmGerarCase" style="width:100%;">Gerar Case</button>
          </div>
          <div id="cmCaseOutput" class="ai-response" style="min-height:200px; margin-top:16px;">
            <div class="empty-state"><div class="empty-state-text">Resultado aparecera aqui</div></div>
          </div>
        </div>

        <!-- Calculator -->
        <div class="tab-panel" id="tab-cm-calculator" style="display:none;">
          <div class="card">
            <div class="card-header"><h3 class="card-title">Calculadora de Precificacao</h3></div>
            <p style="color:var(--text-secondary); font-size:0.82rem; margin-bottom:16px;">
              Estime o valor da proposta baseado em historico de precos e escopo.
            </p>
            <div class="form-group">
              <label class="form-label">Descreva o escopo</label>
              <textarea class="form-input" id="cmCalcEscopo" rows="4" placeholder="Ex: 20 imagens externas, 10 internas, 1 filme 60s, branding completo..."></textarea>
            </div>
            <button class="btn btn-primary" id="cmGerarCalc" style="width:100%;">Calcular Estimativa</button>
          </div>
          <div id="cmCalcOutput" class="ai-response" style="min-height:200px; margin-top:16px;">
            <div class="empty-state"><div class="empty-state-text">Resultado aparecera aqui</div></div>
          </div>
        </div>
      </div>
    `;
  },

  // ===========================================================================
  // Pipeline CRM — Rendering
  // ===========================================================================

  _renderPipelineTab() {
    const crm = TBO_STORAGE.getCrmData();
    const deals = TBO_STORAGE.getCrmDeals();
    const stages = (crm.stages || []).sort((a, b) => a.order - b.order);
    const rdConnected = !!crm.config?.rdToken;

    return `
      <!-- RD Status Banner -->
      <div class="crm-status-banner" style="display:flex; align-items:center; justify-content:space-between; padding:10px 16px; border-radius:8px; background:var(--bg-tertiary); margin-bottom:16px; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="status-dot" style="background:${rdConnected ? '#22c55e' : '#ef4444'};"></span>
          <span style="font-size:0.82rem; color:var(--text-secondary);">RD Station: ${rdConnected ? 'Conectado' : 'Desconectado (modo local)'}</span>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button class="btn btn-sm btn-secondary" id="cmCrmImport">Importar CSV</button>
          <button class="btn btn-sm btn-secondary" id="cmCrmExport">Exportar</button>
          <button class="btn btn-sm btn-secondary" id="cmCrmStageConfig" title="Configurar etapas">Etapas</button>
        </div>
      </div>

      <!-- Pipeline KPIs -->
      <div id="cmPipelineKpis">${this._renderPipelineKPIs(deals, stages)}</div>

      <!-- Filters -->
      <div style="display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap; align-items:center;">
        <select class="form-input" id="cmFilterOwner" style="width:auto; min-width:140px; font-size:0.82rem;">
          <option value="">Todos responsaveis</option>
          ${this._getTeamMembers().map(m => `<option value="${m}">${m}</option>`).join('')}
        </select>
        <select class="form-input" id="cmFilterService" style="width:auto; min-width:130px; font-size:0.82rem;">
          <option value="">Todos servicos</option>
          ${this._BUS.map(b => `<option value="${b}">${b}</option>`).join('')}
        </select>
        <input type="text" class="form-input" id="cmFilterSearch" placeholder="Buscar deal..." style="width:auto; min-width:180px; font-size:0.82rem;">
        <div style="flex:1;"></div>
        <button class="btn btn-sm btn-primary" id="cmNewDeal">+ Novo Deal</button>
      </div>

      <!-- Kanban Board -->
      <div class="pipeline-board" id="cmKanbanBoard">
        ${this._renderKanban(deals, stages)}
      </div>
    `;
  },

  _renderPipelineKPIs(deals, stages) {
    const activeStages = (stages || []).filter(s => s.id !== 'fechado_perdido');
    const activeDeals = deals.filter(d => d.stage !== 'fechado_perdido');
    const wonDeals = deals.filter(d => d.stage === 'fechado_ganho');
    const lostDeals = deals.filter(d => d.stage === 'fechado_perdido');
    const totalPipeline = activeDeals.reduce((s, d) => s + (d.value || 0), 0);
    const wonTotal = wonDeals.reduce((s, d) => s + (d.value || 0), 0);
    const totalClosed = wonDeals.length + lostDeals.length;
    const convRate = totalClosed > 0 ? ((wonDeals.length / totalClosed) * 100).toFixed(1) : '\u2014';
    const forecast = activeDeals.reduce((s, d) => s + ((d.value || 0) * (d.probability || 0) / 100), 0);

    return `
      <div class="grid-4" style="margin-bottom:16px;">
        <div class="kpi-card">
          <div class="kpi-label">Pipeline Ativo</div>
          <div class="kpi-value">${TBO_FORMATTER.currency(totalPipeline)}</div>
          <div class="kpi-change">${activeDeals.length} deals</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Ganhos</div>
          <div class="kpi-value">${TBO_FORMATTER.currency(wonTotal)}</div>
          <div class="kpi-change positive">${wonDeals.length} fechados</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Taxa Conversao</div>
          <div class="kpi-value">${convRate}${convRate !== '\u2014' ? '%' : ''}</div>
          <div class="kpi-change">${totalClosed} encerrados</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Forecast</div>
          <div class="kpi-value">${TBO_FORMATTER.currency(forecast)}</div>
          <div class="kpi-change">ponderado por prob.</div>
        </div>
      </div>
    `;
  },

  _renderKanban(deals, stages) {
    const filtered = this._applyDealFilters(deals);
    return stages.map(stage => {
      const stageDeals = filtered.filter(d => d.stage === stage.id);
      const stageTotal = stageDeals.reduce((s, d) => s + (d.value || 0), 0);
      return `
        <div class="pipeline-column" data-stage="${stage.id}" style="border-top: 3px solid ${stage.color};">
          <div class="pipeline-column-header">
            <span class="pipeline-column-title">${stage.label}</span>
            <span class="pipeline-column-count">${stageDeals.length} &middot; ${TBO_FORMATTER.currency(stageTotal)}</span>
          </div>
          <div class="pipeline-column-body" data-stage="${stage.id}">
            ${stageDeals.map(d => this._renderDealCard(d)).join('')}
            ${stageDeals.length === 0 ? '<div class="pipeline-empty" style="padding:24px 8px; text-align:center; color:var(--text-muted); font-size:0.78rem;">Arraste deals aqui</div>' : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  _renderDealCard(deal) {
    const ownerInitials = TBO_FORMATTER.initials(deal.owner);
    const servicesTags = (deal.services || []).map(s =>
      `<span class="deal-service-tag">${s}</span>`
    ).join('');
    const updatedRel = TBO_FORMATTER.relativeTime(deal.updatedAt);
    const agingClass = this._getDealAgingClass(deal);
    const ageDays = this._getDealAgeDays(deal);
    const agingBadge = agingClass === 'deal-aging-critical'
      ? `<span class="deal-aging-badge critical" title="Parado ha ${ageDays} dias">${ageDays}d</span>`
      : agingClass === 'deal-aging-warning'
        ? `<span class="deal-aging-badge warning" title="Parado ha ${ageDays} dias">${ageDays}d</span>`
        : '';

    return `
      <div class="pipeline-deal ${agingClass}" draggable="true" data-deal-id="${deal.id}" title="${deal.name}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:4px;">
          <div class="pipeline-deal-name">${deal.riskFlag ? '<span style="color:#ef4444;" title="Risco">\u{1F534}</span> ' : ''}${TBO_FORMATTER.truncate(deal.name, 30)}</div>
          <div style="display:flex; align-items:center; gap:4px;">
            ${agingBadge}
            <div class="deal-owner-badge" title="${deal.owner || 'Sem responsavel'}">${ownerInitials}</div>
          </div>
        </div>
        <div class="pipeline-deal-company">${deal.company || '\u2014'}</div>
        <div class="pipeline-deal-value">${TBO_FORMATTER.currency(deal.value)}${deal.probability ? ' &middot; ' + deal.probability + '%' : ''}</div>
        ${servicesTags ? `<div class="deal-services-tags">${servicesTags}</div>` : ''}
        <div style="font-size:0.7rem; color:var(--text-muted); margin-top:4px;">${updatedRel}</div>
      </div>
    `;
  },

  _applyDealFilters(deals) {
    let result = deals;
    const f = this._filters;
    if (f.owner) result = result.filter(d => d.owner === f.owner);
    if (f.service) result = result.filter(d => (d.services || []).includes(f.service));
    if (f.search) {
      const q = f.search.toLowerCase();
      result = result.filter(d =>
        (d.name || '').toLowerCase().includes(q) ||
        (d.company || '').toLowerCase().includes(q) ||
        (d.contact || '').toLowerCase().includes(q)
      );
    }
    return result;
  },

  // ===========================================================================
  // Mini-Funnel Visualization
  // ===========================================================================

  _renderMiniFunnel(deals, stages) {
    // Only show funnel for active stages (not fechado_perdido)
    const funnelStages = stages.filter(s => s.id !== 'fechado_perdido');
    if (funnelStages.length === 0) return '';

    const maxVal = Math.max(...funnelStages.map(s => {
      const total = deals.filter(d => d.stage === s.id).reduce((sum, d) => sum + (d.value || 0), 0);
      return total;
    }), 1);

    return `
      <div class="cm-funnel" style="display:flex; align-items:flex-end; gap:2px; margin-bottom:16px; padding:12px 16px; background:var(--bg-tertiary); border-radius:8px;">
        ${funnelStages.map(s => {
          const stageDeals = deals.filter(d => d.stage === s.id);
          const total = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
          const pct = maxVal > 0 ? Math.max((total / maxVal) * 100, 8) : 8;
          const count = stageDeals.length;
          return `
            <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;">
              <span style="font-size:0.65rem; color:var(--text-muted);">${TBO_FORMATTER.currency(total)}</span>
              <div style="width:100%; height:${pct * 0.6}px; min-height:6px; max-height:60px; background:${s.color}; border-radius:3px; opacity:0.85; transition: height 0.3s;"></div>
              <span style="font-size:0.68rem; font-weight:600; color:var(--text-secondary);">${count}</span>
              <span style="font-size:0.6rem; color:var(--text-muted); text-align:center; line-height:1.1;">${s.label}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  // ===========================================================================
  // Auto-Seed Pipeline from Context Data
  // ===========================================================================

  _autoSeedPipeline(context) {
    const crm = TBO_STORAGE.getCrmData();
    // Only seed once — check if we already seeded
    if (crm._seeded) return;

    const ativos = context.projetos_ativos || [];
    const orcamentos = context.orcamentos_enviados_construtoras || [];

    if (ativos.length === 0 && orcamentos.length === 0) return;

    let added = 0;

    // Seed active projects as deals in "proposta" or "negociacao" stage
    ativos.forEach(p => {
      const name = p.nome || '';
      const company = p.construtora || '';
      if (!name || !company) return;
      // Skip TBO internal projects
      if (company === 'TBO') return;

      // Check if already exists
      const exists = Object.values(crm.deals).some(d =>
        d.company.toLowerCase() === company.toLowerCase() &&
        d.name.toLowerCase().includes(name.split('_').pop().toLowerCase())
      );
      if (exists) return;

      const bus = p.bus || [];
      // Estimate value based on BU count
      const estimatedValue = bus.length * 25000;

      const id = 'd_seed_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4);
      const now = new Date().toISOString();
      crm.deals[id] = {
        id,
        name: name.replace(/_/g, ' '),
        company,
        contact: '',
        contactEmail: '',
        stage: 'negociacao', // active projects are in negotiation or beyond
        value: estimatedValue,
        probability: 70,
        services: bus,
        owner: 'Ruy',
        notes: `Auto-importado de projetos ativos. BUs: ${bus.join(', ')}`,
        source: 'auto_seed',
        rdDealId: null,
        margin: null,
        cost: null,
        riskFlag: false,
        priority: 'media',
        createdAt: now,
        updatedAt: now,
        expectedClose: '',
        activities: []
      };
      added++;
    });

    // Seed orcamentos as leads (construtoras that got proposals but aren't active projects)
    const activeCompanies = ativos.map(p => (p.construtora || '').toUpperCase());
    orcamentos.forEach(company => {
      // Skip if already an active project
      if (activeCompanies.includes(company.toUpperCase())) return;

      // Check if already exists
      const exists = Object.values(crm.deals).some(d =>
        d.company.toLowerCase() === company.toLowerCase()
      );
      if (exists) return;

      const id = 'd_seed_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4);
      const now = new Date().toISOString();
      crm.deals[id] = {
        id,
        name: `Proposta ${company}`,
        company,
        contact: '',
        contactEmail: '',
        stage: 'lead',
        value: 30000,
        probability: 20,
        services: [],
        owner: 'Ruy',
        notes: 'Construtora que ja recebeu orcamento. Auto-importado.',
        source: 'auto_seed',
        rdDealId: null,
        margin: null,
        cost: null,
        riskFlag: false,
        priority: 'baixa',
        createdAt: now,
        updatedAt: now,
        expectedClose: '',
        activities: []
      };
      added++;
    });

    if (added > 0) {
      crm._seeded = true;
      TBO_STORAGE.saveCrmData(crm);
      TBO_STORAGE.addSyncLog({ type: 'auto_seed', created: added });
    }
  },

  // ===========================================================================
  // Deal Aging Helper
  // ===========================================================================

  _getDealAgeDays(deal) {
    if (!deal.updatedAt) return 0;
    const now = new Date();
    const updated = new Date(deal.updatedAt);
    return Math.floor((now - updated) / 86400000);
  },

  _getDealAgingClass(deal) {
    const days = this._getDealAgeDays(deal);
    if (['fechado_ganho', 'fechado_perdido'].includes(deal.stage)) return '';
    if (days >= 14) return 'deal-aging-critical';
    if (days >= 7) return 'deal-aging-warning';
    return '';
  },

  // ===========================================================================
  // Init — Bindings
  // ===========================================================================

  init() {
    // Tab switching
    document.querySelectorAll('.tabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
        const panel = document.getElementById(`tab-${tab.dataset.tab}`);
        if (panel) panel.style.display = 'block';
        if (typeof TBO_UX !== 'undefined') {
          TBO_UX.updateBreadcrumb('comercial', tab.textContent.trim());
          TBO_UX.setTabHash('comercial', tab.dataset.tab);
        }
      });
    });

    // Existing AI generators
    this._bind('cmGerarProposta', () => this._generateProposta());
    this._bind('cmGerarProspecao', () => this._generateProspecao());
    this._bind('cmGerarCase', () => this._generateCase());
    this._bind('cmGerarCalc', () => this._generateCalc());

    // Pipeline CRM bindings
    this._bind('cmNewDeal', () => this._showDealModal());
    this._bind('cmCrmImport', () => this._showImportModal());
    this._bind('cmCrmExport', () => this._showExportModal());
    this._bind('cmCrmStageConfig', () => this._showStageConfigModal());

    // Pipeline filters
    const filterOwner = document.getElementById('cmFilterOwner');
    const filterService = document.getElementById('cmFilterService');
    const filterSearch = document.getElementById('cmFilterSearch');
    if (filterOwner) filterOwner.addEventListener('change', () => { this._filters.owner = filterOwner.value; this._refreshPipeline(); });
    if (filterService) filterService.addEventListener('change', () => { this._filters.service = filterService.value; this._refreshPipeline(); });
    if (filterSearch) {
      let _t;
      filterSearch.addEventListener('input', () => { clearTimeout(_t); _t = setTimeout(() => { this._filters.search = filterSearch.value; this._refreshPipeline(); }, 250); });
    }

    // Init drag & drop
    this._initDragDrop();

    // Deal card click → edit
    document.getElementById('cmKanbanBoard')?.addEventListener('click', (e) => {
      const card = e.target.closest('.pipeline-deal');
      if (card) this._showDealModal(card.dataset.dealId);
    });
  },

  _bind(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  },

  // ===========================================================================
  // Drag & Drop
  // ===========================================================================

  _initDragDrop() {
    const board = document.getElementById('cmKanbanBoard');
    if (!board) return;

    board.addEventListener('dragstart', (e) => {
      const card = e.target.closest('.pipeline-deal');
      if (!card) return;
      e.dataTransfer.setData('text/plain', card.dataset.dealId);
      card.classList.add('dragging');
      // Highlight all columns
      setTimeout(() => {
        board.querySelectorAll('.pipeline-column-body').forEach(col => col.classList.add('drop-target'));
      }, 0);
    });

    board.addEventListener('dragend', (e) => {
      const card = e.target.closest('.pipeline-deal');
      if (card) card.classList.remove('dragging');
      board.querySelectorAll('.pipeline-column-body').forEach(col => {
        col.classList.remove('drop-target', 'drag-over');
      });
    });

    board.addEventListener('dragover', (e) => {
      const colBody = e.target.closest('.pipeline-column-body');
      if (colBody) { e.preventDefault(); colBody.classList.add('drag-over'); }
    });

    board.addEventListener('dragleave', (e) => {
      const colBody = e.target.closest('.pipeline-column-body');
      if (colBody && !colBody.contains(e.relatedTarget)) {
        colBody.classList.remove('drag-over');
      }
    });

    board.addEventListener('drop', (e) => {
      e.preventDefault();
      const colBody = e.target.closest('.pipeline-column-body');
      if (!colBody) return;
      const dealId = e.dataTransfer.getData('text/plain');
      const newStage = colBody.dataset.stage;
      if (dealId && newStage) this._onDealDrop(dealId, newStage);
      board.querySelectorAll('.pipeline-column-body').forEach(col => col.classList.remove('drop-target', 'drag-over'));
    });
  },

  _onDealDrop(dealId, newStageId) {
    const crm = TBO_STORAGE.getCrmData();
    const deal = crm.deals[dealId];
    if (!deal || deal.stage === newStageId) return;
    const oldStage = deal.stage;
    TBO_STORAGE.updateCrmDeal(dealId, { stage: newStageId });
    const stages = crm.stages || [];
    const oldLabel = (stages.find(s => s.id === oldStage) || {}).label || oldStage;
    const newLabel = (stages.find(s => s.id === newStageId) || {}).label || newStageId;
    TBO_TOAST.success(`${TBO_FORMATTER.truncate(deal.name, 20)}: ${oldLabel} \u2192 ${newLabel}`);
    this._refreshPipeline();
  },

  // ===========================================================================
  // Deal Modal (Create / Edit)
  // ===========================================================================

  _showDealModal(dealId) {
    const crm = TBO_STORAGE.getCrmData();
    const deal = dealId ? crm.deals[dealId] : null;
    const isEdit = !!deal;
    const stages = (crm.stages || []).sort((a, b) => a.order - b.order);
    const team = this._getTeamMembers();

    const html = `
      <div class="modal-overlay active" id="cmDealModalOverlay">
        <div class="modal modal--lg">
          <div class="modal-header">
            <h3 class="modal-title">${isEdit ? 'Editar Deal' : 'Novo Deal'}</h3>
            <button class="modal-close" id="cmDealModalClose">&times;</button>
          </div>
          <div class="modal-body" style="max-height:65vh; overflow-y:auto;">
            <div class="grid-2" style="gap:16px;">
              <div class="form-group">
                <label class="form-label">Nome do Deal *</label>
                <input type="text" class="form-input" id="cmDealName" value="${isEdit ? (deal.name || '').replace(/"/g, '&quot;') : ''}" placeholder="Ex: Imagens Empreendimento X">
              </div>
              <div class="form-group">
                <label class="form-label">Empresa / Construtora *</label>
                <input type="text" class="form-input" id="cmDealCompany" value="${isEdit ? (deal.company || '').replace(/"/g, '&quot;') : ''}" placeholder="Nome da construtora" list="cmDealCompanyList">
                <datalist id="cmDealCompanyList">
                  ${(typeof TBO_SEARCH !== 'undefined' ? TBO_SEARCH.getClientList() : []).map(c => `<option value="${c.value}">`).join('')}
                </datalist>
              </div>
              <div class="form-group">
                <label class="form-label">Contato</label>
                <input type="text" class="form-input" id="cmDealContact" value="${isEdit ? (deal.contact || '').replace(/"/g, '&quot;') : ''}" placeholder="Nome do contato">
              </div>
              <div class="form-group">
                <label class="form-label">Email contato</label>
                <input type="email" class="form-input" id="cmDealEmail" value="${isEdit ? (deal.contactEmail || '').replace(/"/g, '&quot;') : ''}" placeholder="email@empresa.com">
              </div>
              <div class="form-group">
                <label class="form-label">Etapa</label>
                <select class="form-input" id="cmDealStage">
                  ${stages.map(s => `<option value="${s.id}" ${(isEdit && deal.stage === s.id) ? 'selected' : ''}>${s.label}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Responsavel</label>
                <select class="form-input" id="cmDealOwner">
                  <option value="">Selecione</option>
                  ${team.map(m => `<option value="${m}" ${(isEdit && deal.owner === m) ? 'selected' : ''}>${m}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Valor (R$)</label>
                <input type="number" class="form-input" id="cmDealValue" value="${isEdit ? (deal.value || '') : ''}" placeholder="0" min="0" step="100">
              </div>
              <div class="form-group">
                <label class="form-label">Probabilidade (%)</label>
                <input type="number" class="form-input" id="cmDealProbability" value="${isEdit ? (deal.probability || '') : ''}" placeholder="0" min="0" max="100">
              </div>
              <div class="form-group">
                <label class="form-label">Previsao de fechamento</label>
                <input type="date" class="form-input" id="cmDealExpectedClose" value="${isEdit ? (deal.expectedClose || '') : ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Prioridade</label>
                <select class="form-input" id="cmDealPriority">
                  <option value="baixa" ${(isEdit && deal.priority === 'baixa') ? 'selected' : ''}>Baixa</option>
                  <option value="media" ${(!isEdit || deal.priority === 'media') ? 'selected' : ''}>M\u00e9dia</option>
                  <option value="alta" ${(isEdit && deal.priority === 'alta') ? 'selected' : ''}>Alta</option>
                </select>
              </div>
            </div>
            <div class="form-group" style="margin-top:12px;">
              <label class="form-label">Servicos</label>
              <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:4px;">
                ${this._BUS.map(bu => `
                  <label style="display:flex; align-items:center; gap:4px; font-size:0.8rem; cursor:pointer;">
                    <input type="checkbox" class="cm-deal-service-check" value="${bu}" ${(isEdit && (deal.services || []).includes(bu)) ? 'checked' : ''}> ${bu}
                  </label>
                `).join('')}
              </div>
            </div>
            <div class="form-group" style="margin-top:12px;">
              <label class="form-label">Notas</label>
              <textarea class="form-input" id="cmDealNotes" rows="3" placeholder="Observacoes, historico, contexto...">${isEdit ? (deal.notes || '') : ''}</textarea>
            </div>
            <div style="display:flex; gap:8px; align-items:center; margin-top:8px;">
              <label style="display:flex; align-items:center; gap:4px; font-size:0.82rem; cursor:pointer;">
                <input type="checkbox" id="cmDealRiskFlag" ${(isEdit && deal.riskFlag) ? 'checked' : ''}> Sinalizar como risco
              </label>
            </div>
          </div>
          <div class="modal-footer" style="display:flex; gap:8px; justify-content:space-between;">
            <div>
              ${isEdit ? `<button class="btn btn-sm" style="color:#ef4444;" id="cmDealDelete">Excluir</button>` : ''}
            </div>
            <div style="display:flex; gap:8px;">
              ${isEdit ? `<button class="btn btn-sm btn-secondary" id="cmDealToProposta">Gerar Proposta</button>` : ''}
              ${isEdit ? `<button class="btn btn-sm btn-secondary" style="color:#14b8a6;" id="cmDealToProposalERP">Registrar Proposta ERP</button>` : ''}
              <button class="btn btn-sm btn-secondary" id="cmDealCancel">Cancelar</button>
              <button class="btn btn-sm btn-primary" id="cmDealSave">${isEdit ? 'Salvar' : 'Criar Deal'}</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    // Bindings
    const overlay = document.getElementById('cmDealModalOverlay');
    const close = () => overlay?.remove();
    document.getElementById('cmDealModalClose')?.addEventListener('click', close);
    document.getElementById('cmDealCancel')?.addEventListener('click', close);
    overlay?.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    document.getElementById('cmDealSave')?.addEventListener('click', () => {
      const formData = {
        name: document.getElementById('cmDealName')?.value?.trim() || '',
        company: document.getElementById('cmDealCompany')?.value?.trim() || '',
        contact: document.getElementById('cmDealContact')?.value?.trim() || '',
        contactEmail: document.getElementById('cmDealEmail')?.value?.trim() || '',
        stage: document.getElementById('cmDealStage')?.value || 'lead',
        owner: document.getElementById('cmDealOwner')?.value || '',
        value: parseFloat(document.getElementById('cmDealValue')?.value) || 0,
        probability: parseInt(document.getElementById('cmDealProbability')?.value) || 0,
        expectedClose: document.getElementById('cmDealExpectedClose')?.value || '',
        priority: document.getElementById('cmDealPriority')?.value || 'media',
        services: [...document.querySelectorAll('.cm-deal-service-check:checked')].map(c => c.value),
        notes: document.getElementById('cmDealNotes')?.value?.trim() || '',
        riskFlag: !!document.getElementById('cmDealRiskFlag')?.checked
      };
      if (!formData.name) { TBO_TOAST.warning('Nome do deal e obrigatorio'); return; }
      if (!formData.company) { TBO_TOAST.warning('Empresa e obrigatoria'); return; }

      if (isEdit) {
        TBO_STORAGE.updateCrmDeal(dealId, formData);
        TBO_TOAST.success('Deal atualizado');
      } else {
        TBO_STORAGE.addCrmDeal(formData);
        TBO_TOAST.success('Deal criado');
      }
      close();
      this._refreshPipeline();
    });

    if (isEdit) {
      document.getElementById('cmDealDelete')?.addEventListener('click', () => {
        if (typeof TBO_UX !== 'undefined' && TBO_UX.confirm) {
          TBO_UX.confirm('Excluir Deal', `Tem certeza que deseja excluir "${deal.name}"?`, () => {
            TBO_STORAGE.deleteCrmDeal(dealId);
            TBO_TOAST.success('Deal excluido');
            close();
            this._refreshPipeline();
          });
        } else if (confirm(`Excluir "${deal.name}"?`)) {
          TBO_STORAGE.deleteCrmDeal(dealId);
          TBO_TOAST.success('Deal excluido');
          close();
          this._refreshPipeline();
        }
      });

      document.getElementById('cmDealToProposta')?.addEventListener('click', () => {
        this._linkDealToProposta(dealId);
        close();
      });

      document.getElementById('cmDealToProposalERP')?.addEventListener('click', () => {
        const crm = TBO_STORAGE.getCrmData();
        const deal = crm.deals[dealId];
        if (!deal) return;
        const proposal = TBO_STORAGE.addErpEntity('proposal', {
          name: deal.name || 'Proposta ' + deal.company,
          client: deal.company || '',
          company: deal.company || '',
          contact: deal.contact || '',
          value: deal.value || 0,
          services: deal.services || [],
          owner: deal.owner || '',
          status: 'rascunho',
          deal_id: dealId,
          notes: deal.notes || '',
          priority: deal.priority || 'media'
        });
        if (typeof TBO_ERP !== 'undefined') TBO_ERP.addAuditLog({
          entityType: 'proposal', entityId: proposal.id,
          action: 'created', userId: TBO_ERP._getCurrentUserId(),
          reason: 'Criada a partir do deal CRM: ' + dealId,
          entityName: proposal.name
        });
        TBO_TOAST.success('Proposta ERP registrada');
        close();
      });
    }
  },

  _linkDealToProposta(dealId) {
    const crm = TBO_STORAGE.getCrmData();
    const deal = crm.deals[dealId];
    if (!deal) return;

    // Switch to Proposta tab
    const propostaTab = document.querySelector('[data-tab="cm-proposta"]');
    if (propostaTab) propostaTab.click();

    // Fill form fields
    setTimeout(() => {
      const clienteEl = document.getElementById('cmCliente');
      const empreendEl = document.getElementById('cmEmpreendimento');
      const briefingEl = document.getElementById('cmBriefing');

      if (clienteEl) clienteEl.value = deal.company || '';
      if (empreendEl) empreendEl.value = deal.name || '';
      if (briefingEl) {
        const parts = [];
        if (deal.contact) parts.push(`Contato: ${deal.contact}`);
        if (deal.value) parts.push(`Valor estimado: R$ ${deal.value}`);
        if (deal.notes) parts.push(deal.notes);
        briefingEl.value = parts.join('\n');
      }

      // Check service checkboxes
      document.querySelectorAll('.cm-bu-check').forEach(cb => {
        cb.checked = (deal.services || []).includes(cb.value);
      });

      TBO_TOAST.info('Dados do deal preenchidos na proposta');
    }, 100);
  },

  // ===========================================================================
  // CSV Import
  // ===========================================================================

  _showImportModal() {
    const html = `
      <div class="modal-overlay active" id="cmImportModalOverlay">
        <div class="modal modal--xl">
          <div class="modal-header">
            <h3 class="modal-title">Importar Deals (CSV)</h3>
            <button class="modal-close" id="cmImportClose">&times;</button>
          </div>
          <div class="modal-body" style="max-height:70vh; overflow-y:auto;">
            <!-- Step 1: File Select -->
            <div id="cmImportStep1">
              <p style="color:var(--text-secondary); font-size:0.82rem; margin-bottom:12px;">
                Selecione um arquivo CSV exportado do RD Station ou outro CRM. O arquivo deve ter cabecalhos na primeira linha.
              </p>
              <div class="form-group">
                <input type="file" id="cmImportFile" accept=".csv,.txt" class="form-input">
              </div>
              <div style="margin-top:8px; font-size:0.78rem; color:var(--text-muted);">
                Formatos aceitos: CSV (separado por virgula ou ponto-e-virgula), UTF-8
              </div>
            </div>

            <!-- Step 2: Preview + Mapping -->
            <div id="cmImportStep2" style="display:none;">
              <div style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:0.85rem; font-weight:600;">Preview dos dados</span>
                <span id="cmImportRowCount" style="font-size:0.78rem; color:var(--text-muted);"></span>
              </div>
              <div style="overflow-x:auto; max-height:200px; margin-bottom:16px; border:1px solid var(--border-color); border-radius:6px;">
                <table class="data-table" id="cmImportPreviewTable" style="font-size:0.75rem;"></table>
              </div>

              <h4 style="font-size:0.85rem; margin-bottom:8px;">Mapeamento de Colunas</h4>
              <div id="cmImportMapping" style="display:grid; grid-template-columns:1fr 1fr; gap:8px;"></div>

              <div class="form-group" style="margin-top:16px;">
                <label class="form-label">Estrategia para duplicatas (mesmo nome + empresa)</label>
                <select class="form-input" id="cmImportStrategy">
                  <option value="skip">Pular duplicatas</option>
                  <option value="update">Atualizar existentes</option>
                  <option value="duplicate">Criar duplicata</option>
                </select>
              </div>
            </div>

            <!-- Step 3: Result -->
            <div id="cmImportStep3" style="display:none;">
              <div id="cmImportResult"></div>
            </div>
          </div>
          <div class="modal-footer" style="display:flex; gap:8px; justify-content:flex-end;">
            <button class="btn btn-sm btn-secondary" id="cmImportCancel">Cancelar</button>
            <button class="btn btn-sm btn-primary" id="cmImportNext" style="display:none;">Importar</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    const overlay = document.getElementById('cmImportModalOverlay');
    const close = () => overlay?.remove();
    document.getElementById('cmImportClose')?.addEventListener('click', close);
    document.getElementById('cmImportCancel')?.addEventListener('click', close);
    overlay?.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    let parsedRows = [];
    let headers = [];

    document.getElementById('cmImportFile')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target.result;
        const result = this._parseCSV(text);
        headers = result.headers;
        parsedRows = result.rows;
        this._renderImportPreview(headers, parsedRows);
      };
      reader.readAsText(file, 'UTF-8');
    });

    document.getElementById('cmImportNext')?.addEventListener('click', () => {
      const mapping = this._getImportMapping();
      const strategy = document.getElementById('cmImportStrategy')?.value || 'skip';
      this._executeImport(parsedRows, mapping, strategy);
    });
  },

  _parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return { headers: [], rows: [] };

    // Detect separator (comma or semicolon)
    const firstLine = lines[0];
    const sep = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',';

    const parseLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
          else { inQuotes = !inQuotes; }
        } else if (ch === sep && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]);
    const rows = lines.slice(1).map(l => parseLine(l)).filter(r => r.some(c => c));
    return { headers, rows };
  },

  _renderImportPreview(headers, rows) {
    document.getElementById('cmImportStep1').style.display = 'none';
    document.getElementById('cmImportStep2').style.display = 'block';
    document.getElementById('cmImportNext').style.display = 'inline-flex';
    document.getElementById('cmImportRowCount').textContent = `${rows.length} registros encontrados`;

    // Preview table (first 5 rows)
    const table = document.getElementById('cmImportPreviewTable');
    const previewRows = rows.slice(0, 5);
    table.innerHTML = `
      <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${previewRows.map(r => `<tr>${r.map(c => `<td>${TBO_FORMATTER.truncate(c, 30)}</td>`).join('')}</tr>`).join('')}</tbody>
    `;

    // Column mapping
    const targetFields = [
      { key: '', label: '(Ignorar)' },
      { key: 'name', label: 'Nome do Deal' },
      { key: 'company', label: 'Empresa' },
      { key: 'contact', label: 'Contato' },
      { key: 'contactEmail', label: 'Email' },
      { key: 'value', label: 'Valor' },
      { key: 'stage', label: 'Etapa' },
      { key: 'owner', label: 'Responsavel' },
      { key: 'probability', label: 'Probabilidade' },
      { key: 'services', label: 'Servicos' },
      { key: 'notes', label: 'Notas' },
      { key: 'expectedClose', label: 'Prev. Fechamento' },
      { key: 'priority', label: 'Prioridade' }
    ];

    const mappingDiv = document.getElementById('cmImportMapping');
    mappingDiv.innerHTML = headers.map((h, i) => {
      // Auto-detect mapping
      const hl = h.toLowerCase();
      let autoMatch = '';
      if (hl.includes('nome') || hl.includes('name') || hl.includes('deal') || hl.includes('titulo')) autoMatch = 'name';
      else if (hl.includes('empresa') || hl.includes('company') || hl.includes('construtora') || hl.includes('organization')) autoMatch = 'company';
      else if (hl.includes('contato') || hl.includes('contact')) autoMatch = 'contact';
      else if (hl.includes('email') || hl.includes('e-mail')) autoMatch = 'contactEmail';
      else if (hl.includes('valor') || hl.includes('value') || hl.includes('amount')) autoMatch = 'value';
      else if (hl.includes('etapa') || hl.includes('stage') || hl.includes('fase') || hl.includes('status')) autoMatch = 'stage';
      else if (hl.includes('responsavel') || hl.includes('owner') || hl.includes('dono')) autoMatch = 'owner';
      else if (hl.includes('prob')) autoMatch = 'probability';
      else if (hl.includes('servico') || hl.includes('service') || hl.includes('produto')) autoMatch = 'services';
      else if (hl.includes('nota') || hl.includes('note') || hl.includes('obs')) autoMatch = 'notes';

      return `
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:0.78rem; min-width:100px; color:var(--text-secondary);">${TBO_FORMATTER.escapeHtml(h)}</span>
          <span style="color:var(--text-muted);">\u2192</span>
          <select class="form-input cm-import-map" data-col="${i}" style="font-size:0.78rem;">
            ${targetFields.map(f => `<option value="${f.key}" ${f.key === autoMatch ? 'selected' : ''}>${f.label}</option>`).join('')}
          </select>
        </div>
      `;
    }).join('');
  },

  _getImportMapping() {
    const mapping = {};
    document.querySelectorAll('.cm-import-map').forEach(sel => {
      const col = parseInt(sel.dataset.col);
      const field = sel.value;
      if (field) mapping[col] = field;
    });
    return mapping;
  },

  _executeImport(rows, mapping, strategy) {
    const crm = TBO_STORAGE.getCrmData();
    const existingDeals = Object.values(crm.deals);
    let created = 0, updated = 0, skipped = 0, errors = 0;

    rows.forEach((row, idx) => {
      try {
        const deal = {};
        Object.entries(mapping).forEach(([col, field]) => {
          const val = row[parseInt(col)] || '';
          if (field === 'value' || field === 'probability') {
            deal[field] = parseFloat(val.replace(/[^\d.,\-]/g, '').replace(',', '.')) || 0;
          } else if (field === 'services') {
            deal[field] = val.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
          } else {
            deal[field] = val;
          }
        });

        if (!deal.name && !deal.company) { skipped++; return; }
        if (!deal.name) deal.name = deal.company || `Import ${idx + 1}`;

        // Check duplicate
        const existing = existingDeals.find(d =>
          d.name.toLowerCase() === (deal.name || '').toLowerCase() &&
          d.company.toLowerCase() === (deal.company || '').toLowerCase()
        );

        if (existing && strategy === 'skip') { skipped++; return; }
        if (existing && strategy === 'update') {
          TBO_STORAGE.updateCrmDeal(existing.id, deal);
          updated++;
          return;
        }

        // Map stage name to ID if needed
        if (deal.stage) {
          const stages = crm.stages || [];
          const match = stages.find(s => s.label.toLowerCase() === deal.stage.toLowerCase() || s.id === deal.stage.toLowerCase());
          deal.stage = match ? match.id : 'lead';
        } else {
          deal.stage = 'lead';
        }

        deal.source = 'csv_import';
        TBO_STORAGE.addCrmDeal(deal);
        created++;
      } catch (e) {
        errors++;
        console.warn('Import row error:', e, row);
      }
    });

    // Log import
    TBO_STORAGE.addSyncLog({
      type: 'csv_import',
      created,
      updated,
      skipped,
      errors,
      totalRows: rows.length
    });

    // Show result
    document.getElementById('cmImportStep2').style.display = 'none';
    document.getElementById('cmImportStep3').style.display = 'block';
    document.getElementById('cmImportNext').style.display = 'none';

    document.getElementById('cmImportResult').innerHTML = `
      <div style="text-align:center; padding:24px;">
        <div style="font-size:2rem; margin-bottom:12px;">\u2705</div>
        <h3 style="margin-bottom:16px;">Importacao Concluida</h3>
        <div class="grid-4" style="gap:12px; max-width:400px; margin:0 auto;">
          <div class="kpi-card"><div class="kpi-label">Criados</div><div class="kpi-value" style="color:#22c55e;">${created}</div></div>
          <div class="kpi-card"><div class="kpi-label">Atualizados</div><div class="kpi-value" style="color:#3b82f6;">${updated}</div></div>
          <div class="kpi-card"><div class="kpi-label">Ignorados</div><div class="kpi-value" style="color:#f59e0b;">${skipped}</div></div>
          <div class="kpi-card"><div class="kpi-label">Erros</div><div class="kpi-value" style="color:#ef4444;">${errors}</div></div>
        </div>
      </div>
    `;

    TBO_TOAST.success(`Importacao: ${created} criados, ${updated} atualizados`);
    this._refreshPipeline();
  },

  // ===========================================================================
  // Export Modal
  // ===========================================================================

  _showExportModal() {
    const crm = TBO_STORAGE.getCrmData();
    const stages = (crm.stages || []).sort((a, b) => a.order - b.order);
    const team = this._getTeamMembers();

    const html = `
      <div class="modal-overlay active" id="cmExportModalOverlay">
        <div class="modal modal--lg">
          <div class="modal-header">
            <h3 class="modal-title">Exportar Deals</h3>
            <button class="modal-close" id="cmExportClose">&times;</button>
          </div>
          <div class="modal-body">
            <div class="grid-2" style="gap:12px;">
              <div class="form-group">
                <label class="form-label">Periodo - De</label>
                <input type="date" class="form-input" id="cmExportFrom">
              </div>
              <div class="form-group">
                <label class="form-label">Periodo - Ate</label>
                <input type="date" class="form-input" id="cmExportTo">
              </div>
              <div class="form-group">
                <label class="form-label">Responsavel</label>
                <select class="form-input" id="cmExportOwner">
                  <option value="">Todos</option>
                  ${team.map(m => `<option value="${m}">${m}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Etapa</label>
                <select class="form-input" id="cmExportStage">
                  <option value="">Todas</option>
                  ${stages.map(s => `<option value="${s.id}">${s.label}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Valor minimo (R$)</label>
                <input type="number" class="form-input" id="cmExportMinValue" placeholder="0" min="0">
              </div>
              <div class="form-group">
                <label class="form-label">Formato</label>
                <select class="form-input" id="cmExportFormat">
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer" style="display:flex; gap:8px; justify-content:flex-end;">
            <button class="btn btn-sm btn-secondary" id="cmExportCancel">Cancelar</button>
            <button class="btn btn-sm btn-primary" id="cmExportExecute">Exportar</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    const overlay = document.getElementById('cmExportModalOverlay');
    const close = () => overlay?.remove();
    document.getElementById('cmExportClose')?.addEventListener('click', close);
    document.getElementById('cmExportCancel')?.addEventListener('click', close);
    overlay?.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    document.getElementById('cmExportExecute')?.addEventListener('click', () => {
      const filters = {
        from: document.getElementById('cmExportFrom')?.value || '',
        to: document.getElementById('cmExportTo')?.value || '',
        owner: document.getElementById('cmExportOwner')?.value || '',
        stage: document.getElementById('cmExportStage')?.value || '',
        minValue: parseFloat(document.getElementById('cmExportMinValue')?.value) || 0
      };
      const format = document.getElementById('cmExportFormat')?.value || 'csv';
      this._executeExport(filters, format);
      close();
    });
  },

  _executeExport(filters, format) {
    let deals = TBO_STORAGE.getCrmDeals();
    const crm = TBO_STORAGE.getCrmData();
    const stages = crm.stages || [];

    // Apply filters
    if (filters.from) deals = deals.filter(d => (d.createdAt || '') >= filters.from);
    if (filters.to) deals = deals.filter(d => (d.createdAt || '') <= filters.to + 'T23:59:59');
    if (filters.owner) deals = deals.filter(d => d.owner === filters.owner);
    if (filters.stage) deals = deals.filter(d => d.stage === filters.stage);
    if (filters.minValue) deals = deals.filter(d => (d.value || 0) >= filters.minValue);

    if (deals.length === 0) {
      TBO_TOAST.warning('Nenhum deal encontrado com esses filtros');
      return;
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(deals, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tbo_deals_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV export
      const stageLabel = (id) => (stages.find(s => s.id === id) || {}).label || id;
      const csvData = deals.map(d => ({
        Nome: d.name,
        Empresa: d.company,
        Contato: d.contact,
        Email: d.contactEmail,
        Etapa: stageLabel(d.stage),
        Valor: d.value,
        Probabilidade: d.probability + '%',
        Responsavel: d.owner,
        Servicos: (d.services || []).join('; '),
        Prioridade: d.priority,
        Risco: d.riskFlag ? 'Sim' : 'Nao',
        'Prev. Fechamento': d.expectedClose,
        Criado: TBO_FORMATTER.date(d.createdAt),
        Atualizado: TBO_FORMATTER.date(d.updatedAt),
        Notas: d.notes
      }));

      if (typeof TBO_UX !== 'undefined' && TBO_UX.exportCSV) {
        TBO_UX.exportCSV(csvData, `tbo_deals_${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        // Fallback CSV generation
        const headers = Object.keys(csvData[0]);
        const rows = csvData.map(r => headers.map(h => `"${(r[h] || '').toString().replace(/"/g, '""')}"`).join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tbo_deals_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }

    TBO_STORAGE.addSyncLog({ type: `export_${format}`, count: deals.length });
    TBO_TOAST.success(`${deals.length} deals exportados (${format.toUpperCase()})`);
  },

  // ===========================================================================
  // Stage Config Modal
  // ===========================================================================

  _showStageConfigModal() {
    const crm = TBO_STORAGE.getCrmData();
    const stages = (crm.stages || []).sort((a, b) => a.order - b.order);

    const html = `
      <div class="modal-overlay active" id="cmStageModalOverlay">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">Configurar Etapas do Pipeline</h3>
            <button class="modal-close" id="cmStageClose">&times;</button>
          </div>
          <div class="modal-body" style="max-height:60vh; overflow-y:auto;">
            <div id="cmStageList">
              ${stages.map((s, i) => `
                <div class="stage-config-item" data-stage-id="${s.id}" data-order="${s.order}">
                  <span style="color:var(--text-muted); cursor:grab; margin-right:8px;">\u2630</span>
                  <input type="color" class="cm-stage-color" value="${s.color}" style="width:28px; height:28px; border:none; cursor:pointer; background:none;">
                  <input type="text" class="form-input cm-stage-label" value="${s.label}" style="flex:1; font-size:0.82rem;">
                  <button class="btn btn-sm cm-stage-remove" data-idx="${i}" style="color:#ef4444; padding:2px 6px;" title="Remover">&times;</button>
                </div>
              `).join('')}
            </div>
            <button class="btn btn-sm btn-secondary" id="cmStageAdd" style="margin-top:12px; width:100%;">+ Adicionar Etapa</button>
          </div>
          <div class="modal-footer" style="display:flex; gap:8px; justify-content:flex-end;">
            <button class="btn btn-sm btn-secondary" id="cmStageCancel">Cancelar</button>
            <button class="btn btn-sm btn-primary" id="cmStageSave">Salvar</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    const overlay = document.getElementById('cmStageModalOverlay');
    const close = () => overlay?.remove();
    document.getElementById('cmStageClose')?.addEventListener('click', close);
    document.getElementById('cmStageCancel')?.addEventListener('click', close);
    overlay?.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    // Add stage
    document.getElementById('cmStageAdd')?.addEventListener('click', () => {
      const list = document.getElementById('cmStageList');
      const count = list.querySelectorAll('.stage-config-item').length;
      const newId = 'stage_' + Date.now().toString(36);
      const itemHtml = `
        <div class="stage-config-item" data-stage-id="${newId}" data-order="${count}">
          <span style="color:var(--text-muted); cursor:grab; margin-right:8px;">\u2630</span>
          <input type="color" class="cm-stage-color" value="#64748b" style="width:28px; height:28px; border:none; cursor:pointer; background:none;">
          <input type="text" class="form-input cm-stage-label" value="Nova Etapa" style="flex:1; font-size:0.82rem;">
          <button class="btn btn-sm cm-stage-remove" style="color:#ef4444; padding:2px 6px;" title="Remover">&times;</button>
        </div>
      `;
      list.insertAdjacentHTML('beforeend', itemHtml);
    });

    // Remove stage (delegated)
    document.getElementById('cmStageList')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.cm-stage-remove');
      if (btn) btn.closest('.stage-config-item')?.remove();
    });

    // Save stages
    document.getElementById('cmStageSave')?.addEventListener('click', () => {
      const items = document.querySelectorAll('#cmStageList .stage-config-item');
      const newStages = [];
      items.forEach((item, i) => {
        const label = item.querySelector('.cm-stage-label')?.value?.trim();
        const color = item.querySelector('.cm-stage-color')?.value || '#64748b';
        const id = item.dataset.stageId;
        if (label) {
          newStages.push({ id, label, order: i, color });
        }
      });

      if (newStages.length < 2) {
        TBO_TOAST.warning('Minimo 2 etapas necessarias');
        return;
      }

      const data = TBO_STORAGE.getCrmData();
      data.stages = newStages;
      TBO_STORAGE.saveCrmData(data);
      TBO_TOAST.success('Etapas atualizadas');
      close();
      this._refreshPipeline();
    });
  },

  // ===========================================================================
  // Refresh Pipeline
  // ===========================================================================

  _refreshPipeline() {
    const crm = TBO_STORAGE.getCrmData();
    const deals = TBO_STORAGE.getCrmDeals();
    const stages = (crm.stages || []).sort((a, b) => a.order - b.order);

    // Refresh KPIs
    const kpisEl = document.getElementById('cmPipelineKpis');
    if (kpisEl) kpisEl.innerHTML = this._renderPipelineKPIs(deals, stages);

    // Refresh Kanban
    const boardEl = document.getElementById('cmKanbanBoard');
    if (boardEl) {
      boardEl.innerHTML = this._renderKanban(deals, stages);
      // Re-init drag & drop on new elements (event delegation already handles it)
    }
  },

  // ===========================================================================
  // AI Generators (unchanged from original)
  // ===========================================================================

  async _aiCall(msg, outputId, ctx = '', btnId = null) {
    if (!TBO_API.isConfigured()) { TBO_TOAST.warning('API nao configurada'); return; }
    const out = document.getElementById(outputId);
    if (typeof TBO_UX !== 'undefined') {
      TBO_UX.showLoading(out, 'Gerando...');
      if (btnId) TBO_UX.btnLoading(btnId, true, 'Gerando...');
    } else if (out) {
      out.textContent = 'Gerando...';
    }
    try {
      const result = await TBO_API.callWithContext('comercial', msg, ctx);
      if (out) out.innerHTML = TBO_FORMATTER.markdownToHtml(result.text);
      TBO_STORAGE.addToHistory('comercial', { type: 'comercial', preview: TBO_FORMATTER.truncate(result.text, 80) });
    } catch (e) {
      if (typeof TBO_UX !== 'undefined') {
        TBO_UX.showError(out, e.message, () => this._aiCall(msg, outputId, ctx, btnId));
      } else if (out) {
        out.textContent = 'Erro: ' + e.message;
      }
      TBO_TOAST.error('Erro', e.message);
    } finally {
      if (typeof TBO_UX !== 'undefined' && btnId) TBO_UX.btnLoading(btnId, false);
    }
  },

  async _generateProposta() {
    const cliente = document.getElementById('cmCliente')?.value || '';
    const empreendimento = document.getElementById('cmEmpreendimento')?.value || '';
    const bus = [...document.querySelectorAll('.cm-bu-check:checked')].map(c => c.value);
    const briefing = document.getElementById('cmBriefing')?.value || '';
    if (!cliente) { TBO_TOAST.warning('Informe o cliente'); return; }

    const ctx = TBO_STORAGE.getClientContext(cliente);
    const msg = `Elabore uma proposta comercial para ${cliente}${empreendimento ? ', empreendimento ' + empreendimento : ''}. Servicos: ${bus.join(', ') || 'a definir'}. ${briefing ? 'Briefing: ' + briefing : ''} Use a estrutura: contexto, escopo detalhado por BU, diferenciais TBO, cronograma sugerido, e faixa de investimento (minimo/recomendado/premium).`;
    await this._aiCall(msg, 'cmPropostaOutput', ctx, 'cmGerarProposta');
  },

  async _generateProspecao() {
    const alvo = document.getElementById('cmProspAlvo')?.value || '';
    const info = document.getElementById('cmProspInfo')?.value || '';
    const blocos = [...document.querySelectorAll('.cm-canvas-check:checked')].map(c => c.value);
    if (!alvo) { TBO_TOAST.warning('Informe a empresa alvo'); return; }

    const msg = `Monte uma estrategia de prospecao usando o Sexy Canvas para a empresa "${alvo}". ${info ? 'Informacoes conhecidas: ' + info : ''} ${blocos.length > 0 ? 'Enfatize os blocos: ' + blocos.join(', ') : 'Use os blocos mais relevantes.'} Sugira: abordagem inicial, mensagem-chave, e argumentos por bloco.`;
    await this._aiCall(msg, 'cmProspecaoOutput', '', 'cmGerarProspecao');
  },

  async _generateCase() {
    const proj = document.getElementById('cmCaseProjeto')?.value || '';
    const fmt = document.getElementById('cmCaseFormato')?.value || 'resumo';
    if (!proj) { TBO_TOAST.warning('Selecione um projeto'); return; }
    const ctx = TBO_STORAGE.getProjectContext(proj);
    await this._aiCall(`Crie um case de sucesso (${fmt}) sobre o projeto "${proj}".`, 'cmCaseOutput', ctx, 'cmGerarCase');
  },

  async _generateCalc() {
    const escopo = document.getElementById('cmCalcEscopo')?.value || '';
    if (!escopo) { TBO_TOAST.warning('Descreva o escopo'); return; }
    const ctx = TBO_STORAGE.getFullContext();
    await this._aiCall(`Com base nos dados historicos de precificacao da TBO, estime o valor para o seguinte escopo: ${escopo}. Apresente faixas (minimo/recomendado/premium) e justifique.`, 'cmCalcOutput', ctx, 'cmGerarCalc');
  },

  // ===========================================================================
  // PROPOSTAS ERP — State machine + Proposal→Project conversion
  // ===========================================================================

  _renderPropostasTab() {
    const proposals = TBO_STORAGE.getAllErpEntities('proposal');
    const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.proposal : null;
    if (!sm) return '<div class="empty-state"><div class="empty-state-text">ERP nao inicializado</div></div>';

    const open = proposals.filter(p => !['recusada','convertida'].includes(p.status));
    const totalValue = open.reduce((s, p) => s + (p.value || 0), 0);
    const approved = proposals.filter(p => p.status === 'aprovada');

    return `
      <div class="grid-4" style="margin-bottom:16px;">
        <div class="kpi-card"><div class="kpi-label">Propostas Abertas</div><div class="kpi-value">${open.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Valor Total</div><div class="kpi-value">${typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.currency(totalValue) : 'R$' + totalValue}</div></div>
        <div class="kpi-card"><div class="kpi-label">Aguardando Conversao</div><div class="kpi-value" style="color:${approved.length > 0 ? '#22c55e' : 'var(--text-primary)'};">${approved.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Total</div><div class="kpi-value">${proposals.length}</div></div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h3 style="font-size:0.95rem;font-weight:700;">Propostas</h3>
        <button class="btn btn-primary" onclick="TBO_COMERCIAL._showProposalModal(null)" style="font-size:0.78rem;">+ Nova Proposta</button>
      </div>
      <div id="cmPropostasList">
        ${proposals.length === 0 ? '<div class="empty-state"><div class="empty-state-text">Nenhuma proposta registrada. Crie propostas para acompanhar seu status.</div></div>' : ''}
        ${proposals.map(p => {
          const stateColor = sm.colors[p.status] || '#94a3b8';
          const stateLabel = sm.labels[p.status] || p.status;
          return `<div class="card" style="margin-bottom:6px;padding:14px;cursor:pointer;" onclick="TBO_COMERCIAL._showProposalModal('${p.id}')">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="font-weight:600;font-size:0.85rem;">${p.name}</span>
                  <span class="tag" style="font-size:0.65rem;background:${stateColor}20;color:${stateColor};border:1px solid ${stateColor}40;">${stateLabel}</span>
                </div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">
                  ${p.company || p.client || ''} | ${p.owner || 'Sem responsavel'} | ${typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.relativeTime(p.updatedAt || p.createdAt) : ''}
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                ${p.value ? `<span style="font-size:0.85rem;font-weight:600;color:var(--accent-gold);">${typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.currency(p.value) : 'R$' + p.value}</span>` : ''}
                ${p.status === 'aprovada' ? `<button class="btn btn-secondary" style="font-size:0.68rem;padding:3px 8px;color:#22c55e;" onclick="event.stopPropagation();TBO_COMERCIAL._convertProposalToProject('${p.id}')">Converter em Projeto</button>` : ''}
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
  },

  _showProposalModal(proposalId) {
    const existing = proposalId ? TBO_STORAGE.getErpEntity('proposal', proposalId) : null;
    const isNew = !existing;
    const sm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.proposal : null;
    const team = this._getTeamMembers();
    const clients = TBO_STORAGE.get('context').clientes_construtoras || [];

    // State transitions
    let transitionHtml = '';
    if (existing && sm) {
      const valid = TBO_ERP.getValidTransitions('proposal', existing.status);
      if (valid.length > 0) {
        transitionHtml = `<div style="margin-bottom:16px;">
          <label class="form-label">Mudar Status</label>
          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
            <span class="tag" style="background:${sm.colors[existing.status]}30;color:${sm.colors[existing.status]};border:1px solid ${sm.colors[existing.status]}50;">${sm.labels[existing.status]}</span>
            \u2192
            ${valid.map(t => `<button class="btn btn-secondary" style="font-size:0.72rem;padding:3px 10px;color:${t.color};border-color:${t.color}40;" onclick="TBO_COMERCIAL._transitionProposal('${existing.id}','${t.state}')">${t.label}</button>`).join('')}
          </div>
        </div>`;
      }
    }

    const p = existing || {};
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
      <div class="modal modal--lg active" style="max-width:600px;">
        <div class="modal-header">
          <h3 class="modal-title">${isNew ? 'Nova Proposta' : p.name}</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <div class="modal-body" style="max-height:70vh;overflow-y:auto;">
          ${transitionHtml}
          <div class="grid-2" style="gap:12px;">
            <div class="form-group">
              <label class="form-label">Nome/Titulo*</label>
              <input type="text" class="form-input" id="cmPropName" value="${p.name || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Cliente/Construtora*</label>
              <input type="text" class="form-input" id="cmPropClient" value="${p.client || p.company || ''}" list="cmPropClientList">
              <datalist id="cmPropClientList">${clients.map(c => `<option value="${c}">`).join('')}</datalist>
            </div>
          </div>
          <div class="grid-3" style="gap:12px;">
            <div class="form-group">
              <label class="form-label">Valor (R$)*</label>
              <input type="number" class="form-input" id="cmPropValue" value="${p.value || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Responsavel</label>
              <select class="form-input" id="cmPropOwner">
                <option value="">Selecione</option>
                ${team.map(t => `<option value="${t}" ${p.owner === t ? 'selected' : ''}>${t}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Prioridade</label>
              <select class="form-input" id="cmPropPriority">
                <option value="baixa" ${p.priority === 'baixa' ? 'selected' : ''}>Baixa</option>
                <option value="media" ${p.priority === 'media' || !p.priority ? 'selected' : ''}>Media</option>
                <option value="alta" ${p.priority === 'alta' ? 'selected' : ''}>Alta</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Servicos</label>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              ${this._BUS.map(bu => `<label style="display:flex;align-items:center;gap:4px;font-size:0.82rem;cursor:pointer;">
                <input type="checkbox" value="${bu}" class="cmPropService" ${(p.services || []).includes(bu) ? 'checked' : ''}> ${bu}
              </label>`).join('')}
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Contato</label>
            <input type="text" class="form-input" id="cmPropContact" value="${p.contact || ''}" placeholder="Nome do contato">
          </div>
          ${p.deal_id ? `<div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:8px;">Vinculada ao deal: ${p.deal_id}</div>` : ''}
          <div class="form-group">
            <label class="form-label">Notas</label>
            <textarea class="form-input" id="cmPropNotes" rows="3">${p.notes || ''}</textarea>
          </div>
        </div>
        <div class="modal-footer" style="display:flex;justify-content:${isNew ? 'flex-end' : 'space-between'};">
          ${!isNew ? `<button class="btn btn-secondary" style="color:#ef4444;" onclick="TBO_COMERCIAL._deleteProposal('${p.id}')">Excluir</button>` : ''}
          <div style="display:flex;gap:8px;">
            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
            <button class="btn btn-primary" onclick="TBO_COMERCIAL._saveProposal('${p.id || ''}')">${isNew ? 'Criar' : 'Salvar'}</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  },

  _saveProposal(existingId) {
    const name = document.getElementById('cmPropName')?.value?.trim();
    const client = document.getElementById('cmPropClient')?.value?.trim();
    const value = Number(document.getElementById('cmPropValue')?.value) || 0;
    if (!name) { TBO_TOAST.warning('Nome e obrigatorio'); return; }
    if (!client) { TBO_TOAST.warning('Cliente e obrigatorio'); return; }

    const services = [];
    document.querySelectorAll('.cmPropService:checked').forEach(cb => services.push(cb.value));

    const data = {
      name,
      client,
      company: client,
      value,
      owner: document.getElementById('cmPropOwner')?.value || '',
      priority: document.getElementById('cmPropPriority')?.value || 'media',
      services,
      contact: document.getElementById('cmPropContact')?.value?.trim() || '',
      notes: document.getElementById('cmPropNotes')?.value?.trim() || ''
    };

    if (existingId) {
      TBO_STORAGE.updateErpEntity('proposal', existingId, data);
      if (typeof TBO_ERP !== 'undefined') TBO_ERP.addAuditLog({
        entityType: 'proposal', entityId: existingId,
        action: 'updated', userId: TBO_ERP._getCurrentUserId(),
        entityName: name
      });
      TBO_TOAST.success('Proposta atualizada');
    } else {
      data.status = 'rascunho';
      const newP = TBO_STORAGE.addErpEntity('proposal', data);
      if (typeof TBO_ERP !== 'undefined') TBO_ERP.addAuditLog({
        entityType: 'proposal', entityId: newP.id,
        action: 'created', userId: TBO_ERP._getCurrentUserId(),
        entityName: name
      });
      TBO_TOAST.success('Proposta criada');
    }
    document.querySelector('.modal-overlay')?.remove();
    this._refreshPropostas();
  },

  _deleteProposal(id) {
    if (!confirm('Excluir esta proposta?')) return;
    TBO_STORAGE.deleteErpEntity('proposal', id);
    TBO_TOAST.success('Proposta excluida');
    document.querySelector('.modal-overlay')?.remove();
    this._refreshPropostas();
  },

  _transitionProposal(proposalId, newState) {
    if (typeof TBO_ERP === 'undefined') return;
    const result = TBO_ERP.transition('proposal', proposalId, newState);
    if (result.ok) {
      TBO_TOAST.success(`Status: ${TBO_ERP.getStateLabel('proposal', newState)}`);
      document.querySelector('.modal-overlay')?.remove();
      this._refreshPropostas();
    } else {
      TBO_TOAST.error(result.error);
    }
  },

  _convertProposalToProject(proposalId) {
    if (!confirm('Converter esta proposta em projeto? Isso criara um novo projeto no modulo Projetos.')) return;
    if (typeof TBO_ERP === 'undefined') { TBO_TOAST.error('ERP nao inicializado'); return; }
    const result = TBO_ERP.convertProposalToProject(proposalId);
    if (result.ok) {
      TBO_TOAST.success(`Projeto criado: ${result.project.name}`);
      this._refreshPropostas();
    } else {
      TBO_TOAST.error(result.error);
    }
  },

  _refreshPropostas() {
    const container = document.getElementById('tab-cm-propostas');
    if (container) container.innerHTML = this._renderPropostasTab();
  }
};

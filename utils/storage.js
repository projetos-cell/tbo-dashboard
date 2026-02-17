// TBO OS — Storage Management
const TBO_STORAGE = {
  // Data file paths (relative)
  paths: {
    context: 'data/context-data.json',
    meetings: 'data/meetings-data.json',
    market: 'data/market-data.json',
    news: 'data/news-data.json',
    sources: 'data/sources.json'
  },

  // In-memory data cache
  _data: {},

  async loadAll() {
    const promises = Object.entries(this.paths).map(async ([key, path]) => {
      try {
        const response = await fetch(path);
        if (response.ok) {
          this._data[key] = await response.json();
        }
      } catch (e) {
        console.warn(`Falha ao carregar ${path}:`, e);
        this._data[key] = this._getFromLocalStorage(key) || {};
      }
    });
    await Promise.all(promises);
    return this._data;
  },

  get(key) {
    return this._data[key] || this._getFromLocalStorage(key) || {};
  },

  set(key, data) {
    this._data[key] = data;
    this._saveToLocalStorage(key, data);
  },

  _getFromLocalStorage(key) {
    try {
      const raw = localStorage.getItem(`tbo_data_${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  _saveToLocalStorage(key, data) {
    try {
      localStorage.setItem(`tbo_data_${key}`, JSON.stringify(data));
    } catch (e) {
      console.warn('localStorage cheio ou indisponível');
    }
  },

  // Generation history
  getHistory(moduleKey) {
    try {
      const raw = localStorage.getItem(`tbo_history_${moduleKey}`);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  addToHistory(moduleKey, entry) {
    const history = this.getHistory(moduleKey);
    history.unshift({
      ...entry,
      timestamp: new Date().toISOString(),
      id: Date.now().toString(36)
    });
    // Keep last 50 entries per module
    if (history.length > 50) history.pop();
    localStorage.setItem(`tbo_history_${moduleKey}`, JSON.stringify(history));
  },

  clearHistory(moduleKey) {
    localStorage.removeItem(`tbo_history_${moduleKey}`);
  },

  // Get context string for a specific project
  getProjectContext(projectName) {
    const context = this.get('context');
    const meetings = this.get('meetings');

    let projectData = '';

    // Find in active projects
    const active = (context.projetos_ativos || []).find(p =>
      p.nome.toLowerCase().includes(projectName.toLowerCase())
    );
    if (active) {
      projectData += `[PROJETO ATIVO] ${active.nome} | Construtora: ${active.construtora} | BUs: ${(active.bus || []).join(', ')}\n`;
    }

    // Find related meetings (support both formats)
    const meetingsArr = meetings.meetings || meetings.reunioes_recentes || [];
    const related = meetingsArr.filter(r => {
      const title = (r.title || r.titulo || '').toLowerCase();
      const summary = (r.summary || r.resumo || '').toLowerCase();
      return title.includes(projectName.toLowerCase()) || summary.includes(projectName.toLowerCase());
    });
    if (related.length > 0) {
      projectData += '\n[REUNIÕES RELACIONADAS]\n';
      related.forEach(r => {
        const date = r.date || r.data;
        const title = r.title || r.titulo;
        const summary = r.summary || r.resumo || '';
        projectData += `- ${date}: ${title} — ${summary}\n`;
        const items = r.action_items || [];
        if (items.length > 0) {
          projectData += `  Action items: ${items.map(i => i.task || i.tarefa || i).join('; ')}\n`;
        }
      });
    }

    return projectData;
  },

  // Get context string for a specific client/construtora
  getClientContext(clientName) {
    const context = this.get('context');
    const meetings = this.get('meetings');

    let clientData = `[CLIENTE: ${clientName}]\n`;

    // Find all projects for this client
    const activeProjects = (context.projetos_ativos || []).filter(p =>
      p.construtora && p.construtora.toLowerCase().includes(clientName.toLowerCase())
    );
    if (activeProjects.length > 0) {
      clientData += `Projetos ativos: ${activeProjects.map(p => p.nome).join(', ')}\n`;
    }

    // Find completed projects
    const finalizados = context.projetos_finalizados || {};
    const completedForClient = [];
    Object.entries(finalizados).forEach(([year, projects]) => {
      projects.forEach(p => {
        if (p.toLowerCase().includes(clientName.toLowerCase())) {
          completedForClient.push(`${p} (${year})`);
        }
      });
    });
    if (completedForClient.length > 0) {
      clientData += `Projetos finalizados: ${completedForClient.join(', ')}\n`;
    }

    // Related meetings (support both formats)
    const meetingsArr = meetings.meetings || meetings.reunioes_recentes || [];
    const related = meetingsArr.filter(r => {
      const title = (r.title || r.titulo || '').toLowerCase();
      const participants = (r.participants || r.participantes || []).map(p => {
        if (typeof p === 'string') return p.toLowerCase();
        return (p.name || p.email || '').toLowerCase();
      });
      return title.includes(clientName.toLowerCase()) ||
        participants.some(p => p.includes(clientName.toLowerCase()));
    });
    if (related.length > 0) {
      clientData += `\nReunições recentes (${related.length}):\n`;
      related.forEach(r => {
        const date = r.date || r.data;
        const title = r.title || r.titulo;
        const duration = r.duration_minutes || r.duracao_min;
        const summary = r.summary || r.resumo || '';
        clientData += `- ${date}: ${title} (${duration}min)\n  ${summary}\n`;
      });
    }

    return clientData;
  },

  // Get full context for system prompt injection
  getFullContext() {
    const context = this.get('context');
    const meetings = this.get('meetings');
    const market = this.get('market');

    let full = '';

    // Active projects summary
    const ativos = context.projetos_ativos || [];
    full += `[PROJETOS ATIVOS: ${ativos.length}]\n`;
    ativos.forEach(p => {
      full += `- ${p.nome} (${p.construtora}) — BUs: ${(p.bus || []).join(', ')}\n`;
    });

    // Commercial data
    if (context.dados_comerciais) {
      const dc = context.dados_comerciais;
      full += `\n[DADOS COMERCIAIS]\n`;
      full += `2024: ${dc['2024']?.propostas || 0} propostas, ${dc['2024']?.conversao_proposta || 'N/A'} conversão, ticket médio R$${dc['2024']?.ticket_medio || 'N/A'}, vendido R$${dc['2024']?.total_vendido || 'N/A'}\n`;
      full += `2025: ${dc['2025']?.propostas || 0} propostas, ${dc['2025']?.conversao_proposta || 'N/A'} conversão, ticket médio R$${dc['2025']?.ticket_medio || 'N/A'}, vendido R$${dc['2025']?.total_vendido || 'N/A'}\n`;

      // 2026 Cash flow data
      const fc = dc['2026']?.fluxo_caixa;
      if (fc) {
        full += `\n[FLUXO DE CAIXA 2026]\n`;
        full += `Meta vendas: R$${fc.meta_vendas_mensal}/mês (R$${fc.meta_vendas_anual}/ano)\n`;
        full += `Receita projetada: R$${fc.receita_total_projetada} | Despesa projetada: R$${fc.despesa_total_projetada}\n`;
        full += `Resultado líquido projetado: R$${fc.resultado_liquido_projetado}\n`;
        if (fc.receita_mensal) {
          full += `Receita mensal: Jan R$${fc.receita_mensal.jan}, Fev R$${fc.receita_mensal.fev}, Mar R$${fc.receita_mensal.mar}, Abr R$${fc.receita_mensal.abr}, Mai R$${fc.receita_mensal.mai}, Jun R$${fc.receita_mensal.jun}\n`;
        }
        if (fc.despesas_detalhadas) {
          full += `Despesas: Pessoas R$${fc.despesas_detalhadas.pessoas?.total_anual}, Terceirização R$${fc.despesas_detalhadas.terceirizacao?.total_anual}, Operacionais R$${fc.despesas_detalhadas.operacionais?.total_anual}\n`;
        }
      }
    }

    // Market data
    if (market.indicadores_curitiba) {
      const ic = market.indicadores_curitiba;
      full += `\n[MERCADO CURITIBA ${ic.periodo}]\n`;
      full += `Empreendimentos: ${ic.empreendimentos_lancados} (${ic.variacao_empreendimentos})\n`;
      full += `Unidades: ${ic.unidades_lancadas} (${ic.variacao_unidades})\n`;
    }

    // Recent meetings summary (support both formats)
    const meetingsArr = meetings.meetings || meetings.reunioes_recentes || [];
    if (meetingsArr.length > 0) {
      full += `\n[ÚLTIMAS REUNIÕES: ${meetingsArr.length}]\n`;
      meetingsArr.slice(0, 10).forEach(r => {
        const date = r.date || r.data;
        const title = r.title || r.titulo;
        const category = r.category || r.categoria || '';
        full += `- ${date}: ${title} (${category})\n`;
      });
    }

    return full;
  },

  // =============================================
  // CRM Data Management (Pipeline / Deals)
  // =============================================

  _crmDefaults() {
    return {
      stages: [
        { id: 'lead', label: 'Lead', order: 0, color: '#6366f1' },
        { id: 'qualificacao', label: 'Qualificação', order: 1, color: '#f59e0b' },
        { id: 'proposta', label: 'Proposta Enviada', order: 2, color: '#3b82f6' },
        { id: 'negociacao', label: 'Negociação', order: 3, color: '#8b5cf6' },
        { id: 'fechado_ganho', label: 'Fechado Ganho', order: 4, color: '#22c55e' },
        { id: 'fechado_perdido', label: 'Fechado Perdido', order: 5, color: '#ef4444' }
      ],
      deals: {},
      syncLog: [],
      config: { rdToken: null, proxyUrl: null, stageMapping: {} }
    };
  },

  initCrmDefaults() {
    if (!localStorage.getItem('tbo_data_crm')) {
      this.saveCrmData(this._crmDefaults());
    }
  },

  getCrmData() {
    try {
      const raw = localStorage.getItem('tbo_data_crm');
      if (!raw) { const d = this._crmDefaults(); this.saveCrmData(d); return d; }
      const data = JSON.parse(raw);
      // Ensure all keys exist
      if (!data.stages) data.stages = this._crmDefaults().stages;
      if (!data.deals) data.deals = {};
      if (!data.syncLog) data.syncLog = [];
      if (!data.config) data.config = { rdToken: null, proxyUrl: null, stageMapping: {} };
      return data;
    } catch (e) {
      console.warn('CRM data parse error, resetting:', e);
      const d = this._crmDefaults();
      this.saveCrmData(d);
      return d;
    }
  },

  saveCrmData(data) {
    try {
      localStorage.setItem('tbo_data_crm', JSON.stringify(data));
    } catch (e) {
      console.warn('CRM save failed (localStorage full?):', e);
    }
  },

  getCrmDeals() {
    const data = this.getCrmData();
    return Object.values(data.deals).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  },

  getCrmDealsByStage(stageId) {
    return this.getCrmDeals().filter(d => d.stage === stageId);
  },

  addCrmDeal(deal) {
    const data = this.getCrmData();
    const id = 'd_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const now = new Date().toISOString();
    const newDeal = {
      id,
      name: deal.name || '',
      company: deal.company || '',
      contact: deal.contact || '',
      contactEmail: deal.contactEmail || '',
      stage: deal.stage || 'lead',
      value: Number(deal.value) || 0,
      probability: Number(deal.probability) || 0,
      services: deal.services || [],
      owner: deal.owner || '',
      notes: deal.notes || '',
      source: deal.source || 'manual',
      rdDealId: deal.rdDealId || null,
      margin: deal.margin || null,
      cost: deal.cost || null,
      riskFlag: !!deal.riskFlag,
      priority: deal.priority || 'media',
      createdAt: now,
      updatedAt: now,
      expectedClose: deal.expectedClose || '',
      activities: []
    };
    data.deals[id] = newDeal;
    this.saveCrmData(data);
    return newDeal;
  },

  updateCrmDeal(id, updates) {
    const data = this.getCrmData();
    if (!data.deals[id]) return null;
    Object.assign(data.deals[id], updates, { updatedAt: new Date().toISOString() });
    this.saveCrmData(data);
    return data.deals[id];
  },

  deleteCrmDeal(id) {
    const data = this.getCrmData();
    if (!data.deals[id]) return false;
    delete data.deals[id];
    this.saveCrmData(data);
    return true;
  },

  addSyncLog(entry) {
    const data = this.getCrmData();
    data.syncLog.unshift({ ...entry, timestamp: new Date().toISOString(), id: Date.now().toString(36) });
    if (data.syncLog.length > 100) data.syncLog = data.syncLog.slice(0, 100);
    this.saveCrmData(data);
  },

  getCrmDealContext(dealId) {
    const data = this.getCrmData();
    const deal = data.deals[dealId];
    if (!deal) return '';
    const stage = (data.stages || []).find(s => s.id === deal.stage);
    return `[DEAL CRM] ${deal.name} | Empresa: ${deal.company} | Etapa: ${stage ? stage.label : deal.stage} | Valor: R$${deal.value} | Prob: ${deal.probability}% | Serviços: ${(deal.services || []).join(', ')} | Responsável: ${deal.owner} | Previsão: ${deal.expectedClose || 'N/A'}\nNotas: ${deal.notes || 'Nenhuma'}`;
  },

  // =============================================
  // ERP Entity CRUD (Generic localStorage-based)
  // Stores all entities in tbo_erp_{entityType}
  // =============================================

  _erpKey(entityType) {
    return `tbo_erp_${entityType}`;
  },

  initErpStorage() {
    const types = ['project','task','deliverable','proposal','decision','meeting_erp','time_entry'];
    types.forEach(t => {
      if (!localStorage.getItem(this._erpKey(t))) {
        localStorage.setItem(this._erpKey(t), JSON.stringify({}));
      }
    });
    if (!localStorage.getItem('tbo_erp_meta')) {
      localStorage.setItem('tbo_erp_meta', JSON.stringify({}));
    }
  },

  getErpMeta() {
    try {
      return JSON.parse(localStorage.getItem('tbo_erp_meta') || '{}');
    } catch (e) { return {}; }
  },

  setErpMeta(updates) {
    const meta = this.getErpMeta();
    Object.assign(meta, updates);
    localStorage.setItem('tbo_erp_meta', JSON.stringify(meta));
  },

  getAllErpEntities(entityType) {
    try {
      const raw = localStorage.getItem(this._erpKey(entityType));
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Object.values(data).sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''));
    } catch (e) {
      console.warn(`ERP read error for ${entityType}:`, e);
      return [];
    }
  },

  getErpEntity(entityType, id) {
    try {
      const raw = localStorage.getItem(this._erpKey(entityType));
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data[id] || null;
    } catch (e) { return null; }
  },

  getErpEntitiesByParent(entityType, parentId) {
    return this.getAllErpEntities(entityType).filter(e =>
      e.project_id === parentId || e.parent_id === parentId
    );
  },

  addErpEntity(entityType, entity) {
    try {
      const raw = localStorage.getItem(this._erpKey(entityType));
      const data = raw ? JSON.parse(raw) : {};
      const id = entityType.charAt(0) + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
      const now = new Date().toISOString();
      const newEntity = {
        ...entity,
        id,
        createdAt: now,
        updatedAt: now
      };
      data[id] = newEntity;
      localStorage.setItem(this._erpKey(entityType), JSON.stringify(data));
      return newEntity;
    } catch (e) {
      console.warn(`ERP add error for ${entityType}:`, e);
      return null;
    }
  },

  updateErpEntity(entityType, id, updates) {
    try {
      const raw = localStorage.getItem(this._erpKey(entityType));
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data[id]) return null;
      Object.assign(data[id], updates, { updatedAt: new Date().toISOString() });
      localStorage.setItem(this._erpKey(entityType), JSON.stringify(data));
      return data[id];
    } catch (e) {
      console.warn(`ERP update error for ${entityType}:`, e);
      return null;
    }
  },

  deleteErpEntity(entityType, id) {
    try {
      const raw = localStorage.getItem(this._erpKey(entityType));
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data[id]) return false;
      delete data[id];
      localStorage.setItem(this._erpKey(entityType), JSON.stringify(data));
      return true;
    } catch (e) { return false; }
  },

  // Timer singleton helpers (fast read/write outside ERP entity store)
  getRunningTimer(userId) {
    try {
      const raw = localStorage.getItem(`tbo_timer_${userId}`);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  },

  setRunningTimer(userId, timerData) {
    if (timerData === null || timerData === undefined) {
      localStorage.removeItem(`tbo_timer_${userId}`);
    } else {
      localStorage.setItem(`tbo_timer_${userId}`, JSON.stringify(timerData));
    }
  },

  // Get ERP context for AI prompts
  getErpContext(projectId) {
    const project = this.getErpEntity('project', projectId);
    if (!project) return '';
    const tasks = this.getErpEntitiesByParent('task', projectId);
    const deliverables = this.getErpEntitiesByParent('deliverable', projectId);
    let ctx = `[PROJETO ERP] ${project.name} | Cliente: ${project.client} | Status: ${project.status} | Responsavel: ${project.owner || 'N/A'}\n`;
    if (project.next_action) ctx += `Proxima acao: ${project.next_action} (${project.next_action_date || 'sem prazo'})\n`;
    if (tasks.length > 0) {
      ctx += `Tarefas (${tasks.length}): `;
      ctx += tasks.slice(0, 5).map(t => `${t.title} [${t.status}]`).join(', ');
      if (tasks.length > 5) ctx += ` +${tasks.length - 5} mais`;
      ctx += '\n';
    }
    if (deliverables.length > 0) {
      ctx += `Entregaveis (${deliverables.length}): `;
      ctx += deliverables.map(d => `${d.name} [${d.status}${d.current_version ? ' ' + d.current_version : ''}]`).join(', ');
      ctx += '\n';
    }
    return ctx;
  },

  // Get all ERP data summary for Command Center
  getErpSummary() {
    const projects = this.getAllErpEntities('project');
    const tasks = this.getAllErpEntities('task');
    const deliverables = this.getAllErpEntities('deliverable');
    const proposals = this.getAllErpEntities('proposal');
    const decisions = this.getAllErpEntities('decision');

    const activeProjects = projects.filter(p => !['finalizado','cancelado'].includes(p.status));
    const pendingTasks = tasks.filter(t => t.status !== 'concluida' && t.status !== 'cancelada');
    const overdueTasks = pendingTasks.filter(t => t.due_date && new Date(t.due_date) < new Date());
    const pendingReviews = deliverables.filter(d => d.status === 'em_revisao');
    const openProposals = proposals.filter(p => !['recusada','convertida'].includes(p.status));

    const timeEntries = this.getAllErpEntities('time_entry');
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = timeEntries.filter(e => e.date === today);
    const todayMinutes = todayEntries.reduce((s, e) => s + (e.duration_minutes || 0), 0);

    return {
      projects: { total: projects.length, active: activeProjects.length },
      tasks: { total: tasks.length, pending: pendingTasks.length, overdue: overdueTasks.length },
      deliverables: { total: deliverables.length, pendingReview: pendingReviews.length },
      proposals: { total: proposals.length, open: openProposals.length },
      decisions: { total: decisions.length },
      timeEntries: { total: timeEntries.length, todayCount: todayEntries.length, todayMinutes }
    };
  },

  // Export all ERP data
  exportErpData() {
    const types = ['project','task','deliverable','proposal','decision','meeting_erp','time_entry'];
    const data = {};
    types.forEach(t => {
      try { data[t] = JSON.parse(localStorage.getItem(this._erpKey(t)) || '{}'); }
      catch (e) { data[t] = {}; }
    });
    data._meta = this.getErpMeta();
    data._auditLog = JSON.parse(localStorage.getItem('tbo_audit_log') || '[]');
    data._exportedAt = new Date().toISOString();
    return data;
  },

  // Export all data as downloadable JSON
  exportAll() {
    const exportData = {
      context: this.get('context'),
      meetings: this.get('meetings'),
      market: this.get('market'),
      news: this.get('news'),
      sources: this.get('sources'),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tbo_os_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
};

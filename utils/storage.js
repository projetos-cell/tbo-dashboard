// ============================================================================
// TBO OS — Storage Management (Supabase + localStorage adapter)
// Supabase primary, localStorage cache, offline sync queue
// ============================================================================

const TBO_STORAGE = {
  // Data file paths (static JSON — context, meetings, market, etc.)
  paths: {
    context: 'data/context-data.json',
    meetings: 'data/meetings-data.json',
    market: 'data/market-data.json',
    news: 'data/news-data.json',
    sources: 'data/sources.json'
  },

  // In-memory data cache
  _data: {},

  // ERP entity cache (mirrors Supabase tables in localStorage for sync reads)
  _erpCache: {},

  // ═══════════════════════════════════════════════════════════════════════════
  // LOAD ALL — static JSON files + warm ERP cache from Supabase
  // ═══════════════════════════════════════════════════════════════════════════

  async loadAll() {
    // 1. Load static JSON files (context, meetings, market, etc.)
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

    // 2. Load company_context from Supabase (overrides static if available)
    await this._loadCompanyContext();

    // 3. Warm ERP cache from Supabase
    await this._warmErpCache();

    // 4. Process any pending sync queue
    if (typeof TBO_SUPABASE !== 'undefined') {
      TBO_SUPABASE.processSyncQueue();
    }

    // 5. Load financial data from Google Sheets (overrides static JSON)
    await this._loadFromGoogleSheets();

    // 6. Load meeting data from Fireflies API (overrides static JSON)
    await this._loadFromFireflies();

    // 7. Sync deals/contacts from RD Station CRM
    await this._loadFromRdStation();

    return this._data;
  },

  async _loadCompanyContext() {
    if (typeof TBO_SUPABASE === 'undefined' || !TBO_SUPABASE.isOnline()) return;
    try {
      const client = TBO_SUPABASE.getClient();
      if (!client) return;
      const { data, error } = await client.from('company_context').select('*');
      if (!error && data && data.length > 0) {
        // Merge company_context rows into _data.context
        const ctx = this._data.context || {};
        data.forEach(row => {
          ctx[row.key] = row.value;
        });
        this._data.context = ctx;
      }
    } catch (e) {
      console.warn('[TBO Storage] Company context load failed:', e);
    }
  },

  async _loadFromGoogleSheets() {
    if (typeof TBO_SHEETS === 'undefined' || !TBO_SHEETS.isEnabled()) return;
    try {
      const sheetsData = await TBO_SHEETS.syncAll();
      if (!sheetsData) return;

      // Merge fluxo_caixa into context.dados_comerciais[fiscalYear]
      const ctx = this._data.context || {};
      const fy = TBO_CONFIG.app.fiscalYear;
      if (!ctx.dados_comerciais) ctx.dados_comerciais = {};
      if (!ctx.dados_comerciais[fy]) ctx.dados_comerciais[fy] = {};

      if (sheetsData.fluxo_caixa) {
        // Preserve meta_vendas and budget fields from static JSON if Sheets doesn't have them
        const existingFC = ctx.dados_comerciais[fy].fluxo_caixa || {};
        const merged = {
          ...existingFC,        // Static JSON as base
          ...sheetsData.fluxo_caixa  // Sheets data overrides
        };
        // Keep contas_a_receber from Sheets if available, otherwise keep static
        if (sheetsData.fluxo_caixa.contas_a_receber) {
          merged.contas_a_receber = sheetsData.fluxo_caixa.contas_a_receber;
        }
        ctx.dados_comerciais[fy].fluxo_caixa = merged;
      }

      if (sheetsData.custos_por_bu && Object.keys(sheetsData.custos_por_bu).length > 0) {
        ctx.dados_comerciais[fy].custos_por_bu = {
          ...(ctx.dados_comerciais[fy].custos_por_bu || {}),
          ...sheetsData.custos_por_bu
        };
      }

      this._data.context = ctx;
      console.log('[TBO Storage] Financial data merged from Google Sheets');
    } catch (e) {
      console.warn('[TBO Storage] Google Sheets load failed, using static data:', e.message);
    }
  },

  async _loadFromFireflies() {
    if (typeof TBO_FIREFLIES === 'undefined' || !TBO_FIREFLIES.isEnabled()) return;
    try {
      const ffData = await TBO_FIREFLIES.sync();
      if (!ffData || !ffData.meetings || ffData.meetings.length === 0) return;

      // Replace meetings data entirely (Fireflies is source of truth when available)
      this._data.meetings = ffData;
      console.log(`[TBO Storage] Meetings loaded from Fireflies API: ${ffData.meetings.length} meetings`);
    } catch (e) {
      console.warn('[TBO Storage] Fireflies load failed, using static data:', e.message);
    }
  },

  async _loadFromRdStation() {
    if (typeof TBO_RD_STATION === 'undefined' || !TBO_RD_STATION.isEnabled()) return;
    try {
      const result = await TBO_RD_STATION.sync();
      if (result) {
        console.log(`[TBO Storage] RD Station sync: ${result.created} created, ${result.updated} updated, ${result.pushed} pushed, ${result.contacts} contacts`);
      }
    } catch (e) {
      console.warn('[TBO Storage] RD Station sync failed:', e.message);
    }
  },

  async _warmErpCache() {
    const entityTypes = ['project', 'task', 'deliverable', 'proposal', 'decision', 'meeting_erp', 'time_entry'];

    // Try Supabase first
    if (typeof TBO_SUPABASE !== 'undefined' && TBO_SUPABASE.isOnline()) {
      const client = TBO_SUPABASE.getClient();
      if (client) {
        const fetches = entityTypes.map(async (type) => {
          const table = TBO_SUPABASE.getTable(type);
          if (!table) return;
          try {
            const { data, error } = await client.from(table).select('*').order('updated_at', { ascending: false });
            if (!error && data) {
              // Build cache as { id: entity } map
              const map = {};
              data.forEach(row => {
                const entity = this._fromSupabaseRow(type, row);
                map[entity.id] = entity;
              });
              this._erpCache[type] = map;
              // Persist to localStorage as cache
              this._saveErpCacheToLocal(type);
            }
          } catch (e) {
            console.warn(`[TBO Storage] Supabase fetch failed for ${type}:`, e);
          }
        });
        await Promise.all(fetches);
        return;
      }
    }

    // Fallback: load from localStorage
    entityTypes.forEach(type => {
      this._loadErpCacheFromLocal(type);
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ROW MAPPING: Supabase snake_case ↔ App camelCase
  // ═══════════════════════════════════════════════════════════════════════════

  _fromSupabaseRow(entityType, row) {
    // Map Supabase snake_case columns to app's camelCase fields
    const entity = { ...row };

    // Standard timestamp mapping
    if (row.created_at) { entity.createdAt = row.created_at; delete entity.created_at; }
    if (row.updated_at) { entity.updatedAt = row.updated_at; delete entity.updated_at; }

    // Entity-specific mappings
    // owner = display name (owner_name), owner_id = UUID reference
    if (entityType === 'project') {
      if (row.owner_name) { entity.owner = row.owner_name; }
      else if (row.owner_id) { entity.owner = row.owner_id; }
      // Keep owner_id as UUID reference for Supabase writes
      if (row.owner_id) { entity.owner_id = row.owner_id; }
      if (row.next_action_date !== undefined) { entity.next_action_date = row.next_action_date; }
      if (row.planned_cost !== undefined) { entity.planned_cost = row.planned_cost; }
      if (row.playbook_name !== undefined) { entity.playbook_name = row.playbook_name; }
    }
    if (entityType === 'task') {
      if (row.owner_name) { entity.owner = row.owner_name; }
      else if (row.owner_id) { entity.owner = row.owner_id; }
      if (row.owner_id) { entity.owner_id = row.owner_id; }
      if (row.project_id) { entity.project_id = row.project_id; }
      if (row.due_date !== undefined) { entity.due_date = row.due_date; }
      if (row.estimate_minutes !== undefined) { entity.estimate_minutes = row.estimate_minutes; }
    }
    if (entityType === 'deliverable') {
      if (row.owner_name) { entity.owner = row.owner_name; }
      else if (row.owner_id) { entity.owner = row.owner_id; }
      if (row.owner_id) { entity.owner_id = row.owner_id; }
      if (row.project_id) { entity.project_id = row.project_id; }
      if (row.current_version !== undefined) { entity.current_version = row.current_version; }
    }
    if (entityType === 'proposal') {
      if (row.owner_name) { entity.owner = row.owner_name; }
      else if (row.owner_id) { entity.owner = row.owner_id; }
      if (row.owner_id) { entity.owner_id = row.owner_id; }
    }
    if (entityType === 'time_entry') {
      if (row.user_id) { entity.user_id = row.user_id; }
      if (row.project_id) { entity.project_id = row.project_id; }
      if (row.duration_minutes !== undefined) { entity.duration_minutes = row.duration_minutes; }
    }
    if (entityType === 'meeting_erp') {
      if (row.action_items !== undefined) { entity.action_items = row.action_items; }
    }

    // Keep legacy_id for migration reference
    if (row.legacy_id) { entity.legacy_id = row.legacy_id; }

    return entity;
  },

  _toSupabaseRow(entityType, entity) {
    // Map app camelCase fields to Supabase snake_case columns
    const row = {};
    const skip = ['createdAt', 'updatedAt', 'id', '_pendingSync'];

    Object.entries(entity).forEach(([key, val]) => {
      if (skip.includes(key)) return;
      // Map known camelCase → snake_case
      if (key === 'owner' && entityType !== 'meeting_erp') {
        // 'owner' holds display name → goes to owner_name column
        row.owner_name = val || null;
      } else if (key === 'owner_id') {
        // owner_id is already the UUID → goes to owner_id column
        row.owner_id = val || null;
      } else if (key === 'project_name') {
        // project_name is derived, skip for DB
      } else {
        row[key] = val;
      }
    });

    return row;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERIC DATA (context, meetings, market, news, sources)
  // ═══════════════════════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERATION HISTORY (kept in localStorage — not critical for Supabase)
  // ═══════════════════════════════════════════════════════════════════════════

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
    if (history.length > 50) history.pop();
    localStorage.setItem(`tbo_history_${moduleKey}`, JSON.stringify(history));
  },

  clearHistory(moduleKey) {
    localStorage.removeItem(`tbo_history_${moduleKey}`);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTEXT HELPERS (project, client, full context for AI prompts)
  // ═══════════════════════════════════════════════════════════════════════════

  getProjectContext(projectName) {
    const context = this.get('context');
    const meetings = this.get('meetings');

    let projectData = '';

    const active = (context.projetos_ativos || []).find(p =>
      p.nome.toLowerCase().includes(projectName.toLowerCase())
    );
    if (active) {
      projectData += `[PROJETO ATIVO] ${active.nome} | Construtora: ${active.construtora} | BUs: ${(active.bus || []).join(', ')}\n`;
    }

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

  getClientContext(clientName) {
    const context = this.get('context');
    const meetings = this.get('meetings');

    let clientData = `[CLIENTE: ${clientName}]\n`;

    const activeProjects = (context.projetos_ativos || []).filter(p =>
      p.construtora && p.construtora.toLowerCase().includes(clientName.toLowerCase())
    );
    if (activeProjects.length > 0) {
      clientData += `Projetos ativos: ${activeProjects.map(p => p.nome).join(', ')}\n`;
    }

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

  getFullContext() {
    const context = this.get('context');
    const meetings = this.get('meetings');
    const market = this.get('market');

    let full = '';

    const ativos = context.projetos_ativos || [];
    full += `[PROJETOS ATIVOS: ${ativos.length}]\n`;
    ativos.forEach(p => {
      full += `- ${p.nome} (${p.construtora}) — BUs: ${(p.bus || []).join(', ')}\n`;
    });

    if (context.dados_comerciais) {
      const dc = context.dados_comerciais;
      full += `\n[DADOS COMERCIAIS]\n`;
      full += `2024: ${dc['2024']?.propostas || 0} propostas, ${dc['2024']?.conversao_proposta || 'N/A'} conversão, ticket médio R$${dc['2024']?.ticket_medio || 'N/A'}, vendido R$${dc['2024']?.total_vendido || 'N/A'}\n`;
      full += `2025: ${dc['2025']?.propostas || 0} propostas, ${dc['2025']?.conversao_proposta || 'N/A'} conversão, ticket médio R$${dc['2025']?.ticket_medio || 'N/A'}, vendido R$${dc['2025']?.total_vendido || 'N/A'}\n`;

      const fc = dc[TBO_CONFIG.app.fiscalYear]?.fluxo_caixa;
      if (fc) {
        full += `\n[FLUXO DE CAIXA ${TBO_CONFIG.app.fiscalYear}]\n`;
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

    if (market.indicadores_curitiba) {
      const ic = market.indicadores_curitiba;
      full += `\n[MERCADO CURITIBA ${ic.periodo}]\n`;
      full += `Empreendimentos: ${ic.empreendimentos_lancados} (${ic.variacao_empreendimentos})\n`;
      full += `Unidades: ${ic.unidades_lancadas} (${ic.variacao_unidades})\n`;
    }

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

  // ═══════════════════════════════════════════════════════════════════════════
  // CRM Data Management (Pipeline / Deals)
  // Now: Supabase crm_deals + crm_stages, localStorage fallback
  // ═══════════════════════════════════════════════════════════════════════════

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

    // Async Supabase write
    this._crmDealToSupabase('insert', newDeal);

    // Async RD Station push (only if enabled and deal is not from RD)
    if (typeof TBO_RD_STATION !== 'undefined' && TBO_RD_STATION.isEnabled()) {
      if (newDeal.source !== 'rd_sync') {
        TBO_RD_STATION.pushDealCreate(newDeal).then(r => {
          if (r && r.id) {
            this.updateCrmDeal(id, { rdDealId: String(r.id) });
          }
        }).catch(e => {
          console.warn('[TBO Storage] RD Station push failed:', e.message);
        });
      }
    }

    return newDeal;
  },

  updateCrmDeal(id, updates) {
    const data = this.getCrmData();
    if (!data.deals[id]) return null;
    Object.assign(data.deals[id], updates, { updatedAt: new Date().toISOString() });
    this.saveCrmData(data);

    // Async Supabase write
    this._crmDealToSupabase('update', data.deals[id]);

    // Async RD Station push (only if deal has rdDealId and is not rd_sync source)
    if (typeof TBO_RD_STATION !== 'undefined' && TBO_RD_STATION.isEnabled()) {
      const deal = data.deals[id];
      if (deal.rdDealId && deal.source !== 'rd_sync') {
        TBO_RD_STATION.pushDealUpdate(deal).catch(e => {
          console.warn('[TBO Storage] RD Station update push failed:', e.message);
        });
      }
    }

    return data.deals[id];
  },

  deleteCrmDeal(id) {
    const data = this.getCrmData();
    if (!data.deals[id]) return false;
    delete data.deals[id];
    this.saveCrmData(data);

    // Async Supabase write
    this._crmDealToSupabase('delete', { id });

    return true;
  },

  _crmDealToSupabase(action, deal) {
    if (typeof TBO_SUPABASE === 'undefined') return;
    const client = TBO_SUPABASE.getClient();
    if (!client || !TBO_SUPABASE.isOnline()) {
      TBO_SUPABASE.addToSyncQueue({ table: 'crm_deals', action, entity: deal, id: deal.id });
      return;
    }

    // Fire-and-forget async write
    (async () => {
      try {
        if (action === 'insert') {
          const row = {
            name: deal.name,
            company: deal.company,
            contact: deal.contact,
            contact_email: deal.contactEmail,
            stage: deal.stage,
            value: deal.value,
            probability: deal.probability,
            services: deal.services,
            owner_id: deal.owner || null,
            notes: deal.notes,
            source: deal.source,
            rd_deal_id: deal.rdDealId,
            margin: deal.margin,
            cost: deal.cost,
            risk_flag: deal.riskFlag,
            priority: deal.priority,
            expected_close: deal.expectedClose || null,
            activities: deal.activities || [],
            legacy_id: deal.id
          };
          await client.from('crm_deals').insert(row);
        } else if (action === 'update') {
          // Find by legacy_id
          const row = {
            name: deal.name,
            company: deal.company,
            stage: deal.stage,
            value: deal.value,
            probability: deal.probability,
            services: deal.services,
            owner_id: deal.owner || null,
            notes: deal.notes,
            risk_flag: deal.riskFlag,
            priority: deal.priority,
            expected_close: deal.expectedClose || null
          };
          await client.from('crm_deals').update(row).eq('legacy_id', deal.id);
        } else if (action === 'delete') {
          await client.from('crm_deals').delete().eq('legacy_id', deal.id);
        }
      } catch (e) {
        console.warn('[TBO Storage] CRM Supabase write failed:', e);
        TBO_SUPABASE.addToSyncQueue({ table: 'crm_deals', action, entity: deal, id: deal.id });
      }
    })();
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

  // ═══════════════════════════════════════════════════════════════════════════
  // ERP Entity CRUD — Supabase primary, localStorage cache
  // Sync reads from cache, async writes to Supabase + cache update
  // ═══════════════════════════════════════════════════════════════════════════

  _erpKey(entityType) {
    return `tbo_erp_${entityType}`;
  },

  _saveErpCacheToLocal(entityType) {
    try {
      const map = this._erpCache[entityType] || {};
      localStorage.setItem(this._erpKey(entityType), JSON.stringify(map));
    } catch (e) {
      console.warn(`[TBO Storage] localStorage save failed for ${entityType}:`, e);
    }
  },

  _loadErpCacheFromLocal(entityType) {
    try {
      const raw = localStorage.getItem(this._erpKey(entityType));
      this._erpCache[entityType] = raw ? JSON.parse(raw) : {};
    } catch (e) {
      this._erpCache[entityType] = {};
    }
  },

  initErpStorage() {
    const types = ['project', 'task', 'deliverable', 'proposal', 'decision', 'meeting_erp', 'time_entry'];
    types.forEach(t => {
      if (!this._erpCache[t]) {
        this._loadErpCacheFromLocal(t);
      }
      // Ensure localStorage key exists for legacy compat
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

  // ── SYNC READS (from cache) ─────────────────────────────────────────────

  getAllErpEntities(entityType) {
    const map = this._erpCache[entityType];
    if (!map) {
      // Fallback: try localStorage directly
      try {
        const raw = localStorage.getItem(this._erpKey(entityType));
        if (!raw) return [];
        const data = JSON.parse(raw);
        this._erpCache[entityType] = data;
        return Object.values(data).sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''));
      } catch (e) { return []; }
    }
    return Object.values(map).sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''));
  },

  getErpEntity(entityType, id) {
    const map = this._erpCache[entityType];
    if (map && map[id]) return map[id];

    // Fallback: try localStorage
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

  // ── WRITE OPERATIONS (cache + async Supabase) ──────────────────────────

  addErpEntity(entityType, entity) {
    try {
      const id = entityType.charAt(0) + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
      const now = new Date().toISOString();
      const newEntity = {
        ...entity,
        id,
        createdAt: now,
        updatedAt: now
      };

      // Update in-memory cache
      if (!this._erpCache[entityType]) this._erpCache[entityType] = {};
      this._erpCache[entityType][id] = newEntity;

      // Persist to localStorage cache
      this._saveErpCacheToLocal(entityType);

      // Async Supabase write
      this._erpToSupabase('insert', entityType, newEntity);

      return newEntity;
    } catch (e) {
      console.warn(`ERP add error for ${entityType}:`, e);
      return null;
    }
  },

  updateErpEntity(entityType, id, updates) {
    try {
      // Update in cache
      if (!this._erpCache[entityType]) this._loadErpCacheFromLocal(entityType);
      const map = this._erpCache[entityType] || {};
      if (!map[id]) {
        // Try localStorage
        const raw = localStorage.getItem(this._erpKey(entityType));
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data[id]) return null;
        map[id] = data[id];
      }

      Object.assign(map[id], updates, { updatedAt: new Date().toISOString() });
      this._erpCache[entityType] = map;

      // Persist to localStorage cache
      this._saveErpCacheToLocal(entityType);

      // Async Supabase write
      this._erpToSupabase('update', entityType, map[id], updates);

      return map[id];
    } catch (e) {
      console.warn(`ERP update error for ${entityType}:`, e);
      return null;
    }
  },

  deleteErpEntity(entityType, id) {
    try {
      if (!this._erpCache[entityType]) this._loadErpCacheFromLocal(entityType);
      const map = this._erpCache[entityType] || {};
      if (!map[id]) {
        // Try localStorage
        const raw = localStorage.getItem(this._erpKey(entityType));
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (!data[id]) return false;
      }

      delete map[id];
      this._erpCache[entityType] = map;

      // Persist to localStorage cache
      this._saveErpCacheToLocal(entityType);

      // Async Supabase write
      this._erpToSupabase('delete', entityType, { id });

      return true;
    } catch (e) { return false; }
  },

  // ── SUPABASE ASYNC WRITE (fire-and-forget) ─────────────────────────────

  _erpToSupabase(action, entityType, entity, updates) {
    if (typeof TBO_SUPABASE === 'undefined') return;
    const table = TBO_SUPABASE.getTable(entityType);
    if (!table) return;

    const client = TBO_SUPABASE.getClient();
    if (!client || !TBO_SUPABASE.isOnline()) {
      TBO_SUPABASE.addToSyncQueue({
        table, action, entityType,
        entity: action === 'insert' ? entity : undefined,
        updates: action === 'update' ? updates : undefined,
        id: entity.id
      });
      return;
    }

    // Fire-and-forget
    (async () => {
      try {
        if (action === 'insert') {
          const row = this._toSupabaseRow(entityType, entity);
          row.legacy_id = entity.id;
          await client.from(table).insert(row);
        } else if (action === 'update') {
          const row = this._toSupabaseRow(entityType, updates || {});
          row.updated_at = new Date().toISOString();
          // Try by legacy_id first (pre-migration entities)
          const { data: existing } = await client.from(table).select('id').eq('legacy_id', entity.id).maybeSingle();
          if (existing) {
            await client.from(table).update(row).eq('id', existing.id);
          } else {
            // May be a UUID id already in Supabase
            await client.from(table).update(row).eq('id', entity.id);
          }
        } else if (action === 'delete') {
          const { data: existing } = await client.from(table).select('id').eq('legacy_id', entity.id).maybeSingle();
          if (existing) {
            await client.from(table).delete().eq('id', existing.id);
          } else {
            await client.from(table).delete().eq('id', entity.id);
          }
        }
      } catch (e) {
        console.warn(`[TBO Storage] Supabase ${action} failed for ${entityType}:`, e);
        TBO_SUPABASE.addToSyncQueue({
          table, action, entityType,
          entity: action === 'insert' ? entity : undefined,
          updates: action === 'update' ? updates : undefined,
          id: entity.id
        });
      }
    })();
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIMER SINGLETON HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════════════════════
  // ERP CONTEXT FOR AI PROMPTS
  // ═══════════════════════════════════════════════════════════════════════════

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

  getErpSummary() {
    const projects = this.getAllErpEntities('project');
    const tasks = this.getAllErpEntities('task');
    const deliverables = this.getAllErpEntities('deliverable');
    const proposals = this.getAllErpEntities('proposal');
    const decisions = this.getAllErpEntities('decision');

    const activeProjects = projects.filter(p => !['finalizado', 'cancelado'].includes(p.status));
    const pendingTasks = tasks.filter(t => t.status !== 'concluida' && t.status !== 'cancelada');
    const overdueTasks = pendingTasks.filter(t => t.due_date && new Date(t.due_date) < new Date());
    const pendingReviews = deliverables.filter(d => d.status === 'em_revisao');
    const openProposals = proposals.filter(p => !['recusada', 'convertida'].includes(p.status));

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

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPORT (includes both localStorage and Supabase data)
  // ═══════════════════════════════════════════════════════════════════════════

  exportErpData() {
    const types = ['project', 'task', 'deliverable', 'proposal', 'decision', 'meeting_erp', 'time_entry'];
    const data = {};
    types.forEach(t => {
      data[t] = this._erpCache[t] || {};
    });
    data._meta = this.getErpMeta();
    data._auditLog = JSON.parse(localStorage.getItem('tbo_audit_log') || '[]');
    data._exportedAt = new Date().toISOString();
    return data;
  },

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
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FORCE REFRESH — Re-fetch all ERP data from Supabase
  // ═══════════════════════════════════════════════════════════════════════════

  async refreshFromSupabase() {
    await this._warmErpCache();
    console.log('[TBO Storage] ERP cache refreshed from Supabase');
  }
};

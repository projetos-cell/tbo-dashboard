// TBO OS — Module: Configuracoes
const TBO_CONFIGURACOES = {
  render() {
    const apiKey = TBO_API.getApiKey();
    const model = TBO_API.getModel();
    const maskedKey = apiKey ? apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4) : '';

    return `
      <div class="configuracoes-module">
        <div class="grid-2" style="gap:24px;">
          <!-- API Settings -->
          <div>
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">API Claude</h3>
                <span class="tag ${apiKey ? 'gold' : ''}">${apiKey ? 'Configurada' : 'Nao configurada'}</span>
              </div>

              <div class="form-group">
                <label class="form-label">Chave de API</label>
                <input type="password" class="form-input" id="cfgApiKey" value="${apiKey}" placeholder="sk-ant-api03-...">
                <div class="form-hint">Sua chave fica armazenada localmente no navegador (localStorage).</div>
              </div>

              <div class="form-group">
                <label class="form-label">Modelo</label>
                <select class="form-input" id="cfgModel">
                  <option value="claude-sonnet-4-20250514" ${model === 'claude-sonnet-4-20250514' ? 'selected' : ''}>Claude Sonnet 4 (recomendado)</option>
                  <option value="claude-opus-4-20250514" ${model === 'claude-opus-4-20250514' ? 'selected' : ''}>Claude Opus 4</option>
                  <option value="claude-haiku-4-20250414" ${model === 'claude-haiku-4-20250414' ? 'selected' : ''}>Claude Haiku 4 (rapido/economico)</option>
                </select>
              </div>

              <button class="btn btn-primary" id="cfgSaveApi" style="width:100%;">Salvar Configuracoes de API</button>
            </div>

            <!-- Data Management -->
            <div class="card" style="margin-top:16px;">
              <div class="card-header"><h3 class="card-title">Gerenciamento de Dados</h3></div>

              <div style="display:flex; flex-direction:column; gap:8px;">
                <button class="btn btn-secondary" id="cfgReloadData">
                  Recarregar Dados dos JSONs
                </button>
                <button class="btn btn-secondary" id="cfgExportData">
                  Exportar Todos os Dados (JSON)
                </button>
                <button class="btn btn-secondary" id="cfgClearCache">
                  Limpar Cache da API
                </button>
                <button class="btn btn-secondary" id="cfgClearAllHistory" style="color:var(--status-error);">
                  Limpar Todo Historico
                </button>
              </div>
            </div>
          </div>

          <!-- Status & Info -->
          <div>
            <div class="card">
              <div class="card-header"><h3 class="card-title">Status do Sistema</h3></div>

              <div id="cfgStatus">
                ${this._renderStatus()}
              </div>
            </div>

            <!-- Sources Config -->
            <div class="card" style="margin-top:16px;">
              <div class="card-header"><h3 class="card-title">Fontes de Dados</h3></div>
              <div id="cfgSources">
                ${this._renderSources()}
              </div>
            </div>

            <!-- About -->
            <div class="card" style="margin-top:16px;">
              <div class="card-header"><h3 class="card-title">Sobre o TBO OS</h3></div>
              <div style="font-size:0.82rem; color:var(--text-secondary); line-height:1.8;">
                <p><strong>TBO OS</strong> — Sistema Operacional do Studio TBO</p>
                <p>Versao: 1.0.0</p>
                <p>Desenvolvido para centralizar processos operacionais, comerciais e criativos.</p>
                <p style="margin-top:8px;">
                  <strong>Tecnologias:</strong> HTML5, CSS3, JavaScript (Vanilla), Claude API
                </p>
                <p><strong>Dados:</strong> Google Drive, Notion, Fireflies, Web Scraping (via IA)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  _renderStatus() {
    const context = TBO_STORAGE.get('context');
    const meetings = TBO_STORAGE.get('meetings');
    const market = TBO_STORAGE.get('market');
    const meetingsArr = meetings.meetings || meetings.reunioes_recentes || [];
    const meta = meetings.metadata || meetings._metadata;

    const items = [
      { label: 'API Claude', ok: TBO_API.isConfigured() },
      { label: 'Dados de Contexto', ok: !!(context.projetos_ativos?.length) },
      { label: 'Dados de Reunioes (Fireflies)', ok: meetingsArr.length > 0 },
      { label: 'Dados de Mercado', ok: !!market.indicadores_curitiba },
      { label: 'Projetos Ativos', detail: `${(context.projetos_ativos || []).length} projetos` },
      { label: 'Clientes', detail: `${(context.clientes_construtoras || []).length} construtoras` },
      { label: 'Reunioes', detail: `${meetingsArr.length} registradas` }
    ];

    let html = items.map(item => `
      <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-subtle);">
        <span style="font-size:0.82rem;">${item.label}</span>
        ${item.ok !== undefined
          ? `<span class="tag ${item.ok ? 'gold' : ''}">${item.ok ? 'OK' : 'Pendente'}</span>`
          : `<span style="font-size:0.78rem; color:var(--text-tertiary);">${item.detail}</span>`
        }
      </div>
    `).join('');

    // Fireflies details section
    if (meetingsArr.length > 0) {
      const catDist = meta?.category_distribution || {};
      const dateRange = meta?.date_range;
      const fromDate = dateRange?.from ? new Date(dateRange.from).toLocaleDateString('pt-BR') : '-';
      const toDate = dateRange?.to ? new Date(dateRange.to).toLocaleDateString('pt-BR') : '-';
      const totalMin = meta?.total_minutes || Math.round(meetingsArr.reduce((s, m) => s + (m.duration_minutes || 0), 0));
      const catLabels = {
        cliente: 'Cliente', daily_socios: 'Daily Socios', alinhamento_interno: 'Interno',
        review_projeto: 'Review', estrategia: 'Estrategia', producao: 'Producao',
        audio_whatsapp: 'Audio/WhatsApp', outros: 'Outros'
      };

      html += `
        <div style="margin-top:16px; padding-top:12px; border-top:2px solid var(--accent);">
          <div style="font-size:0.85rem; font-weight:600; margin-bottom:8px; color:var(--accent);">Fireflies — Detalhes</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:0.78rem; color:var(--text-secondary);">
            <span>Conta:</span><span style="color:var(--text-primary);">${meta?.account_email || 'marco@agenciatbo.com.br'}</span>
            <span>Total reunioes:</span><span style="color:var(--text-primary);">${meetingsArr.length}</span>
            <span>Total minutos:</span><span style="color:var(--text-primary);">${totalMin} min</span>
            <span>Periodo:</span><span style="color:var(--text-primary);">${fromDate} a ${toDate}</span>
          </div>
          <div style="margin-top:10px; font-size:0.78rem; color:var(--text-secondary);">
            <div style="font-weight:600; margin-bottom:4px;">Categorias:</div>
            ${Object.entries(catDist).map(([cat, count]) => `
              <div style="display:flex; justify-content:space-between; padding:2px 0;">
                <span>${catLabels[cat] || cat}</span>
                <span class="tag" style="font-size:0.7rem;">${count}</span>
              </div>
            `).join('')}
          </div>
          <div style="margin-top:10px; display:flex; gap:8px;">
            <button class="btn btn-secondary" id="cfgViewMeetings" style="font-size:0.75rem; padding:4px 10px;">Visualizar reunioes</button>
            <button class="btn btn-secondary" id="cfgResyncFF" style="font-size:0.75rem; padding:4px 10px;">Re-sincronizar</button>
          </div>
        </div>
      `;
    }

    return html;
  },

  _renderSources() {
    const sources = TBO_STORAGE.get('sources');
    const allSources = [...(sources.market_sources || []), ...(sources.news_sources || [])];

    if (allSources.length === 0) return '<div class="empty-state"><div class="empty-state-text">Nenhuma fonte configurada</div></div>';

    return allSources.map(s => `
      <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-subtle);">
        <div>
          <div style="font-size:0.82rem;">${s.name}</div>
          <div style="font-size:0.7rem; color:var(--text-tertiary);">${s.type} — ${s.frequency}</div>
        </div>
        <span class="tag ${s.active ? 'gold' : ''}">${s.active ? 'Ativa' : 'Inativa'}</span>
      </div>
    `).join('');
  },

  init() {
    // Save API settings
    this._bind('cfgSaveApi', () => {
      const key = document.getElementById('cfgApiKey')?.value || '';
      const model = document.getElementById('cfgModel')?.value || '';

      TBO_API.setApiKey(key);
      if (model) TBO_API.setModel(model);

      TBO_APP._updateStatus();
      TBO_TOAST.success('Salvo', 'Configuracoes de API atualizadas.');
    });

    // Reload data
    this._bind('cfgReloadData', async () => {
      TBO_TOAST.info('Recarregando', 'Carregando dados dos JSONs...');
      try {
        await TBO_STORAGE.loadAll();
        TBO_APP._updateStatus();
        TBO_TOAST.success('Dados recarregados');
        // Refresh status display
        const statusEl = document.getElementById('cfgStatus');
        if (statusEl) statusEl.innerHTML = this._renderStatus();
      } catch (e) {
        TBO_TOAST.error('Erro', e.message);
      }
    });

    // Export data
    this._bind('cfgExportData', () => {
      TBO_STORAGE.exportAll();
      TBO_TOAST.success('Exportado', 'Arquivo JSON baixado.');
    });

    // Clear API cache with confirmation
    this._bind('cfgClearCache', () => {
      if (typeof TBO_UX !== 'undefined') {
        TBO_UX.confirm('Limpar cache', 'Tem certeza que deseja limpar o cache da API?', () => {
          TBO_API.clearCache();
          TBO_TOAST.info('Cache limpo');
        }, { confirmText: 'Limpar' });
      } else {
        TBO_API.clearCache();
        TBO_TOAST.info('Cache limpo');
      }
    });

    // Clear all history with confirmation
    this._bind('cfgClearAllHistory', () => {
      if (typeof TBO_UX !== 'undefined') {
        TBO_UX.confirm('Limpar todo historico', 'Isso removera permanentemente o historico de geracoes de todos os modulos. Continuar?', () => {
          const modules = ['command-center', 'conteudo', 'comercial', 'projetos', 'mercado', 'reunioes', 'financeiro'];
          modules.forEach(m => TBO_STORAGE.clearHistory(m));
          TBO_TOAST.success('Historico limpo', 'Todo o historico de geracoes foi removido.');
        }, { danger: true, confirmText: 'Limpar tudo' });
      } else {
        const modules = ['command-center', 'conteudo', 'comercial', 'projetos', 'mercado', 'reunioes', 'financeiro'];
        modules.forEach(m => TBO_STORAGE.clearHistory(m));
        TBO_TOAST.success('Historico limpo', 'Todo o historico de geracoes foi removido.');
      }
    });

    // View meetings list
    this._bind('cfgViewMeetings', () => {
      const meetings = TBO_STORAGE.get('meetings');
      const arr = meetings.meetings || [];
      if (arr.length === 0) { TBO_TOAST.info('Sem dados', 'Nenhuma reuniao encontrada.'); return; }
      const catLabels = {
        cliente: 'Cliente', daily_socios: 'Daily', alinhamento_interno: 'Interno',
        review_projeto: 'Review', estrategia: 'Estrategia', producao: 'Producao',
        audio_whatsapp: 'Audio', outros: 'Outros'
      };
      const html = arr.map(m => {
        const d = new Date(m.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
        const dur = Math.round(m.duration_minutes || 0);
        return `<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-subtle);font-size:0.8rem;">
          <div><strong>${m.title}</strong><br><span style="color:var(--text-tertiary);font-size:0.72rem;">${d} — ${dur} min</span></div>
          <span class="tag" style="font-size:0.68rem;">${catLabels[m.category] || m.category}</span>
        </div>`;
      }).join('');
      TBO_MODAL.show('Reunioes Fireflies', `<div style="max-height:400px;overflow-y:auto;">${html}</div>`);
    });

    // Re-sync fireflies
    this._bind('cfgResyncFF', () => {
      TBO_TOAST.info('Re-sincronizacao', 'Para re-sincronizar reunioes do Fireflies, re-execute a Fase 3 no Claude Code.');
    });
  },

  _bind(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  }
};

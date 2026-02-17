// TBO OS — Module: Configuracoes
const TBO_CONFIGURACOES = {
  render() {
    const provider = TBO_API.getProvider();
    const apiKey = TBO_API.getApiKey();
    const model = TBO_API.getModel();
    const models = TBO_API.getAvailableModels();
    const openaiKey = TBO_API.getApiKeyFor('openai');
    const claudeKey = TBO_API.getApiKeyFor('claude') || localStorage.getItem('tbo_api_key') || '';
    const isOpenAI = provider === 'openai';

    return `
      <div class="configuracoes-module">
        <div class="grid-2" style="gap:24px;">
          <!-- API Settings -->
          <div>
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Inteligencia Artificial</h3>
                <span class="tag ${apiKey ? 'gold' : ''}">${apiKey ? TBO_API.getProviderLabel() : 'Nao configurada'}</span>
              </div>

              <!-- Provider Selector -->
              <div class="form-group">
                <label class="form-label">Provedor de IA</label>
                <div style="display:flex;gap:8px;">
                  <button class="btn ${isOpenAI ? 'btn-primary' : 'btn-secondary'}" id="cfgProviderOpenAI" style="flex:1;font-size:0.78rem;padding:10px;">
                    <span style="font-size:1.1rem;">&#x1F916;</span><br>OpenAI (ChatGPT)
                  </button>
                  <button class="btn ${!isOpenAI ? 'btn-primary' : 'btn-secondary'}" id="cfgProviderClaude" style="flex:1;font-size:0.78rem;padding:10px;">
                    <span style="font-size:1.1rem;">&#x2728;</span><br>Anthropic (Claude)
                  </button>
                </div>
                <div class="form-hint">Selecione qual IA sera usada para gerar conteudo, briefings e analises.</div>
              </div>

              <!-- OpenAI Config -->
              <div id="cfgOpenAISection" style="${isOpenAI ? '' : 'display:none;'}">
                <div class="form-group">
                  <label class="form-label">Chave OpenAI</label>
                  <input type="password" class="form-input" id="cfgOpenAIKey" value="${openaiKey}" placeholder="sk-proj-...">
                  <div class="form-hint">Obtenha em <a href="https://platform.openai.com/api-keys" target="_blank" style="color:var(--accent);">platform.openai.com/api-keys</a></div>
                </div>
                <div class="form-group">
                  <label class="form-label">Modelo OpenAI</label>
                  <select class="form-input" id="cfgOpenAIModel">
                    ${models.openai.map(m => `<option value="${m.id}" ${(localStorage.getItem('tbo_model_openai') || 'gpt-4o') === m.id ? 'selected' : ''}>${m.label}</option>`).join('')}
                  </select>
                </div>
              </div>

              <!-- Claude Config -->
              <div id="cfgClaudeSection" style="${!isOpenAI ? '' : 'display:none;'}">
                <div class="form-group">
                  <label class="form-label">Chave Claude</label>
                  <input type="password" class="form-input" id="cfgClaudeKey" value="${claudeKey}" placeholder="sk-ant-api03-...">
                  <div class="form-hint">Obtenha em <a href="https://console.anthropic.com/" target="_blank" style="color:var(--accent);">console.anthropic.com</a></div>
                </div>
                <div class="form-group">
                  <label class="form-label">Modelo Claude</label>
                  <select class="form-input" id="cfgClaudeModel">
                    ${models.claude.map(m => `<option value="${m.id}" ${(localStorage.getItem('tbo_model') || 'claude-sonnet-4-20250514') === m.id ? 'selected' : ''}>${m.label}</option>`).join('')}
                  </select>
                </div>
              </div>

              <button class="btn btn-primary" id="cfgSaveApi" style="width:100%;margin-top:8px;">Salvar Configuracoes de IA</button>

              <!-- Test API -->
              <button class="btn btn-secondary" id="cfgTestApi" style="width:100%;margin-top:8px;font-size:0.78rem;">
                &#9889; Testar Conexao
              </button>
              <div id="cfgTestResult" style="margin-top:8px;font-size:0.78rem;display:none;"></div>
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
                <p>Versao: <strong>${TBO_CONFIG.app.version}</strong></p>
                <p>Desenvolvido para centralizar processos operacionais, comerciais e criativos.</p>
                <p style="margin-top:8px;">
                  <strong>Tecnologias:</strong> HTML5, CSS3, JavaScript (Vanilla), Claude API, OpenAI API
                </p>
                <p><strong>Dados:</strong> Google Drive, Notion, Fireflies, Web Scraping (via IA)</p>
                <p style="margin-top:12px;"><strong>IA ativa:</strong> ${TBO_API.getProviderLabel()} (${TBO_API.getModel()})</p>
              </div>
              <!-- Social Links -->
              <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border-subtle);">
                <div style="font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted);margin-bottom:8px;">Redes Sociais TBO</div>
                <div style="display:flex;gap:10px;flex-wrap:wrap;">
                  <a href="https://www.instagram.com/tbo.arq/" target="_blank" class="btn btn-secondary" style="font-size:0.72rem;padding:6px 12px;text-decoration:none;display:flex;align-items:center;gap:4px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
                    Instagram
                  </a>
                  <a href="https://www.linkedin.com/company/tbo-studio/" target="_blank" class="btn btn-secondary" style="font-size:0.72rem;padding:6px 12px;text-decoration:none;display:flex;align-items:center;gap:4px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                    LinkedIn
                  </a>
                  <a href="https://www.behance.net/tbo_studio" target="_blank" class="btn btn-secondary" style="font-size:0.72rem;padding:6px 12px;text-decoration:none;display:flex;align-items:center;gap:4px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12.5C1 12.5 3 5 8.5 5c3 0 4 2 4 4s-2 4-4 4H1v-0.5zM13 12.5c0 0 2-7 7-7 3 0 4 2 4 4s-2 4-4 4h-7v-1z"/></svg>
                    Behance
                  </a>
                  <a href="https://agenciatbo.com.br" target="_blank" class="btn btn-secondary" style="font-size:0.72rem;padding:6px 12px;text-decoration:none;display:flex;align-items:center;gap:4px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    Website
                  </a>
                </div>
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
    // Provider toggle
    this._bind('cfgProviderOpenAI', () => {
      TBO_API.setProvider('openai');
      document.getElementById('cfgOpenAISection').style.display = '';
      document.getElementById('cfgClaudeSection').style.display = 'none';
      document.getElementById('cfgProviderOpenAI').className = 'btn btn-primary';
      document.getElementById('cfgProviderClaude').className = 'btn btn-secondary';
      TBO_TOAST.info('Provedor alterado', 'OpenAI (ChatGPT) selecionado como provedor de IA.');
      TBO_APP._updateStatus();
    });
    this._bind('cfgProviderClaude', () => {
      TBO_API.setProvider('claude');
      document.getElementById('cfgOpenAISection').style.display = 'none';
      document.getElementById('cfgClaudeSection').style.display = '';
      document.getElementById('cfgProviderOpenAI').className = 'btn btn-secondary';
      document.getElementById('cfgProviderClaude').className = 'btn btn-primary';
      TBO_TOAST.info('Provedor alterado', 'Anthropic (Claude) selecionado como provedor de IA.');
      TBO_APP._updateStatus();
    });

    // Save API settings
    this._bind('cfgSaveApi', () => {
      const provider = TBO_API.getProvider();
      if (provider === 'openai') {
        const key = document.getElementById('cfgOpenAIKey')?.value || '';
        const model = document.getElementById('cfgOpenAIModel')?.value || '';
        TBO_API.setApiKeyFor('openai', key);
        if (model) { localStorage.setItem('tbo_model_openai', model); }
        // Also set as main key so isConfigured() works
        localStorage.setItem('tbo_api_key', key);
      } else {
        const key = document.getElementById('cfgClaudeKey')?.value || '';
        const model = document.getElementById('cfgClaudeModel')?.value || '';
        TBO_API.setApiKeyFor('claude', key);
        if (model) { localStorage.setItem('tbo_model', model); }
        localStorage.setItem('tbo_api_key', key);
      }
      TBO_APP._updateStatus();
      TBO_TOAST.success('Salvo', `Configuracoes de IA (${TBO_API.getProviderLabel()}) atualizadas.`);
    });

    // Test API connection
    this._bind('cfgTestApi', async () => {
      const resultEl = document.getElementById('cfgTestResult');
      if (!resultEl) return;
      resultEl.style.display = 'block';
      resultEl.innerHTML = '<span style="color:var(--accent);">Testando conexao...</span>';
      try {
        const result = await TBO_API.call(
          'Responda apenas: "Conexao OK. Provedor: [seu nome]."',
          'Teste de conexao. Responda em uma unica frase curta.',
          { maxTokens: 100 }
        );
        resultEl.innerHTML = `<span style="color:#22c55e;">&#10003; Sucesso!</span> <span style="color:var(--text-muted);">${result.model} — ${result.provider || TBO_API.getProvider()}</span>`;
      } catch (e) {
        resultEl.innerHTML = `<span style="color:#ef4444;">&#10007; Erro: ${e.message}</span>`;
      }
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

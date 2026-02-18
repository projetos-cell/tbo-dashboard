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
            ${typeof TBO_AUTH !== 'undefined' && TBO_AUTH.getCurrentUser()?.role === 'founder' ? this._renderUserManagement() : ''}
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

            <!-- Backup & Recovery -->
            <div class="card" style="margin-top:16px;">
              <div class="card-header"><h3 class="card-title">Backup & Recuperacao</h3></div>
              <div id="cfgBackupSection">
                ${this._renderBackupSection()}
              </div>
            </div>

            <!-- Audit Log -->
            <div class="card" style="margin-top:16px;">
              <div class="card-header">
                <h3 class="card-title">Audit Log</h3>
                <span class="tag" id="cfgAuditCount">--</span>
              </div>
              <div id="cfgAuditSection">
                ${this._renderAuditSection()}
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

  _renderUserManagement() {
    const roleColors = {
      founder: '#E85102',
      project_owner: '#8b5cf6',
      comercial: '#f59e0b',
      artist: '#3a7bd5',
      finance: '#2ecc71'
    };
    const roleLabels = {
      founder: 'Fundador',
      project_owner: 'Project Owner',
      comercial: 'Comercial',
      artist: 'Artista',
      finance: 'Financeiro'
    };

    const users = this._users || [];
    const rows = users.map(u => {
      const initials = (u.full_name || u.username || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      const roleBg = roleColors[u.role] || '#6b7280';
      const roleLabel = roleLabels[u.role] || u.role || 'N/A';
      const isActive = u.is_active !== false;
      return `<tr style="border-bottom:1px solid var(--border-subtle);">
        <td style="padding:10px 8px;">
          <div style="width:32px;height:32px;border-radius:50%;background:${roleBg};color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:700;">${initials}</div>
        </td>
        <td style="padding:10px 8px;font-size:0.82rem;color:var(--text-primary);font-weight:500;">${u.full_name || '-'}</td>
        <td style="padding:10px 8px;font-size:0.78rem;color:var(--text-secondary);">${u.username || '-'}</td>
        <td style="padding:10px 8px;">
          <span class="tag" style="background:${roleBg}22;color:${roleBg};border:1px solid ${roleBg}44;font-size:0.72rem;">${roleLabel}</span>
        </td>
        <td style="padding:10px 8px;font-size:0.78rem;color:var(--text-secondary);">${u.bu || '-'}</td>
        <td style="padding:10px 8px;text-align:center;">
          <label class="user-toggle">
            <input type="checkbox" data-userid="${u.id}" ${isActive ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </td>
        <td style="padding:10px 8px;text-align:center;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${isActive ? '#22c55e' : '#ef4444'};"></span>
        </td>
      </tr>`;
    }).join('');

    return `
      <style>
        .user-toggle { position:relative; display:inline-block; width:36px; height:20px; }
        .user-toggle input { opacity:0; width:0; height:0; }
        .user-toggle .slider { position:absolute; cursor:pointer; inset:0; background:#ccc; border-radius:20px; transition:.3s; }
        .user-toggle .slider:before { content:''; position:absolute; height:14px; width:14px; left:3px; bottom:3px; background:white; border-radius:50%; transition:.3s; }
        .user-toggle input:checked + .slider { background:#22c55e; }
        .user-toggle input:checked + .slider:before { transform:translateX(16px); }
      </style>
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header">
          <h3 class="card-title">Gestao de Usuarios</h3>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-primary" id="cfgAddUser" style="font-size:0.72rem;padding:4px 12px;">+ Novo Usuario</button>
            <button class="btn btn-secondary" id="cfgReloadUsers" style="font-size:0.72rem;padding:4px 10px;">Recarregar</button>
          </div>
        </div>
        <!-- Summary badges -->
        <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;" id="cfgUserSummary">
          ${(() => {
            const total = users.length;
            const active = users.filter(u => u.is_active !== false).length;
            const inactive = total - active;
            const roleCounts = {};
            users.forEach(u => { roleCounts[u.role] = (roleCounts[u.role] || 0) + 1; });
            let badges = '';
            badges += '<span style="font-size:0.72rem;padding:4px 10px;border-radius:12px;background:var(--bg-tertiary);color:var(--text-primary);font-weight:600;">' + total + ' total</span>';
            badges += '<span style="font-size:0.72rem;padding:4px 10px;border-radius:12px;background:#22c55e22;color:#22c55e;font-weight:600;">' + active + ' ativos</span>';
            badges += '<span style="font-size:0.72rem;padding:4px 10px;border-radius:12px;background:#ef444422;color:#ef4444;font-weight:600;">' + inactive + ' inativos</span>';
            Object.entries(roleCounts).forEach(([role, count]) => {
              const color = roleColors[role] || '#6b7280';
              const label = roleLabels[role] || role;
              badges += '<span style="font-size:0.72rem;padding:4px 10px;border-radius:12px;background:' + color + '18;color:' + color + ';font-weight:500;">' + count + ' ' + label + '</span>';
            });
            return badges;
          })()}
        </div>
        <div id="cfgUserTable" style="overflow-x:auto;">
          ${users.length > 0 ? `
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:2px solid var(--border-subtle);">
                <th style="padding:8px;font-size:0.72rem;color:var(--text-tertiary);text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;"></th>
                <th style="padding:8px;font-size:0.72rem;color:var(--text-tertiary);text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Nome</th>
                <th style="padding:8px;font-size:0.72rem;color:var(--text-tertiary);text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Username</th>
                <th style="padding:8px;font-size:0.72rem;color:var(--text-tertiary);text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Cargo</th>
                <th style="padding:8px;font-size:0.72rem;color:var(--text-tertiary);text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">BU</th>
                <th style="padding:8px;font-size:0.72rem;color:var(--text-tertiary);text-align:center;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Ativo</th>
                <th style="padding:8px;font-size:0.72rem;color:var(--text-tertiary);text-align:center;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Status</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>` : `<div style="padding:20px;text-align:center;font-size:0.82rem;color:var(--text-tertiary);">Carregando usuarios...</div>`}
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

    // Fireflies API configuration
    const ffEnabled = typeof TBO_FIREFLIES !== 'undefined' && TBO_FIREFLIES.isEnabled();
    const ffHasKey = typeof TBO_FIREFLIES !== 'undefined' && !!TBO_FIREFLIES.getApiKey();
    const ffStatus = typeof TBO_FIREFLIES !== 'undefined' ? TBO_FIREFLIES.getStatus() : null;

    html += `
      <div style="margin-top:16px; padding-top:12px; border-top:2px solid var(--accent);">
        <div style="font-size:0.85rem; font-weight:600; margin-bottom:8px; color:var(--accent);">Fireflies.ai — API em Tempo Real</div>
        <div style="display:flex; gap:8px; align-items:center; margin-bottom:10px;">
          <input type="password" id="cfgFirefliesKey" placeholder="Cole sua API Key do Fireflies..."
            value="${ffHasKey ? '••••••••••••' : ''}"
            style="flex:1; padding:6px 10px; border:1px solid var(--border-subtle); border-radius:6px; font-size:0.78rem; background:var(--bg-secondary); color:var(--text-primary);" />
          <button class="btn btn-primary" id="cfgSaveFFKey" style="font-size:0.75rem; padding:6px 12px;">Salvar</button>
        </div>
        <div style="font-size:0.72rem; color:var(--text-tertiary); margin-bottom:10px;">
          Obtenha sua API Key em <a href="https://app.fireflies.ai/integrations/custom/fireflies" target="_blank" style="color:var(--accent);">app.fireflies.ai/integrations</a> → Developer Settings
        </div>
        ${ffStatus && ffStatus.lastSync ? `<div style="font-size:0.75rem; color:var(--text-secondary); margin-bottom:6px;">Ultimo sync: ${new Date(ffStatus.lastSync).toLocaleString('pt-BR')} | ${ffStatus.meetingCount} reunioes</div>` : ''}
        ${ffStatus && ffStatus.error ? `<div style="font-size:0.75rem; color:var(--danger); margin-bottom:6px;">Erro: ${ffStatus.error}</div>` : ''}
      </div>
    `;

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
        audio_whatsapp: 'Audio/WhatsApp', outros: 'Outros', geral: 'Geral'
      };

      html += `
        <div style="margin-top:12px; padding-top:8px;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:0.78rem; color:var(--text-secondary);">
            <span>Fonte:</span><span style="color:var(--text-primary);">${ffEnabled ? 'API em tempo real' : 'Arquivo estatico'}</span>
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

    // Save Fireflies API key
    this._bind('cfgSaveFFKey', () => {
      const input = document.getElementById('cfgFirefliesKey');
      if (!input) return;
      const key = input.value.trim();
      if (!key || key === '••••••••••••') {
        TBO_TOAST.warn('API Key', 'Cole sua API Key do Fireflies para ativar a integracao.');
        return;
      }
      if (typeof TBO_FIREFLIES !== 'undefined') {
        TBO_FIREFLIES.setApiKey(key);
        input.value = '••••••••••••';
        TBO_TOAST.success('Fireflies', 'API Key salva! Re-sincronizando...');
        TBO_FIREFLIES.forceRefresh().then(() => {
          TBO_STORAGE.loadAll().then(() => {
            if (typeof TBO_APP !== 'undefined') TBO_APP._updateStatus();
            TBO_TOAST.success('Fireflies', `${TBO_FIREFLIES.getStatus().meetingCount} reunioes carregadas em tempo real!`);
          });
        }).catch(e => {
          TBO_TOAST.error('Fireflies', `Erro: ${e.message}`);
        });
      }
    });

    // Re-sync fireflies
    this._bind('cfgResyncFF', async () => {
      if (typeof TBO_FIREFLIES !== 'undefined' && TBO_FIREFLIES.isEnabled()) {
        TBO_TOAST.info('Fireflies', 'Re-sincronizando reunioes...');
        try {
          await TBO_FIREFLIES.forceRefresh();
          await TBO_STORAGE.loadAll();
          if (typeof TBO_APP !== 'undefined') TBO_APP._updateStatus();
          const status = TBO_FIREFLIES.getStatus();
          TBO_TOAST.success('Fireflies', `${status.meetingCount} reunioes atualizadas!`);
        } catch (e) {
          TBO_TOAST.error('Fireflies', `Erro ao sincronizar: ${e.message}`);
        }
      } else {
        TBO_TOAST.info('Fireflies', 'Configure sua API Key acima para ativar a sincronizacao em tempo real.');
      }
    });

    // ── User Management bindings ──────────────────────────────────────────
    if (typeof TBO_AUTH !== 'undefined' && TBO_AUTH.getCurrentUser()?.role === 'founder') {
      this._loadUsers();

      this._bind('cfgReloadUsers', () => {
        TBO_TOAST.info('Recarregando', 'Atualizando lista de usuarios...');
        this._loadUsers();
      });

      this._bind('cfgAddUser', () => {
        this._showAddUserModal();
      });

      const userTable = document.getElementById('cfgUserTable');
      if (userTable) {
        userTable.addEventListener('change', (e) => {
          const checkbox = e.target.closest('input[type="checkbox"][data-userid]');
          if (checkbox) {
            const userId = checkbox.dataset.userid;
            const isActive = checkbox.checked;
            this._toggleUserActive(userId, isActive);
          }
        });
      }
    }

    // ── Backup bindings ──────────────────────────────────────────────────

    this._bind('cfgCreateBackup', () => {
      if (typeof TBO_BACKUP === 'undefined') return;
      const result = TBO_BACKUP.createBackup('Backup manual');
      TBO_TOAST.success('Backup criado', result.snapshot.label);
      const section = document.getElementById('cfgBackupSection');
      if (section) section.innerHTML = this._renderBackupSection();
      this._bindBackupActions();
    });

    this._bind('cfgExportBackup', () => {
      if (typeof TBO_BACKUP === 'undefined') return;
      const result = TBO_BACKUP.exportToFile();
      if (result.ok) {
        TBO_TOAST.success('Exportado', `Backup JSON (${result.sizeKB}KB) baixado.`);
      }
    });

    // Import file
    const importInput = document.getElementById('cfgImportFile');
    if (importInput) {
      importInput.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file || typeof TBO_BACKUP === 'undefined') return;
        const result = await TBO_BACKUP.importFromFile(file);
        if (result.ok) {
          TBO_TOAST.success('Importado', result.msg);
          // Refresh page data
          if (typeof TBO_STORAGE !== 'undefined') await TBO_STORAGE.loadAll();
        } else {
          TBO_TOAST.error('Erro', result.msg);
        }
        importInput.value = '';
      });
    }

    this._bindBackupActions();
  },

  _bindBackupActions() {
    // Restore buttons
    document.querySelectorAll('.cfgRestoreBackup').forEach(btn => {
      btn.addEventListener('click', () => {
        if (typeof TBO_BACKUP === 'undefined') return;
        const key = btn.dataset.key;
        TBO_UX.confirm('Restaurar backup', 'Isso substituira todos os dados atuais pelo backup selecionado. Continuar?', () => {
          const result = TBO_BACKUP.restoreBackup(key);
          if (result.ok) {
            TBO_TOAST.success('Restaurado', result.msg);
            setTimeout(() => window.location.reload(), 1000);
          } else {
            TBO_TOAST.error('Erro', result.msg);
          }
        }, { danger: true, confirmText: 'Restaurar' });
      });
    });

    // Delete buttons
    document.querySelectorAll('.cfgDeleteBackup').forEach(btn => {
      btn.addEventListener('click', () => {
        if (typeof TBO_BACKUP === 'undefined') return;
        TBO_BACKUP.deleteBackup(btn.dataset.key);
        const section = document.getElementById('cfgBackupSection');
        if (section) section.innerHTML = this._renderBackupSection();
        this._bindBackupActions();
        TBO_TOAST.info('Removido', 'Backup deletado.');
      });
    });
  },

  // ── Backup Section ──────────────────────────────────────────────────────

  _renderBackupSection() {
    if (typeof TBO_BACKUP === 'undefined') return '<div style="font-size:0.82rem;color:var(--text-tertiary);">Sistema de backup nao disponivel.</div>';

    const backups = TBO_BACKUP.listBackups();
    const info = TBO_BACKUP.getStorageInfo();

    let html = `
      <div style="display:flex;gap:8px;margin-bottom:12px;">
        <button class="btn btn-primary" id="cfgCreateBackup" style="flex:1;font-size:0.78rem;">Criar Backup Agora</button>
        <button class="btn btn-secondary" id="cfgExportBackup" style="flex:1;font-size:0.78rem;">Exportar JSON</button>
      </div>
      <div style="margin-bottom:12px;">
        <label class="btn btn-secondary" style="width:100%;font-size:0.78rem;cursor:pointer;text-align:center;display:block;">
          Importar Backup JSON
          <input type="file" id="cfgImportFile" accept=".json" style="display:none;">
        </label>
      </div>
      <div style="font-size:0.75rem;color:var(--text-tertiary);margin-bottom:12px;">
        Storage: ${info.tboKB}KB dados + ${info.backupKB}KB backups / ~${info.limitKB}KB limite
        <div style="background:var(--bg-tertiary);border-radius:4px;height:6px;margin-top:4px;overflow:hidden;">
          <div style="background:var(--accent);height:100%;width:${Math.min(100, Math.round((info.tboKB + info.backupKB) / info.limitKB * 100))}%;border-radius:4px;"></div>
        </div>
      </div>
    `;

    if (backups.length > 0) {
      html += '<div style="font-size:0.78rem;font-weight:600;margin-bottom:8px;">Backups salvos (max ${TBO_BACKUP._maxBackups}):</div>';
      html += backups.map(b => {
        const date = new Date(b.date);
        const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
        const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return `<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-subtle);font-size:0.78rem;">
          <div>
            <div>${b.label} <span style="color:var(--text-tertiary);">(v${b.version})</span></div>
            <div style="font-size:0.7rem;color:var(--text-tertiary);">${dateStr} ${timeStr} — ${b.sizeKB}KB, ${b.dataKeys} itens</div>
          </div>
          <div style="display:flex;gap:4px;">
            <button class="btn btn-sm btn-secondary cfgRestoreBackup" data-key="${b.key}" style="font-size:0.7rem;padding:2px 8px;">Restaurar</button>
            <button class="btn btn-sm cfgDeleteBackup" data-key="${b.key}" style="font-size:0.7rem;padding:2px 6px;color:var(--status-error);">x</button>
          </div>
        </div>`;
      }).join('');
    } else {
      html += '<div style="font-size:0.78rem;color:var(--text-tertiary);">Nenhum backup salvo. Crie o primeiro backup acima.</div>';
    }

    return html;
  },

  // ── Audit Log Section ─────────────────────────────────────────────────────

  _renderAuditSection() {
    if (typeof TBO_STORAGE === 'undefined') return '';

    const log = TBO_STORAGE.getAuditLog ? TBO_STORAGE.getAuditLog() : [];
    const recent = log.slice(0, 20);

    // Update count badge
    setTimeout(() => {
      const badge = document.getElementById('cfgAuditCount');
      if (badge) badge.textContent = `${log.length} registros`;
    }, 0);

    if (recent.length === 0) {
      return '<div style="font-size:0.78rem;color:var(--text-tertiary);padding:8px 0;">Nenhum registro de auditoria.</div>';
    }

    const actionLabels = {
      create: 'Criou', update: 'Atualizou', delete: 'Removeu',
      transition: 'Transicao', approve: 'Aprovou', reject: 'Rejeitou',
      complete: 'Concluiu', start: 'Iniciou', pause: 'Pausou'
    };

    return `
      <div style="max-height:300px;overflow-y:auto;">
        ${recent.map(entry => {
          const date = new Date(entry.timestamp || entry.date);
          const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          const action = actionLabels[entry.action] || entry.action || '?';
          const entity = entry.entityType || entry.type || '?';
          const name = entry.entityName || entry.name || entry.entityId || '';
          const user = entry.userId || entry.user || '-';
          return `<div style="display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px solid var(--border-subtle);font-size:0.75rem;">
            <span style="color:var(--text-tertiary);white-space:nowrap;min-width:75px;">${dateStr} ${timeStr}</span>
            <div style="flex:1;">
              <span style="font-weight:600;">${user}</span>
              <span style="color:var(--text-secondary);">${action}</span>
              <span class="tag" style="font-size:0.65rem;">${entity}</span>
              ${name ? `<span style="color:var(--text-primary);">${name}</span>` : ''}
              ${entry.from && entry.to ? `<span style="color:var(--text-tertiary);">${entry.from} &rarr; ${entry.to}</span>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
      ${log.length > 20 ? `<div style="font-size:0.72rem;color:var(--text-tertiary);padding:8px 0;text-align:center;">Mostrando 20 de ${log.length} registros</div>` : ''}
    `;
  },

  // ── User Management ─────────────────────────────────────────────────────

  async _loadUsers() {
    try {
      const { data, error } = await TBO_SUPABASE.getClient()
        .from('profiles')
        .select('*')
        .order('full_name');
      if (error) throw error;
      this._users = data || [];
      const roleColors = {
        founder: '#E85102',
        project_owner: '#8b5cf6',
        comercial: '#f59e0b',
        artist: '#3a7bd5',
        finance: '#2ecc71'
      };
      const roleLabels = {
        founder: 'Fundador',
        project_owner: 'Project Owner',
        comercial: 'Comercial',
        artist: 'Artista',
        finance: 'Financeiro'
      };
      const container = document.getElementById('cfgUserTable');
      if (container) {
        const rows = this._users.map(u => {
          const initials = (u.full_name || u.username || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
          const roleBg = roleColors[u.role] || '#6b7280';
          const roleLabel = roleLabels[u.role] || u.role || 'N/A';
          const isActive = u.is_active !== false;
          return `<tr style="border-bottom:1px solid var(--border-subtle);">
            <td style="padding:10px 8px;">
              <div style="width:32px;height:32px;border-radius:50%;background:${roleBg};color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:700;">${initials}</div>
            </td>
            <td style="padding:10px 8px;font-size:0.82rem;color:var(--text-primary);font-weight:500;">${u.full_name || '-'}</td>
            <td style="padding:10px 8px;font-size:0.78rem;color:var(--text-secondary);">${u.username || '-'}</td>
            <td style="padding:10px 8px;">
              <span class="tag" style="background:${roleBg}22;color:${roleBg};border:1px solid ${roleBg}44;font-size:0.72rem;">${roleLabel}</span>
            </td>
            <td style="padding:10px 8px;font-size:0.78rem;color:var(--text-secondary);">${u.bu || '-'}</td>
            <td style="padding:10px 8px;text-align:center;">
              <label class="user-toggle">
                <input type="checkbox" data-userid="${u.id}" ${isActive ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </td>
            <td style="padding:10px 8px;text-align:center;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${isActive ? '#22c55e' : '#ef4444'};"></span>
            </td>
          </tr>`;
        }).join('');

        container.innerHTML = this._users.length > 0 ? `
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:2px solid var(--border-subtle);">
                <th style="padding:8px;font-size:0.72rem;color:var(--text-tertiary);text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;"></th>
                <th style="padding:8px;font-size:0.72rem;color:var(--text-tertiary);text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Nome</th>
                <th style="padding:8px;font-size:0.72rem;color:var(--text-tertiary);text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Username</th>
                <th style="padding:8px;font-size:0.72rem;color:var(--text-tertiary);text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Cargo</th>
                <th style="padding:8px;font-size:0.72rem;color:var(--text-tertiary);text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">BU</th>
                <th style="padding:8px;font-size:0.72rem;color:var(--text-tertiary);text-align:center;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Ativo</th>
                <th style="padding:8px;font-size:0.72rem;color:var(--text-tertiary);text-align:center;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Status</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>` : `<div style="padding:20px;text-align:center;font-size:0.82rem;color:var(--text-tertiary);">Nenhum usuario encontrado.</div>`;
      }

      // Update summary badges
      const summaryEl = document.getElementById('cfgUserSummary');
      if (summaryEl) {
        const total = this._users.length;
        const active = this._users.filter(u => u.is_active !== false).length;
        const inactive = total - active;
        const roleCounts = {};
        this._users.forEach(u => { roleCounts[u.role] = (roleCounts[u.role] || 0) + 1; });
        let badges = '';
        badges += '<span style="font-size:0.72rem;padding:4px 10px;border-radius:12px;background:var(--bg-tertiary);color:var(--text-primary);font-weight:600;">' + total + ' total</span>';
        badges += '<span style="font-size:0.72rem;padding:4px 10px;border-radius:12px;background:#22c55e22;color:#22c55e;font-weight:600;">' + active + ' ativos</span>';
        badges += '<span style="font-size:0.72rem;padding:4px 10px;border-radius:12px;background:#ef444422;color:#ef4444;font-weight:600;">' + inactive + ' inativos</span>';
        Object.entries(roleCounts).forEach(([role, count]) => {
          const color = roleColors[role] || '#6b7280';
          const label = roleLabels[role] || role;
          badges += '<span style="font-size:0.72rem;padding:4px 10px;border-radius:12px;background:' + color + '18;color:' + color + ';font-weight:500;">' + count + ' ' + label + '</span>';
        });
        summaryEl.innerHTML = badges;
      }
    } catch (e) {
      console.error('[TBO_CONFIGURACOES] Erro ao carregar usuarios:', e);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao carregar usuarios: ' + e.message);
    }
  },

  async _toggleUserActive(userId, isActive) {
    try {
      const { error } = await TBO_SUPABASE.getClient()
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId);
      if (error) throw error;
      TBO_TOAST.success('Usuario atualizado', isActive ? 'Usuario ativado com sucesso.' : 'Usuario desativado com sucesso.');
      await this._loadUsers();
    } catch (e) {
      console.error('[TBO_CONFIGURACOES] Erro ao atualizar usuario:', e);
      TBO_TOAST.error('Erro', 'Falha ao atualizar usuario: ' + e.message);
      await this._loadUsers();
    }
  },

  // ── Add User Modal ─────────────────────────────────────────────────────

  _showAddUserModal() {
    const roleOptions = [
      { value: 'artist', label: 'Artista', color: '#3a7bd5' },
      { value: 'project_owner', label: 'Project Owner', color: '#8b5cf6' },
      { value: 'comercial', label: 'Comercial', color: '#f59e0b' },
      { value: 'finance', label: 'Financeiro', color: '#2ecc71' },
      { value: 'founder', label: 'Fundador', color: '#E85102' }
    ];

    const buOptions = ['', 'Branding', 'Digital 3D', 'Marketing', 'Vendas'];

    const html = `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div>
          <label style="font-size:0.78rem;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:4px;">Nome Completo *</label>
          <input type="text" id="addUserName" class="form-input" placeholder="Ex: Maria Silva" style="width:100%;">
        </div>
        <div>
          <label style="font-size:0.78rem;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:4px;">Username *</label>
          <input type="text" id="addUserUsername" class="form-input" placeholder="Ex: maria (sem espacos)" style="width:100%;">
          <div style="font-size:0.68rem;color:var(--text-tertiary);margin-top:2px;">Identificador unico, usado para login legado</div>
        </div>
        <div>
          <label style="font-size:0.78rem;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:4px;">Email *</label>
          <input type="email" id="addUserEmail" class="form-input" placeholder="Ex: maria@agenciatbo.com.br" style="width:100%;">
        </div>
        <div>
          <label style="font-size:0.78rem;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:4px;">Cargo / Role *</label>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${roleOptions.map(r => `
              <label style="display:flex;align-items:center;gap:4px;padding:6px 12px;border:2px solid var(--border-subtle);border-radius:8px;cursor:pointer;font-size:0.78rem;transition:all .2s;" class="addUserRoleOption" data-role="${r.value}" data-color="${r.color}">
                <input type="radio" name="addUserRole" value="${r.value}" style="display:none;">
                <span style="width:10px;height:10px;border-radius:50%;background:${r.color};"></span>
                ${r.label}
              </label>
            `).join('')}
          </div>
        </div>
        <div>
          <label style="font-size:0.78rem;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:4px;">Business Unit</label>
          <select id="addUserBU" class="form-input" style="width:100%;">
            ${buOptions.map(bu => `<option value="${bu}">${bu || '(Nenhuma)'}</option>`).join('')}
          </select>
        </div>
        <button class="btn btn-primary" id="addUserSubmit" style="width:100%;margin-top:4px;">Criar Usuario</button>
      </div>
    `;

    if (typeof TBO_MODAL !== 'undefined') {
      TBO_MODAL.show('Novo Usuario', html);
    } else {
      // Fallback: create inline modal
      const overlay = document.createElement('div');
      overlay.id = 'addUserOverlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
      overlay.innerHTML = `<div style="background:var(--bg-primary,#fff);border-radius:12px;padding:24px;max-width:480px;width:90%;max-height:90vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="font-size:1rem;font-weight:700;margin:0;">Novo Usuario</h3>
          <button id="addUserClose" style="background:none;border:none;font-size:1.2rem;cursor:pointer;color:var(--text-tertiary);">&times;</button>
        </div>
        ${html}
      </div>`;
      document.body.appendChild(overlay);
      document.getElementById('addUserClose')?.addEventListener('click', () => overlay.remove());
      overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    }

    // Bind role selection
    setTimeout(() => {
      document.querySelectorAll('.addUserRoleOption').forEach(opt => {
        opt.addEventListener('click', () => {
          document.querySelectorAll('.addUserRoleOption').forEach(o => {
            o.style.borderColor = 'var(--border-subtle)';
            o.style.background = 'transparent';
          });
          opt.style.borderColor = opt.dataset.color;
          opt.style.background = opt.dataset.color + '15';
          opt.querySelector('input').checked = true;
        });
      });

      // Bind submit
      document.getElementById('addUserSubmit')?.addEventListener('click', () => this._submitAddUser());
    }, 100);
  },

  async _submitAddUser() {
    const name = document.getElementById('addUserName')?.value?.trim();
    const username = document.getElementById('addUserUsername')?.value?.trim()?.toLowerCase();
    const email = document.getElementById('addUserEmail')?.value?.trim()?.toLowerCase();
    const roleEl = document.querySelector('input[name="addUserRole"]:checked');
    const role = roleEl?.value;
    const bu = document.getElementById('addUserBU')?.value || null;

    // Validation
    if (!name) { TBO_TOAST.warn('Campo obrigatorio', 'Informe o nome completo.'); return; }
    if (!username) { TBO_TOAST.warn('Campo obrigatorio', 'Informe o username.'); return; }
    if (!email) { TBO_TOAST.warn('Campo obrigatorio', 'Informe o email.'); return; }
    if (!role) { TBO_TOAST.warn('Campo obrigatorio', 'Selecione um cargo/role.'); return; }

    // Check for spaces in username
    if (username.includes(' ')) { TBO_TOAST.warn('Username invalido', 'O username nao pode conter espacos.'); return; }

    try {
      // Insert directly into profiles (with a random UUID since we don't create auth users in legacy mode)
      const newId = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); });

      const { error } = await TBO_SUPABASE.getClient()
        .from('profiles')
        .insert({
          id: newId,
          username: username,
          full_name: name,
          email: email,
          role: role,
          bu: bu,
          is_active: true
        });

      if (error) throw error;

      TBO_TOAST.success('Usuario criado', `${name} foi adicionado com sucesso como ${role}.`);

      // Close modal
      const overlay = document.getElementById('addUserOverlay');
      if (overlay) overlay.remove();
      if (typeof TBO_MODAL !== 'undefined' && TBO_MODAL.close) TBO_MODAL.close();

      // Reload users
      await this._loadUsers();
    } catch (e) {
      console.error('[TBO_CONFIGURACOES] Erro ao criar usuario:', e);
      TBO_TOAST.error('Erro ao criar usuario', e.message || 'Verifique os dados e tente novamente.');
    }
  },

  // ── Bind helper ─────────────────────────────────────────────────────────

  _bind(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  }
};

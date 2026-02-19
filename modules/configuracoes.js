// TBO OS — Module: Configuracoes (v2.2 — Sidebar Category Layout)
// Reescrito com layout de categorias laterais (estilo macOS/VS Code Settings)
const TBO_CONFIGURACOES = {

  // Categoria ativa atual
  _activeCategory: 'perfil',
  _users: [],

  // ── Definicao das categorias ─────────────────────────────────────────────
  _categories: [
    { id: 'perfil',       icon: 'user',          label: 'Perfil & Conta' },
    { id: 'integracoes',  icon: 'plug',          label: 'Integrações' },
    { id: 'ia',           icon: 'brain',         label: 'Inteligência Artificial' },
    { id: 'usuarios',     icon: 'users',         label: 'Gestão de Usuários' },
    { id: 'dados',        icon: 'database',      label: 'Dados & Backup' },
    { id: 'sistema',      icon: 'settings',      label: 'Sistema' }
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER PRINCIPAL
  // ══════════════════════════════════════════════════════════════════════════

  render() {
    const isFounder = typeof TBO_AUTH !== 'undefined' && TBO_AUTH.getCurrentUser()?.role === 'founder';
    // Filtra categorias visiveis (usuarios so para founder)
    const visibleCats = this._categories.filter(c => c.id !== 'usuarios' || isFounder);

    return `
      <style>${this._getStyles()}</style>
      <div class="cfg-container">
        <!-- Sidebar de categorias -->
        <nav class="cfg-sidebar">
          <div class="cfg-sidebar-title">Configurações</div>
          ${visibleCats.map(c => `
            <button class="cfg-sidebar-item ${this._activeCategory === c.id ? 'active' : ''}"
                    data-category="${c.id}" id="cfgCat_${c.id}">
              <i data-lucide="${c.icon}"></i>
              <span>${c.label}</span>
            </button>
          `).join('')}
        </nav>

        <!-- Painel de conteudo -->
        <div class="cfg-content" id="cfgContentPanel">
          ${this._renderCategoryContent(this._activeCategory)}
        </div>
      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER POR CATEGORIA
  // ══════════════════════════════════════════════════════════════════════════

  _renderCategoryContent(categoryId) {
    switch (categoryId) {
      case 'perfil':      return this._renderPerfil();
      case 'integracoes': return this._renderIntegracoes();
      case 'ia':          return this._renderIA();
      case 'usuarios':    return this._renderUsuarios();
      case 'dados':       return this._renderDados();
      case 'sistema':     return this._renderSistema();
      default:            return this._renderPerfil();
    }
  },

  // ── Categoria 1: Perfil & Conta ──────────────────────────────────────────

  _renderPerfil() {
    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    const name = user?.name || user?.full_name || user?.username || 'Usuário';
    const email = user?.email || '-';
    const role = user?.role || '-';
    const avatar = user?.avatarUrl || '';
    // v2.2.1: Usar initials do user session (calculado em auth.js via TBO_PERMISSIONS.getInitials)
    // Fallback para calculo local caso nao exista
    const initials = user?.initials || TBO_PERMISSIONS.getInitials(name);
    const roleLabel = user?.roleLabel || (typeof TBO_CONFIG !== 'undefined' ? TBO_CONFIG.business.getRoleLabel(role) : role);
    const roleColor = user?.roleColor || (typeof TBO_CONFIG !== 'undefined' ? TBO_CONFIG.business.getRoleColor(role) : '#666');

    // Tema atual
    const theme = localStorage.getItem('tbo_theme') || 'system';
    // Notificacoes
    const notifGeneral = localStorage.getItem('tbo_notif_general') !== 'false';
    const notifSync = localStorage.getItem('tbo_notif_sync') !== 'false';
    const notifErrors = localStorage.getItem('tbo_notif_errors') !== 'false';

    return `
      <div class="cfg-section-header">
        <h2>Perfil & Conta</h2>
        <p class="cfg-section-desc">Informações do usuário atual e preferências de interface.</p>
      </div>

      <!-- Card: Perfil do Usuario -->
      <div class="card cfg-card">
        <div class="cfg-profile-header">
          ${avatar
            ? `<img src="${avatar}" alt="Avatar" class="cfg-avatar" />`
            : `<div class="cfg-avatar-placeholder" style="background:${roleColor};">${initials}</div>`
          }
          <div class="cfg-profile-info">
            <h3 class="cfg-profile-name">${TBO_FORMATTER ? TBO_FORMATTER.escapeHtml(name) : name}</h3>
            <span class="cfg-profile-email">${TBO_FORMATTER ? TBO_FORMATTER.escapeHtml(email) : email}</span>
            <span class="tag" style="background:${roleColor}22;color:${roleColor};border:1px solid ${roleColor}44;margin-top:4px;">${roleLabel}</span>
          </div>
        </div>
      </div>

      <!-- Card: Tema -->
      <div class="card cfg-card">
        <h3 class="cfg-card-title"><i data-lucide="palette"></i> Aparência</h3>
        <div class="cfg-theme-selector">
          <button class="cfg-theme-btn ${theme === 'light' ? 'active' : ''}" data-theme="light">
            <i data-lucide="sun"></i> Claro
          </button>
          <button class="cfg-theme-btn ${theme === 'dark' ? 'active' : ''}" data-theme="dark">
            <i data-lucide="moon"></i> Escuro
          </button>
          <button class="cfg-theme-btn ${theme === 'system' ? 'active' : ''}" data-theme="system">
            <i data-lucide="monitor"></i> Sistema
          </button>
        </div>
      </div>

      <!-- Card: Notificacoes -->
      <div class="card cfg-card">
        <h3 class="cfg-card-title"><i data-lucide="bell"></i> Notificações</h3>
        <div class="cfg-toggle-list">
          <label class="cfg-toggle-row">
            <div>
              <div class="cfg-toggle-label">Notificações gerais</div>
              <div class="cfg-toggle-hint">Toasts de sucesso, info e avisos</div>
            </div>
            <input type="checkbox" id="cfgNotifGeneral" class="cfg-checkbox" ${notifGeneral ? 'checked' : ''}>
          </label>
          <label class="cfg-toggle-row">
            <div>
              <div class="cfg-toggle-label">Notificações de sincronização</div>
              <div class="cfg-toggle-hint">Alertas quando integrações sincronizam</div>
            </div>
            <input type="checkbox" id="cfgNotifSync" class="cfg-checkbox" ${notifSync ? 'checked' : ''}>
          </label>
          <label class="cfg-toggle-row">
            <div>
              <div class="cfg-toggle-label">Notificações de erros</div>
              <div class="cfg-toggle-hint">Alertas de falha em operações</div>
            </div>
            <input type="checkbox" id="cfgNotifErrors" class="cfg-checkbox" ${notifErrors ? 'checked' : ''}>
          </label>
        </div>
      </div>
    `;
  },

  // ── Categoria 2: Integracoes ─────────────────────────────────────────────

  _renderIntegracoes() {
    return `
      <div class="cfg-section-header">
        <h2>Integrações</h2>
        <p class="cfg-section-desc">Gerencie conexões com serviços externos.</p>
      </div>

      ${this._renderIntegrationCard_Fireflies()}
      ${this._renderIntegrationCard_RDStation()}
      ${this._renderIntegrationCard_GoogleCalendar()}
      ${this._renderIntegrationCard_GoogleSheets()}
      ${this._renderIntegrationCard_Notion()}
    `;
  },

  _renderIntegrationCard_Fireflies() {
    const enabled = typeof TBO_FIREFLIES !== 'undefined' && TBO_FIREFLIES.isEnabled();
    const hasKey = typeof TBO_FIREFLIES !== 'undefined' && !!TBO_FIREFLIES.getApiKey();
    const status = typeof TBO_FIREFLIES !== 'undefined' ? TBO_FIREFLIES.getStatus() : null;
    const connected = enabled && hasKey;
    const daysRange = localStorage.getItem('tbo_fireflies_days') || '90';

    return `
      <div class="card cfg-card cfg-integration-card">
        <div class="cfg-integration-header">
          <div class="cfg-integration-icon" style="background:#ff6d2e22;color:#ff6d2e;">
            <i data-lucide="flame"></i>
          </div>
          <div class="cfg-integration-meta">
            <h3>Fireflies.ai</h3>
            <span class="cfg-integration-desc">Transcrição automática de reuniões</span>
          </div>
          <span class="cfg-status-badge ${connected ? 'connected' : 'disconnected'}">
            ${connected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>

        <div class="cfg-integration-body">
          <div class="cfg-field-row">
            <label class="form-label">API Key</label>
            <div class="cfg-field-input-group">
              <input type="password" class="form-input" id="cfgFirefliesKey"
                     value="${hasKey ? '************' : ''}"
                     placeholder="Cole sua API Key do Fireflies...">
              <button class="btn btn-primary btn-sm" id="cfgSaveFFKey">Salvar</button>
            </div>
            <span class="cfg-field-hint">Obtenha em <a href="https://app.fireflies.ai/integrations/custom/fireflies" target="_blank">app.fireflies.ai/integrations</a></span>
          </div>

          <div class="cfg-field-row">
            <label class="form-label">Periodo de busca (dias)</label>
            <div class="cfg-field-input-group">
              <input type="number" class="form-input" id="cfgFirefliesDays" value="${daysRange}" min="7" max="365" style="width:100px;">
              <button class="btn btn-secondary btn-sm" id="cfgSaveFFDays">Aplicar</button>
            </div>
          </div>

          <div class="cfg-integration-actions">
            <button class="btn btn-secondary btn-sm" id="cfgResyncFF" ${!connected ? 'disabled' : ''}>
              <i data-lucide="refresh-cw"></i> Re-sincronizar
            </button>
            <button class="btn btn-secondary btn-sm" id="cfgViewMeetings" ${!connected ? 'disabled' : ''}>
              <i data-lucide="list"></i> Ver reunioes
            </button>
          </div>

          ${status && status.lastSync ? `
          <div class="cfg-integration-status">
            <span>Ultimo sync: <strong>${new Date(status.lastSync).toLocaleString('pt-BR')}</strong></span>
            <span>${status.meetingCount || 0} reunioes</span>
          </div>` : ''}
          ${status && status.error ? `<div class="cfg-integration-error">Erro: ${status.error}</div>` : ''}
        </div>
      </div>
    `;
  },

  _renderIntegrationCard_RDStation() {
    const enabled = typeof TBO_RD_STATION !== 'undefined' && TBO_RD_STATION.isEnabled();
    const hasToken = typeof TBO_RD_STATION !== 'undefined' && !!TBO_RD_STATION.getApiToken();
    const status = typeof TBO_RD_STATION !== 'undefined' ? TBO_RD_STATION.getStatus() : null;
    const connected = enabled && hasToken;

    return `
      <div class="card cfg-card cfg-integration-card">
        <div class="cfg-integration-header">
          <div class="cfg-integration-icon" style="background:#7c3aed22;color:#7c3aed;">
            <i data-lucide="target"></i>
          </div>
          <div class="cfg-integration-meta">
            <h3>RD Station CRM</h3>
            <span class="cfg-integration-desc">Sync unilateral de deals e contatos (RD -> TBO)</span>
          </div>
          <span class="cfg-status-badge ${connected ? 'connected' : 'disconnected'}">
            ${connected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>

        <div class="cfg-integration-body">
          <div class="cfg-field-row">
            <label class="form-label">API Token</label>
            <div class="cfg-field-input-group">
              <input type="password" class="form-input" id="cfgRdToken"
                     value="${hasToken ? '************' : ''}"
                     placeholder="Cole seu API Token do RD Station CRM...">
              <button class="btn btn-primary btn-sm" id="cfgSaveRdToken">Salvar</button>
            </div>
            <span class="cfg-field-hint">Obtenha em <a href="https://crm.rdstation.com" target="_blank">RD Station CRM</a> -> Configurações -> Token de API</span>
          </div>

          <div class="cfg-integration-actions">
            <button class="btn btn-secondary btn-sm" id="cfgTestRd" ${!hasToken ? 'disabled' : ''}>
              <i data-lucide="zap"></i> Testar
            </button>
            <button class="btn btn-secondary btn-sm" id="cfgRdSync" ${!connected ? 'disabled' : ''}>
              <i data-lucide="refresh-cw"></i> Sincronizar Agora
            </button>
            <button class="btn btn-secondary btn-sm" id="cfgRdStageMapping" ${!connected ? 'disabled' : ''}>
              <i data-lucide="git-branch"></i> Mapear Etapas
            </button>
            <label class="cfg-inline-toggle">
              <input type="checkbox" id="cfgRdAutoSync" ${enabled ? 'checked' : ''}> Auto-sync
            </label>
          </div>
          <div id="cfgRdTestResult" class="cfg-test-result" style="display:none;"></div>

          ${status && status.lastSync ? `
          <div class="cfg-integration-status">
            <span>Ultimo sync: <strong>${new Date(status.lastSync).toLocaleString('pt-BR')}</strong></span>
            <div class="cfg-status-counters">
              <span class="cfg-counter">${status.rdDealCount || 0} deals</span>
              <span class="cfg-counter">${status.contactCount || 0} contatos</span>
              <span class="cfg-counter">${status.organizationCount || 0} empresas</span>
              <span class="cfg-counter">${status.activityCount || 0} notas</span>
              <span class="cfg-counter">${status.taskCount || 0} tarefas</span>
            </div>
          </div>` : ''}
          ${status && status.error ? `<div class="cfg-integration-error">Erro: ${status.error}</div>` : ''}
        </div>
      </div>
    `;
  },

  _renderIntegrationCard_GoogleCalendar() {
    const enabled = typeof TBO_GOOGLE_CALENDAR !== 'undefined' && TBO_GOOGLE_CALENDAR.isEnabled();
    const status = typeof TBO_GOOGLE_CALENDAR !== 'undefined' ? TBO_GOOGLE_CALENDAR.getStatus() : null;
    const currentUser = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    const isGoogleUser = !!currentUser?.supabaseUserId && !!currentUser?.avatarUrl;
    const connected = enabled && isGoogleUser;

    return `
      <div class="card cfg-card cfg-integration-card">
        <div class="cfg-integration-header">
          <div class="cfg-integration-icon" style="background:#4285f422;color:#4285f4;">
            <i data-lucide="calendar"></i>
          </div>
          <div class="cfg-integration-meta">
            <h3>Google Calendar</h3>
            <span class="cfg-integration-desc">Eventos e agenda (somente leitura)</span>
          </div>
          <span class="cfg-status-badge ${connected ? 'connected' : 'disconnected'}">
            ${connected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>

        <div class="cfg-integration-body">
          ${!isGoogleUser ? `
          <div class="cfg-integration-notice">
            <i data-lucide="info"></i>
            <span>Faca login via Google (botao na tela de login) para habilitar o Google Calendar.</span>
          </div>` : `
          <div class="cfg-integration-actions">
            <button class="btn btn-secondary btn-sm" id="cfgGcalSync">
              <i data-lucide="refresh-cw"></i> Sincronizar Eventos
            </button>
            <button class="btn btn-secondary btn-sm" id="cfgGcalTest">
              <i data-lucide="zap"></i> Testar Conexão
            </button>
            <label class="cfg-inline-toggle">
              <input type="checkbox" id="cfgGcalAutoSync" ${enabled ? 'checked' : ''}> Auto-sync
            </label>
          </div>
          <div id="cfgGcalTestResult" class="cfg-test-result" style="display:none;"></div>
          `}

          ${status && status.lastSync ? `
          <div class="cfg-integration-status">
            <span>Ultimo sync: <strong>${new Date(status.lastSync).toLocaleString('pt-BR')}</strong></span>
            <span>${status.eventCount || 0} eventos | ${status.todayCount || 0} hoje</span>
          </div>` : ''}
          ${status && status.error ? `<div class="cfg-integration-error">Erro: ${status.error}</div>` : ''}
        </div>
      </div>
    `;
  },

  _renderIntegrationCard_GoogleSheets() {
    const available = typeof TBO_SHEETS !== 'undefined';
    const sheetId = localStorage.getItem('tbo_sheets_id') || '';
    const lastSync = localStorage.getItem('tbo_sheets_last_sync');
    const connected = available && !!sheetId;

    return `
      <div class="card cfg-card cfg-integration-card">
        <div class="cfg-integration-header">
          <div class="cfg-integration-icon" style="background:#0f9d5822;color:#0f9d58;">
            <i data-lucide="table"></i>
          </div>
          <div class="cfg-integration-meta">
            <h3>Google Sheets</h3>
            <span class="cfg-integration-desc">Planilhas financeiras e fluxo de caixa</span>
          </div>
          <span class="cfg-status-badge ${connected ? 'connected' : 'disconnected'}">
            ${connected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>

        <div class="cfg-integration-body">
          <div class="cfg-field-row">
            <label class="form-label">Spreadsheet ID</label>
            <div class="cfg-field-input-group">
              <input type="text" class="form-input" id="cfgSheetsId"
                     value="${sheetId}"
                     placeholder="ID da planilha Google Sheets...">
              <button class="btn btn-primary btn-sm" id="cfgSaveSheetsId">Salvar</button>
            </div>
            <span class="cfg-field-hint">O ID esta na URL: docs.google.com/spreadsheets/d/<strong>[ID]</strong>/edit</span>
          </div>

          <div class="cfg-integration-actions">
            <button class="btn btn-secondary btn-sm" id="cfgSyncSheets" ${!connected ? 'disabled' : ''}>
              <i data-lucide="refresh-cw"></i> Sincronizar Dados
            </button>
          </div>

          ${lastSync ? `
          <div class="cfg-integration-status">
            <span>Ultimo sync: <strong>${new Date(lastSync).toLocaleString('pt-BR')}</strong></span>
          </div>` : ''}
        </div>
      </div>
    `;
  },

  _renderIntegrationCard_Notion() {
    return `
      <div class="card cfg-card cfg-integration-card cfg-integration-disabled">
        <div class="cfg-integration-header">
          <div class="cfg-integration-icon" style="background:#00000011;color:#000;">
            <i data-lucide="book-open"></i>
          </div>
          <div class="cfg-integration-meta">
            <h3>Notion</h3>
            <span class="cfg-integration-desc">Base de conhecimento e wikis</span>
          </div>
          <span class="cfg-status-badge future">Em breve</span>
        </div>
        <div class="cfg-integration-body">
          <div class="cfg-integration-notice">
            <i data-lucide="clock"></i>
            <span>Integracao com Notion sera disponibilizada em versao futura.</span>
          </div>
        </div>
      </div>
    `;
  },

  // ── Categoria 3: Inteligencia Artificial ─────────────────────────────────

  _renderIA() {
    const provider = TBO_API.getProvider();
    const models = TBO_API.getAvailableModels();
    const openaiKey = TBO_API.getApiKeyFor('openai');
    const claudeKey = TBO_API.getApiKeyFor('claude') || localStorage.getItem('tbo_api_key') || '';
    const isOpenAI = provider === 'openai';

    return `
      <div class="cfg-section-header">
        <h2>Inteligência Artificial</h2>
        <p class="cfg-section-desc">Configure o provedor e modelos de IA utilizados pelo sistema.</p>
      </div>

      <!-- Card: Provedor -->
      <div class="card cfg-card">
        <h3 class="cfg-card-title"><i data-lucide="cpu"></i> Provedor de IA</h3>
        <div class="cfg-provider-selector">
          <button class="cfg-provider-btn ${isOpenAI ? 'active' : ''}" id="cfgProviderOpenAI">
            <div class="cfg-provider-icon">&#x1F916;</div>
            <div class="cfg-provider-name">OpenAI (ChatGPT)</div>
          </button>
          <button class="cfg-provider-btn ${!isOpenAI ? 'active' : ''}" id="cfgProviderClaude">
            <div class="cfg-provider-icon">&#x2728;</div>
            <div class="cfg-provider-name">Anthropic (Claude)</div>
          </button>
        </div>
        <span class="cfg-field-hint">Selecione qual IA sera usada para gerar conteudo, briefings e analises.</span>
      </div>

      <!-- Card: Configuracao OpenAI -->
      <div class="card cfg-card" id="cfgOpenAISection" style="${isOpenAI ? '' : 'display:none;'}">
        <h3 class="cfg-card-title">Configuracao OpenAI</h3>
        <div class="cfg-field-row">
          <label class="form-label">Chave de API</label>
          <input type="password" class="form-input" id="cfgOpenAIKey" value="${openaiKey}" placeholder="sk-proj-...">
          <span class="cfg-field-hint">Obtenha em <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com/api-keys</a></span>
        </div>
        <div class="cfg-field-row">
          <label class="form-label">Modelo</label>
          <select class="form-input" id="cfgOpenAIModel">
            ${models.openai.map(m => `<option value="${m.id}" ${(localStorage.getItem('tbo_model_openai') || 'gpt-4o') === m.id ? 'selected' : ''}>${m.label}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Card: Configuracao Claude -->
      <div class="card cfg-card" id="cfgClaudeSection" style="${!isOpenAI ? '' : 'display:none;'}">
        <h3 class="cfg-card-title">Configuracao Claude</h3>
        <div class="cfg-field-row">
          <label class="form-label">Chave de API</label>
          <input type="password" class="form-input" id="cfgClaudeKey" value="${claudeKey}" placeholder="sk-ant-api03-...">
          <span class="cfg-field-hint">Obtenha em <a href="https://console.anthropic.com/" target="_blank">console.anthropic.com</a></span>
        </div>
        <div class="cfg-field-row">
          <label class="form-label">Modelo</label>
          <select class="form-input" id="cfgClaudeModel">
            ${models.claude.map(m => `<option value="${m.id}" ${(localStorage.getItem('tbo_model') || 'claude-sonnet-4-20250514') === m.id ? 'selected' : ''}>${m.label}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Card: Acoes -->
      <div class="card cfg-card">
        <div class="cfg-ia-actions">
          <button class="btn btn-primary" id="cfgSaveApi" style="flex:1;">
            <i data-lucide="save"></i> Salvar Configurações
          </button>
          <button class="btn btn-secondary" id="cfgTestApi" style="flex:1;">
            <i data-lucide="zap"></i> Testar Conexão
          </button>
        </div>
        <div id="cfgTestResult" class="cfg-test-result" style="display:none;"></div>
      </div>
    `;
  },

  // ── Categoria 4: Gestao de Usuarios (founder only) ──────────────────────

  _renderUsuarios() {
    const users = this._users || [];

    const rows = users.map(u => {
      const initials = (u.full_name || u.username || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      const roleBg = TBO_CONFIG.business.getRoleColor(u.role);
      const roleLabel = TBO_CONFIG.business.getRoleLabel(u.role);
      const isActive = u.is_active !== false;
      return `<tr>
        <td class="cfg-td">
          <div class="cfg-user-avatar" style="background:${roleBg};">${initials}</div>
        </td>
        <td class="cfg-td cfg-td-name">${TBO_FORMATTER ? TBO_FORMATTER.escapeHtml(u.full_name || '-') : (u.full_name || '-')}</td>
        <td class="cfg-td cfg-td-secondary">${TBO_FORMATTER ? TBO_FORMATTER.escapeHtml(u.username || '-') : (u.username || '-')}</td>
        <td class="cfg-td">
          <span class="tag" style="background:${roleBg}22;color:${roleBg};border:1px solid ${roleBg}44;font-size:0.72rem;">${roleLabel}</span>
        </td>
        <td class="cfg-td cfg-td-secondary">${u.bu || '-'}</td>
        <td class="cfg-td" style="text-align:center;">
          <label class="cfg-switch">
            <input type="checkbox" data-userid="${u.id}" ${isActive ? 'checked' : ''}>
            <span class="cfg-switch-slider"></span>
          </label>
        </td>
        <td class="cfg-td" style="text-align:center;">
          <span class="cfg-status-dot ${isActive ? 'active' : 'inactive'}"></span>
        </td>
      </tr>`;
    }).join('');

    // Summary badges
    const total = users.length;
    const active = users.filter(u => u.is_active !== false).length;
    const inactive = total - active;
    const roleCounts = {};
    users.forEach(u => { roleCounts[u.role] = (roleCounts[u.role] || 0) + 1; });

    return `
      <div class="cfg-section-header">
        <h2>Gestão de Usuários</h2>
        <p class="cfg-section-desc">Gerencie acessos e permissões da equipe.</p>
      </div>

      <!-- Card: Acoes e resumo -->
      <div class="card cfg-card">
        <div class="cfg-users-toolbar">
          <div class="cfg-users-badges" id="cfgUserSummary">
            <span class="cfg-badge">${total} total</span>
            <span class="cfg-badge cfg-badge-success">${active} ativos</span>
            <span class="cfg-badge cfg-badge-danger">${inactive} inativos</span>
            ${Object.entries(roleCounts).map(([role, count]) => {
              const color = TBO_CONFIG.business.getRoleColor(role);
              const label = TBO_CONFIG.business.getRoleLabel(role);
              return `<span class="cfg-badge" style="background:${color}18;color:${color};">${count} ${label}</span>`;
            }).join('')}
          </div>
          <div class="cfg-users-actions">
            <button class="btn btn-primary btn-sm" id="cfgAddUser"><i data-lucide="user-plus"></i> Novo Usuario</button>
            <button class="btn btn-secondary btn-sm" id="cfgReloadUsers"><i data-lucide="refresh-cw"></i> Recarregar</button>
          </div>
        </div>
      </div>

      <!-- Card: Tabela de usuarios -->
      <div class="card cfg-card">
        <div id="cfgUserTable" style="overflow-x:auto;">
          ${users.length > 0 ? `
          <table class="cfg-table">
            <thead>
              <tr>
                <th></th>
                <th>Nome</th>
                <th>Username</th>
                <th>Cargo</th>
                <th>BU</th>
                <th style="text-align:center;">Ativo</th>
                <th style="text-align:center;">Status</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>` : `
          <div class="cfg-empty-state">
            <i data-lucide="users"></i>
            <span>Carregando usuarios...</span>
          </div>`}
        </div>
      </div>
    `;
  },

  // ── Categoria 5: Dados & Backup ──────────────────────────────────────────

  _renderDados() {
    return `
      <div class="cfg-section-header">
        <h2>Dados & Backup</h2>
        <p class="cfg-section-desc">Gerenciamento de cache, exportacao e backup do sistema.</p>
      </div>

      <!-- Card: Acoes rapidas -->
      <div class="card cfg-card">
        <h3 class="cfg-card-title"><i data-lucide="hard-drive"></i> Gerenciamento de Dados</h3>
        <div class="cfg-data-actions">
          <button class="btn btn-secondary" id="cfgReloadData">
            <i data-lucide="refresh-cw"></i> Recarregar Dados
          </button>
          <button class="btn btn-secondary" id="cfgExportData">
            <i data-lucide="download"></i> Exportar Todos os Dados (JSON)
          </button>
          <button class="btn btn-secondary" id="cfgClearCache">
            <i data-lucide="trash-2"></i> Limpar Cache da API
          </button>
          <button class="btn btn-ghost" id="cfgClearAllHistory" style="color:var(--danger);">
            <i data-lucide="alert-triangle"></i> Limpar Todo Historico
          </button>
        </div>
      </div>

      <!-- Card: Backup & Recuperacao -->
      <div class="card cfg-card">
        <h3 class="cfg-card-title"><i data-lucide="archive"></i> Backup & Recuperacao</h3>
        <div id="cfgBackupSection">
          ${this._renderBackupSection()}
        </div>
      </div>

      <!-- Card: Audit Log -->
      <div class="card cfg-card">
        <div class="cfg-card-title-row">
          <h3 class="cfg-card-title"><i data-lucide="scroll-text"></i> Audit Log</h3>
          <span class="tag" id="cfgAuditCount">--</span>
        </div>
        <div id="cfgAuditSection">
          ${this._renderAuditSection()}
        </div>
      </div>
    `;
  },

  // ── Categoria 6: Sistema ─────────────────────────────────────────────────

  _renderSistema() {
    const context = TBO_STORAGE.get('context');
    const meetings = TBO_STORAGE.get('meetings');
    const meetingsArr = meetings.meetings || meetings.reunioes_recentes || [];

    // Status dos servicos
    const services = [
      { name: 'API de IA', icon: 'cpu', ok: TBO_API.isConfigured(), detail: TBO_API.getProviderLabel() },
      { name: 'Dados de Contexto', icon: 'folder', ok: !!(context.projetos_ativos?.length), detail: `${(context.projetos_ativos || []).length} projetos` },
      { name: 'Fireflies', icon: 'flame', ok: typeof TBO_FIREFLIES !== 'undefined' && TBO_FIREFLIES.isEnabled(), detail: `${meetingsArr.length} reunioes` },
      { name: 'RD Station', icon: 'target', ok: typeof TBO_RD_STATION !== 'undefined' && TBO_RD_STATION.isEnabled() },
      { name: 'Google Calendar', icon: 'calendar', ok: typeof TBO_GOOGLE_CALENDAR !== 'undefined' && TBO_GOOGLE_CALENDAR.isEnabled() },
      { name: 'Google Sheets', icon: 'table', ok: typeof TBO_SHEETS !== 'undefined' && !!localStorage.getItem('tbo_sheets_id') },
      { name: 'Supabase', icon: 'database', ok: typeof TBO_SUPABASE !== 'undefined' && !!TBO_SUPABASE.getClient() }
    ];

    const version = typeof TBO_CONFIG !== 'undefined' ? TBO_CONFIG.app.version : '2.1.0';

    return `
      <div class="cfg-section-header">
        <h2>Sistema</h2>
        <p class="cfg-section-desc">Status dos serviços, versão e informações técnicas.</p>
      </div>

      <!-- Card: Status dos servicos -->
      <div class="card cfg-card">
        <h3 class="cfg-card-title"><i data-lucide="activity"></i> Status dos Servicos</h3>
        <div class="cfg-services-list">
          ${services.map(s => `
            <div class="cfg-service-row">
              <div class="cfg-service-info">
                <i data-lucide="${s.icon}"></i>
                <span class="cfg-service-name">${s.name}</span>
              </div>
              <div class="cfg-service-status">
                ${s.detail ? `<span class="cfg-service-detail">${s.detail}</span>` : ''}
                <span class="cfg-status-indicator ${s.ok ? 'ok' : 'off'}">
                  ${s.ok ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Card: Configuracoes Financeiras (founder/coo only) -->
      ${typeof TBO_AUTH !== 'undefined' && ['founder', 'coo'].includes(TBO_AUTH.getCurrentUser()?.role) ? this._renderFinancialConfig() : ''}

      <!-- Card: Sobre -->
      <div class="card cfg-card">
        <h3 class="cfg-card-title"><i data-lucide="info"></i> Sobre o TBO OS</h3>
        <div class="cfg-about">
          <div class="cfg-about-row"><span class="cfg-about-label">Sistema</span><strong>TBO OS</strong> — Sistema Operacional do Studio TBO</div>
          <div class="cfg-about-row"><span class="cfg-about-label">Versao</span><strong>${version}</strong></div>
          <div class="cfg-about-row"><span class="cfg-about-label">IA Ativa</span>${TBO_API.getProviderLabel()} (${TBO_API.getModel()})</div>
          <div class="cfg-about-row"><span class="cfg-about-label">Tecnologias</span>HTML5, CSS3, JavaScript (Vanilla), Supabase, Claude API, OpenAI API</div>
          <div class="cfg-about-row"><span class="cfg-about-label">Dados</span>Supabase, Google Drive, Notion, Fireflies, RD Station CRM</div>
        </div>

        <div class="cfg-social-links">
          <span class="cfg-social-label">Redes Sociais TBO</span>
          <div class="cfg-social-row">
            <a href="https://www.instagram.com/tbo.arq/" target="_blank" class="btn btn-secondary btn-sm">
              <i data-lucide="instagram"></i> Instagram
            </a>
            <a href="https://www.linkedin.com/company/tbo-studio/" target="_blank" class="btn btn-secondary btn-sm">
              <i data-lucide="linkedin"></i> LinkedIn
            </a>
            <a href="https://agenciatbo.com.br" target="_blank" class="btn btn-secondary btn-sm">
              <i data-lucide="globe"></i> Website
            </a>
          </div>
        </div>
      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════════════════════
  // RENDERS AUXILIARES (reutilizados)
  // ══════════════════════════════════════════════════════════════════════════

  _renderFinancialConfig() {
    const fin = TBO_CONFIG.business.financial;
    const bi = TBO_CONFIG.business.biScoring;
    const fy = TBO_CONFIG.app.fiscalYear;

    const _field = (id, label, value, hint) => `
      <div class="cfg-fin-field">
        <div class="cfg-fin-field-info">
          <div class="cfg-fin-field-label">${label}</div>
          ${hint ? `<div class="cfg-fin-field-hint">${hint}</div>` : ''}
        </div>
        <input type="number" id="${id}" value="${value}" class="form-input cfg-fin-input">
      </div>`;

    return `
      <div class="card cfg-card">
        <div class="cfg-card-title-row">
          <h3 class="cfg-card-title"><i data-lucide="bar-chart-3"></i> Configurações Financeiras ${fy}</h3>
          <span class="tag gold">Editavel</span>
        </div>
        <span class="cfg-field-hint" style="margin-bottom:12px;display:block;">Valores refletidos em KPIs, BI e dashboards. Salvos no Supabase.</span>

        <div class="cfg-fin-group-label">Metas</div>
        ${_field('cfgFinMonthly', 'Meta Vendas Mensal', fin.monthlyTarget, 'R$/mes')}
        ${_field('cfgFinQuarterly', 'Meta Trimestral', fin.quarterlyTarget, 'R$/trimestre')}
        ${_field('cfgFinPremium', 'Threshold Premium', fin.premiumThreshold, 'Deals acima = premium')}

        <div class="cfg-fin-group-label">Referencia</div>
        ${_field('cfgFinAvgTicket', 'Ticket Medio 2025', fin.averageTicket2025, 'Usado no scoring BI')}
        ${_field('cfgFinRevenue2024', 'Receita Total 2024', fin.totalRevenue2024, 'Benchmark historico')}

        <div class="cfg-fin-group-label">Comissoes</div>
        ${_field('cfgFinCommStd', 'Comissao Padrao (%)', (fin.commissionRates?.standard || 0.05) * 100, 'Deals normais')}
        ${_field('cfgFinCommPrem', 'Comissao Premium (%)', (fin.commissionRates?.premium || 0.08) * 100, 'Deals > threshold')}

        <div class="cfg-fin-group-label">BI Scoring</div>
        ${_field('cfgBiBaseWinRate', 'Win Rate Base (%)', bi.baseWinRate, 'Taxa base de conversao')}
        ${_field('cfgBiProbBase', 'Probabilidade Base', bi.probabilityBase, 'Score inicial deals')}

        <div class="cfg-fin-group-label">Pricing por BU</div>
        <div class="cfg-pricing-grid">
          <div class="cfg-pricing-header">Servico</div>
          <div class="cfg-pricing-header" style="text-align:right;">Min</div>
          <div class="cfg-pricing-header" style="text-align:right;">Max</div>
          ${Object.entries(fin.servicePricing || {}).map(([bu, p]) => `
            <div>${bu}</div>
            <div style="text-align:right;color:var(--text-secondary);">R$ ${(p.min || 0).toLocaleString('pt-BR')}</div>
            <div style="text-align:right;color:var(--text-primary);font-weight:500;">R$ ${(p.max || 0).toLocaleString('pt-BR')}</div>
          `).join('')}
        </div>

        <div class="cfg-fin-actions">
          <button class="btn btn-primary" id="cfgSaveFinancial" style="flex:1;">
            <i data-lucide="save"></i> Salvar no Supabase
          </button>
          <button class="btn btn-secondary" id="cfgSyncFromSheets" style="flex:1;">
            <i data-lucide="table"></i> Sync Google Sheets
          </button>
        </div>
        <div id="cfgFinSaveResult" class="cfg-test-result" style="display:none;"></div>

        <div class="cfg-fin-setup">
          <div class="cfg-fin-group-label">Setup Supabase</div>
          <button class="btn btn-secondary btn-sm" id="cfgCreateFinTables" style="width:100%;">
            Criar Tabelas no Supabase (executar 1x)
          </button>
          <span class="cfg-field-hint">Cria business_config, financial_data, financial_targets, operating_criteria</span>
        </div>
      </div>
    `;
  },

  _renderBackupSection() {
    if (typeof TBO_BACKUP === 'undefined') {
      return '<div class="cfg-empty-state"><i data-lucide="archive"></i><span>Sistema de backup nao disponivel.</span></div>';
    }

    const backups = TBO_BACKUP.listBackups();
    const info = TBO_BACKUP.getStorageInfo();
    const usagePercent = Math.min(100, Math.round((info.tboKB + info.backupKB) / info.limitKB * 100));

    let html = `
      <div class="cfg-backup-actions">
        <button class="btn btn-primary btn-sm" id="cfgCreateBackup"><i data-lucide="plus"></i> Criar Backup</button>
        <button class="btn btn-secondary btn-sm" id="cfgExportBackup"><i data-lucide="download"></i> Exportar JSON</button>
        <label class="btn btn-secondary btn-sm" style="cursor:pointer;">
          <i data-lucide="upload"></i> Importar
          <input type="file" id="cfgImportFile" accept=".json" style="display:none;">
        </label>
      </div>

      <div class="cfg-storage-bar">
        <div class="cfg-storage-info">
          <span>Storage: ${info.tboKB}KB dados + ${info.backupKB}KB backups</span>
          <span>${usagePercent}% de ~${info.limitKB}KB</span>
        </div>
        <div class="cfg-storage-track">
          <div class="cfg-storage-fill" style="width:${usagePercent}%;"></div>
        </div>
      </div>
    `;

    if (backups.length > 0) {
      html += `<div class="cfg-backup-list-title">Backups salvos (max ${TBO_BACKUP._maxBackups}):</div>`;
      html += backups.map(b => {
        const date = new Date(b.date);
        const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
        const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return `<div class="cfg-backup-item">
          <div class="cfg-backup-info">
            <div>${b.label} <span class="cfg-backup-version">(v${b.version})</span></div>
            <div class="cfg-backup-meta">${dateStr} ${timeStr} | ${b.sizeKB}KB, ${b.dataKeys} itens</div>
          </div>
          <div class="cfg-backup-btns">
            <button class="btn btn-sm btn-secondary cfgRestoreBackup" data-key="${b.key}">Restaurar</button>
            <button class="btn btn-sm btn-ghost cfgDeleteBackup" data-key="${b.key}" style="color:var(--danger);">x</button>
          </div>
        </div>`;
      }).join('');
    } else {
      html += '<div class="cfg-empty-state" style="padding:12px 0;"><i data-lucide="archive"></i><span>Nenhum backup salvo.</span></div>';
    }

    return html;
  },

  _renderAuditSection() {
    if (typeof TBO_STORAGE === 'undefined') return '';

    const log = TBO_STORAGE.getAuditLog ? TBO_STORAGE.getAuditLog() : [];
    const recent = log.slice(0, 20);

    // Atualiza badge de contagem
    setTimeout(() => {
      const badge = document.getElementById('cfgAuditCount');
      if (badge) badge.textContent = `${log.length} registros`;
    }, 0);

    if (recent.length === 0) {
      return '<div class="cfg-empty-state" style="padding:12px 0;"><i data-lucide="scroll-text"></i><span>Nenhum registro de auditoria.</span></div>';
    }

    const actionLabels = {
      create: 'Criou', update: 'Atualizou', delete: 'Removeu',
      transition: 'Transicao', approve: 'Aprovou', reject: 'Rejeitou',
      complete: 'Concluiu', start: 'Iniciou', pause: 'Pausou'
    };

    return `
      <div class="cfg-audit-list">
        ${recent.map(entry => {
          const date = new Date(entry.timestamp || entry.date);
          const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          const action = actionLabels[entry.action] || entry.action || '?';
          const entity = entry.entityType || entry.type || '?';
          const name = entry.entityName || entry.name || entry.entityId || '';
          const user = entry.userId || entry.user || '-';
          return `<div class="cfg-audit-row">
            <span class="cfg-audit-date">${dateStr} ${timeStr}</span>
            <div class="cfg-audit-detail">
              <strong>${user}</strong>
              <span>${action}</span>
              <span class="tag" style="font-size:0.65rem;">${entity}</span>
              ${name ? `<span>${name}</span>` : ''}
              ${entry.from && entry.to ? `<span class="cfg-audit-arrow">${entry.from} &rarr; ${entry.to}</span>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
      ${log.length > 20 ? `<div class="cfg-audit-more">Mostrando 20 de ${log.length} registros</div>` : ''}
    `;
  },

  // ══════════════════════════════════════════════════════════════════════════
  // INIT — Bindagem de eventos
  // ══════════════════════════════════════════════════════════════════════════

  init() {
    // Ativar icones Lucide
    if (window.lucide) lucide.createIcons();

    // ── Navegacao de categorias ────────────────────────────────────────────
    document.querySelectorAll('.cfg-sidebar-item').forEach(btn => {
      btn.addEventListener('click', () => {
        this._activeCategory = btn.dataset.category;
        // Atualizar sidebar ativa
        document.querySelectorAll('.cfg-sidebar-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Re-renderizar conteudo
        const panel = document.getElementById('cfgContentPanel');
        if (panel) {
          panel.innerHTML = this._renderCategoryContent(this._activeCategory);
          if (window.lucide) lucide.createIcons();
          this._bindCategoryEvents(this._activeCategory);
        }
      });
    });

    // Bind eventos da categoria inicial
    this._bindCategoryEvents(this._activeCategory);
  },

  // ── Bind de eventos por categoria ────────────────────────────────────────

  _bindCategoryEvents(categoryId) {
    switch (categoryId) {
      case 'perfil':      this._bindPerfil(); break;
      case 'integracoes': this._bindIntegracoes(); break;
      case 'ia':          this._bindIA(); break;
      case 'usuarios':    this._bindUsuarios(); break;
      case 'dados':       this._bindDados(); break;
      case 'sistema':     this._bindSistema(); break;
    }
  },

  // ── Bindings: Perfil & Conta ─────────────────────────────────────────────

  _bindPerfil() {
    // Tema
    document.querySelectorAll('.cfg-theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        localStorage.setItem('tbo_theme', theme);
        document.querySelectorAll('.cfg-theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Aplicar tema (se o sistema suportar)
        if (typeof TBO_APP !== 'undefined' && TBO_APP.setTheme) {
          TBO_APP.setTheme(theme);
        }
        TBO_TOAST.success('Tema alterado', `Tema "${theme}" aplicado.`);
      });
    });

    // Notificacoes
    ['cfgNotifGeneral', 'cfgNotifSync', 'cfgNotifErrors'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => {
          const key = id.replace('cfgNotif', '').toLowerCase();
          localStorage.setItem(`tbo_notif_${key}`, el.checked);
          TBO_TOAST.info('Notificacoes', `Notificacoes de ${key} ${el.checked ? 'ativadas' : 'desativadas'}.`);
        });
      }
    });
  },

  // ── Bindings: Integracoes ────────────────────────────────────────────────

  _bindIntegracoes() {
    // === Fireflies ===
    this._bind('cfgSaveFFKey', () => {
      const input = document.getElementById('cfgFirefliesKey');
      if (!input) return;
      const key = input.value.trim();
      if (!key || key === '************') {
        TBO_TOAST.warning('API Key', 'Cole sua API Key do Fireflies para ativar a integracao.');
        return;
      }
      if (typeof TBO_FIREFLIES !== 'undefined') {
        TBO_FIREFLIES.setApiKey(key);
        input.value = '************';
        TBO_TOAST.success('Fireflies', 'API Key salva! Re-sincronizando...');
        TBO_FIREFLIES.forceRefresh().then(() => {
          TBO_STORAGE.loadAll().then(() => {
            if (typeof TBO_APP !== 'undefined') TBO_APP._updateStatus();
            TBO_TOAST.success('Fireflies', `${TBO_FIREFLIES.getStatus().meetingCount} reunioes carregadas em tempo real!`);
          });
        }).catch(e => TBO_TOAST.error('Fireflies', `Erro: ${e.message}`));
      }
    });

    this._bind('cfgSaveFFDays', () => {
      const input = document.getElementById('cfgFirefliesDays');
      if (!input) return;
      const days = parseInt(input.value) || 90;
      localStorage.setItem('tbo_fireflies_days', days);
      TBO_TOAST.success('Fireflies', `Periodo alterado para ${days} dias.`);
    });

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
        TBO_TOAST.info('Fireflies', 'Configure sua API Key para ativar a sincronizacao.');
      }
    });

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

    // === RD Station ===
    this._bind('cfgSaveRdToken', () => {
      const input = document.getElementById('cfgRdToken');
      if (!input) return;
      const token = input.value.trim();
      if (!token || token === '************') {
        TBO_TOAST.warning('RD Station', 'Cole seu API Token do RD Station CRM.');
        return;
      }
      if (typeof TBO_RD_STATION !== 'undefined') {
        TBO_RD_STATION.setApiToken(token);
        TBO_RD_STATION.setEnabled(true);
        input.value = '************';
        TBO_TOAST.success('RD Station', 'Token salvo! Testando conexao...');
        TBO_RD_STATION.testConnection().then(result => {
          const users = result.users || result || [];
          TBO_TOAST.success('RD Station', `Conectado! ${Array.isArray(users) ? users.length : 0} usuarios encontrados.`);
          return TBO_RD_STATION.fetchDealStages();
        }).then(stages => {
          if (stages && stages.length > 0 && !TBO_RD_STATION.getStageMapping()) {
            const mapping = TBO_RD_STATION.buildDefaultStageMapping(stages);
            TBO_RD_STATION.setStageMapping(mapping);
            TBO_TOAST.info('RD Station', 'Mapeamento de etapas criado automaticamente.');
          }
        }).catch(e => TBO_TOAST.error('RD Station', `Erro: ${e.message}`));
      }
    });

    this._bind('cfgTestRd', async () => {
      const resultEl = document.getElementById('cfgRdTestResult');
      if (!resultEl) return;
      resultEl.style.display = 'block';
      resultEl.innerHTML = '<span style="color:#7c3aed;">Testando conexao...</span>';
      try {
        if (typeof TBO_RD_STATION === 'undefined' || !TBO_RD_STATION.getApiToken()) {
          resultEl.innerHTML = '<span style="color:#ef4444;">Nenhum token configurado.</span>';
          return;
        }
        const result = await TBO_RD_STATION.testConnection();
        const users = result.users || result || [];
        resultEl.innerHTML = `<span style="color:#22c55e;">&#10003; Conectado!</span> <span style="color:var(--text-muted);">${Array.isArray(users) ? users.length : 0} usuarios no CRM</span>`;
      } catch (e) {
        resultEl.innerHTML = `<span style="color:#ef4444;">&#10007; Erro: ${e.message}</span>`;
      }
    });

    this._bind('cfgRdSync', async () => {
      if (typeof TBO_RD_STATION === 'undefined' || !TBO_RD_STATION.isEnabled()) return;
      TBO_TOAST.info('RD Station', 'Sincronizando deals e contatos...');
      try {
        const result = await TBO_RD_STATION.forceRefresh();
        if (result) {
          TBO_TOAST.success('RD Station', `Sync completo: ${result.created} novos, ${result.updated} atualizados | ${result.contacts} contatos, ${result.organizations || 0} empresas`);
        } else {
          TBO_TOAST.warning('RD Station', 'Sync retornou sem resultado.');
        }
      } catch (e) {
        TBO_TOAST.error('RD Station', `Erro: ${e.message}`);
      }
    });

    this._bind('cfgRdStageMapping', () => {
      if (typeof TBO_RD_STATION !== 'undefined') {
        TBO_RD_STATION._showStageMappingModal();
      }
    });

    const rdAutoSync = document.getElementById('cfgRdAutoSync');
    if (rdAutoSync) {
      rdAutoSync.addEventListener('change', () => {
        if (typeof TBO_RD_STATION !== 'undefined') {
          TBO_RD_STATION.setEnabled(rdAutoSync.checked);
          TBO_TOAST.info('RD Station', rdAutoSync.checked ? 'Auto-sync ativado.' : 'Auto-sync desativado.');
        }
      });
    }

    // === Google Calendar ===
    this._bind('cfgGcalSync', async () => {
      if (typeof TBO_GOOGLE_CALENDAR === 'undefined') return;
      TBO_TOAST.info('Google Calendar', 'Sincronizando eventos...');
      try {
        const result = await TBO_GOOGLE_CALENDAR.forceRefresh();
        if (result) {
          TBO_TOAST.success('Google Calendar', `${result.events} eventos sincronizados!`);
        } else {
          TBO_TOAST.warning('Google Calendar', 'Sync retornou sem resultado. Verifique login Google.');
        }
      } catch (e) {
        TBO_TOAST.error('Google Calendar', `Erro: ${e.message}`);
      }
    });

    this._bind('cfgGcalTest', async () => {
      const resultEl = document.getElementById('cfgGcalTestResult');
      if (!resultEl) return;
      resultEl.style.display = 'block';
      resultEl.innerHTML = '<span style="color:#4285f4;">Testando conexao...</span>';
      try {
        if (typeof TBO_GOOGLE_CALENDAR === 'undefined') {
          resultEl.innerHTML = '<span style="color:#ef4444;">Modulo nao carregado.</span>';
          return;
        }
        const result = await TBO_GOOGLE_CALENDAR.testConnection();
        resultEl.innerHTML = `<span style="color:#22c55e;">&#10003; Conectado!</span> <span style="color:var(--text-muted);">${result.calendars || 0} calendarios</span>`;
      } catch (e) {
        resultEl.innerHTML = `<span style="color:#ef4444;">&#10007; Erro: ${e.message}</span>`;
      }
    });

    const gcalAutoSync = document.getElementById('cfgGcalAutoSync');
    if (gcalAutoSync) {
      gcalAutoSync.addEventListener('change', () => {
        if (typeof TBO_GOOGLE_CALENDAR !== 'undefined') {
          TBO_GOOGLE_CALENDAR.setEnabled(gcalAutoSync.checked);
          TBO_TOAST.info('Google Calendar', gcalAutoSync.checked ? 'Auto-sync ativado.' : 'Auto-sync desativado.');
        }
      });
    }

    // === Google Sheets ===
    this._bind('cfgSaveSheetsId', () => {
      const input = document.getElementById('cfgSheetsId');
      if (!input) return;
      const id = input.value.trim();
      if (!id) {
        TBO_TOAST.warning('Google Sheets', 'Informe o ID da planilha.');
        return;
      }
      localStorage.setItem('tbo_sheets_id', id);
      TBO_TOAST.success('Google Sheets', 'Spreadsheet ID salvo!');
    });

    this._bind('cfgSyncSheets', async () => {
      if (typeof TBO_SHEETS === 'undefined') {
        TBO_TOAST.warning('Google Sheets', 'Modulo de Google Sheets nao disponivel.');
        return;
      }
      TBO_TOAST.info('Google Sheets', 'Sincronizando dados...');
      try {
        await TBO_SHEETS.syncFluxoCaixa();
        localStorage.setItem('tbo_sheets_last_sync', new Date().toISOString());
        TBO_TOAST.success('Google Sheets', 'Dados sincronizados com sucesso!');
      } catch (e) {
        TBO_TOAST.error('Google Sheets', `Erro: ${e.message}`);
      }
    });
  },

  // ── Bindings: Inteligencia Artificial ────────────────────────────────────

  _bindIA() {
    // Seletor de provedor
    this._bind('cfgProviderOpenAI', () => {
      TBO_API.setProvider('openai');
      document.getElementById('cfgOpenAISection').style.display = '';
      document.getElementById('cfgClaudeSection').style.display = 'none';
      document.getElementById('cfgProviderOpenAI').classList.add('active');
      document.getElementById('cfgProviderClaude').classList.remove('active');
      TBO_TOAST.info('Provedor alterado', 'OpenAI (ChatGPT) selecionado.');
      if (typeof TBO_APP !== 'undefined') TBO_APP._updateStatus();
    });

    this._bind('cfgProviderClaude', () => {
      TBO_API.setProvider('claude');
      document.getElementById('cfgOpenAISection').style.display = 'none';
      document.getElementById('cfgClaudeSection').style.display = '';
      document.getElementById('cfgProviderOpenAI').classList.remove('active');
      document.getElementById('cfgProviderClaude').classList.add('active');
      TBO_TOAST.info('Provedor alterado', 'Anthropic (Claude) selecionado.');
      if (typeof TBO_APP !== 'undefined') TBO_APP._updateStatus();
    });

    // Salvar configuracoes de IA
    this._bind('cfgSaveApi', () => {
      const provider = TBO_API.getProvider();
      if (provider === 'openai') {
        const key = document.getElementById('cfgOpenAIKey')?.value || '';
        const model = document.getElementById('cfgOpenAIModel')?.value || '';
        TBO_API.setApiKeyFor('openai', key);
        if (model) localStorage.setItem('tbo_model_openai', model);
        localStorage.setItem('tbo_api_key', key);
      } else {
        const key = document.getElementById('cfgClaudeKey')?.value || '';
        const model = document.getElementById('cfgClaudeModel')?.value || '';
        TBO_API.setApiKeyFor('claude', key);
        if (model) localStorage.setItem('tbo_model', model);
        localStorage.setItem('tbo_api_key', key);
      }
      if (typeof TBO_APP !== 'undefined') TBO_APP._updateStatus();
      TBO_TOAST.success('Salvo', `Configuracoes de IA (${TBO_API.getProviderLabel()}) atualizadas.`);
    });

    // Testar conexao
    this._bind('cfgTestApi', async () => {
      const resultEl = document.getElementById('cfgTestResult');
      if (!resultEl) return;
      resultEl.style.display = 'block';
      resultEl.innerHTML = '<span style="color:var(--brand-primary);">Testando conexao...</span>';
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
  },

  // ── Bindings: Gestao de Usuarios ─────────────────────────────────────────

  _bindUsuarios() {
    const isFounder = typeof TBO_AUTH !== 'undefined' && TBO_AUTH.getCurrentUser()?.role === 'founder';
    if (!isFounder) return;

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
  },

  // ── Bindings: Dados & Backup ─────────────────────────────────────────────

  _bindDados() {
    // Recarregar dados
    this._bind('cfgReloadData', async () => {
      TBO_TOAST.info('Recarregando', 'Carregando dados...');
      try {
        await TBO_STORAGE.loadAll();
        if (typeof TBO_APP !== 'undefined') TBO_APP._updateStatus();
        TBO_TOAST.success('Dados recarregados');
      } catch (e) {
        TBO_TOAST.error('Erro', e.message);
      }
    });

    // Exportar dados
    this._bind('cfgExportData', () => {
      TBO_STORAGE.exportAll();
      TBO_TOAST.success('Exportado', 'Arquivo JSON baixado.');
    });

    // Limpar cache
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

    // Limpar todo historico
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

    // Backup
    this._bind('cfgCreateBackup', () => {
      if (typeof TBO_BACKUP === 'undefined') return;
      const result = TBO_BACKUP.createBackup('Backup manual');
      TBO_TOAST.success('Backup criado', result.snapshot.label);
      const section = document.getElementById('cfgBackupSection');
      if (section) {
        section.innerHTML = this._renderBackupSection();
        if (window.lucide) lucide.createIcons();
        this._bindBackupActions();
      }
    });

    this._bind('cfgExportBackup', () => {
      if (typeof TBO_BACKUP === 'undefined') return;
      const result = TBO_BACKUP.exportToFile();
      if (result.ok) TBO_TOAST.success('Exportado', `Backup JSON (${result.sizeKB}KB) baixado.`);
    });

    // Import
    const importInput = document.getElementById('cfgImportFile');
    if (importInput) {
      importInput.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file || typeof TBO_BACKUP === 'undefined') return;
        const result = await TBO_BACKUP.importFromFile(file);
        if (result.ok) {
          TBO_TOAST.success('Importado', result.msg);
          if (typeof TBO_STORAGE !== 'undefined') await TBO_STORAGE.loadAll();
        } else {
          TBO_TOAST.error('Erro', result.msg);
        }
        importInput.value = '';
      });
    }

    this._bindBackupActions();
  },

  // ── Bindings: Sistema ────────────────────────────────────────────────────

  _bindSistema() {
    // Configuracoes financeiras (founder/coo)
    this._bind('cfgSaveFinancial', async () => {
      const resultEl = document.getElementById('cfgFinSaveResult');
      if (resultEl) { resultEl.style.display = 'block'; resultEl.innerHTML = '<span style="color:var(--brand-primary);">Salvando...</span>'; }

      const getVal = (id) => parseFloat(document.getElementById(id)?.value) || 0;

      const financialUpdate = {
        monthlyTarget: getVal('cfgFinMonthly'),
        quarterlyTarget: getVal('cfgFinQuarterly'),
        premiumThreshold: getVal('cfgFinPremium'),
        averageTicket2025: getVal('cfgFinAvgTicket'),
        totalRevenue2024: getVal('cfgFinRevenue2024'),
        commissionRates: {
          standard: getVal('cfgFinCommStd') / 100,
          premium: getVal('cfgFinCommPrem') / 100
        }
      };

      const biUpdate = {
        baseWinRate: getVal('cfgBiBaseWinRate'),
        probabilityBase: getVal('cfgBiProbBase')
      };

      const ok1 = await TBO_CONFIG.saveBusinessConfig('financial', financialUpdate);
      const ok2 = await TBO_CONFIG.saveBusinessConfig('biScoring', biUpdate);

      if (resultEl) {
        if (ok1 && ok2) {
          resultEl.innerHTML = '<span style="color:#22c55e;">&#10003; Salvo no Supabase e localStorage!</span>';
          TBO_TOAST.success('Configuracoes financeiras', 'Valores atualizados com sucesso.');
        } else {
          resultEl.innerHTML = '<span style="color:#f59e0b;">&#9888; Salvo localmente. Supabase indisponivel.</span>';
          TBO_TOAST.info('Configuracoes financeiras', 'Salvo localmente. Execute "Criar Tabelas" se o Supabase nao esta configurado.');
        }
      }
    });

    this._bind('cfgSyncFromSheets', async () => {
      if (typeof TBO_SHEETS === 'undefined') {
        TBO_TOAST.warning('Google Sheets', 'Modulo de Google Sheets nao disponivel.');
        return;
      }
      TBO_TOAST.info('Google Sheets', 'Sincronizando dados financeiros...');
      try {
        await TBO_SHEETS.syncFluxoCaixa();
        TBO_TOAST.success('Google Sheets', 'Fluxo de caixa atualizado da planilha!');
      } catch (e) {
        TBO_TOAST.error('Google Sheets', `Erro: ${e.message}`);
      }
    });

    this._bind('cfgCreateFinTables', async () => {
      if (typeof TBO_SUPABASE === 'undefined') {
        TBO_TOAST.error('Supabase', 'Cliente Supabase nao inicializado.');
        return;
      }
      TBO_TOAST.info('Supabase', 'Criando tabelas financeiras...');
      try {
        const client = TBO_SUPABASE.getClient();
        if (!client) throw new Error('Supabase client nao disponivel');
        const { data, error } = await client.from('business_config').select('key').limit(1);
        if (error && error.code === '42P01') {
          TBO_TOAST.warning('Supabase', 'Tabelas nao existem. Execute o SQL no Supabase Dashboard.');
        } else if (error) {
          TBO_TOAST.error('Supabase', `Erro: ${error.message}`);
        } else {
          TBO_TOAST.success('Supabase', 'Tabelas ja existem! Pronto para usar.');
          const ok = await TBO_CONFIG.saveBusinessConfig('financial', TBO_CONFIG.business.financial);
          if (ok) TBO_TOAST.success('Supabase', 'Config financeiro salvo com sucesso!');
        }
      } catch (e) {
        TBO_TOAST.error('Supabase', `Erro: ${e.message}. Execute o SQL manualmente no Supabase Dashboard.`);
      }
    });
  },

  // ══════════════════════════════════════════════════════════════════════════
  // METODOS AUXILIARES
  // ══════════════════════════════════════════════════════════════════════════

  _bindBackupActions() {
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

    document.querySelectorAll('.cfgDeleteBackup').forEach(btn => {
      btn.addEventListener('click', () => {
        if (typeof TBO_BACKUP === 'undefined') return;
        TBO_BACKUP.deleteBackup(btn.dataset.key);
        const section = document.getElementById('cfgBackupSection');
        if (section) {
          section.innerHTML = this._renderBackupSection();
          if (window.lucide) lucide.createIcons();
          this._bindBackupActions();
        }
        TBO_TOAST.info('Removido', 'Backup deletado.');
      });
    });
  },

  // ── Gestao de usuarios ───────────────────────────────────────────────────

  async _loadUsers() {
    try {
      const tenantId = TBO_SUPABASE.getCurrentTenantId();
      let query = TBO_SUPABASE.getClient()
        .from('profiles')
        .select('*')
        .order('full_name');
      if (tenantId) query = query.eq('tenant_id', tenantId);
      const { data, error } = await query;
      if (error) throw error;
      this._users = data || [];

      // Re-renderizar tabela de usuarios se estivermos na categoria
      if (this._activeCategory === 'usuarios') {
        const panel = document.getElementById('cfgContentPanel');
        if (panel) {
          panel.innerHTML = this._renderUsuarios();
          if (window.lucide) lucide.createIcons();
          this._bindUsuarios();
        }
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

  _showAddUserModal() {
    const roleOptions = Object.entries(TBO_CONFIG.business.roles).map(([id, r]) => ({
      value: id, label: r.label, color: r.color
    }));
    const buOptions = ['', ...TBO_CONFIG.business.getBUNames()];

    const html = `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div>
          <label class="form-label">Nome Completo *</label>
          <input type="text" id="addUserName" class="form-input" placeholder="Ex: Maria Silva" style="width:100%;">
        </div>
        <div>
          <label class="form-label">Username *</label>
          <input type="text" id="addUserUsername" class="form-input" placeholder="Ex: maria (sem espacos)" style="width:100%;">
          <span class="cfg-field-hint">Identificador unico, usado para login legado</span>
        </div>
        <div>
          <label class="form-label">Email *</label>
          <input type="email" id="addUserEmail" class="form-input" placeholder="Ex: maria@agenciatbo.com.br" style="width:100%;">
        </div>
        <div>
          <label class="form-label">Cargo / Role *</label>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${roleOptions.map(r => `
              <label class="addUserRoleOption" data-role="${r.value}" data-color="${r.color}"
                     style="display:flex;align-items:center;gap:4px;padding:6px 12px;border:2px solid var(--border-subtle);border-radius:8px;cursor:pointer;font-size:0.78rem;transition:all .2s;">
                <input type="radio" name="addUserRole" value="${r.value}" style="display:none;">
                <span style="width:10px;height:10px;border-radius:50%;background:${r.color};"></span>
                ${r.label}
              </label>
            `).join('')}
          </div>
        </div>
        <div>
          <label class="form-label">Business Unit</label>
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

    if (!name) { TBO_TOAST.warning('Campo obrigatorio', 'Informe o nome completo.'); return; }
    if (!username) { TBO_TOAST.warning('Campo obrigatorio', 'Informe o username.'); return; }
    if (!email) { TBO_TOAST.warning('Campo obrigatorio', 'Informe o email.'); return; }
    if (!role) { TBO_TOAST.warning('Campo obrigatorio', 'Selecione um cargo/role.'); return; }
    if (username.includes(' ')) { TBO_TOAST.warning('Username invalido', 'O username nao pode conter espacos.'); return; }

    try {
      const newId = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); });

      const { error } = await TBO_SUPABASE.getClient()
        .from('profiles')
        .insert({
          id: newId,
          username,
          full_name: name,
          email,
          role,
          bu,
          is_active: true
        });

      if (error) throw error;

      TBO_TOAST.success('Usuario criado', `${name} foi adicionado com sucesso como ${role}.`);

      const overlay = document.getElementById('addUserOverlay');
      if (overlay) overlay.remove();
      if (typeof TBO_MODAL !== 'undefined' && TBO_MODAL.close) TBO_MODAL.close();

      await this._loadUsers();
    } catch (e) {
      console.error('[TBO_CONFIGURACOES] Erro ao criar usuario:', e);
      TBO_TOAST.error('Erro ao criar usuario', e.message || 'Verifique os dados e tente novamente.');
    }
  },

  // ── Helper de bind ───────────────────────────────────────────────────────

  _bind(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ESTILOS (scoped ao modulo)
  // ══════════════════════════════════════════════════════════════════════════

  _getStyles() {
    return `
      /* ── Layout principal ──────────────────────────────── */
      .cfg-container {
        display: flex;
        gap: 0;
        min-height: calc(100vh - 140px);
        background: var(--bg-primary);
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid var(--border-default);
      }

      /* ── Sidebar ───────────────────────────────────────── */
      .cfg-sidebar {
        width: 220px;
        min-width: 220px;
        background: var(--bg-secondary);
        border-right: 1px solid var(--border-default);
        padding: 20px 12px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .cfg-sidebar-title {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-muted);
        padding: 0 8px 12px;
        margin-bottom: 4px;
        border-bottom: 1px solid var(--border-subtle);
      }

      .cfg-sidebar-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border: none;
        background: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.82rem;
        font-weight: 500;
        color: var(--text-secondary);
        transition: all 0.15s ease;
        text-align: left;
        width: 100%;
      }

      .cfg-sidebar-item:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
      }

      .cfg-sidebar-item.active {
        background: var(--brand-primary);
        color: #fff;
      }

      .cfg-sidebar-item.active i { color: #fff; }

      .cfg-sidebar-item i {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }

      /* ── Painel de conteudo ────────────────────────────── */
      .cfg-content {
        flex: 1;
        padding: 28px 32px;
        overflow-y: auto;
        max-height: calc(100vh - 140px);
      }

      .cfg-section-header {
        margin-bottom: 24px;
      }

      .cfg-section-header h2 {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 4px;
      }

      .cfg-section-desc {
        font-size: 0.82rem;
        color: var(--text-muted);
        margin: 0;
      }

      /* ── Cards ─────────────────────────────────────────── */
      .cfg-card {
        margin-bottom: 16px;
        padding: 20px;
      }

      .cfg-card-title {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 16px;
      }

      .cfg-card-title i { width: 18px; height: 18px; color: var(--text-muted); }

      .cfg-card-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }

      .cfg-card-title-row .cfg-card-title { margin-bottom: 0; }

      /* ── Perfil ────────────────────────────────────────── */
      .cfg-profile-header {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .cfg-avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid var(--border-default);
      }

      .cfg-avatar-placeholder {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        font-weight: 700;
        color: #fff;
        flex-shrink: 0;
      }

      .cfg-profile-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .cfg-profile-name {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0;
      }

      .cfg-profile-email {
        font-size: 0.82rem;
        color: var(--text-secondary);
      }

      /* ── Tema ──────────────────────────────────────────── */
      .cfg-theme-selector {
        display: flex;
        gap: 8px;
      }

      .cfg-theme-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px;
        border: 2px solid var(--border-default);
        border-radius: 10px;
        background: var(--bg-secondary);
        cursor: pointer;
        font-size: 0.82rem;
        font-weight: 500;
        color: var(--text-secondary);
        transition: all 0.15s ease;
      }

      .cfg-theme-btn:hover { border-color: var(--text-muted); }

      .cfg-theme-btn.active {
        border-color: var(--brand-primary);
        background: var(--brand-primary)0a;
        color: var(--brand-primary);
      }

      .cfg-theme-btn i { width: 18px; height: 18px; }

      /* ── Toggles / Checkboxes ──────────────────────────── */
      .cfg-toggle-list {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .cfg-toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid var(--border-subtle);
        cursor: pointer;
      }

      .cfg-toggle-row:last-child { border-bottom: none; }

      .cfg-toggle-label {
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--text-primary);
      }

      .cfg-toggle-hint {
        font-size: 0.72rem;
        color: var(--text-muted);
        margin-top: 2px;
      }

      .cfg-checkbox {
        width: 18px;
        height: 18px;
        accent-color: var(--brand-primary);
        cursor: pointer;
      }

      .cfg-inline-toggle {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.78rem;
        cursor: pointer;
        color: var(--text-secondary);
      }

      /* ── Integration Cards ─────────────────────────────── */
      .cfg-integration-card { padding: 0; overflow: hidden; }

      .cfg-integration-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border-subtle);
      }

      .cfg-integration-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .cfg-integration-icon i { width: 20px; height: 20px; }

      .cfg-integration-meta {
        flex: 1;
      }

      .cfg-integration-meta h3 {
        font-size: 0.92rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }

      .cfg-integration-desc {
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      .cfg-status-badge {
        font-size: 0.7rem;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 20px;
        white-space: nowrap;
      }

      .cfg-status-badge.connected {
        background: #22c55e18;
        color: #22c55e;
        border: 1px solid #22c55e44;
      }

      .cfg-status-badge.disconnected {
        background: #ef444418;
        color: #ef4444;
        border: 1px solid #ef444444;
      }

      .cfg-status-badge.future {
        background: var(--bg-tertiary);
        color: var(--text-muted);
        border: 1px solid var(--border-subtle);
      }

      .cfg-integration-body { padding: 16px 20px; }

      .cfg-integration-disabled { opacity: 0.7; }

      .cfg-integration-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
        margin-top: 12px;
      }

      .cfg-integration-actions .btn { display: flex; align-items: center; gap: 4px; }
      .cfg-integration-actions .btn i { width: 14px; height: 14px; }

      .cfg-integration-status {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--border-subtle);
        font-size: 0.78rem;
        color: var(--text-secondary);
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .cfg-status-counters {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .cfg-counter {
        background: var(--bg-secondary);
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.72rem;
      }

      .cfg-integration-error {
        margin-top: 8px;
        font-size: 0.75rem;
        color: var(--danger);
      }

      .cfg-integration-notice {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        background: var(--bg-tertiary);
        border-radius: 8px;
        font-size: 0.78rem;
        color: var(--text-secondary);
      }

      .cfg-integration-notice i { width: 16px; height: 16px; flex-shrink: 0; color: var(--text-muted); }

      /* ── Campos de formulario ──────────────────────────── */
      .cfg-field-row {
        margin-bottom: 14px;
      }

      .cfg-field-input-group {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .cfg-field-input-group .form-input { flex: 1; }

      .cfg-field-hint {
        font-size: 0.72rem;
        color: var(--text-muted);
        margin-top: 4px;
        display: block;
      }

      .cfg-field-hint a { color: var(--brand-primary); }

      .cfg-test-result {
        margin-top: 8px;
        padding: 8px 12px;
        background: var(--bg-secondary);
        border-radius: 6px;
        font-size: 0.78rem;
      }

      /* ── IA Provider Selector ──────────────────────────── */
      .cfg-provider-selector {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
      }

      .cfg-provider-btn {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 16px;
        border: 2px solid var(--border-default);
        border-radius: 12px;
        background: var(--bg-secondary);
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .cfg-provider-btn:hover { border-color: var(--text-muted); }

      .cfg-provider-btn.active {
        border-color: var(--brand-primary);
        background: var(--brand-primary)08;
      }

      .cfg-provider-icon { font-size: 1.5rem; }

      .cfg-provider-name {
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .cfg-ia-actions {
        display: flex;
        gap: 8px;
      }

      .cfg-ia-actions .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }

      .cfg-ia-actions .btn i { width: 16px; height: 16px; }

      /* ── Usuarios ──────────────────────────────────────── */
      .cfg-users-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
      }

      .cfg-users-badges {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .cfg-badge {
        font-size: 0.72rem;
        padding: 4px 10px;
        border-radius: 12px;
        font-weight: 600;
        background: var(--bg-tertiary);
        color: var(--text-primary);
      }

      .cfg-badge-success { background: #22c55e22; color: #22c55e; }
      .cfg-badge-danger { background: #ef444422; color: #ef4444; }

      .cfg-users-actions {
        display: flex;
        gap: 6px;
      }

      .cfg-users-actions .btn { display: flex; align-items: center; gap: 4px; }
      .cfg-users-actions .btn i { width: 14px; height: 14px; }

      .cfg-table {
        width: 100%;
        border-collapse: collapse;
      }

      .cfg-table th {
        padding: 8px;
        font-size: 0.72rem;
        color: var(--text-muted);
        text-align: left;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 2px solid var(--border-subtle);
      }

      .cfg-table tr { border-bottom: 1px solid var(--border-subtle); }
      .cfg-table tr:last-child { border-bottom: none; }

      .cfg-td {
        padding: 10px 8px;
        font-size: 0.82rem;
        color: var(--text-primary);
      }

      .cfg-td-name { font-weight: 500; }
      .cfg-td-secondary { color: var(--text-secondary); font-size: 0.78rem; }

      .cfg-user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.72rem;
        font-weight: 700;
      }

      .cfg-switch {
        position: relative;
        display: inline-block;
        width: 36px;
        height: 20px;
      }

      .cfg-switch input { opacity: 0; width: 0; height: 0; }

      .cfg-switch-slider {
        position: absolute;
        cursor: pointer;
        inset: 0;
        background: #ccc;
        border-radius: 20px;
        transition: .3s;
      }

      .cfg-switch-slider:before {
        content: '';
        position: absolute;
        height: 14px;
        width: 14px;
        left: 3px;
        bottom: 3px;
        background: white;
        border-radius: 50%;
        transition: .3s;
      }

      .cfg-switch input:checked + .cfg-switch-slider { background: #22c55e; }
      .cfg-switch input:checked + .cfg-switch-slider:before { transform: translateX(16px); }

      .cfg-status-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      .cfg-status-dot.active { background: #22c55e; }
      .cfg-status-dot.inactive { background: #ef4444; }

      /* ── Dados & Backup ────────────────────────────────── */
      .cfg-data-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .cfg-data-actions .btn {
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: flex-start;
      }

      .cfg-data-actions .btn i { width: 16px; height: 16px; }

      .cfg-backup-actions {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }

      .cfg-backup-actions .btn {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .cfg-backup-actions .btn i { width: 14px; height: 14px; }

      .cfg-storage-bar {
        margin-bottom: 16px;
      }

      .cfg-storage-info {
        display: flex;
        justify-content: space-between;
        font-size: 0.72rem;
        color: var(--text-muted);
        margin-bottom: 4px;
      }

      .cfg-storage-track {
        background: var(--bg-tertiary);
        border-radius: 4px;
        height: 6px;
        overflow: hidden;
      }

      .cfg-storage-fill {
        background: var(--brand-primary);
        height: 100%;
        border-radius: 4px;
        transition: width 0.3s ease;
      }

      .cfg-backup-list-title {
        font-size: 0.78rem;
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--text-secondary);
      }

      .cfg-backup-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid var(--border-subtle);
      }

      .cfg-backup-item:last-child { border-bottom: none; }

      .cfg-backup-info { font-size: 0.78rem; }
      .cfg-backup-version { color: var(--text-muted); }
      .cfg-backup-meta { font-size: 0.7rem; color: var(--text-muted); }
      .cfg-backup-btns { display: flex; gap: 4px; }

      /* ── Audit Log ─────────────────────────────────────── */
      .cfg-audit-list {
        max-height: 300px;
        overflow-y: auto;
      }

      .cfg-audit-row {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 6px 0;
        border-bottom: 1px solid var(--border-subtle);
        font-size: 0.75rem;
      }

      .cfg-audit-date {
        color: var(--text-muted);
        white-space: nowrap;
        min-width: 75px;
      }

      .cfg-audit-detail { flex: 1; color: var(--text-secondary); }
      .cfg-audit-detail strong { color: var(--text-primary); }
      .cfg-audit-arrow { color: var(--text-muted); }
      .cfg-audit-more { font-size: 0.72rem; color: var(--text-muted); padding: 8px 0; text-align: center; }

      /* ── Sistema / Services ────────────────────────────── */
      .cfg-services-list {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .cfg-service-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid var(--border-subtle);
      }

      .cfg-service-row:last-child { border-bottom: none; }

      .cfg-service-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .cfg-service-info i { width: 16px; height: 16px; color: var(--text-muted); }

      .cfg-service-name {
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--text-primary);
      }

      .cfg-service-status {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .cfg-service-detail {
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      .cfg-status-indicator {
        font-size: 0.7rem;
        font-weight: 600;
        padding: 3px 10px;
        border-radius: 12px;
      }

      .cfg-status-indicator.ok {
        background: #22c55e18;
        color: #22c55e;
      }

      .cfg-status-indicator.off {
        background: #ef444418;
        color: #ef4444;
      }

      /* ── Financial Config ──────────────────────────────── */
      .cfg-fin-group-label {
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--brand-primary);
        margin: 14px 0 6px;
      }

      .cfg-fin-group-label:first-of-type { margin-top: 0; }

      .cfg-fin-field {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px solid var(--border-subtle);
      }

      .cfg-fin-field-label { font-size: 0.82rem; font-weight: 500; }
      .cfg-fin-field-hint { font-size: 0.68rem; color: var(--text-muted); }

      .cfg-fin-input {
        width: 110px !important;
        text-align: right;
        padding: 4px 8px !important;
        font-size: 0.82rem !important;
      }

      .cfg-fin-actions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
      }

      .cfg-fin-actions .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }

      .cfg-fin-actions .btn i { width: 14px; height: 14px; }

      .cfg-fin-setup {
        margin-top: 14px;
        padding-top: 14px;
        border-top: 1px solid var(--border-subtle);
      }

      .cfg-pricing-grid {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 4px;
        font-size: 0.75rem;
      }

      .cfg-pricing-header {
        font-weight: 600;
        color: var(--text-muted);
      }

      /* ── About ─────────────────────────────────────────── */
      .cfg-about {
        font-size: 0.82rem;
        color: var(--text-secondary);
      }

      .cfg-about-row {
        display: flex;
        gap: 8px;
        padding: 6px 0;
        border-bottom: 1px solid var(--border-subtle);
        line-height: 1.6;
      }

      .cfg-about-row:last-child { border-bottom: none; }

      .cfg-about-label {
        min-width: 100px;
        font-weight: 600;
        color: var(--text-muted);
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      .cfg-social-links {
        margin-top: 16px;
        padding-top: 14px;
        border-top: 1px solid var(--border-subtle);
      }

      .cfg-social-label {
        font-size: 0.72rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
        display: block;
        margin-bottom: 8px;
      }

      .cfg-social-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .cfg-social-row .btn {
        display: flex;
        align-items: center;
        gap: 4px;
        text-decoration: none;
        font-size: 0.75rem;
      }

      .cfg-social-row .btn i { width: 14px; height: 14px; }

      /* ── Empty state ───────────────────────────────────── */
      .cfg-empty-state {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 20px;
        color: var(--text-muted);
        font-size: 0.82rem;
      }

      .cfg-empty-state i { width: 18px; height: 18px; }

      /* ── Responsivo ────────────────────────────────────── */
      @media (max-width: 768px) {
        .cfg-container {
          flex-direction: column;
          min-height: auto;
        }

        .cfg-sidebar {
          width: 100%;
          min-width: 100%;
          flex-direction: row;
          padding: 12px;
          gap: 4px;
          overflow-x: auto;
          border-right: none;
          border-bottom: 1px solid var(--border-default);
        }

        .cfg-sidebar-title { display: none; }

        .cfg-sidebar-item {
          flex-direction: column;
          gap: 2px;
          font-size: 0.68rem;
          padding: 8px 12px;
          min-width: fit-content;
          text-align: center;
        }

        .cfg-sidebar-item span { white-space: nowrap; }

        .cfg-content {
          padding: 20px 16px;
          max-height: none;
        }

        .cfg-provider-selector { flex-direction: column; }
        .cfg-theme-selector { flex-direction: column; }

        .cfg-integration-header {
          flex-wrap: wrap;
          gap: 8px;
        }

        .cfg-users-toolbar { flex-direction: column; align-items: flex-start; }
      }
    `;
  }
};

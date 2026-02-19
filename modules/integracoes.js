// TBO OS — Module: Integracoes (Integration Status)
// Cards showing status of each integration: Supabase, Google OAuth, AI, Fireflies, Notion
const TBO_INTEGRACOES = {

  render() {
    const integrations = this._checkAll();
    const connected = integrations.filter(i => i.status === 'connected').length;
    const total = integrations.length;

    return `
      <div class="integracoes-module">
        <!-- KPIs -->
        <div class="grid-4" style="margin-bottom:24px;">
          <div class="kpi-card">
            <div class="kpi-label">Integracoes Ativas</div>
            <div class="kpi-value" style="color:var(--color-success);">${connected}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Total</div>
            <div class="kpi-value">${total}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Desconectadas</div>
            <div class="kpi-value" style="color:${total - connected > 0 ? 'var(--color-danger)' : 'var(--color-success)'};">${total - connected}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Saude</div>
            <div class="kpi-value" style="color:${connected === total ? 'var(--color-success)' : 'var(--color-warning)'};">${total > 0 ? Math.round(connected / total * 100) : 0}%</div>
          </div>
        </div>

        <!-- Integration Cards -->
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;">
          ${integrations.map(integ => this._renderCard(integ)).join('')}
        </div>

        <!-- Actions -->
        <div class="card" style="margin-top:24px;">
          <h3 style="margin:0 0 12px;font-size:0.92rem;">Acoes</h3>
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <button class="btn btn-secondary" id="integRefreshBtn">Verificar Conexoes</button>
            <button class="btn btn-ghost" onclick="TBO_ROUTER.navigate('configuracoes')">Ir para Configuracoes</button>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    document.getElementById('integRefreshBtn')?.addEventListener('click', () => {
      this._refresh();
    });
  },

  _renderCard(integ) {
    const statusColor = integ.status === 'connected' ? 'var(--color-success)' : integ.status === 'partial' ? 'var(--color-warning)' : 'var(--color-danger)';
    const statusLabel = integ.status === 'connected' ? 'Conectado' : integ.status === 'partial' ? 'Parcial' : 'Desconectado';
    const statusIcon = integ.status === 'connected' ? 'check-circle' : integ.status === 'partial' ? 'alert-circle' : 'x-circle';

    return `
      <div class="card" style="position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${statusColor};"></div>
        <div style="display:flex;align-items:flex-start;gap:12px;padding-top:8px;">
          <div style="width:40px;height:40px;border-radius:var(--radius-md);background:var(--bg-elevated);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <i data-lucide="${integ.icon}" style="width:20px;height:20px;color:${statusColor};"></i>
          </div>
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <strong style="font-size:0.9rem;">${integ.name}</strong>
              <span style="font-size:0.68rem;padding:2px 8px;border-radius:999px;background:${statusColor}18;color:${statusColor};font-weight:600;">
                ${statusLabel}
              </span>
            </div>
            <p style="font-size:0.78rem;color:var(--text-secondary);margin:0 0 8px;line-height:1.4;">${integ.description}</p>
            ${integ.details ? `<div style="font-size:0.72rem;color:var(--text-muted);line-height:1.5;">${integ.details}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  },

  _checkAll() {
    return [
      this._checkSupabase(),
      this._checkGoogleOAuth(),
      this._checkAI(),
      this._checkFireflies(),
      this._checkRdStation(),
      this._checkNotion()
    ];
  },

  _checkSupabase() {
    const hasClient = typeof TBO_SUPABASE !== 'undefined' && TBO_SUPABASE.getClient() !== null;
    const isOnline = hasClient && TBO_SUPABASE.isOnline();
    const tables = hasClient ? Object.keys(TBO_SUPABASE._tableMap).length : 0;

    return {
      name: 'Supabase',
      icon: 'database',
      status: hasClient ? (isOnline ? 'connected' : 'partial') : 'disconnected',
      description: 'Banco de dados PostgreSQL para persistencia de dados.',
      details: hasClient ? `${tables} tabelas mapeadas. ${isOnline ? 'Online' : 'Offline — usando cache local.'}` : 'Client nao inicializado.'
    };
  },

  _checkGoogleOAuth() {
    const hasSupabase = typeof TBO_SUPABASE !== 'undefined' && TBO_SUPABASE.getClient() !== null;
    const currentUser = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    const isGoogleUser = currentUser?.avatarUrl && currentUser?.supabaseUserId;

    return {
      name: 'Google OAuth',
      icon: 'log-in',
      status: hasSupabase ? (isGoogleUser ? 'connected' : 'partial') : 'disconnected',
      description: 'Autenticacao via Google para login SSO.',
      details: isGoogleUser ? `Logado como ${currentUser.name} via Google.` : hasSupabase ? 'Disponivel mas nao em uso na sessao atual.' : 'Requer Supabase Auth configurado.'
    };
  },

  _checkAI() {
    const config = typeof TBO_CONFIG !== 'undefined' ? TBO_CONFIG : {};
    const hasKey = !!(config.OPENAI_API_KEY || config.CLAUDE_API_KEY || config.AI_API_KEY);

    return {
      name: 'AI (Claude/OpenAI)',
      icon: 'brain',
      status: hasKey ? 'connected' : 'disconnected',
      description: 'Inteligencia artificial para geracoes, analises e insights.',
      details: hasKey ? 'Chave de API configurada.' : 'Nenhuma chave de API configurada. Adicione em config.js.'
    };
  },

  _checkFireflies() {
    const config = typeof TBO_CONFIG !== 'undefined' ? TBO_CONFIG : {};
    const hasKey = !!(config.FIREFLIES_API_KEY);
    const statusEl = document.getElementById('statusFireflies');
    const dot = statusEl?.querySelector('.status-dot');
    const isConnected = dot?.getAttribute('data-status') === 'connected';

    return {
      name: 'Fireflies.ai',
      icon: 'mic',
      status: hasKey ? (isConnected ? 'connected' : 'partial') : 'disconnected',
      description: 'Transcricao automatica de reunioes.',
      details: hasKey ? (isConnected ? 'Conectado e funcional.' : 'Chave configurada, verificando conexao.') : 'Nenhuma chave de API. Adicione em config.js.'
    };
  },

  _checkRdStation() {
    const hasToken = typeof TBO_RD_STATION !== 'undefined' && !!TBO_RD_STATION.getApiToken();
    const status = typeof TBO_RD_STATION !== 'undefined' ? TBO_RD_STATION.getStatus() : null;
    const isConnected = status?.enabled && !status?.error;

    return {
      name: 'RD Station CRM',
      icon: 'briefcase',
      status: hasToken ? (isConnected ? 'connected' : 'partial') : 'disconnected',
      description: 'CRM para gestao de deals e contatos comerciais.',
      details: hasToken
        ? (isConnected
          ? `Sincronizado. ${status.rdDealCount || 0} deals. Ultimo sync: ${status.lastSync ? new Date(status.lastSync).toLocaleString('pt-BR') : 'nunca'}`
          : `Token configurado. ${status?.error || 'Verificando conexao.'}`)
        : 'Nenhum token. Configure em Configuracoes.'
    };
  },

  _checkNotion() {
    const config = typeof TBO_CONFIG !== 'undefined' ? TBO_CONFIG : {};
    const hasKey = !!(config.NOTION_API_KEY || config.NOTION_TOKEN);

    return {
      name: 'Notion',
      icon: 'book-open',
      status: hasKey ? 'connected' : 'disconnected',
      description: 'Integracao com Notion para documentacao e wikis.',
      details: hasKey ? 'Token configurado.' : 'Nenhum token Notion. Adicione em config.js.'
    };
  },

  async _refresh() {
    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.info('Verificando', 'Testando conexoes...');

    // Test Supabase reachability
    if (typeof TBO_SUPABASE !== 'undefined') {
      const reachable = await TBO_SUPABASE.isReachable();
      if (reachable) {
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Supabase', 'Conexao OK.');
      } else {
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Supabase', 'Nao alcanavel.');
      }
    }

    // Re-render
    const container = document.getElementById('moduleContainer');
    if (container) {
      container.innerHTML = this.render();
      this.init();
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }
};

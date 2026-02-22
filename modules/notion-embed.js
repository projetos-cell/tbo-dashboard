/**
 * TBO OS — Module: Notion Embed
 *
 * Renders Notion pages embedded via iframe within the TBO OS layout.
 * Used by sidebar children that previously opened Notion in a new tab.
 *
 * Route: #notion-embed/{childId}
 * The childId maps to a Notion URL via the EMBED_MAP.
 */
const TBO_NOTION_EMBED = {
  _childId: null,
  _title: null,
  _notionUrl: null,

  /**
   * Map of child IDs to Notion embed config
   * Each entry: { title, notionUrl, icon, parent }
   */
  EMBED_MAP: {
    'geral-quadro':      { title: 'Quadro Geral',              notionUrl: 'https://www.notion.so/1f3b27ff29e3802b8269dff2957eeb1f', icon: 'layout-dashboard', parent: 'Geral' },
    'geral-quadro-v2':   { title: 'Quadro Geral v2',           notionUrl: 'https://www.notion.so/2c5b27ff29e3807d8658fca89047002f', icon: 'layout-grid',      parent: 'Geral' },
    'geral-cultura':     { title: 'Manual de Cultura',          notionUrl: 'https://www.notion.so/2193782e356143e5b41756c78e230cec', icon: 'book-open',        parent: 'Geral' },
    'geral-docs':        { title: 'Documentos & Padroes',       notionUrl: 'https://www.notion.so/1c58ac19b4de401bacc051dba890f357', icon: 'file-text',        parent: 'Geral' },
    'geral-bds':         { title: 'BDs | TBO',                  notionUrl: 'https://www.notion.so/1fab27ff29e380d9b152d288ecd5b2da', icon: 'database',         parent: 'Geral' },
    'geral-okrs':        { title: 'OKRs TBO — 2026',            notionUrl: 'https://www.notion.so/2e0b27ff29e38020bf63e8cf9b3714d5', icon: 'target',           parent: 'Pessoas' },
    'brand-linhas':      { title: 'Linhas Editoriais',           notionUrl: 'https://www.notion.so/24fb27ff29e3804db856e6a2c22d9fb0', icon: 'pen-tool',         parent: 'Branding' },
    'brand-links':       { title: 'Links Educacionais',          notionUrl: 'https://www.notion.so/1f8b27ff29e38043b77bf330385eac7d', icon: 'link',             parent: 'Branding' },
    'brand-atendimento': { title: 'Atendimento & Gestao',        notionUrl: 'https://www.notion.so/646495112ac24518926e664f5ff07164', icon: 'headphones',       parent: 'Branding' },
    '3d-cronograma':     { title: 'Cronograma Digital 3D',       notionUrl: 'https://www.notion.so/1fab27ff29e380d496a7cdb3721336ba', icon: 'calendar-range',   parent: 'Digital 3D' },
    'av-cronograma':     { title: 'Cronograma Audiovisual',      notionUrl: 'https://www.notion.so/1fab27ff29e380988600ee817de6ba00', icon: 'calendar-range',   parent: 'Audiovisual' },
    'mkt-guia':          { title: 'Guia da Marca',               notionUrl: 'https://www.notion.so/12ab27ff29e381c3b452c6acf15cdf52', icon: 'book-marked',      parent: 'Marketing' },
    'mkt-calendario':    { title: 'Calendario Redes Sociais',    notionUrl: 'https://www.notion.so/12ab27ff29e3818eab6acab66f4e292b', icon: 'calendar',         parent: 'Marketing' },
    'mkt-demandas':      { title: 'Gestao de Demandas',          notionUrl: 'https://www.notion.so/18ab27ff29e380a6aec4e1d71bff18d5', icon: 'list-checks',      parent: 'Marketing' },
    'com-gestao':        { title: 'Gestao Comercial',             notionUrl: 'https://www.notion.so/237083f5f949400a907f04cb07bf5e55', icon: 'chart-bar',        parent: 'Comercial' }
  },

  render() {
    // Parse childId from the current hash: #notion-embed/{childId}
    const hash = (window.location.hash || '').replace('#', '');
    const parts = hash.split('/');
    this._childId = parts[1] || null;

    const config = this._childId ? this.EMBED_MAP[this._childId] : null;

    if (!config) {
      return `
      <div class="notion-embed-module">
        <div class="notion-embed-error">
          <i data-lucide="alert-circle" style="width:48px;height:48px;opacity:0.3;"></i>
          <h3>Pagina nao encontrada</h3>
          <p>O identificador "${this._esc(this._childId || '')}" nao corresponde a nenhuma pagina Notion cadastrada.</p>
          <button class="btn btn-sm btn-primary" onclick="window.location.hash='dashboard'">Voltar ao Dashboard</button>
        </div>
      </div>`;
    }

    this._title = config.title;
    this._notionUrl = config.notionUrl;

    return `
    <div class="notion-embed-module">
      <div class="notion-embed-toolbar">
        <div class="notion-embed-breadcrumb">
          <span class="notion-embed-bc-parent">${this._esc(config.parent)}</span>
          <i data-lucide="chevron-right" style="width:14px;height:14px;opacity:0.4;"></i>
          <span class="notion-embed-bc-current">
            <i data-lucide="${this._esc(config.icon)}" style="width:16px;height:16px;"></i>
            ${this._esc(config.title)}
          </span>
        </div>
        <div class="notion-embed-actions">
          <button class="btn btn-sm" id="notionEmbedRefresh" title="Recarregar">
            <i data-lucide="refresh-cw"></i>
          </button>
          <button class="btn btn-sm" id="notionEmbedOpen" title="Abrir no Notion">
            <i data-lucide="external-link"></i> Abrir no Notion
          </button>
        </div>
      </div>
      <div class="notion-embed-frame-container">
        <iframe
          id="notionEmbedIframe"
          class="notion-embed-iframe"
          src="${this._esc(config.notionUrl)}"
          frameborder="0"
          allowfullscreen
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation-by-user-activation"
        ></iframe>
        <div class="notion-embed-loading" id="notionEmbedLoading">
          <div class="loading-spinner"></div>
          <p>Carregando pagina do Notion...</p>
        </div>
      </div>
    </div>`;
  },

  init() {
    // Bind actions
    document.getElementById('notionEmbedRefresh')?.addEventListener('click', () => {
      const iframe = document.getElementById('notionEmbedIframe');
      if (iframe) {
        const loading = document.getElementById('notionEmbedLoading');
        if (loading) loading.style.display = 'flex';
        iframe.src = iframe.src;
      }
    });

    document.getElementById('notionEmbedOpen')?.addEventListener('click', () => {
      if (this._notionUrl) window.open(this._notionUrl, '_blank', 'noopener');
    });

    // Hide loading when iframe loads
    const iframe = document.getElementById('notionEmbedIframe');
    if (iframe) {
      iframe.addEventListener('load', () => {
        const loading = document.getElementById('notionEmbedLoading');
        if (loading) loading.style.display = 'none';
      });
      // Fallback: hide loading after 5s
      setTimeout(() => {
        const loading = document.getElementById('notionEmbedLoading');
        if (loading) loading.style.display = 'none';
      }, 5000);
    }

    if (window.lucide) lucide.createIcons();
  },

  _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }
};

if (typeof window !== 'undefined') {
  window.TBO_NOTION_EMBED = TBO_NOTION_EMBED;
}

/**
 * TBO OS — Module: Notion Embed
 *
 * Renders Notion pages within TBO OS, keeping sidebar navigation context.
 * Tries iframe embed first; if Notion blocks it (private workspace pages),
 * shows a rich landing page with quick-open button.
 *
 * Route: #notion-embed/{childId}
 * The childId maps to a Notion URL via the EMBED_MAP.
 */
const TBO_NOTION_EMBED = {
  _childId: null,
  _title: null,
  _notionUrl: null,
  _iframeCheckTimer: null,

  /**
   * Map of child IDs to Notion embed config
   * Each entry: { title, notionUrl, icon, parent, desc }
   */
  EMBED_MAP: {
    'geral-cultura':     { title: 'Manual de Cultura',          notionUrl: 'https://www.notion.so/2193782e356143e5b41756c78e230cec', icon: 'book-open',        parent: 'Geral',        desc: 'Valores, principios e cultura organizacional da TBO.' },
    'geral-docs':        { title: 'Documentos & Padroes',       notionUrl: 'https://www.notion.so/1c58ac19b4de401bacc051dba890f357', icon: 'file-text',        parent: 'Geral',        desc: 'Templates, checklists e padroes de qualidade da agencia.' },
    'geral-bds':         { title: 'BDs | TBO',                  notionUrl: 'https://www.notion.so/1fab27ff29e380d9b152d288ecd5b2da', icon: 'database',         parent: 'Geral',        desc: 'Databases centrais com informacoes consolidadas.' },
    'geral-okrs':        { title: 'OKRs TBO — 2026',            notionUrl: 'https://www.notion.so/2e0b27ff29e38020bf63e8cf9b3714d5', icon: 'target',           parent: 'Pessoas',      desc: 'Objetivos e resultados-chave da TBO para 2026.' },
    'brand-linhas':      { title: 'Linhas Editoriais',           notionUrl: 'https://www.notion.so/24fb27ff29e3804db856e6a2c22d9fb0', icon: 'pen-tool',         parent: 'Branding',     desc: 'Diretrizes de conteudo e linhas editoriais por cliente.' },
    'brand-links':       { title: 'Links Educacionais',          notionUrl: 'https://www.notion.so/1f8b27ff29e38043b77bf330385eac7d', icon: 'link',             parent: 'Branding',     desc: 'Acervo de links e referencias para a equipe de branding.' },
    'brand-atendimento': { title: 'Atendimento & Gestao',        notionUrl: 'https://www.notion.so/646495112ac24518926e664f5ff07164', icon: 'headphones',       parent: 'Branding',     desc: 'Processos de atendimento e gestao de contas do branding.' },
    '3d-cronograma':     { title: 'Cronograma Digital 3D',       notionUrl: 'https://www.notion.so/1fab27ff29e380d496a7cdb3721336ba', icon: 'calendar-range',   parent: 'Digital 3D',   desc: 'Cronograma de producao e entregas da BU Digital 3D.' },
    'av-cronograma':     { title: 'Cronograma Audiovisual',      notionUrl: 'https://www.notion.so/1fab27ff29e380988600ee817de6ba00', icon: 'calendar-range',   parent: 'Audiovisual',  desc: 'Cronograma de producao e entregas da BU Audiovisual.' },
    'mkt-guia':          { title: 'Guia da Marca',               notionUrl: 'https://www.notion.so/12ab27ff29e381c3b452c6acf15cdf52', icon: 'book-marked',      parent: 'Marketing',    desc: 'Manual de identidade visual e guidelines de marca.' },
    'mkt-calendario':    { title: 'Calendario Redes Sociais',    notionUrl: 'https://www.notion.so/12ab27ff29e3818eab6acab66f4e292b', icon: 'calendar',         parent: 'Marketing',    desc: 'Calendario editorial e planejamento de redes sociais.' },
    'mkt-demandas':      { title: 'Gestao de Demandas',          notionUrl: 'https://www.notion.so/18ab27ff29e380a6aec4e1d71bff18d5', icon: 'list-checks',      parent: 'Marketing',    desc: 'Backlog e gestao de demandas de marketing.' },
    'com-gestao':        { title: 'Gestao Comercial',             notionUrl: 'https://www.notion.so/237083f5f949400a907f04cb07bf5e55', icon: 'chart-bar',        parent: 'Comercial',    desc: 'Controle de propostas, negociacoes e pipeline comercial.' }
  },

  /* ── Workspace color map ───────────────────────────────── */
  _wsColors: {
    'Geral':        '#E85102',
    'Pessoas':      '#EC4899',
    'Branding':     '#8B5CF6',
    'Digital 3D':   '#3B82F6',
    'Audiovisual':  '#F59E0B',
    'Marketing':    '#22C55E',
    'Comercial':    '#0EA5E9'
  },

  render() {
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
    const color = this._wsColors[config.parent] || '#E85102';
    const pageId = (config.notionUrl.split('/').pop() || '').replace(/-/g, '');

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
          <button class="btn btn-sm" id="notionEmbedOpen" title="Abrir no Notion">
            <i data-lucide="external-link"></i> <span>Abrir no Notion</span>
          </button>
        </div>
      </div>

      <!-- Iframe attempt (hidden until proven working) -->
      <div class="notion-embed-frame-container" id="notionEmbedFrameWrap" style="display:none;">
        <iframe
          id="notionEmbedIframe"
          class="notion-embed-iframe"
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

      <!-- Fallback landing page (shown by default) -->
      <div class="notion-embed-landing" id="notionEmbedLanding">
        <div class="notion-embed-landing-inner">
          <div class="notion-embed-landing-icon" style="background:${color}15; border-color:${color}30;">
            <i data-lucide="${this._esc(config.icon)}" style="width:48px;height:48px;color:${color};"></i>
          </div>
          <div class="notion-embed-landing-badge" style="background:${color}15; color:${color};">
            ${this._esc(config.parent)}
          </div>
          <h2 class="notion-embed-landing-title">${this._esc(config.title)}</h2>
          <p class="notion-embed-landing-desc">${this._esc(config.desc || '')}</p>

          <button class="notion-embed-landing-cta" id="notionEmbedLandingOpen" style="background:${color};">
            <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.017 4.313l55.333-4.087c6.797-.583 8.543-.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277-1.553 6.807-6.99 7.193L24.467 99.967c-4.08.193-6.023-.39-8.16-3.113L3.3 79.94c-2.333-3.113-3.3-5.443-3.3-8.167V11.113c0-3.497 1.553-6.413 6.017-6.8z" fill="#fff"/>
              <path fill-rule="evenodd" d="M61.35.227L6.017 4.313C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723.967 5.053 3.3 8.167l12.993 16.913c2.137 2.723 4.08 3.307 8.16 3.113L88.723 96.08c5.437-.387 6.99-2.917 6.99-7.193V20.64c0-2.21-.812-2.812-3.49-4.727L74.167 3.14C69.893.027 68.147-.357 61.35.227zM25.723 19.01c-5.547.34-6.81.417-9.963-2.15L8.057 10.727c-.78-.78-.39-1.753 1.163-1.947l53.007-3.887c4.667-.39 7.003 1.167 8.75 2.527l9.34 6.8c.39.193 1.36 1.36.193 1.36l-54.593 3.237-.193.193zm-4.08 75.023V27.747c0-2.527.78-3.697 3.103-3.89l58.05-3.3c2.14-.193 3.107 1.167 3.107 3.693v65.897c0 2.527-.39 4.667-3.883 4.863l-55.527 3.3c-3.497.193-4.853-1.003-4.853-4.277zm54.243-62.597c.39 1.753 0 3.5-1.753 3.697l-2.72.583v48.443c-2.333 1.167-4.47 1.753-6.22 1.753-2.913 0-3.69-.777-5.833-3.5L41.397 53.38v26.393l5.637 1.36s0 3.5-4.86 3.5L30.42 85.407c-.387-.78 0-2.723 1.357-3.11l3.497-.97V42.58l-4.857-.387c-.39-1.753.583-4.277 3.3-4.473l13.577-.97 19.543 29.7V41.8l-4.667-.583c-.39-2.143 1.163-3.693 3.103-3.883l13.593-.897z" fill="#000"/>
            </svg>
            Abrir no Notion
          </button>

          <div class="notion-embed-landing-meta">
            <div class="notion-embed-landing-meta-item">
              <i data-lucide="globe" style="width:14px;height:14px;"></i>
              <span>Notion Workspace</span>
            </div>
            <div class="notion-embed-landing-meta-item">
              <i data-lucide="lock" style="width:14px;height:14px;"></i>
              <span>Acesso restrito a equipe</span>
            </div>
            <div class="notion-embed-landing-meta-item">
              <i data-lucide="hash" style="width:14px;height:14px;"></i>
              <span>${pageId.substring(0, 8)}...</span>
            </div>
          </div>

          <p class="notion-embed-landing-tip">
            <i data-lucide="info" style="width:13px;height:13px;"></i>
            Esta pagina do Notion sera aberta em uma nova aba com autenticacao automatica.
          </p>
        </div>
      </div>
    </div>`;
  },

  init() {
    const config = this._childId ? this.EMBED_MAP[this._childId] : null;
    if (!config) { if (window.lucide) lucide.createIcons(); return; }

    const openNotion = () => {
      if (this._notionUrl) window.open(this._notionUrl, '_blank', 'noopener');
    };

    // Bind "Abrir no Notion" buttons
    document.getElementById('notionEmbedOpen')?.addEventListener('click', openNotion);
    document.getElementById('notionEmbedLandingOpen')?.addEventListener('click', openNotion);

    // Try iframe embed — detect if Notion allows it
    this._tryIframeEmbed(config);

    if (window.lucide) lucide.createIcons();
  },

  /**
   * Attempt iframe loading.  If the Notion page is published to web,
   * the iframe will fire 'load' successfully and we swap views.
   * Otherwise, we stay on the landing page.
   */
  _tryIframeEmbed(config) {
    const iframe = document.getElementById('notionEmbedIframe');
    const frameWrap = document.getElementById('notionEmbedFrameWrap');
    const landing = document.getElementById('notionEmbedLanding');
    const loading = document.getElementById('notionEmbedLoading');
    if (!iframe || !frameWrap || !landing) return;

    // Build public embed URL to test — {workspace}.notion.site is embeddable
    // We try the notion.site format first (works for published pages)
    const pageId = (config.notionUrl.split('/').pop() || '').replace(/-/g, '');
    const embedUrl = 'https://agenciatbo.notion.site/' + pageId;

    let resolved = false;

    iframe.addEventListener('load', () => {
      if (resolved) return;
      // Iframe loaded — could be the actual page or an error page.
      // We check after a delay; if the iframe has reasonable height, it worked.
      setTimeout(() => {
        if (resolved) return;
        try {
          // Try to detect error page by checking iframe dimensions
          // If Notion loaded, iframe will have content; if blocked, it shows error
          if (iframe.contentWindow && iframe.offsetHeight > 200) {
            resolved = true;
            frameWrap.style.display = '';
            landing.style.display = 'none';
            if (loading) loading.style.display = 'none';
          }
        } catch (e) {
          // Cross-origin — can't access content, but iframe loaded
          // If we get here, the page likely loaded successfully
          resolved = true;
          frameWrap.style.display = '';
          landing.style.display = 'none';
          if (loading) loading.style.display = 'none';
        }
      }, 1500);
    });

    iframe.addEventListener('error', () => {
      // Iframe failed — keep landing page visible
      resolved = true;
    });

    // Set src to try the embed
    iframe.src = embedUrl;

    // Final fallback: after 6 seconds, if not resolved, stay on landing
    this._iframeCheckTimer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        frameWrap.style.display = 'none';
        landing.style.display = '';
        if (loading) loading.style.display = 'none';
      }
    }, 6000);
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

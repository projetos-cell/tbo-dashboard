/**
 * TBO OS — Activity Feed (Painel lateral)
 *
 * Painel deslizante que mostra atividades recentes do audit_log.
 * Integra com TBO_ACTIVITY para dados formatados.
 */

const TBO_ACTIVITY_FEED = (() => {
  let _isOpen = false;
  let _panel = null;
  let _backdrop = null;
  let _list = null;
  let _filter = 'all';
  let _unsubscribe = null;

  function _escHtml(str) {
    if (typeof TBO_FORMATTER !== 'undefined' && TBO_FORMATTER.escapeHtml) {
      return TBO_FORMATTER.escapeHtml(str);
    }
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function _timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins}min atrás`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h atrás`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d atrás`;
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  function _getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  // Filtros disponíveis
  const FILTERS = [
    { key: 'all', label: 'Tudo' },
    { key: 'projects', label: 'Projetos' },
    { key: 'tasks', label: 'Tarefas' },
    { key: 'crm_deals', label: 'CRM' },
    { key: 'financial_transactions', label: 'Financeiro' },
    { key: 'chat_messages', label: 'Chat' }
  ];

  function _createDOM() {
    if (_panel) return;

    // Backdrop
    _backdrop = document.createElement('div');
    _backdrop.className = 'af-backdrop';
    _backdrop.addEventListener('click', () => _close());
    document.body.appendChild(_backdrop);

    // Painel
    _panel = document.createElement('div');
    _panel.className = 'af-panel';
    _panel.setAttribute('role', 'complementary');
    _panel.setAttribute('aria-label', 'Atividade recente');

    const filtersHtml = FILTERS.map(f =>
      `<button class="af-filter${f.key === _filter ? ' af-filter--active' : ''}" data-filter="${f.key}">${_escHtml(f.label)}</button>`
    ).join('');

    _panel.innerHTML = `
      <div class="af-header">
        <span class="af-header-title">
          <i data-lucide="activity"></i>
          Atividade Recente
        </span>
        <button class="af-close-btn" title="Fechar" aria-label="Fechar painel de atividade">
          <i data-lucide="x"></i>
        </button>
      </div>
      <div class="af-filters">${filtersHtml}</div>
      <div class="af-list" id="afList"></div>
    `;

    document.body.appendChild(_panel);
    _list = _panel.querySelector('#afList');

    // Eventos
    _panel.querySelector('.af-close-btn').addEventListener('click', () => _close());
    _panel.querySelector('.af-filters').addEventListener('click', (e) => {
      const btn = e.target.closest('.af-filter');
      if (!btn) return;
      _filter = btn.dataset.filter;
      _panel.querySelectorAll('.af-filter').forEach(f =>
        f.classList.toggle('af-filter--active', f.dataset.filter === _filter)
      );
      _loadItems();
    });

    // Tecla Escape
    _panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') _close();
    });

    if (window.lucide) lucide.createIcons({ root: _panel });
  }

  function _renderItem(item) {
    const avatarContent = item.avatar
      ? `<img src="${_escHtml(item.avatar)}" alt="${_escHtml(item.actor)}">`
      : _escHtml(_getInitials(item.actor));

    const entityHtml = item.entityName
      ? ` <span class="af-entity">${_escHtml(item.entityName)}</span>`
      : '';

    return `<div class="af-item" data-id="${_escHtml(item.id)}">
      <div class="af-avatar">${avatarContent}</div>
      <div class="af-content">
        <div class="af-text">
          <strong>${_escHtml(item.actor)}</strong> ${_escHtml(item.verb)} ${_escHtml(item.entity)}${entityHtml}
        </div>
        <div class="af-time">${_timeAgo(item.timestamp)}</div>
      </div>
    </div>`;
  }

  async function _loadItems() {
    if (!_list) return;

    // Mostrar skeleton enquanto carrega
    _list.innerHTML = Array.from({ length: 5 }, () =>
      `<div class="af-item">
        <div class="skeleton skeleton-circle" style="width:32px;height:32px;flex-shrink:0"></div>
        <div style="flex:1;display:flex;flex-direction:column;gap:6px">
          <div class="skeleton skeleton-text" style="width:80%"></div>
          <div class="skeleton skeleton-text" style="width:40%"></div>
        </div>
      </div>`
    ).join('');

    try {
      if (typeof TBO_ACTIVITY === 'undefined') {
        _list.innerHTML = '<div class="af-empty"><i data-lucide="activity"></i><span>Activity service indisponível</span></div>';
        if (window.lucide) lucide.createIcons({ root: _list });
        return;
      }

      const opts = { limit: 30 };
      if (_filter !== 'all') opts.entity = _filter;

      const items = await TBO_ACTIVITY.getRecent(opts);

      if (!items.length) {
        _list.innerHTML = '<div class="af-empty"><i data-lucide="inbox"></i><span>Nenhuma atividade recente</span></div>';
        if (window.lucide) lucide.createIcons({ root: _list });
        return;
      }

      _list.innerHTML = items.map(_renderItem).join('');
    } catch (err) {
      console.warn('[ActivityFeed] Erro ao carregar:', err);
      _list.innerHTML = '<div class="af-empty"><i data-lucide="alert-circle"></i><span>Erro ao carregar atividades</span></div>';
      if (window.lucide) lucide.createIcons({ root: _list });
    }
  }

  function _open() {
    if (_isOpen) return;
    _createDOM();

    _backdrop.classList.add('af-backdrop--visible');
    _panel.classList.add('af-panel--open');
    _isOpen = true;

    _loadItems();

    // Iniciar polling se TBO_ACTIVITY disponível
    if (typeof TBO_ACTIVITY !== 'undefined') {
      _unsubscribe = TBO_ACTIVITY.onUpdate((items) => {
        if (!_isOpen || !_list) return;
        const filtered = _filter === 'all'
          ? items
          : items.filter(i => i.rawEntity === _filter);
        if (filtered.length) {
          _list.innerHTML = filtered.map(_renderItem).join('');
        }
      });
      TBO_ACTIVITY.startPolling(45000);
    }
  }

  function _close() {
    if (!_isOpen) return;
    _backdrop.classList.remove('af-backdrop--visible');
    _panel.classList.remove('af-panel--open');
    _isOpen = false;

    if (_unsubscribe) {
      _unsubscribe();
      _unsubscribe = null;
    }
    if (typeof TBO_ACTIVITY !== 'undefined') {
      TBO_ACTIVITY.stopPolling();
    }
  }

  return {
    open: _open,
    close: _close,
    toggle() { _isOpen ? _close() : _open(); },
    get isOpen() { return _isOpen; }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_ACTIVITY_FEED = TBO_ACTIVITY_FEED;
}

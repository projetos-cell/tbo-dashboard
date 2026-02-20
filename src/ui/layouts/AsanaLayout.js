/**
 * TBO OS — Asana-style Layout Manager
 *
 * Gerencia o layout de 3 painéis:
 *   Sidebar (existente) | Main Content | Details Panel
 *
 * Ativa o layout Asana no módulo atual, adiciona toolbar e
 * coordena abertura/fechamento do DetailsPanel.
 */

const TBO_ASANA_LAYOUT = (() => {
  'use strict';

  let _active = false;
  let _currentView = 'list'; // list | board | calendar

  function _escHtml(str) {
    if (typeof TBO_FORMATTER !== 'undefined' && TBO_FORMATTER.escapeHtml) {
      return TBO_FORMATTER.escapeHtml(str);
    }
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  /**
   * Ativa o layout Asana no main-content
   * @param {object} opts
   * @param {string} opts.title - Título da seção
   * @param {Array} opts.views - Views disponíveis ['list','board','calendar']
   * @param {Array} opts.actions - Botões de ação [{ label, icon, onClick, primary? }]
   * @param {HTMLElement|string} opts.container - Onde renderizar conteúdo
   */
  function activate(_opts = {}) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    mainContent.classList.add('asana-main');
    _active = true;

    // Garantir que moduleContainer existe e virou flex child
    const moduleContainer = document.getElementById('moduleContainer');
    if (moduleContainer) {
      moduleContainer.style.display = 'flex';
      moduleContainer.style.flexDirection = 'column';
      moduleContainer.style.flex = '1';
      moduleContainer.style.minWidth = '0';
      moduleContainer.style.overflow = 'hidden';
      moduleContainer.style.maxWidth = 'none';
    }
  }

  /**
   * Desativa layout Asana (volta ao padrão)
   */
  function deactivate() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.classList.remove('asana-main');

    const moduleContainer = document.getElementById('moduleContainer');
    if (moduleContainer) {
      moduleContainer.style.display = '';
      moduleContainer.style.flexDirection = '';
      moduleContainer.style.flex = '';
      moduleContainer.style.minWidth = '';
      moduleContainer.style.overflow = '';
      moduleContainer.style.maxWidth = '';
    }

    // Fechar details panel se aberto
    if (typeof TBO_DETAILS_PANEL !== 'undefined') {
      TBO_DETAILS_PANEL.close();
    }

    _active = false;
  }

  /**
   * Gera HTML de toolbar Asana
   * @param {object} opts
   * @returns {string} HTML
   */
  function toolbar(opts = {}) {
    const { title = '', views = [], actions = [], filters = [] } = opts;

    let viewsHtml = '';
    if (views.length > 1) {
      viewsHtml = `<div class="asana-views">${views.map(v =>
        `<button class="asana-view-btn${v === _currentView ? ' asana-view-btn--active' : ''}" data-view="${_escHtml(v)}">${_escHtml(v === 'list' ? 'Lista' : v === 'board' ? 'Quadro' : 'Calendário')}</button>`
      ).join('')}</div>`;
    }

    let filtersHtml = '';
    if (filters.length) {
      filtersHtml = filters.map(f =>
        `<button class="asana-toolbar-btn" data-filter="${_escHtml(f.key)}">
          <i data-lucide="${_escHtml(f.icon || 'filter')}"></i>
          ${_escHtml(f.label)}
        </button>`
      ).join('');
    }

    let actionsHtml = '';
    if (actions.length) {
      actionsHtml = actions.map((a, i) =>
        `<button class="asana-toolbar-btn${a.primary ? ' asana-toolbar-btn--primary' : ''}" data-action-idx="${i}">
          ${a.icon ? `<i data-lucide="${_escHtml(a.icon)}"></i>` : ''}
          ${_escHtml(a.label)}
        </button>`
      ).join('');
    }

    return `<div class="asana-toolbar">
      <span class="asana-toolbar-title">${_escHtml(title)}</span>
      ${viewsHtml}
      <div class="asana-toolbar-actions">
        ${filtersHtml}
        ${actionsHtml}
      </div>
    </div>`;
  }

  /**
   * Bind eventos da toolbar
   * @param {HTMLElement} container - Container que contém a toolbar
   * @param {object} opts - Mesmas opts passadas no toolbar()
   */
  function bindToolbar(container, opts = {}) {
    if (!container) return;

    // View switcher
    container.querySelectorAll('.asana-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _currentView = btn.dataset.view;
        container.querySelectorAll('.asana-view-btn').forEach(b =>
          b.classList.toggle('asana-view-btn--active', b === btn)
        );
        if (opts.onViewChange) opts.onViewChange(_currentView);
      });
    });

    // Actions
    container.querySelectorAll('[data-action-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.actionIdx, 10);
        const action = opts.actions?.[idx];
        if (action?.onClick) action.onClick();
      });
    });

    // Filters
    container.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (opts.onFilter) opts.onFilter(btn.dataset.filter);
      });
    });

    if (window.lucide) lucide.createIcons({ root: container });
  }

  return {
    activate,
    deactivate,
    toolbar,
    bindToolbar,
    get isActive() { return _active; },
    get currentView() { return _currentView; },
    setView(view) { _currentView = view; }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_ASANA_LAYOUT = TBO_ASANA_LAYOUT;
}

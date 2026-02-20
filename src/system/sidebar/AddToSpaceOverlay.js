/**
 * TBO OS — AddToSpaceOverlay (Notion-style)
 *
 * Overlay full-screen para adicionar conteúdo a um espaço de equipe.
 * Abre ao clicar no "+" de qualquer workspace na sidebar.
 *
 * Funcionalidades:
 *   - Página vazia, Nova base de dados, Construir com IA TBO
 *   - Início rápido: templates pré-definidos (tarefas, projetos, docs, brainstorming)
 *   - Busca local filtrando cards
 *   - Focus trap, ESC/backdrop/X para fechar
 *   - ARIA completo (dialog, modal, expanded)
 *
 * API:
 *   TBO_ADD_TO_SPACE.open({ spaceId, spaceLabel, spaceIcon, onCreate, onClose })
 *   TBO_ADD_TO_SPACE.close()
 *   TBO_ADD_TO_SPACE.isOpen
 */

const TBO_ADD_TO_SPACE = (() => {
  'use strict';

  let _overlay = null;
  let _isOpen = false;
  let _triggerEl = null;
  let _currentSpace = null;
  let _onCreateCb = null;
  let _onCloseCb = null;
  let _searchTerm = '';

  // ── Templates de criação ────────────────────────────────────────────────

  const PRIMARY_ACTIONS = [
    {
      id: 'empty-page',
      icon: 'file-text',
      title: 'Página vazia',
      description: 'Comece do zero com uma página em branco',
      type: 'page',
      color: '#E85102'
    },
    {
      id: 'empty-database',
      icon: 'database',
      title: 'Nova base de dados vazia',
      description: 'Crie uma tabela, board ou timeline',
      type: 'database',
      color: '#0EA5E9'
    },
    {
      id: 'ai-builder',
      icon: 'sparkles',
      title: 'Construa com a IA TBO',
      description: 'Deixe a IA criar a estrutura para você',
      type: 'ai',
      color: '#A855F7'
    }
  ];

  const QUICK_START_TEMPLATES = [
    {
      id: 'task-tracker',
      icon: 'check-square',
      title: 'Controle de tarefas',
      description: 'Kanban com status, responsáveis e prazos',
      type: 'template',
      templateKey: 'tasks',
      color: '#22C55E',
      preview: 'kanban'
    },
    {
      id: 'projects',
      icon: 'folder-kanban',
      title: 'Projetos',
      description: 'Gestão completa de projetos com timeline',
      type: 'template',
      templateKey: 'projects',
      color: '#E85102',
      preview: 'table'
    },
    {
      id: 'doc-central',
      icon: 'library',
      title: 'Central de documentos',
      description: 'Wiki organizada com categorias e tags',
      type: 'template',
      templateKey: 'docs',
      color: '#3B82F6',
      preview: 'list'
    },
    {
      id: 'brainstorm',
      icon: 'lightbulb',
      title: 'Sessão de brainstorming',
      description: 'Quadro para ideias, votação e decisões',
      type: 'template',
      templateKey: 'brainstorm',
      color: '#F59E0B',
      preview: 'board'
    },
    {
      id: 'meeting-notes',
      icon: 'notebook-pen',
      title: 'Atas de reunião',
      description: 'Registre decisões, ações e responsáveis',
      type: 'template',
      templateKey: 'meetings',
      color: '#8B5CF6',
      preview: 'list'
    },
    {
      id: 'crm-pipeline',
      icon: 'users',
      title: 'Pipeline comercial',
      description: 'Funil de vendas com etapas e valores',
      type: 'template',
      templateKey: 'crm',
      color: '#EC4899',
      preview: 'kanban'
    },
    {
      id: 'sprint-board',
      icon: 'zap',
      title: 'Sprint board',
      description: 'Board ágil com sprints e story points',
      type: 'template',
      templateKey: 'sprint',
      color: '#14B8A6',
      preview: 'board'
    },
    {
      id: 'content-calendar',
      icon: 'calendar-range',
      title: 'Calendário de conteúdo',
      description: 'Planejamento editorial com datas e canais',
      type: 'template',
      templateKey: 'content',
      color: '#F97316',
      preview: 'calendar'
    }
  ];

  // ── Helpers ─────────────────────────────────────────────────────────────

  function _esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  function _getFilteredTemplates() {
    if (!_searchTerm) return QUICK_START_TEMPLATES;
    const q = _searchTerm.toLowerCase();
    return QUICK_START_TEMPLATES.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.templateKey.toLowerCase().includes(q)
    );
  }

  function _getFilteredPrimary() {
    if (!_searchTerm) return PRIMARY_ACTIONS;
    const q = _searchTerm.toLowerCase();
    return PRIMARY_ACTIONS.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────

  function _buildOverlayHTML() {
    const space = _currentSpace || {};
    const label = _esc(space.spaceLabel || 'Espaço');
    const icon = _esc(space.spaceIcon || 'globe');

    return `
      <div class="ats-overlay" role="dialog" aria-modal="true" aria-label="Adicionar a ${label}">
        <div class="ats-backdrop"></div>
        <div class="ats-container">
          <!-- Header -->
          <header class="ats-header">
            <div class="ats-header-left">
              <button class="ats-close-btn" aria-label="Fechar" data-ats-close>
                <i data-lucide="x"></i>
              </button>
              <div class="ats-header-title">
                <span class="ats-header-prefix">Adicionar a</span>
                <span class="ats-header-space">
                  <i data-lucide="${icon}" class="ats-header-space-icon"></i>
                  <span class="ats-header-space-label">${label}</span>
                  <i data-lucide="chevron-down" class="ats-header-chevron"></i>
                </span>
              </div>
            </div>
            <div class="ats-header-center">
              <div class="ats-search-wrapper">
                <i data-lucide="search" class="ats-search-icon"></i>
                <input
                  type="text"
                  class="ats-search-input"
                  placeholder="Buscar..."
                  aria-label="Buscar templates"
                  data-ats-search
                />
              </div>
            </div>
            <div class="ats-header-right"></div>
          </header>

          <!-- Conteúdo -->
          <div class="ats-body">
            <div class="ats-content" data-ats-content>
              ${_renderContent()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function _renderContent() {
    const primaryFiltered = _getFilteredPrimary();
    const templatesFiltered = _getFilteredTemplates();
    const noResults = primaryFiltered.length === 0 && templatesFiltered.length === 0;

    if (noResults) {
      return `
        <div class="ats-empty">
          <i data-lucide="search-x" class="ats-empty-icon"></i>
          <p class="ats-empty-text">Nenhum resultado para "${_esc(_searchTerm)}"</p>
        </div>
      `;
    }

    let html = '';

    // Ações primárias
    if (primaryFiltered.length > 0) {
      html += '<div class="ats-primary-grid">';
      primaryFiltered.forEach(action => {
        html += `
          <button class="ats-primary-card" data-ats-create="${_esc(action.id)}" data-type="${_esc(action.type)}">
            <div class="ats-primary-icon" style="color: ${action.color}">
              <i data-lucide="${_esc(action.icon)}"></i>
            </div>
            <div class="ats-primary-info">
              <span class="ats-primary-title">${_esc(action.title)}</span>
              <span class="ats-primary-desc">${_esc(action.description)}</span>
            </div>
          </button>
        `;
      });
      html += '</div>';
    }

    // Início rápido
    if (templatesFiltered.length > 0) {
      html += `
        <div class="ats-section">
          <h3 class="ats-section-title">Início rápido</h3>
          <div class="ats-templates-grid">
      `;
      templatesFiltered.forEach(tmpl => {
        html += `
          <button class="ats-template-card" data-ats-create="${_esc(tmpl.id)}" data-type="${_esc(tmpl.type)}" data-template="${_esc(tmpl.templateKey)}">
            <div class="ats-template-preview ats-preview--${_esc(tmpl.preview)}" style="--tmpl-color: ${tmpl.color}">
              ${_renderPreview(tmpl.preview, tmpl.color)}
            </div>
            <div class="ats-template-info">
              <div class="ats-template-icon" style="color: ${tmpl.color}">
                <i data-lucide="${_esc(tmpl.icon)}"></i>
              </div>
              <span class="ats-template-title">${_esc(tmpl.title)}</span>
            </div>
            <span class="ats-template-desc">${_esc(tmpl.description)}</span>
          </button>
        `;
      });
      html += '</div></div>';
    }

    return html;
  }

  function _renderPreview(type, color) {
    const light = color + '20';
    switch (type) {
    case 'kanban':
      return `<div class="ats-mini-kanban">
          <div class="ats-mini-col" style="background:${light}"><div class="ats-mini-card" style="background:${color}"></div><div class="ats-mini-card" style="background:${color}"></div></div>
          <div class="ats-mini-col" style="background:${light}"><div class="ats-mini-card" style="background:${color}"></div></div>
          <div class="ats-mini-col" style="background:${light}"><div class="ats-mini-card" style="background:${color}"></div><div class="ats-mini-card" style="background:${color}"></div><div class="ats-mini-card" style="background:${color}"></div></div>
        </div>`;
    case 'table':
      return `<div class="ats-mini-table">
          <div class="ats-mini-row ats-mini-row--header" style="background:${light}"><span style="background:${color}"></span><span style="background:${color}"></span><span style="background:${color}"></span></div>
          <div class="ats-mini-row"><span style="background:${light}"></span><span style="background:${light}"></span><span style="background:${light}"></span></div>
          <div class="ats-mini-row"><span style="background:${light}"></span><span style="background:${light}"></span><span style="background:${light}"></span></div>
        </div>`;
    case 'list':
      return `<div class="ats-mini-list">
          <div class="ats-mini-list-item" style="background:${light}"><span style="background:${color}"></span></div>
          <div class="ats-mini-list-item" style="background:${light}"><span style="background:${color}"></span></div>
          <div class="ats-mini-list-item" style="background:${light}"><span style="background:${color}"></span></div>
        </div>`;
    case 'board':
      return `<div class="ats-mini-board">
          <div class="ats-mini-note" style="background:${color}"></div>
          <div class="ats-mini-note" style="background:${color}; opacity:0.7"></div>
          <div class="ats-mini-note" style="background:${color}; opacity:0.5"></div>
          <div class="ats-mini-note" style="background:${color}; opacity:0.8"></div>
        </div>`;
    case 'calendar':
      return `<div class="ats-mini-calendar">
          <div class="ats-mini-cal-header" style="background:${color}"></div>
          <div class="ats-mini-cal-grid">
            <span></span><span></span><span style="background:${light}"></span><span></span><span style="background:${light}"></span><span></span><span></span>
            <span style="background:${light}"></span><span></span><span></span><span></span><span></span><span style="background:${light}"></span><span></span>
          </div>
        </div>`;
    default:
      return `<div class="ats-mini-empty" style="background:${light}"></div>`;
    }
  }

  // ── Focus Trap ──────────────────────────────────────────────────────────

  function _trapFocus(e) {
    if (!_overlay || !_isOpen) return;
    if (e.key !== 'Tab') return;

    const focusable = _overlay.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // ── Event Handlers ─────────────────────────────────────────────────────

  function _onKeydown(e) {
    if (e.key === 'Escape' && _isOpen) {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
    _trapFocus(e);
  }

  function _onBackdropClick(e) {
    if (e.target.classList.contains('ats-backdrop')) {
      close();
    }
  }

  function _onSearchInput(e) {
    _searchTerm = e.target.value.trim();
    _refreshContent();
  }

  function _onCreateClick(e) {
    const btn = e.target.closest('[data-ats-create]');
    if (!btn) return;

    const actionId = btn.dataset.atsCreate;
    const type = btn.dataset.type;
    const templateKey = btn.dataset.template || null;

    // Callback
    if (typeof _onCreateCb === 'function') {
      _onCreateCb({
        actionId,
        type,
        templateKey,
        spaceId: _currentSpace?.spaceId,
        spaceLabel: _currentSpace?.spaceLabel
      });
    }

    // Toast de feedback
    if (typeof TBO_TOAST !== 'undefined') {
      const item = [...PRIMARY_ACTIONS, ...QUICK_START_TEMPLATES].find(x => x.id === actionId);
      TBO_TOAST.success(
        'Criando...',
        `${item ? item.title : actionId} em ${_currentSpace?.spaceLabel || 'espaço'}`
      );
    }

    close();
  }

  // ── Refresh conteúdo (busca) ────────────────────────────────────────────

  function _refreshContent() {
    if (!_overlay) return;
    const contentArea = _overlay.querySelector('[data-ats-content]');
    if (!contentArea) return;

    contentArea.innerHTML = _renderContent();
    if (window.lucide) lucide.createIcons({ root: contentArea });
  }

  // ── Bind / Unbind ──────────────────────────────────────────────────────

  function _bindEvents() {
    if (!_overlay) return;

    // Fechar com X
    _overlay.querySelectorAll('[data-ats-close]').forEach(btn => {
      btn.addEventListener('click', close);
    });

    // Backdrop
    const backdrop = _overlay.querySelector('.ats-backdrop');
    if (backdrop) backdrop.addEventListener('click', _onBackdropClick);

    // Busca
    const searchInput = _overlay.querySelector('[data-ats-search]');
    if (searchInput) {
      searchInput.addEventListener('input', _onSearchInput);
    }

    // Cards
    _overlay.addEventListener('click', _onCreateClick);

    // ESC + Focus trap
    document.addEventListener('keydown', _onKeydown);
  }

  function _unbindEvents() {
    document.removeEventListener('keydown', _onKeydown);
  }

  // ── API Pública ─────────────────────────────────────────────────────────

  /**
   * Abre o overlay para um espaço específico
   * @param {Object} opts
   * @param {string} opts.spaceId - ID do espaço (ex: 'ws-geral')
   * @param {string} opts.spaceLabel - Nome do espaço (ex: 'Geral')
   * @param {string} opts.spaceIcon - Ícone lucide (ex: 'globe')
   * @param {Function} opts.onCreate - Callback(type) ao criar item
   * @param {Function} opts.onClose - Callback ao fechar
   */
  function open(opts = {}) {
    if (_isOpen) close();

    _currentSpace = opts;
    _onCreateCb = opts.onCreate || null;
    _onCloseCb = opts.onClose || null;
    _searchTerm = '';
    _triggerEl = document.activeElement;

    // Criar DOM
    const wrapper = document.createElement('div');
    wrapper.id = 'atsOverlayRoot';
    wrapper.innerHTML = _buildOverlayHTML();
    document.body.appendChild(wrapper);

    _overlay = wrapper.querySelector('.ats-overlay');
    _isOpen = true;

    // Atualizar trigger ARIA
    if (_triggerEl) {
      _triggerEl.setAttribute('aria-expanded', 'true');
    }

    // Ícones
    if (window.lucide) lucide.createIcons({ root: _overlay });

    // Bind
    _bindEvents();

    // Block body scroll
    document.body.style.overflow = 'hidden';

    // Animar entrada
    requestAnimationFrame(() => {
      _overlay.classList.add('ats-overlay--open');

      // Foco no input de busca
      const searchInput = _overlay.querySelector('[data-ats-search]');
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 50);
      }
    });
  }

  function close() {
    if (!_isOpen || !_overlay) return;

    _overlay.classList.remove('ats-overlay--open');
    _overlay.classList.add('ats-overlay--closing');

    // Atualizar trigger ARIA
    if (_triggerEl) {
      _triggerEl.setAttribute('aria-expanded', 'false');
    }

    _unbindEvents();
    document.body.style.overflow = '';

    // Callback
    if (typeof _onCloseCb === 'function') {
      _onCloseCb();
    }

    // Animar saída
    setTimeout(() => {
      const root = document.getElementById('atsOverlayRoot');
      if (root) root.remove();
      _overlay = null;
      _isOpen = false;
      _currentSpace = null;
      _onCreateCb = null;
      _onCloseCb = null;
      _searchTerm = '';

      // Devolver foco ao trigger
      if (_triggerEl && _triggerEl.isConnected) {
        _triggerEl.focus();
        _triggerEl = null;
      }
    }, 200);
  }

  return {
    open,
    close,
    get isOpen() { return _isOpen; }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_ADD_TO_SPACE = TBO_ADD_TO_SPACE;
}
